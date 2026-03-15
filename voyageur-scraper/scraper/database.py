"""
Voyageur Scraper — Database Layer
SQLite via aiosqlite for async-safe reads/writes from FastAPI + scraper
"""

import json
import time
import aiosqlite
import sqlite3
from typing import Optional
from scraper.config import DB_PATH


# ─────────────────────────────────────────────────────────────────
# SCHEMA
# ─────────────────────────────────────────────────────────────────
SCHEMA = """
-- One row per property (the source of truth for metadata)
CREATE TABLE IF NOT EXISTS properties (
    slug            TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    chain           TEXT NOT NULL DEFAULT 'hyatt',
    property_code   TEXT,
    city            TEXT,
    country         TEXT,
    category        INTEGER,  -- Hyatt category 1-8 (NULL for dynamic chains)
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- One row per scraped date per property
-- Multiple rows per property = richer data for peak/off-peak detection
CREATE TABLE IF NOT EXISTS pricing (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    slug            TEXT NOT NULL,
    check_date      TEXT NOT NULL,           -- YYYY-MM-DD
    points_per_night INTEGER,
    rate_tier       TEXT,                    -- 'off_peak' | 'standard' | 'peak'
    availability    INTEGER NOT NULL DEFAULT 1,  -- 1=available, 0=sold out
    median_cpp      REAL,                   -- cents per point from MaxMyPoint
    scraped_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY (slug) REFERENCES properties(slug),
    UNIQUE(slug, check_date)  -- upsert on conflict
);

-- Audit log for every scrape run
CREATE TABLE IF NOT EXISTS scrape_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    slug            TEXT NOT NULL,
    check_date      TEXT NOT NULL,
    success         INTEGER NOT NULL,        -- 1=success, 0=failure
    error_message   TEXT,
    duration_ms     INTEGER,
    scraped_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_pricing_slug ON pricing(slug);
CREATE INDEX IF NOT EXISTS idx_pricing_scraped_at ON pricing(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_slug ON scrape_logs(slug);

-- ═══════════════════════════════════════════════════════════════
-- FLIGHT PRICING TABLES
-- ═══════════════════════════════════════════════════════════════

-- Raw results from seats.aero per route/cabin/date
CREATE TABLE IF NOT EXISTS flight_pricing (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    origin          TEXT NOT NULL,
    destination     TEXT NOT NULL,
    airline         TEXT,
    cabin           TEXT NOT NULL,       -- 'economy' | 'business' | 'first'
    points          INTEGER,             -- award miles required (one-way)
    source_program  TEXT,                -- mileage program (e.g. 'united', 'aeroplan')
    search_date     TEXT NOT NULL,       -- YYYY-MM-DD
    travel_date     TEXT,                -- departure date searched
    direct_flight   INTEGER DEFAULT 0,
    availability    INTEGER DEFAULT 1,
    scraped_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    UNIQUE(origin, destination, airline, cabin, search_date)
);

-- Best/average pricing per route+cabin (updated after each scrape)
CREATE TABLE IF NOT EXISTS flight_route_summary (
    origin          TEXT NOT NULL,
    destination     TEXT NOT NULL,
    cabin           TEXT NOT NULL,
    best_points     INTEGER,
    best_airline    TEXT,
    best_program    TEXT,
    avg_points      INTEGER,
    direct_available INTEGER DEFAULT 0,
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    PRIMARY KEY (origin, destination, cabin)
);

-- Audit log for flight scrape runs
CREATE TABLE IF NOT EXISTS flight_scrape_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    origin          TEXT NOT NULL,
    destination     TEXT NOT NULL,
    success         INTEGER NOT NULL,
    results_count   INTEGER DEFAULT 0,
    error_message   TEXT,
    duration_ms     INTEGER,
    scraped_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_flight_pricing_route ON flight_pricing(origin, destination);
CREATE INDEX IF NOT EXISTS idx_flight_summary_route ON flight_route_summary(origin, destination);
"""


# ─────────────────────────────────────────────────────────────────
# SYNC INIT (called once at startup)
# ─────────────────────────────────────────────────────────────────
def init_db():
    """Create tables if they don't exist. Called synchronously at startup."""
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()


def seed_properties(properties: list[dict]):
    """
    Insert or ignore all known properties into the properties table.
    Safe to call on every startup — uses INSERT OR IGNORE.
    """
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executemany(
            """
            INSERT OR IGNORE INTO properties (slug, name, chain, property_code, city, country, category)
            VALUES (:slug, :name, 'hyatt', :property_code, :city, :country, :category)
            """,
            properties,
        )
        conn.commit()
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────────
# ASYNC WRITES (used by scraper)
# ─────────────────────────────────────────────────────────────────
async def upsert_pricing(
    slug: str,
    check_date: str,
    points_per_night: Optional[int],
    rate_tier: Optional[str],
    availability: bool,
    median_cpp: Optional[float] = None,
):
    """Insert or replace a pricing row. Called after each successful scrape."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO pricing (slug, check_date, points_per_night, rate_tier, availability, median_cpp, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug, check_date) DO UPDATE SET
                points_per_night = excluded.points_per_night,
                rate_tier        = excluded.rate_tier,
                availability     = excluded.availability,
                median_cpp       = excluded.median_cpp,
                scraped_at       = excluded.scraped_at
            """,
            (slug, check_date, points_per_night, rate_tier, int(availability), median_cpp, int(time.time())),
        )
        await db.commit()


async def log_scrape(
    slug: str,
    check_date: str,
    success: bool,
    error_message: Optional[str] = None,
    duration_ms: Optional[int] = None,
):
    """Append a row to scrape_logs."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO scrape_logs (slug, check_date, success, error_message, duration_ms)
            VALUES (?, ?, ?, ?, ?)
            """,
            (slug, check_date, int(success), error_message, duration_ms),
        )
        await db.commit()


# ─────────────────────────────────────────────────────────────────
# ASYNC READS (used by FastAPI)
# ─────────────────────────────────────────────────────────────────
async def get_all_prices() -> dict:
    """
    Returns a dict keyed by hotel slug, matching the shape the frontend expects:

    {
      "park-hyatt-tokyo": {
        "pointsPerNight": 30000,
        "cachedAt": 1710000000000,   # ms since epoch
        "availability": true,
        "medianCPP": 1.8,
        "rateTier": "standard",
        "chain": "hyatt"
      },
      ...
    }

    Logic: For each property, take the most recently scraped available date.
    If multiple dates exist, return the median points cost (removes outliers).
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Pull all properties + their freshest available pricing
        cursor = await db.execute(
            """
            SELECT
                p.slug,
                p.name,
                p.chain,
                p.category,
                pr.points_per_night,
                pr.rate_tier,
                pr.availability,
                pr.median_cpp,
                pr.scraped_at
            FROM properties p
            LEFT JOIN pricing pr ON pr.slug = p.slug
            WHERE pr.scraped_at = (
                SELECT MAX(scraped_at) FROM pricing
                WHERE slug = p.slug AND availability = 1
            )
            OR pr.scraped_at IS NULL
            ORDER BY p.slug
            """
        )
        rows = await cursor.fetchall()

        result = {}
        for row in rows:
            if row["points_per_night"] is None:
                continue  # Not yet scraped — frontend falls back to hardcoded

            # Derive a rough cents-per-point from cash price if available
            # (Cash price isn't stored in DB — would need to join properties for that)
            # For now, store None; API consumers can compute it
            result[row["slug"]] = {
                "pointsPerNight": row["points_per_night"],
                "cachedAt": int(row["scraped_at"]) * 1000,  # ms for JS
                "availability": bool(row["availability"]),
                "rateTier": row["rate_tier"],
                "chain": row["chain"],
                "medianCPP": row["median_cpp"],
            }

        return result


async def get_property_history(slug: str) -> list[dict]:
    """Return all pricing rows for a single property, newest first."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT check_date, points_per_night, rate_tier, availability, scraped_at
            FROM pricing
            WHERE slug = ?
            ORDER BY scraped_at DESC
            """,
            (slug,),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


# ─────────────────────────────────────────────────────────────────
# FLIGHT ASYNC WRITES (used by flight scraper)
# ─────────────────────────────────────────────────────────────────
async def upsert_flight_pricing(
    origin: str,
    destination: str,
    airline: Optional[str],
    cabin: str,
    points: Optional[int],
    source_program: Optional[str] = None,
    search_date: str = "",
    travel_date: Optional[str] = None,
    direct_flight: bool = False,
):
    """Insert or replace a flight pricing row."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO flight_pricing (origin, destination, airline, cabin, points, source_program, search_date, travel_date, direct_flight, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(origin, destination, airline, cabin, search_date) DO UPDATE SET
                points       = excluded.points,
                source_program = excluded.source_program,
                travel_date  = excluded.travel_date,
                direct_flight = excluded.direct_flight,
                scraped_at   = excluded.scraped_at
            """,
            (origin, destination, airline, cabin, points, source_program, search_date, travel_date, int(direct_flight), int(time.time())),
        )
        await db.commit()


async def upsert_flight_summary(
    origin: str,
    destination: str,
    cabin: str,
    best_points: Optional[int],
    best_airline: Optional[str],
    best_program: Optional[str],
    avg_points: Optional[int],
    direct_available: bool = False,
):
    """Insert or replace a flight route summary row."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO flight_route_summary (origin, destination, cabin, best_points, best_airline, best_program, avg_points, direct_available, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(origin, destination, cabin) DO UPDATE SET
                best_points      = excluded.best_points,
                best_airline     = excluded.best_airline,
                best_program     = excluded.best_program,
                avg_points       = excluded.avg_points,
                direct_available = excluded.direct_available,
                updated_at       = excluded.updated_at
            """,
            (origin, destination, cabin, best_points, best_airline, best_program, avg_points, int(direct_available), int(time.time())),
        )
        await db.commit()


async def log_flight_scrape(
    origin: str,
    destination: str,
    success: bool,
    results_count: int = 0,
    error_message: Optional[str] = None,
    duration_ms: Optional[int] = None,
):
    """Append a row to flight_scrape_logs."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO flight_scrape_logs (origin, destination, success, results_count, error_message, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (origin, destination, int(success), results_count, error_message, duration_ms),
        )
        await db.commit()


# ─────────────────────────────────────────────────────────────────
# FLIGHT ASYNC READS (used by FastAPI)
# ─────────────────────────────────────────────────────────────────
async def get_all_flight_prices() -> dict:
    """
    Returns flight pricing keyed by "ORIGIN-DEST" with per-cabin best prices.

    {
      "JFK-NRT": {
        "economy":  { "points": 55000, "airline": "ANA", "program": "aeroplan", "direct": false, "cachedAt": 1710000000000 },
        "business": { "points": 88000, "airline": "ANA", "program": "aeroplan", "direct": true,  "cachedAt": 1710000000000 },
      },
      ...
    }
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT origin, destination, cabin, best_points, best_airline, best_program, avg_points, direct_available, updated_at
            FROM flight_route_summary
            ORDER BY origin, destination
            """
        )
        rows = await cursor.fetchall()

        result = {}
        for row in rows:
            route_key = f"{row['origin']}-{row['destination']}"
            if route_key not in result:
                result[route_key] = {}

            result[route_key][row["cabin"]] = {
                "points": row["best_points"],
                "airline": row["best_airline"],
                "program": row["best_program"],
                "avgPoints": row["avg_points"],
                "direct": bool(row["direct_available"]),
                "cachedAt": int(row["updated_at"]) * 1000,
            }

        return result


async def get_flight_route_detail(origin: str, destination: str) -> list[dict]:
    """Return all pricing rows for a specific route, newest first."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT airline, cabin, points, source_program, search_date, travel_date, direct_flight, scraped_at
            FROM flight_pricing
            WHERE origin = ? AND destination = ?
            ORDER BY scraped_at DESC
            """,
            (origin, destination),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_scrape_stats() -> dict:
    """Summary stats for the /api/stats endpoint."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        total_props = (await (await db.execute("SELECT COUNT(*) as n FROM properties")).fetchone())["n"]
        scraped_props = (await (await db.execute(
            "SELECT COUNT(DISTINCT slug) as n FROM pricing"
        )).fetchone())["n"]
        last_run = (await (await db.execute(
            "SELECT MAX(scraped_at) as t FROM scrape_logs WHERE success = 1"
        )).fetchone())["t"]
        error_count_24h = (await (await db.execute(
            "SELECT COUNT(*) as n FROM scrape_logs WHERE success = 0 AND scraped_at > ?",
            (int(time.time()) - 86400,),
        )).fetchone())["n"]

        return {
            "totalProperties": total_props,
            "scrapedProperties": scraped_props,
            "lastSuccessfulRunAt": last_run * 1000 if last_run else None,
            "errors24h": error_count_24h,
        }
