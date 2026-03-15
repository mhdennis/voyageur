"""
Voyageur API — FastAPI Server
Serves live hotel pricing data to the React frontend.

Endpoints:
  GET /api/hotels/prices         → main endpoint consumed by TravelConcierge.jsx
  GET /api/hotels/{slug}/history → pricing history for one property
  GET /api/hotels/{slug}/live    → trigger on-demand scrape for one property
  GET /api/stats                 → scraper health & coverage stats
  POST /api/scrape/trigger       → manually trigger a full scrape run
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add parent dir to path so we can import scraper modules
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper import database
from scraper.config import HYATT_PROPERTIES, DB_PATH
from scraper.hyatt import run_hyatt_scraper, scrape_property
from scraper.flights import run_flight_scraper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("voyageur.api")

# ─────────────────────────────────────────────────────────────────
# STARTUP / SHUTDOWN
# ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed property metadata on startup
    logger.info(f"Initializing database at {DB_PATH}")
    database.init_db()
    database.seed_properties(HYATT_PROPERTIES)
    logger.info(f"Seeded {len(HYATT_PROPERTIES)} Hyatt properties")
    yield
    logger.info("API shutting down")


app = FastAPI(
    title="Voyageur Hotel Pricing API",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow requests from the React frontend (localhost dev + Vercel prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://voyageur-mvptest.vercel.app",
        os.environ.get("FRONTEND_ORIGIN", ""),
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Track whether a scrape is currently running (prevent double-triggering)
_scrape_running = False


# ─────────────────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────────────────
class HotelPrice(BaseModel):
    pointsPerNight: Optional[int]
    cachedAt: Optional[int]          # ms since epoch (matches JS Date.now())
    availability: bool
    rateTier: Optional[str]          # 'off_peak' | 'standard' | 'peak'
    chain: str
    medianCPP: Optional[float]       # cents per point (None until cash price scraped)


class ScrapeResult(BaseModel):
    message: str
    alreadyRunning: bool = False


# ─────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────

@app.get("/api/hotels/prices", response_model=dict[str, HotelPrice])
async def get_all_prices():
    """
    Returns all scraped hotel prices as a dict keyed by hotel slug.
    This is the primary endpoint consumed by TravelConcierge.jsx.

    The frontend calls this on mount:
        fetch("/api/hotels/prices")
          .then(res => res.json())
          .then(data => setLivePricing(data))

    Response shape (matches getEffectivePricing() in the app):
    {
      "park-hyatt-tokyo": {
        "pointsPerNight": 30000,
        "cachedAt": 1710000000000,
        "availability": true,
        "rateTier": "standard",
        "chain": "hyatt",
        "medianCPP": null
      },
      ...
    }

    Properties not yet scraped are omitted — frontend falls back to hardcoded values.
    """
    try:
        prices = await database.get_all_prices()
        return prices
    except Exception as e:
        logger.error(f"Error fetching prices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pricing data")


@app.get("/api/hotels/{slug}/history")
async def get_property_history(slug: str):
    """
    Returns the full pricing history for a single property.
    Useful for debugging and visualizing rate fluctuations.
    """
    history = await database.get_property_history(slug)
    if not history:
        raise HTTPException(status_code=404, detail=f"No data found for '{slug}'")
    return {"slug": slug, "history": history}


@app.get("/api/hotels/{slug}/live")
async def get_live_price(slug: str, background_tasks: BackgroundTasks):
    """
    Returns cached price for a single property AND triggers a background
    re-scrape to refresh the data. Response is always the cached value
    (don't block on scrape completion).
    """
    history = await database.get_property_history(slug)
    prices = await database.get_all_prices()
    current = prices.get(slug)

    # Trigger background refresh
    prop = next((p for p in HYATT_PROPERTIES if p["slug"] == slug), None)
    if prop:
        background_tasks.add_task(_refresh_single_property, prop)

    return {
        "slug": slug,
        "current": current,
        "historyCount": len(history),
        "refreshTriggered": prop is not None,
    }


@app.get("/api/stats")
async def get_stats():
    """
    Returns scraper health stats:
    - How many properties are in the DB
    - How many have been scraped
    - When the last successful run was
    - Error count in the last 24h
    """
    try:
        stats = await database.get_scrape_stats()
        stats["scrapedProperties"] = stats.get("scrapedProperties", 0)
        stats["coveragePct"] = (
            round(stats["scrapedProperties"] / max(stats["totalProperties"], 1) * 100, 1)
            if stats["totalProperties"]
            else 0
        )
        return stats
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")


@app.post("/api/scrape/trigger", response_model=ScrapeResult)
async def trigger_scrape(background_tasks: BackgroundTasks):
    """
    Manually trigger a full scrape of all Hyatt properties.
    Returns immediately — scrape runs in the background.
    Prevents duplicate runs if one is already in progress.
    """
    global _scrape_running
    if _scrape_running:
        return ScrapeResult(
            message="Scrape already in progress",
            alreadyRunning=True,
        )

    background_tasks.add_task(_run_full_scrape)
    return ScrapeResult(message="Scrape triggered in background", alreadyRunning=False)


# ─────────────────────────────────────────────────────────────────
# FLIGHT ROUTES
# ─────────────────────────────────────────────────────────────────

@app.get("/api/flights/prices")
async def get_all_flight_prices():
    """
    Returns all flight route summaries as a dict keyed by "ORIGIN-DEST".
    This is the primary endpoint consumed by TravelConcierge.jsx for live flight pricing.

    Response shape:
    {
      "JFK-NRT": {
        "economy":  { "points": 55000, "airline": "NH", "program": "aeroplan", "direct": false, "cachedAt": 1710000000000 },
        "business": { "points": 88000, "airline": "NH", "program": "aeroplan", "direct": true,  "cachedAt": 1710000000000 },
      },
      ...
    }
    """
    try:
        prices = await database.get_all_flight_prices()
        return prices
    except Exception as e:
        logger.error(f"Error fetching flight prices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch flight pricing data")


@app.get("/api/flights/{origin}/{destination}")
async def get_flight_route_detail(origin: str, destination: str):
    """
    Returns detailed pricing history for a specific route.
    """
    origin = origin.upper()
    destination = destination.upper()
    detail = await database.get_flight_route_detail(origin, destination)
    if not detail:
        raise HTTPException(status_code=404, detail=f"No data found for {origin}→{destination}")
    return {"origin": origin, "destination": destination, "prices": detail}


@app.post("/api/flights/scrape/trigger")
async def trigger_flight_scrape(background_tasks: BackgroundTasks):
    """Trigger a flight scrape run in the background."""
    background_tasks.add_task(_run_flight_scrape)
    return {"message": "Flight scrape triggered in background"}


@app.get("/health")
async def health():
    """Basic health check."""
    return {"status": "ok", "db": DB_PATH}


# ─────────────────────────────────────────────────────────────────
# BACKGROUND TASKS
# ─────────────────────────────────────────────────────────────────
async def _run_full_scrape():
    """Run full scrape of all properties. Called in background."""
    global _scrape_running
    _scrape_running = True
    try:
        logger.info("Starting full Hyatt scrape run...")
        result = await run_hyatt_scraper(HYATT_PROPERTIES)
        logger.info(f"Scrape complete: {result}")
    except Exception as e:
        logger.error(f"Scrape run failed: {e}")
    finally:
        _scrape_running = False


async def _refresh_single_property(prop: dict):
    """Refresh a single property from MaxMyPoint."""
    try:
        await scrape_property(prop)
    except Exception as e:
        logger.error(f"Refresh failed for {prop['slug']}: {e}")


async def _run_flight_scrape():
    """Run flight scrape of all routes. Called in background."""
    try:
        logger.info("Starting flight scrape run...")
        result = await run_flight_scraper(tier2=False)  # Tier 1 only for triggered runs
        logger.info(f"Flight scrape complete: {result}")
    except Exception as e:
        logger.error(f"Flight scrape run failed: {e}")


# ─────────────────────────────────────────────────────────────────
# ENTRYPOINT
# ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("api.server:app", host="0.0.0.0", port=port, reload=True)
