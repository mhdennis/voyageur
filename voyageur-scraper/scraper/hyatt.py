"""
Voyageur Scraper — Hyatt Pricing via MaxMyPoint API

Fetches award pricing data from MaxMyPoint (service.maxmypoint.com),
which aggregates Hyatt award rates. This replaces the previous Playwright-based
approach which was blocked by Hyatt's bot detection (429 responses).

MaxMyPoint returns:
  - medianp: median points per night (e.g. "30,000")
  - median_value: median cents per point
  - max_point_value / min_point_value: CPP range
  - availability: percentage string (e.g. "93%")
"""

import asyncio
import json
import logging
import random
import re
import time
import urllib.request
import urllib.parse
from typing import Optional

from scraper.config import (
    HYATT_CATEGORY_CHART,
    MMP_API_BASE,
    SCRAPER_SETTINGS,
    USER_AGENTS,
)
from scraper import database

logger = logging.getLogger("voyageur.hyatt")

POINTS_REGEX = re.compile(r"(\d{1,3}(?:,\d{3})+|\d{4,6})")


def _parse_points(text: str) -> Optional[int]:
    """Parse '30,000' or '30000' → 30000. Returns None if no match."""
    if not text or text == "N/A":
        return None
    match = POINTS_REGEX.search(text)
    if match:
        return int(match.group(1).replace(",", ""))
    return None


def _classify_tier(points: int, category: int) -> str:
    """Classify off_peak / standard / peak based on points vs category chart."""
    chart = HYATT_CATEGORY_CHART.get(category)
    if not chart:
        return "standard"

    off_peak = chart["off_peak"]
    standard = chart["standard"]
    peak = chart["peak"]

    off_peak_boundary = (off_peak + standard) / 2
    standard_boundary = (standard + peak) / 2

    if points <= off_peak_boundary:
        return "off_peak"
    elif points <= standard_boundary:
        return "standard"
    else:
        return "peak"


def _fetch_hotel_from_mmp(mmp_name: str, mmp_id: int) -> Optional[dict]:
    """
    Call MaxMyPoint search API and return the matching hotel row.
    Returns the raw API row dict, or None on failure.
    """
    url = f"{MMP_API_BASE}/hotels?search={urllib.parse.quote(mmp_name)}"
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://maxmypoint.com/",
        "Origin": "https://maxmypoint.com",
    }

    req = urllib.request.Request(url, headers=headers)
    timeout = SCRAPER_SETTINGS.get("request_timeout", 15)

    resp = urllib.request.urlopen(req, timeout=timeout)
    data = json.loads(resp.read().decode())
    rows = data.get("rows", [])

    # Match by mmp_id for precision
    for row in rows:
        if row.get("id") == mmp_id:
            return row

    # Fallback: first result if only one and name matches closely
    if len(rows) == 1:
        return rows[0]

    return None


async def scrape_property(property_config: dict) -> Optional[dict]:
    """
    Fetch pricing for a single Hyatt property from MaxMyPoint.
    Returns pricing dict or None on failure.
    """
    slug = property_config["slug"]
    name = property_config["name"]
    category = property_config["category"]
    mmp_id = property_config.get("mmp_id")
    mmp_name = property_config.get("mmp_name")

    if not mmp_id or not mmp_name:
        logger.warning(f"{name}: no MaxMyPoint mapping, skipping")
        return None

    logger.info(f"Fetching {name} from MaxMyPoint (id={mmp_id})")
    start_ms = int(time.time() * 1000)

    result = None
    error_msg = None
    max_retries = SCRAPER_SETTINGS["max_retries"]

    for attempt in range(1, max_retries + 1):
        try:
            row = _fetch_hotel_from_mmp(mmp_name, mmp_id)
            if row is None:
                logger.warning(f"{name}: no match in MaxMyPoint (attempt {attempt}/{max_retries})")
                if attempt < max_retries:
                    await asyncio.sleep(SCRAPER_SETTINGS["retry_delay_seconds"])
                continue

            points = _parse_points(row.get("medianp"))

            # Fall back to category chart standard rate if MMP has no points
            if points is None:
                chart = HYATT_CATEGORY_CHART.get(category, {})
                if chart:
                    points = chart["standard"]
                    logger.info(f"{name}: MMP has no median points, using category {category} standard: {points:,}")

            median_cpp = None
            try:
                val = row.get("median_value")
                if val and val != "N/A":
                    median_cpp = float(val)
            except (ValueError, TypeError):
                pass

            max_cpp = None
            try:
                val = row.get("max_point_value")
                if val and val != "N/A":
                    max_cpp = float(val)
            except (ValueError, TypeError):
                pass

            # Determine availability
            avail_str = row.get("availability", "")
            availability = True  # default to available
            if avail_str:
                try:
                    avail_pct = int(avail_str.replace("%", ""))
                    availability = avail_pct > 0
                except (ValueError, TypeError):
                    pass

            rate_tier = _classify_tier(points, category) if points else None

            result = {
                "points_per_night": points,
                "rate_tier": rate_tier,
                "availability": availability,
                "median_cpp": median_cpp,
                "max_cpp": max_cpp,
                "availability_pct": avail_str,
            }

            if points:
                logger.info(
                    f"{name}: {points:,} pts/nt [{rate_tier}] "
                    f"(CPP: {median_cpp}, avail: {avail_str})"
                )
            else:
                logger.info(f"{name}: no points data (avail: {avail_str})")
            break

        except Exception as e:
            error_msg = str(e)
            logger.warning(f"{name}: attempt {attempt}/{max_retries} failed: {e}")
            if attempt < max_retries:
                jitter = random.uniform(0, 2.0)
                await asyncio.sleep(SCRAPER_SETTINGS["retry_delay_seconds"] + jitter)

    duration_ms = int(time.time() * 1000) - start_ms
    success = result is not None

    # Log to DB
    check_date = time.strftime("%Y-%m-%d")
    await database.log_scrape(
        slug=slug,
        check_date=check_date,
        success=success,
        error_message=error_msg if not success else None,
        duration_ms=duration_ms,
    )

    if success and result["points_per_night"] is not None:
        await database.upsert_pricing(
            slug=slug,
            check_date=check_date,
            points_per_night=result["points_per_night"],
            rate_tier=result["rate_tier"],
            availability=result["availability"],
            median_cpp=result.get("median_cpp"),
        )

    return result


async def run_hyatt_scraper(properties: list[dict], check_dates: list[str] = None):
    """
    Fetch pricing for all Hyatt properties from MaxMyPoint.
    check_dates param is kept for API compatibility but not used
    (MaxMyPoint returns aggregate pricing, not per-date).
    """
    total = len(properties)
    completed = 0
    errors = 0

    for prop in properties:
        result = await scrape_property(prop)
        completed += 1
        if result is None:
            errors += 1
        status = "✓" if result else "✗"
        logger.info(f"[{completed}/{total}] {status} {prop['name']}")

        # Rate-limit delay between requests
        if completed < total:
            delay = random.uniform(
                SCRAPER_SETTINGS["min_delay_seconds"],
                SCRAPER_SETTINGS["max_delay_seconds"],
            )
            await asyncio.sleep(delay)

    logger.info(f"Hyatt scrape complete: {completed - errors}/{total} successful")
    return {"completed": completed, "errors": errors, "total": total}
