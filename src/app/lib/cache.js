import { kv } from "@vercel/kv";

const CACHE_PREFIX = "voyageur:pricing:";
const DEFAULT_TTL = 60 * 60 * 48; // 48 hours

/**
 * Cache pricing data for a hotel
 * @param {string} hotelKey - slugified hotel name (e.g., "park-hyatt-hadahaa")
 * @param {object} data - pricing data to cache
 */
export async function cachePricing(hotelKey, data) {
  const key = CACHE_PREFIX + hotelKey;
  await kv.set(key, JSON.stringify({ ...data, cachedAt: Date.now() }), { ex: DEFAULT_TTL });
}

/**
 * Get cached pricing for a single hotel
 * @param {string} hotelKey - slugified hotel name
 * @returns {object|null} pricing data or null
 */
export async function getCachedPricing(hotelKey) {
  const key = CACHE_PREFIX + hotelKey;
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

/**
 * Get all cached pricing data (for frontend)
 * @returns {object} map of hotelKey -> pricing data
 */
export async function getAllCachedPricing() {
  const keys = await kv.keys(CACHE_PREFIX + "*");
  if (!keys.length) return {};

  const result = {};
  // Batch fetch all keys
  const values = await Promise.all(keys.map(k => kv.get(k)));
  keys.forEach((key, i) => {
    const hotelKey = key.replace(CACHE_PREFIX, "");
    try {
      result[hotelKey] = typeof values[i] === "string" ? JSON.parse(values[i]) : values[i];
    } catch {
      // skip corrupted entries
    }
  });
  return result;
}

/**
 * Slugify a hotel name for use as a cache key
 * @param {string} name - hotel name
 * @returns {string} slugified name
 */
export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
