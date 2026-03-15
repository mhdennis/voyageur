"""
Voyageur Scraper — Configuration
Hyatt-first implementation (fixed category system, valid until May 2026)

Data source: MaxMyPoint API (service.maxmypoint.com)
Hyatt.com blocks automated access (429), so we use MaxMyPoint's hotel
search API which aggregates award pricing data across hotel chains.
"""

import os
from datetime import datetime, timedelta

# ─────────────────────────────────────────────────────────────────
# HYATT AWARD CATEGORY CHART
# Points per night at Off-Peak / Standard / Peak
# Source: World of Hyatt Award Chart (current as of Mar 2026)
# ⚠️  Hyatt expands to 5-tier dynamic pricing in May 2026 — revisit then
# ─────────────────────────────────────────────────────────────────
HYATT_CATEGORY_CHART = {
    1: {"off_peak": 3_500,  "standard": 5_000,  "peak": 6_500},
    2: {"off_peak": 6_000,  "standard": 8_000,  "peak": 10_000},
    3: {"off_peak": 9_000,  "standard": 12_000, "peak": 15_000},
    4: {"off_peak": 12_000, "standard": 15_000, "peak": 18_000},
    5: {"off_peak": 17_000, "standard": 20_000, "peak": 25_000},
    6: {"off_peak": 21_000, "standard": 25_000, "peak": 30_000},
    7: {"off_peak": 26_000, "standard": 30_000, "peak": 35_000},
    8: {"off_peak": 35_000, "standard": 40_000, "peak": 50_000},
}

# ─────────────────────────────────────────────────────────────────
# HYATT PROPERTIES
# All 29 Hyatt properties that appear in the app's DESTINATIONS data
# slug = matches frontend's slugifyHotel() output exactly (API key lookup)
# mmp_id = MaxMyPoint internal hotel ID
# mmp_name = search query for MaxMyPoint API
# ─────────────────────────────────────────────────────────────────
HYATT_PROPERTIES = [
    # ── Park Hyatt ──────────────────────────────────────────────
    {"slug": "park-hyatt-tokyo",           "name": "Park Hyatt Tokyo",                 "property_code": "TYOPH", "city": "Tokyo",       "country": "Japan",                  "category": 7, "mmp_id": 8598,  "mmp_name": "Park Hyatt Tokyo"},
    {"slug": "park-hyatt-new-york",        "name": "Park Hyatt New York",              "property_code": "NYCPH", "city": "New York",    "country": "United States",          "category": 8, "mmp_id": 8613,  "mmp_name": "Park Hyatt New York"},
    {"slug": "park-hyatt-sydney",          "name": "Park Hyatt Sydney",                "property_code": "SYDPH", "city": "Sydney",      "country": "Australia",              "category": 7, "mmp_id": 8611,  "mmp_name": "Park Hyatt Sydney"},
    {"slug": "park-hyatt-hadahaa",         "name": "Park Hyatt Hadahaa",               "property_code": "MLEPH", "city": "Maldives",    "country": "Maldives",               "category": 8, "mmp_id": 8599,  "mmp_name": "Park Hyatt Maldives Hadahaa"},
    {"slug": "park-hyatt-bangkok",         "name": "Park Hyatt Bangkok",               "property_code": "BKKPH", "city": "Bangkok",     "country": "Thailand",               "category": 7, "mmp_id": 8602,  "mmp_name": "Park Hyatt Bangkok"},
    {"slug": "park-hyatt-st-kitts",        "name": "Park Hyatt St. Kitts",             "property_code": "SKBPH", "city": "St. Kitts",   "country": "Saint Kitts and Nevis",  "category": 6, "mmp_id": 8615,  "mmp_name": "Park Hyatt St Kitts"},
    {"slug": "park-hyatt-zanzibar",        "name": "Park Hyatt Zanzibar",              "property_code": "ZNZPH", "city": "Zanzibar",    "country": "Tanzania",               "category": 6, "mmp_id": 8590,  "mmp_name": "Park Hyatt Zanzibar"},
    {"slug": "park-hyatt-niseko-hanazono", "name": "Park Hyatt Niseko Hanazono",       "property_code": "CTSPH", "city": "Niseko",      "country": "Japan",                  "category": 7, "mmp_id": 7300,  "mmp_name": "Park Hyatt Niseko Hanazono"},
    {"slug": "park-hyatt-dubai",           "name": "Park Hyatt Dubai",                 "property_code": "DXBPH", "city": "Dubai",       "country": "UAE",                    "category": 7, "mmp_id": 8593,  "mmp_name": "Park Hyatt Dubai"},
    # ── Andaz ────────────────────────────────────────────────────
    {"slug": "andaz-tokyo-toranomon-hills","name": "Andaz Tokyo Toranomon Hills",      "property_code": "TYOAZ", "city": "Tokyo",       "country": "Japan",                  "category": 6, "mmp_id": 7554,  "mmp_name": "Andaz Tokyo"},
    {"slug": "andaz-papagayo",             "name": "Andaz Papagayo",                   "property_code": "SJOAN", "city": "Guanacaste",  "country": "Costa Rica",             "category": 7, "mmp_id": 7545,  "mmp_name": "Andaz Costa Rica Papagayo"},
    # ── Grand Hyatt ───────────────────────────────────────────────
    {"slug": "grand-hyatt-bali",           "name": "Grand Hyatt Bali",                 "property_code": "DPSGH", "city": "Bali",        "country": "Indonesia",              "category": 5, "mmp_id": 7299,  "mmp_name": "Grand Hyatt Bali"},
    {"slug": "grand-hyatt-seoul",          "name": "Grand Hyatt Seoul",                "property_code": "SELGH", "city": "Seoul",       "country": "South Korea",            "category": 5, "mmp_id": 7631,  "mmp_name": "Grand Hyatt Seoul"},
    # ── Hyatt Regency ─────────────────────────────────────────────
    {"slug": "hyatt-regency-kyoto",        "name": "Hyatt Regency Kyoto",              "property_code": "KYORH", "city": "Kyoto",       "country": "Japan",                  "category": 5, "mmp_id": 7468,  "mmp_name": "Hyatt Regency Kyoto"},
    {"slug": "hyatt-regency-maui-resort-and-spa", "name": "Hyatt Regency Maui Resort and Spa", "property_code": "OGGRM", "city": "Maui", "country": "United States",         "category": 5, "mmp_id": 7354,  "mmp_name": "Hyatt Regency Maui"},
    {"slug": "hyatt-regency-cartagena",    "name": "Hyatt Regency Cartagena",          "property_code": "CTNHR", "city": "Cartagena",   "country": "Colombia",               "category": 4, "mmp_id": 7411,  "mmp_name": "Hyatt Regency Cartagena"},
    {"slug": "hyatt-regency-cape-town",    "name": "Hyatt Regency Cape Town",          "property_code": "CPTRH", "city": "Cape Town",   "country": "South Africa",           "category": 4, "mmp_id": 7444,  "mmp_name": "Hyatt Regency Cape Town"},
    {"slug": "hyatt-regency-casablanca",   "name": "Hyatt Regency Casablanca",         "property_code": "CASHR", "city": "Casablanca",  "country": "Morocco",                "category": 3, "mmp_id": 7442,  "mmp_name": "Hyatt Regency Casablanca"},
    {"slug": "hyatt-regency-muscat",       "name": "Hyatt Regency Muscat",             "property_code": "MCTHR", "city": "Muscat",      "country": "Oman",                   "category": 3, "mmp_id": 7094,  "mmp_name": "Grand Hyatt Muscat"},
    {"slug": "hyatt-regency-barcelona",    "name": "Hyatt Regency Barcelona",          "property_code": "BCNHR", "city": "Barcelona",   "country": "Spain",                  "category": 4, "mmp_id": 7114,  "mmp_name": "Hyatt Regency Barcelona"},
    {"slug": "hyatt-regency-koh-samui",    "name": "Hyatt Regency Koh Samui",          "property_code": "USNHR", "city": "Koh Samui",   "country": "Thailand",               "category": 5, "mmp_id": 7482,  "mmp_name": "Hyatt Regency Koh Samui"},
    {"slug": "hyatt-regency-lisboa",       "name": "Hyatt Regency Lisboa",             "property_code": "LISHR", "city": "Lisbon",      "country": "Portugal",               "category": 4, "mmp_id": 7425,  "mmp_name": "Hyatt Regency Lisbon"},
    # ── Hyatt Centric ─────────────────────────────────────────────
    {"slug": "hyatt-centric-waikiki-beach","name": "Hyatt Centric Waikiki Beach",      "property_code": "HNLHW", "city": "Honolulu",    "country": "United States",          "category": 4, "mmp_id": 7303,  "mmp_name": "Hyatt Centric Waikiki Beach"},
    {"slug": "hyatt-centric-park-city",    "name": "Hyatt Centric Park City",          "property_code": "SLCHC", "city": "Park City",   "country": "United States",          "category": 5, "mmp_id": 7668,  "mmp_name": "Hyatt Centric Park City"},
    # ── Alila ─────────────────────────────────────────────────────
    {"slug": "alila-villas-uluwatu",       "name": "Alila Villas Uluwatu",             "property_code": "DPSAL", "city": "Bali",        "country": "Indonesia",              "category": 8, "mmp_id": 7534,  "mmp_name": "Alila Villas Uluwatu"},
    {"slug": "alila-jabal-akhdar",         "name": "Alila Jabal Akhdar",               "property_code": "MCTAL", "city": "Jabal Akhdar","country": "Oman",                   "category": 7, "mmp_id": 7525,  "mmp_name": "Alila Jabal Akhdar"},
    # ── All-inclusive (Ziva) ──────────────────────────────────────
    {"slug": "hyatt-ziva-riviera-canc-n",  "name": "Hyatt Ziva Riviera Cancún",        "property_code": "CUNJZ", "city": "Cancún",      "country": "Mexico",                 "category": 5, "mmp_id": 7130,  "mmp_name": "Hyatt Ziva Cap Cana"},
    {"slug": "hyatt-ziva-los-cabos",       "name": "Hyatt Ziva Los Cabos",             "property_code": "SJDJZ", "city": "Los Cabos",   "country": "Mexico",                 "category": 5, "mmp_id": 7519,  "mmp_name": "Hyatt Ziva Los Cabos"},
    # ── Residence Club ────────────────────────────────────────────
    {"slug": "hyatt-residence-club",       "name": "Hyatt Residence Club",             "property_code": "ASPHR", "city": "Aspen",       "country": "United States",          "category": 6, "mmp_id": None,  "mmp_name": None},  # Not in MaxMyPoint
]

# ─────────────────────────────────────────────────────────────────
# MAXMYPOINT API
# ─────────────────────────────────────────────────────────────────
MMP_API_BASE = "https://service.maxmypoint.com"

# ─────────────────────────────────────────────────────────────────
# SCRAPER BEHAVIOR
# ─────────────────────────────────────────────────────────────────
SCRAPER_SETTINGS = {
    # Delay between API requests (seconds) to respect rate limits
    "min_delay_seconds": 1.0,
    "max_delay_seconds": 2.5,

    # Retries on transient failures
    "max_retries": 3,
    "retry_delay_seconds": 5.0,

    # HTTP request timeout (seconds)
    "request_timeout": 15,
}

# ─────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────
DB_PATH = os.environ.get("VOYAGEUR_DB_PATH", "voyageur.db")

# Rotate user agents to reduce detection risk
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]
