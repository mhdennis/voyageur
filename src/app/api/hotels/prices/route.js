import { NextResponse } from "next/server";
import { getAllCachedPricing } from "../../../lib/cache.js";

/**
 * Frontend-facing endpoint: returns all cached hotel pricing data.
 * Called on page load to merge live pricing with hardcoded fallbacks.
 *
 * Response shape:
 * {
 *   "park-hyatt-hadahaa": {
 *     hotelName: "Park Hyatt Hadahaa",
 *     pointsPerNight: 30000,
 *     medianCPP: 3.6,
 *     availability: "93%",
 *     source: "maxmypoint",
 *     lastUpdated: "2026-03-02T06:00:00.000Z",
 *     cachedAt: 1740898800000
 *   },
 *   ...
 * }
 */
export async function GET() {
  try {
    const pricing = await getAllCachedPricing();

    return NextResponse.json(pricing, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    // If KV is not configured (local dev), return empty object
    // so the app gracefully falls back to hardcoded estimates
    console.error("Failed to fetch cached pricing:", err.message);
    return NextResponse.json({}, {
      headers: {
        "Cache-Control": "public, s-maxage=60",
      },
    });
  }
}
