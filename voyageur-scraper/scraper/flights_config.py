"""
Voyageur Scraper — Flight Pricing Configuration
Data source: seats.aero Partner API (https://seats.aero/partnerapi/)

Authentication: Partner-Authorization header with API key
Endpoint: GET /search?origin_airport=X&destination_airport=Y
"""

import os

# ─────────────────────────────────────────────────────────────────
# SEATS.AERO API
# ─────────────────────────────────────────────────────────────────
SEATS_AERO_BASE = "https://seats.aero/partnerapi"
SEATS_AERO_API_KEY = os.environ.get("SEATS_AERO_API_KEY", "")

# ─────────────────────────────────────────────────────────────────
# ORIGIN HUBS
# Tier 1: scraped every run (major gateway cities)
# Tier 2: scraped every other run (secondary hubs)
# ─────────────────────────────────────────────────────────────────
ORIGIN_HUBS = {
    "tier1": ["JFK", "LAX", "ORD", "MIA", "SFO"],
    "tier2": ["ATL", "IAH", "SEA", "DFW", "DEN"],
}

# ─────────────────────────────────────────────────────────────────
# DESTINATION AIRPORTS
# All unique destination airports from DESTINATIONS in TravelConcierge.jsx
# ─────────────────────────────────────────────────────────────────
DESTINATION_AIRPORTS = [
    "CUN",  # Tulum (Cancún)
    "DPS",  # Bali
    "SLC",  # Park City
    "LIS",  # Lisbon / Comporta
    "NRT",  # Tokyo (+ HND but NRT is primary for award searches)
    "MLE",  # Maldives
    "PLS",  # Turks & Caicos
    "ASE",  # Aspen
    "BCN",  # Barcelona
    "BKK",  # Bangkok / Thailand
    "DXB",  # Dubai
    "SJD",  # Los Cabos
    "CTG",  # Cartagena
    "CPT",  # Cape Town
    "SJO",  # Costa Rica
    "MCT",  # Oman (Muscat)
    "RAK",  # Marrakech
    "CTS",  # Hokkaido (Sapporo)
]

# ─────────────────────────────────────────────────────────────────
# CABINS TO SEARCH
# seats.aero uses: economy, premium, business, first
# We focus on economy + business (most relevant for award travelers)
# ─────────────────────────────────────────────────────────────────
CABINS = ["economy", "business"]

# ─────────────────────────────────────────────────────────────────
# SCRAPER SETTINGS
# ─────────────────────────────────────────────────────────────────
FLIGHT_SCRAPER_SETTINGS = {
    "min_delay_seconds": 0.5,
    "max_delay_seconds": 1.5,
    "max_retries": 2,
    "retry_delay_seconds": 3.0,
    "request_timeout": 20,
    # Search window: look 30-90 days out for representative pricing
    "search_days_ahead_min": 30,
    "search_days_ahead_max": 90,
}
