#!/usr/bin/env python3
"""
Voyageur Scraper — Main Entry Point

Usage:
    python run_scraper.py                    # Fetch hotel pricing (default)
    python run_scraper.py --flights          # Fetch flight pricing from seats.aero
    python run_scraper.py --all              # Fetch both hotels and flights
    python run_scraper.py --dry-run          # Print what would be fetched
    python run_scraper.py --slug park-hyatt-tokyo  # Single hotel property
    python run_scraper.py --stats            # Print DB stats and exit
"""

import argparse
import asyncio
import logging
import sys
import os

# Ensure scraper modules are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scraper import database
from scraper.config import HYATT_PROPERTIES
from scraper.hyatt import run_hyatt_scraper
from scraper.flights import run_flight_scraper
from scraper.flights_config import ORIGIN_HUBS, DESTINATION_AIRPORTS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("scraper.log", mode="a"),
    ],
)
logger = logging.getLogger("voyageur.runner")


def parse_args():
    parser = argparse.ArgumentParser(description="Voyageur award price scraper")
    parser.add_argument("--dry-run", action="store_true", help="Print plan, don't scrape")
    parser.add_argument("--slug", type=str, help="Fetch pricing for a single hotel by slug")
    parser.add_argument("--stats", action="store_true", help="Print DB stats and exit")
    parser.add_argument("--flights", action="store_true", help="Scrape flight pricing from seats.aero")
    parser.add_argument("--all", action="store_true", help="Scrape both hotels and flights")
    parser.add_argument("--tier1-only", action="store_true", help="Only scrape tier 1 hub airports for flights")
    return parser.parse_args()


async def print_stats():
    stats = await database.get_scrape_stats()
    print("\n── Voyageur DB Stats ──────────────────────")
    print(f"  Properties in DB:   {stats['totalProperties']}")
    print(f"  Properties scraped: {stats['scrapedProperties']}")
    if stats.get("lastSuccessfulRunAt"):
        from datetime import datetime
        ts = datetime.fromtimestamp(stats["lastSuccessfulRunAt"] / 1000)
        print(f"  Last successful run: {ts.strftime('%Y-%m-%d %H:%M')}")
    else:
        print("  Last successful run: never")
    print(f"  Errors (24h):       {stats['errors24h']}")

    prices = await database.get_all_prices()
    print(f"\n── Live Prices ({len(prices)} properties) ────────────")
    for slug, data in sorted(prices.items()):
        tier = data.get("rateTier", "?")
        pts = data.get("pointsPerNight", "?")
        cpp = data.get("medianCPP")
        cpp_str = f"{cpp}¢/pt" if cpp else ""
        avail = "✓" if data.get("availability") else "✗"
        print(f"  {avail} {slug:<45} {str(pts):>8} pts  [{tier}] {cpp_str}")
    print()


async def print_flight_stats():
    prices = await database.get_all_flight_prices()
    print(f"\n── Flight Prices ({len(prices)} routes) ────────────")
    for route_key, cabins in sorted(prices.items()):
        for cabin, data in cabins.items():
            pts = data.get("points", "?")
            airline = data.get("airline", "?")
            program = data.get("program", "?")
            direct = "direct" if data.get("direct") else "connect"
            print(f"  {route_key:<12} {cabin:<10} {str(pts):>8} pts  ({airline}, {program}) [{direct}]")
    print()


async def main():
    args = parse_args()

    # Initialize DB
    database.init_db()
    database.seed_properties(HYATT_PROPERTIES)

    # ── Stats only ────────────────────────────────────────────────
    if args.stats:
        await print_stats()
        await print_flight_stats()
        return

    do_hotels = not args.flights or args.all
    do_flights = args.flights or args.all

    # ── Determine what to scrape (hotels) ─────────────────────────
    properties = HYATT_PROPERTIES
    if args.slug:
        properties = [p for p in HYATT_PROPERTIES if p["slug"] == args.slug]
        if not properties:
            available = [p["slug"] for p in HYATT_PROPERTIES]
            print(f"\n✗ No property found with slug '{args.slug}'")
            print(f"  Available slugs:\n  " + "\n  ".join(available))
            sys.exit(1)

    # ── Dry run ───────────────────────────────────────────────────
    if args.dry_run:
        if do_hotels:
            print(f"\n── Hotel Dry Run Plan ─────────────────────────")
            print(f"  Properties: {len(properties)}")
            print(f"  Source:     MaxMyPoint API (service.maxmypoint.com)")
            print(f"\n  Properties to fetch:")
            for p in properties:
                mmp = f"mmp_id={p.get('mmp_id')}" if p.get('mmp_id') else "NOT TRACKED"
                print(f"    • {p['name']} (Cat {p['category']}) → {p['slug']} [{mmp}]")
            print()

        if do_flights:
            origins = list(ORIGIN_HUBS["tier1"])
            if not args.tier1_only:
                origins.extend(ORIGIN_HUBS["tier2"])
            total_routes = len(origins) * len(DESTINATION_AIRPORTS)
            print(f"\n── Flight Dry Run Plan ────────────────────────")
            print(f"  Origins:      {', '.join(origins)}")
            print(f"  Destinations: {len(DESTINATION_AIRPORTS)} airports")
            print(f"  Total routes: {total_routes}")
            print(f"  Source:       seats.aero Partner API")
            print(f"\n  Routes to fetch:")
            for o in origins:
                dests = [d for d in DESTINATION_AIRPORTS if d != o]
                print(f"    {o} → {', '.join(dests)}")
            print()
        return

    # ── Run hotel scraper ─────────────────────────────────────────
    if do_hotels:
        logger.info(f"Starting hotel scrape: {len(properties)} properties via MaxMyPoint API")
        result = await run_hyatt_scraper(properties)
        logger.info(
            f"Hotels done: {result['completed'] - result['errors']}/{result['total']} succeeded, "
            f"{result['errors']} errors"
        )

    # ── Run flight scraper ────────────────────────────────────────
    if do_flights:
        tier2 = not args.tier1_only
        logger.info(f"Starting flight scrape via seats.aero (tier2={tier2})")
        result = await run_flight_scraper(tier2=tier2)
        logger.info(
            f"Flights done: {result['completed'] - result['errors']}/{result['total']} succeeded, "
            f"{result['errors']} errors"
        )

    # Print summary
    if do_hotels:
        await print_stats()
    if do_flights:
        await print_flight_stats()


if __name__ == "__main__":
    asyncio.run(main())
