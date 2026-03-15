"""
Voyageur Scraper — Award Flight Pricing via seats.aero Partner API

Uses the cached search endpoint to find award flight availability
across multiple mileage programs for each origin→destination route.

seats.aero response fields:
  - YMileageCost / JMileageCost / FMileageCost: points as strings (e.g. "55000")
  - YAirlines / JAirlines / FAirlines: airline codes (e.g. "NH")
  - YDirect / JDirect / FDirect: boolean for direct flights
  - YAvailable / JAvailable / FAvailable: boolean availability
  - Source: mileage program (e.g. "united", "aeroplan")
"""

import asyncio
import json
import logging
import random
import time
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional

from scraper.flights_config import (
    SEATS_AERO_BASE,
    SEATS_AERO_API_KEY,
    ORIGIN_HUBS,
    DESTINATION_AIRPORTS,
    CABINS,
    FLIGHT_SCRAPER_SETTINGS,
)
from scraper import database

logger = logging.getLogger("voyageur.flights")

# Map seats.aero cabin codes to our cabin names
CABIN_MAP = {
    "economy":  {"avail": "YAvailable", "cost": "YMileageCost", "airline": "YAirlines", "direct": "YDirect"},
    "business": {"avail": "JAvailable", "cost": "JMileageCost", "airline": "JAirlines", "direct": "JDirect"},
    "first":    {"avail": "FAvailable", "cost": "FMileageCost", "airline": "FAirlines", "direct": "FDirect"},
}


def _parse_mileage_cost(cost_str: str) -> Optional[int]:
    """Parse mileage cost string to int. Handles '55000', '55,000', etc."""
    if not cost_str or cost_str == "null":
        return None
    try:
        return int(str(cost_str).replace(",", "").split(".")[0])
    except (ValueError, TypeError):
        return None


def _search_route(origin: str, destination: str, start_date: str, end_date: str) -> list[dict]:
    """
    Call seats.aero cached search for a route.
    Returns list of availability objects.
    """
    if not SEATS_AERO_API_KEY:
        raise ValueError("SEATS_AERO_API_KEY not set")

    params = urllib.parse.urlencode({
        "origin_airport": origin,
        "destination_airport": destination,
        "start_date": start_date,
        "end_date": end_date,
        "take": 200,
    })
    url = f"{SEATS_AERO_BASE}/search?{params}"

    headers = {
        "Partner-Authorization": SEATS_AERO_API_KEY,
        "Accept": "application/json",
    }

    req = urllib.request.Request(url, headers=headers)
    timeout = FLIGHT_SCRAPER_SETTINGS.get("request_timeout", 20)

    resp = urllib.request.urlopen(req, timeout=timeout)
    data = json.loads(resp.read().decode())

    return data.get("data", [])


async def scrape_route(origin: str, destination: str) -> Optional[dict]:
    """
    Fetch award availability for a single route from seats.aero.
    Returns summary dict with best pricing per cabin, or None on failure.
    """
    logger.info(f"Searching {origin} → {destination}")
    start_ms = int(time.time() * 1000)

    settings = FLIGHT_SCRAPER_SETTINGS
    search_date = time.strftime("%Y-%m-%d")

    # Search window: 30-90 days out
    start_date = (datetime.now() + timedelta(days=settings["search_days_ahead_min"])).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=settings["search_days_ahead_max"])).strftime("%Y-%m-%d")

    error_msg = None
    results = None
    max_retries = settings["max_retries"]

    for attempt in range(1, max_retries + 1):
        try:
            # Run sync HTTP call in thread pool to not block event loop
            results = await asyncio.get_event_loop().run_in_executor(
                None, _search_route, origin, destination, start_date, end_date
            )
            break
        except Exception as e:
            error_msg = str(e)
            logger.warning(f"{origin}→{destination}: attempt {attempt}/{max_retries} failed: {e}")
            if attempt < max_retries:
                jitter = random.uniform(0, 1.0)
                await asyncio.sleep(settings["retry_delay_seconds"] + jitter)

    duration_ms = int(time.time() * 1000) - start_ms

    if results is None:
        await database.log_flight_scrape(origin, destination, success=False, error_message=error_msg, duration_ms=duration_ms)
        return None

    # Process results: find best pricing per cabin
    cabin_bests = {}  # cabin → {points, airline, program, direct}

    for avail in results:
        source = avail.get("Source", "")
        travel_date = avail.get("Date", "")

        for cabin_name in CABINS:
            fields = CABIN_MAP.get(cabin_name)
            if not fields:
                continue

            is_available = avail.get(fields["avail"], False)
            if not is_available:
                continue

            points = _parse_mileage_cost(avail.get(fields["cost"], ""))
            if points is None or points <= 0:
                continue

            airline = avail.get(fields["airline"], "")
            is_direct = avail.get(fields["direct"], False)

            # Store individual pricing row
            await database.upsert_flight_pricing(
                origin=origin,
                destination=destination,
                airline=airline or source,
                cabin=cabin_name,
                points=points,
                source_program=source,
                search_date=search_date,
                travel_date=travel_date,
                direct_flight=is_direct,
            )

            # Track best for summary
            current_best = cabin_bests.get(cabin_name)
            if current_best is None or points < current_best["points"]:
                cabin_bests[cabin_name] = {
                    "points": points,
                    "airline": airline,
                    "program": source,
                    "direct": is_direct,
                }
            # Also prefer direct flights if points are within 20%
            elif is_direct and not current_best.get("direct") and points <= current_best["points"] * 1.2:
                cabin_bests[cabin_name] = {
                    "points": points,
                    "airline": airline,
                    "program": source,
                    "direct": is_direct,
                }

    # Compute averages per cabin and update summary table
    for cabin_name in CABINS:
        best = cabin_bests.get(cabin_name)
        if not best:
            continue

        # Calculate average points for this cabin across all results
        all_points = []
        for avail in results:
            fields = CABIN_MAP.get(cabin_name)
            if avail.get(fields["avail"], False):
                pts = _parse_mileage_cost(avail.get(fields["cost"], ""))
                if pts and pts > 0:
                    all_points.append(pts)
        avg_points = int(sum(all_points) / len(all_points)) if all_points else best["points"]

        await database.upsert_flight_summary(
            origin=origin,
            destination=destination,
            cabin=cabin_name,
            best_points=best["points"],
            best_airline=best["airline"],
            best_program=best["program"],
            avg_points=avg_points,
            direct_available=best.get("direct", False),
        )

    results_count = len(results)
    await database.log_flight_scrape(origin, destination, success=True, results_count=results_count, duration_ms=duration_ms)

    cabins_found = list(cabin_bests.keys())
    if cabin_bests:
        for cab, info in cabin_bests.items():
            logger.info(f"  {origin}→{destination} {cab}: {info['points']:,} pts ({info['airline']}, {info['program']})")
    else:
        logger.info(f"  {origin}→{destination}: no availability found in {results_count} results")

    return {"cabins": cabin_bests, "results_count": results_count}


async def run_flight_scraper(tier2: bool = True):
    """
    Scrape all routes: tier1 hubs × all destinations.
    If tier2=True, also include tier2 hubs.
    """
    origins = list(ORIGIN_HUBS["tier1"])
    if tier2:
        origins.extend(ORIGIN_HUBS["tier2"])

    total_routes = len(origins) * len(DESTINATION_AIRPORTS)
    completed = 0
    errors = 0

    logger.info(f"Starting flight scrape: {len(origins)} origins × {len(DESTINATION_AIRPORTS)} destinations = {total_routes} routes")

    for origin in origins:
        for dest in DESTINATION_AIRPORTS:
            # Skip same-airport routes
            if origin == dest:
                completed += 1
                continue

            result = await scrape_route(origin, dest)
            completed += 1
            if result is None:
                errors += 1

            status = "✓" if result else "✗"
            logger.info(f"[{completed}/{total_routes}] {status} {origin}→{dest}")

            # Rate-limit delay
            if completed < total_routes:
                delay = random.uniform(
                    FLIGHT_SCRAPER_SETTINGS["min_delay_seconds"],
                    FLIGHT_SCRAPER_SETTINGS["max_delay_seconds"],
                )
                await asyncio.sleep(delay)

    logger.info(f"Flight scrape complete: {completed - errors}/{total_routes} successful")
    return {"completed": completed, "errors": errors, "total": total_routes}
