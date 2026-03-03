import { HYATT_HOTEL_MAP, MMP_API_BASE } from "./config.js";

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Parse a formatted points string like "30,000" or "5,000" to a number
 */
function parsePoints(str) {
  if (!str) return null;
  return parseInt(str.replace(/,/g, ""), 10) || null;
}

/**
 * Fetch pricing for a single hotel from MaxMyPoint by searching its name
 * @param {object} hotelEntry - entry from HYATT_HOTEL_MAP
 * @returns {object} pricing data
 */
async function fetchHotelPricing(hotelEntry) {
  const url = `${MMP_API_BASE}/hotels?search=${encodeURIComponent(hotelEntry.mmpName)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": randomUA(),
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://maxmypoint.com/",
      "Origin": "https://maxmypoint.com",
    },
  });

  if (!res.ok) {
    throw new Error(`MMP API returned ${res.status} for ${hotelEntry.appName}`);
  }

  const data = await res.json();
  const rows = data.rows || data || [];

  // Find the exact match by mmpId
  const match = Array.isArray(rows)
    ? rows.find(r => r.id === hotelEntry.mmpId)
    : null;

  if (!match) {
    throw new Error(`No match found for ${hotelEntry.appName} (mmpId: ${hotelEntry.mmpId})`);
  }

  return {
    hotelName: hotelEntry.appName,
    pointsPerNight: parsePoints(match.medianp),
    medianCPP: parseFloat(match.median_value) || null,
    maxCPP: parseFloat(match.max_point_value) || null,
    minCPP: parseFloat(match.min_point_value) || null,
    availability: match.availability || null,
    mmpCode: match.code,
    source: "maxmypoint",
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fetch pricing for all tracked Hyatt hotels
 * @param {object} options
 * @param {number} options.batchStart - start index for batching
 * @param {number} options.batchSize - number of hotels per batch
 * @param {number} options.delayMs - delay between requests in ms
 * @returns {object} { results: [...], errors: [...] }
 */
export async function fetchAllHyattPricing({
  batchStart = 0,
  batchSize = HYATT_HOTEL_MAP.length,
  delayMs = 1200,
} = {}) {
  const hotels = HYATT_HOTEL_MAP.slice(batchStart, batchStart + batchSize);
  const results = [];
  const errors = [];

  for (const hotel of hotels) {
    try {
      const pricing = await fetchHotelPricing(hotel);
      results.push(pricing);
    } catch (err) {
      errors.push({ hotel: hotel.appName, error: err.message });

      // Retry once after a short delay
      try {
        await sleep(2000);
        const pricing = await fetchHotelPricing(hotel);
        results.push(pricing);
        // Remove from errors since retry succeeded
        errors.pop();
      } catch (retryErr) {
        // Keep the original error
      }
    }

    // Rate-limit: wait between requests
    if (hotels.indexOf(hotel) < hotels.length - 1) {
      await sleep(delayMs);
    }
  }

  return { results, errors };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
