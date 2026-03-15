import { NextResponse } from "next/server";

/**
 * Frontend-facing endpoint: returns all cached flight pricing data.
 * Called on page load to merge live pricing with hardcoded fallbacks.
 *
 * Response shape:
 * {
 *   "JFK-NRT": {
 *     "economy":  { "points": 55000, "airline": "NH", ... },
 *     "business": { "points": 88000, "airline": "NH", ... },
 *   },
 *   ...
 * }
 */
export async function GET() {
  const apiUrl = process.env.VOYAGEUR_API_URL || "http://localhost:8000";

  // Proxy to Python API server
  try {
    const res = await fetch(`${apiUrl}/api/flights/prices`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { "Cache-Control": "public, s-maxage=60" },
      });
    }
  } catch (e) {
    // Python API not running — return empty
  }

  return NextResponse.json({}, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
