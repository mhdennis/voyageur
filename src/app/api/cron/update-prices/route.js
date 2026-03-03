import { NextResponse } from "next/server";
import { fetchAllHyattPricing } from "../../../lib/maxmypoint/scraper.js";
import { cachePricing, slugify } from "../../../lib/cache.js";

/**
 * Cron endpoint: fetches live Hyatt award pricing from MaxMyPoint
 * and caches results in Vercel KV.
 *
 * Protected by CRON_SECRET header.
 * Supports ?batch=N param for splitting across cron jobs.
 *
 * Schedule: daily at 6 AM UTC (configured in vercel.json)
 */
export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const batch = parseInt(searchParams.get("batch") || "0", 10);
  const batchSize = parseInt(searchParams.get("size") || "6", 10);

  try {
    const { results, errors } = await fetchAllHyattPricing({
      batchStart: batch * batchSize,
      batchSize,
      delayMs: 1200,
    });

    // Cache each result
    let cached = 0;
    for (const pricing of results) {
      const key = slugify(pricing.hotelName);
      await cachePricing(key, pricing);
      cached++;
    }

    return NextResponse.json({
      success: true,
      batch,
      cached,
      errors: errors.length ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
