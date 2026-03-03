/**
 * Mapping of Voyageur hotel names to MaxMyPoint database IDs.
 * Used by the scraper to fetch live award pricing.
 *
 * Fields:
 *   appName  — exact hotel name as it appears in DESTINATIONS
 *   mmpId    — MaxMyPoint internal ID (for /hotel-by-id endpoint)
 *   mmpCode  — MaxMyPoint/Hyatt spirit code
 *   mmpName  — MaxMyPoint's display name (may differ from ours)
 */
export const HYATT_HOTEL_MAP = [
  { appName: "Alila Villas Uluwatu", mmpId: 7534, mmpCode: "dpsav", mmpName: "Alila Villas Uluwatu" },
  { appName: "Hyatt Centric Park City", mmpId: 7668, mmpCode: "slcpc", mmpName: "Hyatt Centric Park City" },
  { appName: "Hyatt Regency Lisboa", mmpId: 7425, mmpCode: "lishr", mmpName: "Hyatt Regency Lisbon" },
  { appName: "Hyatt Regency Tokyo", mmpId: 7472, mmpCode: "tyoty", mmpName: "Hyatt Regency Tokyo" },
  { appName: "Park Hyatt Hadahaa", mmpId: 8599, mmpCode: "mldph", mmpName: "Park Hyatt Maldives Hadahaa" },
  { appName: "Hyatt Regency Barcelona", mmpId: 7114, mmpCode: "bcnrb", mmpName: "Hyatt Regency Barcelona Tower" },
  { appName: "Park Hyatt Bangkok", mmpId: 8602, mmpCode: "bkkph", mmpName: "Park Hyatt Bangkok" },
  { appName: "Hyatt Regency Koh Samui", mmpId: 7482, mmpCode: "usmrk", mmpName: "Hyatt Regency Koh Samui" },
  { appName: "Park Hyatt Dubai", mmpId: 8593, mmpCode: "dxbph", mmpName: "Park Hyatt Dubai" },
  { appName: "Hyatt Ziva Los Cabos", mmpId: 7519, mmpCode: "sjdif", mmpName: "Hyatt Ziva Los Cabos" },
  { appName: "Hyatt Regency Cartagena", mmpId: 7411, mmpCode: "ctgrc", mmpName: "Hyatt Regency Cartagena" },
  { appName: "Hyatt Regency Cape Town", mmpId: 7444, mmpCode: "cptrc", mmpName: "Hyatt Regency Cape Town" },
  { appName: "Andaz Costa Rica Resort at Peninsula Papagayo", mmpId: 7545, mmpCode: "liraz", mmpName: "Andaz Peninsula Papagayo Resort, Costa Rica" },
  { appName: "Alila Jabal Akhdar", mmpId: 7525, mmpCode: "mctal", mmpName: "Alila Jabal Akhdar" },
  { appName: "Hyatt Regency Muscat", mmpId: 7094, mmpCode: "musca", mmpName: "Grand Hyatt Muscat" },
  { appName: "Hyatt Regency Casablanca", mmpId: 7442, mmpCode: "casab", mmpName: "Hyatt Regency Casablanca" },
  { appName: "Park Hyatt Niseko Hanazono", mmpId: 7300, mmpCode: "ctsph", mmpName: "Park Hyatt Niseko Hanazono" },
  { appName: "Hyatt Ziva Cap Cana", mmpId: 7130, mmpCode: "pujif", mmpName: "Hyatt Ziva Cap Cana" },
];

/**
 * Hotels in the app that are NOT tracked by MaxMyPoint.
 * These will always use hardcoded fallback pricing.
 */
export const UNTRACKED_HOTELS = [
  "Hyatt Ziva Riviera Cancún",   // property was rebranded
  "The Palms Turks and Caicos",  // not in MaxMyPoint database
  "Hyatt Residence Club",        // different booking system
];

export const MMP_API_BASE = "https://service.maxmypoint.com";

// Rate limits for anonymous users (per MaxMyPoint system-config)
export const RATE_LIMITS = {
  search: 600,          // per day
  hotelRewardsAvail: 6, // per day
  mapSearch: 10,        // per day
};
