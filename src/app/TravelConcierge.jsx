"use client";

import { useState, useEffect, useCallback } from "react";

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --cream: #F5F0E8;
  --cream-light: #FAF7F2;
  --cream-dark: #E8E0D4;
  --card-bg: #FFFFFF;
  --sage: #8B9E7E;
  --sage-light: #A8B99D;
  --sage-dark: #6B7E60;
  --sage-dim: rgba(139,158,126,0.1);
  --sage-wash: rgba(139,158,126,0.06);
  --terracotta: #C4715B;
  --terracotta-light: #D4907D;
  --terracotta-dim: rgba(196,113,91,0.08);
  --warm-gold: #B8965A;
  --dusty-rose: #C49B8A;
  --soft-plum: #8B7B8E;
  --sky: #7EA5B8;
  --text-primary: #3A3228;
  --text-secondary: #7A7068;
  --text-muted: #A89E94;
  --border: rgba(58,50,40,0.08);
  --border-strong: rgba(58,50,40,0.14);
  --shadow-sm: 0 1px 3px rgba(58,50,40,0.06);
  --shadow-md: 0 4px 16px rgba(58,50,40,0.08);
  --shadow-lg: 0 8px 30px rgba(58,50,40,0.1);
}

body {
  background: var(--cream);
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  letter-spacing: 0.01em;
}

input, select, textarea, button { font-family: 'Outfit', sans-serif; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-up { animation: fadeUp 0.6s ease-out forwards; opacity: 0; }
.fade-up-1 { animation-delay: 0.06s; }
.fade-up-2 { animation-delay: 0.12s; }
.fade-up-3 { animation-delay: 0.18s; }
.fade-up-4 { animation-delay: 0.24s; }
.fade-up-5 { animation-delay: 0.30s; }

input[type="date"] {
  appearance: none;
  -webkit-appearance: none;
  font-family: 'Outfit', sans-serif;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0.5;
  cursor: pointer;
}

nav::-webkit-scrollbar { display: none; }
nav { -ms-overflow-style: none; scrollbar-width: none; }

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--cream-dark); border-radius: 3px; }
::selection { background: rgba(139,158,126,0.2); }
`;

// ============ DATA ============

const CREDIT_CARDS = [
  { id: "chase_sapphire", name: "Chase Sapphire Reserve", issuer: "Chase", color: "#1A3C6E", portalMultiplier: 1.5, transferPartners: ["United", "Hyatt", "Southwest", "British Airways", "Air France"] },
  { id: "amex_plat", name: "Amex Platinum", issuer: "Amex", color: "#8C8C8C", portalMultiplier: 1.0, transferPartners: ["Delta", "Hilton", "Marriott", "ANA", "Singapore Airlines"] },
  { id: "capital_one_vx", name: "Capital One Venture X", issuer: "Capital One", color: "#004977", portalMultiplier: 1.0, transferPartners: ["Turkish Airlines", "Avianca", "Wyndham", "Accor"] },
  { id: "citi_premier", name: "Citi Premier", issuer: "Citi", color: "#003B70", portalMultiplier: 1.0, transferPartners: ["JetBlue", "Turkish Airlines", "Singapore Airlines", "Accor"] },
  { id: "amex_gold", name: "Amex Gold", issuer: "Amex", color: "#B8860B", portalMultiplier: 1.0, transferPartners: ["Delta", "Hilton", "Marriott", "ANA", "British Airways"] },
  { id: "bilt", name: "Bilt Mastercard", issuer: "Bilt", color: "#2A2A2A", portalMultiplier: 1.25, transferPartners: ["Hyatt", "American Airlines", "United", "Turkish Airlines", "IHG"] },
];

const LOYALTY_PROGRAMS = [
  { id: "marriott", name: "Marriott Bonvoy", type: "Hotel", color: "#8B1A4A" },
  { id: "hilton", name: "Hilton Honors", type: "Hotel", color: "#104C97" },
  { id: "hyatt", name: "World of Hyatt", type: "Hotel", color: "#CE0E2D" },
  { id: "ihg", name: "IHG One Rewards", type: "Hotel", color: "#2D6C3F" },
  { id: "delta", name: "Delta SkyMiles", type: "Airline", color: "#003366" },
  { id: "united", name: "United MileagePlus", type: "Airline", color: "#002244" },
  { id: "american", name: "AAdvantage", type: "Airline", color: "#BF0D3E" },
  { id: "southwest", name: "Rapid Rewards", type: "Airline", color: "#304CB2" },
];

const TRIP_TYPES = [
  { id: "solo", label: "Solo Adventure", icon: "🧳", color: "#7EA5B8" },
  { id: "baecation", label: "Baecation", icon: "💕", color: "#C4715B" },
  { id: "girls_trip", label: "Girls Trip", icon: "👯‍♀️", color: "#C49B8A" },
  { id: "guys_trip", label: "Guys Trip", icon: "🤝", color: "#7EA5B8" },
  { id: "family", label: "Family Vacation", icon: "👨‍👩‍👧‍👦", color: "#B8965A" },
  { id: "beach", label: "Beach Getaway", icon: "🏖️", color: "#8B9E7E" },
  { id: "ski", label: "Ski / Cold Weather", icon: "⛷️", color: "#8B7B8E" },
  { id: "city", label: "City Break", icon: "🏙️", color: "#B8965A" },
  { id: "adventure", label: "Adventure", icon: "🏔️", color: "#6B7E60" },
  { id: "wellness", label: "Wellness Retreat", icon: "🧘", color: "#C49B8A" },
];

const BUDGET_OPTIONS = [
  { id: "budget", label: "Budget-Friendly", icon: "💰", desc: "Under $150/night", color: "#8B9E7E" },
  { id: "mid", label: "Mid-Range", icon: "💎", desc: "$150–$350/night", color: "#B8965A" },
  { id: "luxury", label: "Luxury", icon: "👑", desc: "$350+/night", color: "#C4715B" },
  { id: "any", label: "No Preference", icon: "✨", desc: "Show me everything", color: "#8B7B8E" },
];

const VIBE_OPTIONS = [
  { id: "popular", label: "Popular Hotspots", icon: "🔥", desc: "Well-known destinations everyone loves", color: "#C4715B" },
  { id: "hidden", label: "Under the Radar", icon: "🗺️", desc: "Hidden gems & off-the-beaten-path", color: "#8B9E7E" },
  { id: "mix", label: "Mix of Both", icon: "✨", desc: "A blend of iconic & undiscovered", color: "#B8965A" },
];

const REGIONS = [
  { id: "north_america", label: "North America", icon: "🇺🇸" },
  { id: "caribbean", label: "Caribbean", icon: "🌴" },
  { id: "central_america", label: "Central America", icon: "🦜" },
  { id: "south_america", label: "South America", icon: "💃" },
  { id: "europe", label: "Europe", icon: "🏰" },
  { id: "africa", label: "Africa", icon: "🦁" },
  { id: "middle_east", label: "Middle East", icon: "🕌" },
  { id: "asia", label: "Asia", icon: "🏯" },
  { id: "oceania", label: "Oceania", icon: "🐨" },
  { id: "indian_ocean", label: "Indian Ocean", icon: "🐠" },
];

const US_METRO_AREAS = [
  { city: "New York", airports: ["JFK", "EWR", "LGA"], primaryIntl: "JFK" },
  { city: "Los Angeles", airports: ["LAX"], primaryIntl: "LAX" },
  { city: "Chicago", airports: ["ORD", "MDW"], primaryIntl: "ORD" },
  { city: "Houston", airports: ["IAH", "HOU"], primaryIntl: "IAH" },
  { city: "Dallas–Fort Worth", airports: ["DFW", "DAL"], primaryIntl: "DFW" },
  { city: "San Francisco", airports: ["SFO", "OAK"], primaryIntl: "SFO" },
  { city: "Washington DC", airports: ["IAD", "DCA", "BWI"], primaryIntl: "IAD" },
  { city: "Miami", airports: ["MIA", "FLL"], primaryIntl: "MIA" },
  { city: "Atlanta", airports: ["ATL"], primaryIntl: "ATL" },
  { city: "Boston", airports: ["BOS"], primaryIntl: "BOS" },
  { city: "Seattle", airports: ["SEA"], primaryIntl: "SEA" },
  { city: "Phoenix", airports: ["PHX"], primaryIntl: "PHX" },
  { city: "Denver", airports: ["DEN"], primaryIntl: "DEN" },
  { city: "Minneapolis", airports: ["MSP"], primaryIntl: "MSP" },
  { city: "Detroit", airports: ["DTW"], primaryIntl: "DTW" },
  { city: "Philadelphia", airports: ["PHL"], primaryIntl: "PHL" },
  { city: "San Diego", airports: ["SAN"], primaryIntl: "SAN" },
  { city: "Tampa", airports: ["TPA"], primaryIntl: "TPA" },
  { city: "Charlotte", airports: ["CLT"], primaryIntl: "CLT" },
  { city: "Portland", airports: ["PDX"], primaryIntl: "PDX" },
  { city: "Nashville", airports: ["BNA"], primaryIntl: "BNA" },
  { city: "Austin", airports: ["AUS"], primaryIntl: "AUS" },
  { city: "Las Vegas", airports: ["LAS"], primaryIntl: "LAS" },
  { city: "Salt Lake City", airports: ["SLC"], primaryIntl: "SLC" },
  { city: "Honolulu", airports: ["HNL"], primaryIntl: "HNL" },
  { city: "San Antonio", airports: ["SAT"], primaryIntl: "SAT" },
  { city: "Columbus", airports: ["CMH"], primaryIntl: "CMH" },
  { city: "Indianapolis", airports: ["IND"], primaryIntl: "IND" },
  { city: "Raleigh", airports: ["RDU"], primaryIntl: "RDU" },
  { city: "St. Louis", airports: ["STL"], primaryIntl: "STL" },
];

// Distance tier mile estimates (round-trip, per person)
const DISTANCE_TIERS = {
  domestic_short:   { economy: 12500,  business: 25000,  cash_econ: 180,  cash_biz: 450 },
  domestic_long:    { economy: 25000,  business: 50000,  cash_econ: 320,  cash_biz: 750 },
  caribbean_mexico: { economy: 25000,  business: 60000,  cash_econ: 340,  cash_biz: 850 },
  central_america:  { economy: 30000,  business: 65000,  cash_econ: 350,  cash_biz: 900 },
  south_america:    { economy: 60000,  business: 130000, cash_econ: 650,  cash_biz: 3200 },
  transatlantic:    { economy: 60000,  business: 140000, cash_econ: 550,  cash_biz: 3000 },
  transpacific:     { economy: 75000,  business: 160000, cash_econ: 850,  cash_biz: 4500 },
  africa:           { economy: 75000,  business: 160000, cash_econ: 900,  cash_biz: 4200 },
  middle_east:      { economy: 75000,  business: 150000, cash_econ: 700,  cash_biz: 3800 },
  indian_ocean:     { economy: 80000,  business: 170000, cash_econ: 950,  cash_biz: 5000 },
  oceania:          { economy: 80000,  business: 170000, cash_econ: 1000, cash_biz: 5500 },
};

// Region → distance tier mapping
const REGION_TO_TIER = {
  north_america: "domestic_long",
  caribbean: "caribbean_mexico",
  central_america: "central_america",
  south_america: "south_america",
  europe: "transatlantic",
  asia: "transpacific",
  africa: "africa",
  middle_east: "middle_east",
  indian_ocean: "indian_ocean",
  oceania: "oceania",
};

// Airlines that serve each route tier, with program names matching CREDIT_CARDS transferPartners
const AIRLINE_ROUTES = {
  domestic_short: [
    { airline: "United", loyaltyId: "united", econMiles: 12500, bizMiles: 25000, bizCabin: "First Class" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 12500, bizMiles: 25000, bizCabin: "First Class" },
    { airline: "American Airlines", loyaltyId: "american", econMiles: 12500, bizMiles: 25000, bizCabin: "First Class" },
    { airline: "Southwest", loyaltyId: "southwest", econMiles: 12000, bizMiles: null, bizCabin: null, econCabin: "Wanna Get Away" },
  ],
  domestic_long: [
    { airline: "United", loyaltyId: "united", econMiles: 25000, bizMiles: 50000, bizCabin: "First Class" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 25000, bizMiles: 50000, bizCabin: "Delta One" },
    { airline: "American Airlines", loyaltyId: "american", econMiles: 25000, bizMiles: 50000, bizCabin: "First Class" },
    { airline: "JetBlue", loyaltyId: null, econMiles: 20000, bizMiles: 45000, bizCabin: "Mint Business" },
  ],
  caribbean_mexico: [
    { airline: "United", loyaltyId: "united", econMiles: 17500, bizMiles: 35000, bizCabin: "Business" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 18000, bizMiles: 40000, bizCabin: "First Class" },
    { airline: "JetBlue", loyaltyId: null, econMiles: 15000, bizMiles: 36000, bizCabin: "Mint Business" },
    { airline: "Southwest", loyaltyId: "southwest", econMiles: 14000, bizMiles: null, bizCabin: null, econCabin: "Wanna Get Away" },
  ],
  central_america: [
    { airline: "United", loyaltyId: "united", econMiles: 17500, bizMiles: 40000, bizCabin: "Business" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 20000, bizMiles: 45000, bizCabin: "First Class" },
    { airline: "Avianca", loyaltyId: null, econMiles: 20000, bizMiles: 40000, bizCabin: "Business" },
    { airline: "Southwest", loyaltyId: "southwest", econMiles: 16000, bizMiles: null, bizCabin: null, econCabin: "Wanna Get Away" },
  ],
  south_america: [
    { airline: "United", loyaltyId: "united", econMiles: 40000, bizMiles: 80000, bizCabin: "Polaris Business" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 42000, bizMiles: 90000, bizCabin: "Delta One" },
    { airline: "Avianca", loyaltyId: null, econMiles: 30000, bizMiles: 55000, bizCabin: "Business" },
    { airline: "JetBlue", loyaltyId: null, econMiles: 25000, bizMiles: 50000, bizCabin: "Mint Business" },
  ],
  transatlantic: [
    { airline: "United", loyaltyId: "united", econMiles: 30000, bizMiles: 70000, bizCabin: "Polaris Business" },
    { airline: "British Airways", loyaltyId: null, econMiles: 26000, bizMiles: 60000, bizCabin: "Club World" },
    { airline: "Air France", loyaltyId: null, econMiles: 29000, bizMiles: 62000, bizCabin: "Business" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 35000, bizMiles: 85000, bizCabin: "Delta One" },
    { airline: "Turkish Airlines", loyaltyId: null, econMiles: 30000, bizMiles: 63000, bizCabin: "Business" },
  ],
  transpacific: [
    { airline: "ANA", loyaltyId: null, econMiles: 55000, bizMiles: 88000, bizCabin: "Business (The Room)" },
    { airline: "United", loyaltyId: "united", econMiles: 40000, bizMiles: 80000, bizCabin: "Polaris Business" },
    { airline: "Singapore Airlines", loyaltyId: null, econMiles: 60000, bizMiles: 92000, bizCabin: "Business" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 45000, bizMiles: 85000, bizCabin: "Delta One" },
  ],
  africa: [
    { airline: "Delta", loyaltyId: "delta", econMiles: 50000, bizMiles: 95000, bizCabin: "Delta One" },
    { airline: "Turkish Airlines", loyaltyId: null, econMiles: 40000, bizMiles: 80000, bizCabin: "Business" },
    { airline: "United", loyaltyId: "united", econMiles: 45000, bizMiles: 90000, bizCabin: "Polaris Business" },
  ],
  middle_east: [
    { airline: "Turkish Airlines", loyaltyId: null, econMiles: 40000, bizMiles: 75000, bizCabin: "Business" },
    { airline: "United", loyaltyId: "united", econMiles: 45000, bizMiles: 85000, bizCabin: "Polaris Business" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 45000, bizMiles: 90000, bizCabin: "Delta One" },
  ],
  indian_ocean: [
    { airline: "Singapore Airlines", loyaltyId: null, econMiles: 65000, bizMiles: 95000, bizCabin: "Business" },
    { airline: "Turkish Airlines", loyaltyId: null, econMiles: 55000, bizMiles: 90000, bizCabin: "Business" },
    { airline: "United", loyaltyId: "united", econMiles: 55000, bizMiles: 100000, bizCabin: "Polaris Business" },
  ],
  oceania: [
    { airline: "United", loyaltyId: "united", econMiles: 55000, bizMiles: 100000, bizCabin: "Polaris Business" },
    { airline: "ANA", loyaltyId: null, econMiles: 60000, bizMiles: 105000, bizCabin: "Business (The Room)" },
    { airline: "Delta", loyaltyId: "delta", econMiles: 55000, bizMiles: 95000, bizCabin: "Delta One" },
  ],
};

// Hub airports for each airline — used to determine if a flight is direct or connecting
const AIRLINE_HUBS = {
  "United": ["EWR", "IAH", "ORD", "SFO", "LAX", "IAD", "DEN"],
  "Delta": ["JFK", "ATL", "MSP", "DTW", "LAX", "SEA", "BOS", "SLC"],
  "American Airlines": ["DFW", "CLT", "MIA", "ORD", "PHL", "PHX", "LAX"],
  "JetBlue": ["JFK", "BOS", "FLL", "MCO", "LAX"],
  "Southwest": ["DAL", "MDW", "BWI", "HOU", "DEN", "LAS", "PHX", "OAK", "ATL"],
  "British Airways": ["JFK", "BOS", "MIA", "LAX", "SFO", "ORD", "IAD"],
  "Air France": ["JFK", "LAX", "MIA", "SFO", "IAH", "ATL", "BOS", "IAD", "ORD", "DTW"],
  "ANA": ["JFK", "ORD", "LAX", "SFO", "IAH", "IAD", "SEA"],
  "Singapore Airlines": ["JFK", "LAX", "SFO", "IAH", "SEA"],
  "Turkish Airlines": ["JFK", "LAX", "MIA", "ORD", "IAH", "IAD", "ATL", "BOS", "SFO", "DFW"],
  "Avianca": ["JFK", "MIA", "LAX", "ORD", "IAH", "FLL"],
  "Delta": ["JFK", "ATL", "MSP", "DTW", "LAX", "SEA", "BOS", "SLC"],
};

// Connecting hub for airlines on international routes
const AIRLINE_CONNECT_HUBS = {
  "ANA": "NRT", "Singapore Airlines": "SIN", "Turkish Airlines": "IST",
  "British Airways": "LHR", "Air France": "CDG", "Avianca": "BOG",
};

const RATING_CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "🍽️", color: "#C4715B" },
  { id: "nightlife", label: "Nightlife & Social", icon: "🍸", color: "#8B7B8E" },
  { id: "activities", label: "Activities & Excursions", icon: "🎯", color: "#8B9E7E" },
  { id: "value", label: "Value for Money", icon: "💰", color: "#B8965A" },
  { id: "culture", label: "Culture & Immersion", icon: "🎭", color: "#7EA5B8" },
];

const TASTE_TAGS = [
  { group: "Food & Drink", color: "#C4715B", tags: [
    { id: "street_food", label: "Street Food Markets", icon: "🥙" },
    { id: "fine_dining", label: "Fine Dining", icon: "🍷" },
    { id: "farm_to_table", label: "Farm-to-Table", icon: "🌿" },
    { id: "seafood", label: "Fresh Seafood", icon: "🦞" },
    { id: "cooking_class", label: "Cooking Classes", icon: "👨‍🍳" },
    { id: "natural_wine", label: "Natural Wine Bars", icon: "🍇" },
    { id: "craft_cocktails", label: "Craft Cocktails", icon: "🍸" },
    { id: "coffee_culture", label: "Coffee Culture", icon: "☕" },
    { id: "food_tours", label: "Food Tours", icon: "🚶‍♂️" },
    { id: "mezcal_tequila", label: "Mezcal & Spirits", icon: "🥃" },
  ]},
  { group: "Nightlife & Social", color: "#8B7B8E", tags: [
    { id: "rooftop_bars", label: "Rooftop Bars", icon: "🌇" },
    { id: "speakeasy", label: "Speakeasy / Hidden Bars", icon: "🤫" },
    { id: "beach_clubs", label: "Beach Clubs", icon: "🎶" },
    { id: "live_music", label: "Live Music Venues", icon: "🎵" },
    { id: "club_scene", label: "Club / DJ Scene", icon: "🎧" },
    { id: "lounge_vibes", label: "Lounge Vibes", icon: "🛋️" },
  ]},
  { group: "Activities & Adventure", color: "#8B9E7E", tags: [
    { id: "water_sports", label: "Snorkeling / Diving", icon: "🤿" },
    { id: "surfing", label: "Surfing", icon: "🏄" },
    { id: "hiking", label: "Hiking & Trails", icon: "🥾" },
    { id: "cenotes", label: "Cenotes & Waterfalls", icon: "💧" },
    { id: "sunrise_hike", label: "Sunrise / Sunset Spots", icon: "🌅" },
    { id: "boat_day", label: "Boat Days", icon: "⛵" },
    { id: "zip_line", label: "Zip Line / Adrenaline", icon: "🪂" },
    { id: "yoga_retreat", label: "Yoga & Wellness", icon: "🧘" },
    { id: "spa_days", label: "Spa & Relaxation", icon: "💆" },
    { id: "safari", label: "Wildlife & Safari", icon: "🦒" },
  ]},
  { group: "Culture & Aesthetics", color: "#7EA5B8", tags: [
    { id: "art_galleries", label: "Art Galleries", icon: "🖼️" },
    { id: "historic_ruins", label: "Historic Ruins", icon: "🏛️" },
    { id: "local_markets", label: "Local Markets", icon: "🛍️" },
    { id: "architecture", label: "Architecture", icon: "🏗️" },
    { id: "temple_spiritual", label: "Temples & Spiritual", icon: "🕌" },
    { id: "photo_spots", label: "Instagram / Photo Spots", icon: "📸" },
    { id: "walking_neighborhoods", label: "Walkable Neighborhoods", icon: "🚶" },
    { id: "design_hotels", label: "Design-Forward Hotels", icon: "🏨" },
    { id: "bookshops", label: "Bookshops & Cafés", icon: "📚" },
  ]},
  { group: "Vibe & Energy", color: "#B8965A", tags: [
    { id: "chill_slow", label: "Slow & Peaceful", icon: "🌊" },
    { id: "vibrant_energy", label: "Vibrant & High Energy", icon: "⚡" },
    { id: "romantic", label: "Romantic", icon: "💕" },
    { id: "off_grid", label: "Off-the-Grid", icon: "🏕️" },
    { id: "luxury_splurge", label: "Luxury Splurge", icon: "✨" },
    { id: "budget_backpack", label: "Budget / Backpacker", icon: "🎒" },
    { id: "digital_nomad", label: "Digital Nomad Friendly", icon: "💻" },
    { id: "family_friendly", label: "Family Friendly", icon: "👨‍👩‍👧" },
  ]},
];

const ALL_TASTE_TAGS = TASTE_TAGS.flatMap(g => g.tags.map(t => ({ ...t, group: g.group, groupColor: g.color })));

const DESTINATIONS = [
  { id: 1, name: "Tulum", country: "Mexico", region: "caribbean", image: "🌴", vibe: "popular", types: ["beach", "baecation", "girls_trip", "wellness"], bestMonths: [11,12,1,2,3,4], budgetTier: "mid", highlight: "Cenotes, beach clubs & Mayan ruins",
    tasteTags: ["beach_clubs","cenotes","mezcal_tequila","yoga_retreat","design_hotels","rooftop_bars","photo_spots","chill_slow"],
    hotels: [{ name: "Conrad Tulum Riviera Maya", chain: "Hilton", category: "Cat 50", pointsPerNight: 80000, cashPerNight: 450, distinctions: ["Forbes 4-Star", "FHR"], checkPriceUrl: "https://www.hilton.com/en/search/?query=Tulum+Mexico", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Ziva Riviera Cancún", chain: "Hyatt", category: "Cat 5", pointsPerNight: 25000, cashPerNight: 320, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Cancun+Mexico", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Cancún Resort", chain: "Marriott", category: "Cat 6", pointsPerNight: 50000, cashPerNight: 280, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Cancun+Mexico", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["CUN"] },
  { id: 2, name: "Bali", country: "Indonesia", region: "asia", image: "🛕", vibe: "popular", types: ["solo", "baecation", "wellness", "adventure", "family"], bestMonths: [4,5,6,7,8,9], budgetTier: "budget", highlight: "Rice terraces, temples & surf",
    tasteTags: ["temple_spiritual","surfing","yoga_retreat","spa_days","rice_terraces","coffee_culture","chill_slow","design_hotels","sunrise_hike"],
    hotels: [{ name: "Alila Villas Uluwatu", chain: "Hyatt", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 400, distinctions: ["Michelin Key", "Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Bali+Indonesia", comparePriceUrl: "https://maxmypoint.com" },{ name: "W Bali - Seminyak", chain: "Marriott", category: "Cat 7", pointsPerNight: 60000, cashPerNight: 350, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Bali+Indonesia", comparePriceUrl: "https://maxmypoint.com" },{ name: "Four Points Seminyak", chain: "Marriott", category: "Cat 3", pointsPerNight: 20000, cashPerNight: 120, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Bali+Indonesia", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["DPS"] },
  { id: 3, name: "Park City", country: "USA", region: "north_america", image: "🎿", vibe: "popular", types: ["ski", "guys_trip", "family"], bestMonths: [12,1,2,3], budgetTier: "luxury", highlight: "World-class slopes & après-ski",
    tasteTags: ["hiking","luxury_splurge","craft_cocktails","lounge_vibes","family_friendly"],
    hotels: [{ name: "Hyatt Centric Park City", chain: "Hyatt", category: "Cat 5", pointsPerNight: 21000, cashPerNight: 350, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Park+City+Utah", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Mountainside", chain: "Marriott", category: "Cat 6", pointsPerNight: 50000, cashPerNight: 420, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Park+City+Utah", comparePriceUrl: "https://maxmypoint.com" },{ name: "Pendry Park City", chain: "Marriott (Autograph)", category: "Cat 7", pointsPerNight: 60000, cashPerNight: 550, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Park+City+Utah", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["SLC"] },
  { id: 4, name: "Lisbon", country: "Portugal", region: "europe", image: "🏛️", vibe: "popular", types: ["solo", "baecation", "city", "girls_trip", "family"], bestMonths: [3,4,5,6,9,10], budgetTier: "mid", highlight: "Pastéis de nata, trams & fado",
    tasteTags: ["street_food","natural_wine","walking_neighborhoods","art_galleries","coffee_culture","rooftop_bars","photo_spots","architecture","bookshops"],
    hotels: [{ name: "Hyatt Regency Lisboa", chain: "Hyatt", category: "Cat 4", pointsPerNight: 17000, cashPerNight: 220, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Lisbon+Portugal", comparePriceUrl: "https://maxmypoint.com" },{ name: "Moxy Lisbon City", chain: "Marriott", category: "Cat 4", pointsPerNight: 30000, cashPerNight: 160, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Lisbon+Portugal", comparePriceUrl: "https://maxmypoint.com" },{ name: "Tivoli Avenida Liberdade", chain: "Minor (Amex FHR)", category: "FHR", pointsPerNight: null, cashPerNight: 320, distinctions: ["Forbes 4-Star", "FHR"], checkPriceUrl: "https://www.tivolihotels.com/en/tivoli-avenida-liberdade-lisboa", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["LIS"] },
  { id: 5, name: "Tokyo", country: "Japan", region: "asia", image: "🗼", vibe: "popular", types: ["solo", "city"], bestMonths: [3,4,10,11], budgetTier: "mid", highlight: "Ramen, cherry blossoms & Shibuya",
    tasteTags: ["street_food","coffee_culture","architecture","temple_spiritual","local_markets","photo_spots","vibrant_energy","fine_dining"],
    hotels: [{ name: "Hyatt Regency Tokyo", chain: "Hyatt", category: "Cat 4", pointsPerNight: 17000, cashPerNight: 200, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Tokyo+Japan", comparePriceUrl: "https://maxmypoint.com" },{ name: "The Prince Gallery Kioicho", chain: "Marriott", category: "Cat 7", pointsPerNight: 60000, cashPerNight: 380, distinctions: ["Michelin Key", "Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Tokyo+Japan", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hilton Tokyo", chain: "Hilton", category: "Cat 30", pointsPerNight: 50000, cashPerNight: 250, checkPriceUrl: "https://www.hilton.com/en/search/?query=Tokyo+Japan", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["NRT", "HND"] },
  { id: 6, name: "Maldives", country: "Maldives", region: "indian_ocean", image: "🐠", vibe: "popular", types: ["baecation", "beach", "wellness"], bestMonths: [11,12,1,2,3,4], budgetTier: "luxury", highlight: "Overwater villas & pristine reefs",
    tasteTags: ["water_sports","spa_days","luxury_splurge","romantic","sunrise_hike","chill_slow","boat_day","design_hotels"],
    hotels: [{ name: "Park Hyatt Hadahaa", chain: "Hyatt", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 900, distinctions: ["Michelin Key", "Forbes 5-Star"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Maldives", comparePriceUrl: "https://maxmypoint.com" },{ name: "Waldorf Astoria Maldives", chain: "Hilton", category: "Cat 60", pointsPerNight: 120000, cashPerNight: 1800, distinctions: ["Michelin Key", "Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.hilton.com/en/search/?query=Maldives", comparePriceUrl: "https://maxmypoint.com" },{ name: "St. Regis Vommuli", chain: "Marriott", category: "Cat 8", pointsPerNight: 85000, cashPerNight: 1500, distinctions: ["Michelin Key", "Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Maldives", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["MLE"] },
  { id: 9, name: "Amalfi Coast", country: "Italy", region: "europe", image: "🍋", vibe: "popular", types: ["baecation", "girls_trip", "beach"], bestMonths: [5,6,7,8,9], budgetTier: "luxury", highlight: "Limoncello, cliffside towns & pasta",
    tasteTags: ["fine_dining","seafood","boat_day","photo_spots","romantic","walking_neighborhoods","luxury_splurge","natural_wine"],
    hotels: [{ name: "NH Grand Hotel Convento", chain: "Minor (NH)", category: "N/A", pointsPerNight: null, cashPerNight: 500, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.nh-hotels.com/en/hotel/nh-collection-grand-hotel-convento-di-amalfi", comparePriceUrl: "https://maxmypoint.com" },{ name: "Monastero Santa Rosa", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 850, distinctions: ["Michelin Key", "LHW", "Forbes 5-Star"], checkPriceUrl: "https://www.monasterosantarosa.com", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hotel Marina Riviera", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 350, checkPriceUrl: "https://www.marinariviera.it", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["NAP"] },
  { id: 11, name: "Turks & Caicos", country: "Turks & Caicos", region: "caribbean", image: "🐚", vibe: "popular", types: ["beach", "baecation", "family"], bestMonths: [11,12,1,2,3,4,5], budgetTier: "luxury", highlight: "Grace Bay Beach & crystal water",
    tasteTags: ["water_sports","beach_clubs","chill_slow","luxury_splurge","boat_day","spa_days","family_friendly"],
    hotels: [{ name: "Ritz-Carlton Turks & Caicos", chain: "Marriott", category: "Cat 8", pointsPerNight: 85000, cashPerNight: 950, distinctions: ["Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Turks+and+Caicos", comparePriceUrl: "https://maxmypoint.com" },{ name: "The Palms TCI", chain: "Hyatt (Leading Hotels)", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 700, distinctions: ["LHW", "Forbes 4-Star"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Turks+and+Caicos", comparePriceUrl: "https://maxmypoint.com" },{ name: "Wymara Resort", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 550, checkPriceUrl: "https://www.wymararesortandvillas.com", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["PLS"] },
  { id: 13, name: "Santorini", country: "Greece", region: "europe", image: "🏛️", vibe: "popular", types: ["baecation", "girls_trip", "beach"], bestMonths: [5,6,9,10], budgetTier: "luxury", highlight: "Sunsets, caldera views & wine",
    tasteTags: ["photo_spots","romantic","fine_dining","natural_wine","sunrise_hike","walking_neighborhoods","architecture","luxury_splurge"],
    hotels: [{ name: "Canaves Oia Suites", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 650, distinctions: ["LHW", "Forbes 5-Star"], checkPriceUrl: "https://www.canaves.com", comparePriceUrl: "https://maxmypoint.com" },{ name: "Mystique (Luxury Collection)", chain: "Marriott", category: "Cat 8", pointsPerNight: 85000, cashPerNight: 750, distinctions: ["LHW", "Forbes 4-Star", "FHR"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Santorini+Greece", comparePriceUrl: "https://maxmypoint.com" },{ name: "Costa Grand Resort", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 280, checkPriceUrl: "https://www.costagrand.gr", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["JTR", "ATH"] },
  { id: 15, name: "Aspen", country: "USA", region: "north_america", image: "🏂", vibe: "popular", types: ["ski", "guys_trip", "girls_trip"], bestMonths: [12,1,2,3], budgetTier: "luxury", highlight: "Powder days & luxury lodge life",
    tasteTags: ["luxury_splurge","craft_cocktails","lounge_vibes","hiking","fine_dining"],
    hotels: [{ name: "St. Regis Aspen", chain: "Marriott", category: "Cat 8", pointsPerNight: 85000, cashPerNight: 900, distinctions: ["Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Aspen+Colorado", comparePriceUrl: "https://maxmypoint.com" },{ name: "The Little Nell", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 1200, distinctions: ["Forbes 5-Star", "LHW"], checkPriceUrl: "https://www.thelittlenell.com", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Residence Club", chain: "Hyatt", category: "Cat 6", pointsPerNight: 25000, cashPerNight: 450, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Aspen+Colorado", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["ASE"] },
  { id: 16, name: "Barcelona", country: "Spain", region: "europe", image: "🎨", vibe: "popular", types: ["city", "solo", "girls_trip", "baecation", "guys_trip", "family"], bestMonths: [4,5,6,9,10], budgetTier: "mid", highlight: "Gaudí, tapas & beach culture",
    tasteTags: ["street_food","architecture","art_galleries","beach_clubs","live_music","walking_neighborhoods","vibrant_energy","rooftop_bars","coffee_culture"],
    hotels: [{ name: "W Barcelona", chain: "Marriott", category: "Cat 7", pointsPerNight: 60000, cashPerNight: 380, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Barcelona+Spain", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Regency Barcelona", chain: "Hyatt", category: "Cat 4", pointsPerNight: 17000, cashPerNight: 200, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Barcelona+Spain", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hilton Diagonal Mar", chain: "Hilton", category: "Cat 30", pointsPerNight: 50000, cashPerNight: 220, checkPriceUrl: "https://www.hilton.com/en/search/?query=Barcelona+Spain", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["BCN"] },
  { id: 27, name: "Thailand", country: "Thailand", region: "asia", image: "🛺", vibe: "popular", types: ["solo", "city", "adventure", "guys_trip", "beach"], bestMonths: [11,12,1,2,3], budgetTier: "budget", highlight: "Temples, street food, islands & legendary nightlife — all for less",
    tasteTags: ["street_food","rooftop_bars","temple_spiritual","beach_clubs","live_music","vibrant_energy","budget_backpack","local_markets","craft_cocktails","spa_days"],
    hotels: [{ name: "Park Hyatt Bangkok", chain: "Hyatt", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 350, distinctions: ["Forbes 5-Star"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Bangkok+Thailand", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Bangkok Surawongse", chain: "Marriott", category: "Cat 5", pointsPerNight: 35000, cashPerNight: 140, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Bangkok+Thailand", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Regency Koh Samui", chain: "Hyatt", category: "Cat 5", pointsPerNight: 21000, cashPerNight: 200, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Koh+Samui+Thailand", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["BKK"] },
  { id: 28, name: "Iceland", country: "Iceland", region: "europe", image: "🌋", vibe: "popular", types: ["adventure", "solo", "baecation"], bestMonths: [6,7,8,9,1,2,3], budgetTier: "mid", highlight: "Northern lights, glaciers, hot springs & volcanic landscapes",
    tasteTags: ["sunrise_hike","off_grid","photo_spots","natural_wine","spa_days","luxury_splurge","chill_slow"],
    hotels: [{ name: "The Retreat at Blue Lagoon", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 1200, distinctions: ["Forbes 5-Star"], checkPriceUrl: "https://www.bluelagoon.com/accommodation/the-retreat-hotel", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hilton Reykjavik Nordica", chain: "Hilton", category: "Cat 30", pointsPerNight: 50000, cashPerNight: 240, checkPriceUrl: "https://www.hilton.com/en/search/?query=Reykjavik+Iceland", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Edition Reykjavik", chain: "Marriott", category: "Cat 7", pointsPerNight: 60000, cashPerNight: 380, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Reykjavik+Iceland", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["KEF"] },
  { id: 29, name: "Dubai", country: "UAE", region: "middle_east", image: "🌃", vibe: "popular", types: ["city", "family", "baecation", "guys_trip", "beach"], bestMonths: [10,11,12,1,2,3], budgetTier: "luxury", highlight: "Supertall skyline, desert safaris, beach clubs & tax-free shopping",
    tasteTags: ["fine_dining","rooftop_bars","beach_clubs","luxury_splurge","spa_days","photo_spots","design_hotels","vibrant_energy"],
    hotels: [{ name: "Park Hyatt Dubai", chain: "Hyatt", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 500, distinctions: ["Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Dubai", comparePriceUrl: "https://maxmypoint.com" },{ name: "W Dubai - The Palm", chain: "Marriott", category: "Cat 7", pointsPerNight: 60000, cashPerNight: 420, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Dubai", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hilton Dubai Palm Jumeirah", chain: "Hilton", category: "Cat 40", pointsPerNight: 60000, cashPerNight: 300, checkPriceUrl: "https://www.hilton.com/en/search/?query=Dubai", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["DXB"] },
  { id: 30, name: "Cabo", country: "Mexico", region: "north_america", image: "🏖️", vibe: "popular", types: ["beach", "baecation", "guys_trip", "girls_trip", "family"], bestMonths: [10,11,12,1,2,3,4,5], budgetTier: "mid", highlight: "Pacific sunsets, sport fishing, tacos & pool-party energy",
    tasteTags: ["beach_clubs","craft_cocktails","fine_dining","rooftop_bars","spa_days","vibrant_energy","romantic","photo_spots"],
    hotels: [{ name: "Waldorf Astoria Los Cabos", chain: "Hilton", category: "Cat 60", pointsPerNight: 95000, cashPerNight: 700, distinctions: ["Michelin Key", "Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.hilton.com/en/search/?query=Los+Cabos+Mexico", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Ziva Los Cabos", chain: "Hyatt", category: "Cat 5", pointsPerNight: 25000, cashPerNight: 350, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Los+Cabos+Mexico", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Puerto Los Cabos", chain: "Marriott", category: "Cat 6", pointsPerNight: 50000, cashPerNight: 280, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Los+Cabos+Mexico", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["SJD"] },
  { id: 7, name: "Cartagena", country: "Colombia", region: "south_america", image: "🌺", vibe: "hidden", types: ["baecation", "girls_trip", "beach", "city", "guys_trip"], bestMonths: [12,1,2,3,4], budgetTier: "budget", highlight: "Old City, salsa & Caribbean coast",
    tasteTags: ["street_food","craft_cocktails","rooftop_bars","live_music","walking_neighborhoods","photo_spots","vibrant_energy","beach_clubs","romantic"],
    hotels: [{ name: "Hyatt Regency Cartagena", chain: "Hyatt", category: "Cat 4", pointsPerNight: 17000, cashPerNight: 190, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Cartagena+Colombia", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hotel Charleston Santa Teresa", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 220, distinctions: ["LHW"], checkPriceUrl: "https://www.hotelcharlestonsantateresa.com", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["CTG"] },
  { id: 8, name: "Banff", country: "Canada", region: "north_america", image: "🏔️", vibe: "hidden", types: ["adventure", "ski", "solo", "family"], bestMonths: [6,7,8,12,1,2], budgetTier: "mid", highlight: "Lake Louise & Rocky Mountain views",
    tasteTags: ["hiking","sunrise_hike","off_grid","photo_spots","chill_slow","spa_days"],
    hotels: [{ name: "Fairmont Banff Springs", chain: "Accor (Fairmont)", category: "N/A", pointsPerNight: null, cashPerNight: 400, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://all.accor.com/ssr/app/accor/hotels/Banff+Canada", comparePriceUrl: "https://maxmypoint.com" },{ name: "Delta Banff Royal Canadian", chain: "Marriott (Delta)", category: "Cat 5", pointsPerNight: 35000, cashPerNight: 220, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Banff+Canada", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["YYC"] },
  { id: 10, name: "Cape Town", country: "South Africa", region: "africa", image: "🦁", vibe: "hidden", types: ["adventure", "solo", "baecation", "guys_trip"], bestMonths: [10,11,12,1,2,3], budgetTier: "mid", highlight: "Table Mountain, wine & safaris",
    tasteTags: ["natural_wine","safari","hiking","surfing","street_food","art_galleries","rooftop_bars","vibrant_energy","farm_to_table"],
    hotels: [{ name: "Hyatt Regency Cape Town", chain: "Hyatt", category: "Cat 4", pointsPerNight: 17000, cashPerNight: 180, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Cape+Town+South+Africa", comparePriceUrl: "https://maxmypoint.com" },{ name: "One&Only Cape Town", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 650, distinctions: ["Michelin Key", "Forbes 5-Star", "LHW"], checkPriceUrl: "https://www.oneandonlyresorts.com/cape-town", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Crystal Towers", chain: "Marriott", category: "Cat 4", pointsPerNight: 30000, cashPerNight: 140, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Cape+Town+South+Africa", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["CPT"] },
  { id: 12, name: "Medellín", country: "Colombia", region: "south_america", image: "🌸", vibe: "hidden", types: ["solo", "city", "adventure", "guys_trip"], bestMonths: [1,2,3,7,8,12], budgetTier: "budget", highlight: "Eternal spring, nightlife & culture",
    tasteTags: ["street_food","club_scene","coffee_culture","walking_neighborhoods","vibrant_energy","digital_nomad","budget_backpack","live_music"],
    hotels: [{ name: "The Charlee Hotel", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 160, checkPriceUrl: "https://www.thecharlee.com", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Medellín", chain: "Marriott", category: "Cat 3", pointsPerNight: 20000, cashPerNight: 120, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Medellin+Colombia", comparePriceUrl: "https://maxmypoint.com" },{ name: "Element by Westin", chain: "Marriott", category: "Cat 3", pointsPerNight: 20000, cashPerNight: 100, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Medellin+Colombia", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["MDE"] },
  { id: 14, name: "Costa Rica", country: "Costa Rica", region: "central_america", image: "🦜", vibe: "hidden", types: ["adventure", "solo", "family", "wellness"], bestMonths: [12,1,2,3,4], budgetTier: "budget", highlight: "Rainforests, volcanoes & zip lines",
    tasteTags: ["zip_line","surfing","yoga_retreat","hiking","off_grid","wildlife","farm_to_table","chill_slow","family_friendly"],
    hotels: [{ name: "Andaz Papagayo", chain: "Hyatt", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 500, distinctions: ["Forbes 4-Star", "FHR"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Costa+Rica", comparePriceUrl: "https://maxmypoint.com" },{ name: "Marriott Hacienda Belén", chain: "Marriott", category: "Cat 4", pointsPerNight: 30000, cashPerNight: 150, checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=San+Jose+Costa+Rica", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["SJO"] },
  { id: 17, name: "Oman", country: "Oman", region: "middle_east", image: "🕌", vibe: "hidden", types: ["adventure", "solo", "baecation"], bestMonths: [10,11,12,1,2,3], budgetTier: "mid", highlight: "Dramatic wadis, desert camps & souks",
    tasteTags: ["historic_ruins","off_grid","architecture","sunrise_hike","luxury_splurge","spa_days","temple_spiritual"],
    hotels: [{ name: "Al Bustan Palace (Ritz)", chain: "Marriott", category: "Cat 8", pointsPerNight: 85000, cashPerNight: 450, distinctions: ["Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Muscat+Oman", comparePriceUrl: "https://maxmypoint.com" },{ name: "Alila Jabal Akhdar", chain: "Hyatt", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 500, distinctions: ["Michelin Key", "Forbes 4-Star"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Oman", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Regency Muscat", chain: "Hyatt", category: "Cat 3", pointsPerNight: 12000, cashPerNight: 140, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Muscat+Oman", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["MCT"] },
  { id: 18, name: "Oaxaca", country: "Mexico", region: "north_america", image: "🌮", vibe: "hidden", types: ["solo", "adventure", "city", "wellness"], bestMonths: [10,11,12,1,2,3], budgetTier: "budget", highlight: "Mezcal, mole & indigenous culture",
    tasteTags: ["street_food","mezcal_tequila","cooking_class","local_markets","art_galleries","walking_neighborhoods","food_tours","budget_backpack"],
    hotels: [{ name: "Hotel Sin Nombre", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 180, distinctions: ["Condé Nast Hot List"], checkPriceUrl: "https://www.hotelsinnombre.com", comparePriceUrl: "https://maxmypoint.com" },{ name: "Quinta Real Oaxaca", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 200, checkPriceUrl: "https://www.quintareal.com/en/oaxaca", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["OAX"] },
  { id: 19, name: "Tasmania", country: "Australia", region: "oceania", image: "🌿", vibe: "hidden", types: ["adventure", "solo", "wellness"], bestMonths: [12,1,2,3], budgetTier: "mid", highlight: "MONA, wild coastlines & farm-to-table",
    tasteTags: ["farm_to_table","hiking","natural_wine","off_grid","art_galleries","chill_slow","seafood"],
    hotels: [{ name: "Saffire Freycinet", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 700, distinctions: ["LHW", "Forbes 5-Star"], checkPriceUrl: "https://www.saffire-freycinet.com.au", comparePriceUrl: "https://maxmypoint.com" },{ name: "MACq 01 Hotel Hobart", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 220, checkPriceUrl: "https://www.macq01.com.au", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["HBA"] },
  { id: 20, name: "Montenegro", country: "Montenegro", region: "europe", image: "⛰️", vibe: "hidden", types: ["baecation", "adventure", "beach", "city", "guys_trip"], bestMonths: [5,6,7,8,9], budgetTier: "budget", highlight: "Bay of Kotor & Adriatic coast gems",
    tasteTags: ["boat_day","walking_neighborhoods","seafood","photo_spots","budget_backpack","architecture","beach_clubs","romantic"],
    hotels: [{ name: "Regent Porto Montenegro", chain: "IHG", category: "Cat 5", pointsPerNight: 40000, cashPerNight: 350, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.ihg.com/rewardsclub/us/en/redeem-rewards/hotel-rewards?query=Montenegro", comparePriceUrl: "https://maxmypoint.com" },{ name: "One&Only Portonovi", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 600, distinctions: ["Michelin Key", "Forbes 5-Star", "LHW"], checkPriceUrl: "https://www.oneandonlyresorts.com/portonovi", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["TGD"] },
  { id: 21, name: "Luang Prabang", country: "Laos", region: "asia", image: "🏯", vibe: "hidden", types: ["solo", "adventure", "wellness"], bestMonths: [10,11,12,1,2,3], budgetTier: "budget", highlight: "Monk processions, waterfalls & night markets",
    tasteTags: ["temple_spiritual","street_food","chill_slow","off_grid","local_markets","sunrise_hike","budget_backpack","walking_neighborhoods"],
    hotels: [{ name: "Sofitel Luang Prabang", chain: "Accor", category: "N/A", pointsPerNight: null, cashPerNight: 250, checkPriceUrl: "https://all.accor.com/ssr/app/accor/hotels/Luang+Prabang+Laos", comparePriceUrl: "https://maxmypoint.com" },{ name: "Villa Maly Boutique", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 90, checkPriceUrl: "https://www.villa-maly.com", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["LPQ"] },
  { id: 22, name: "Puglia", country: "Italy", region: "europe", image: "🫒", vibe: "hidden", types: ["baecation", "girls_trip", "beach", "family"], bestMonths: [5,6,7,8,9,10], budgetTier: "mid", highlight: "Trulli houses, olive groves & Adriatic beaches without the Amalfi crowds",
    tasteTags: ["farm_to_table","natural_wine","walking_neighborhoods","photo_spots","chill_slow","romantic","local_markets","architecture"],
    hotels: [{ name: "Masseria Torre Maizza", chain: "Marriott (Luxury Collection)", category: "Cat 7", pointsPerNight: 60000, cashPerNight: 550, distinctions: ["Michelin Key", "Forbes 5-Star", "LHW"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Puglia+Italy", comparePriceUrl: "https://maxmypoint.com" },{ name: "Borgo Egnazia", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 700, distinctions: ["Forbes 5-Star", "LHW"], checkPriceUrl: "https://www.borgoegnazia.com", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hilton Garden Inn Lecce", chain: "Hilton", category: "Cat 20", pointsPerNight: 40000, cashPerNight: 140, checkPriceUrl: "https://www.hilton.com/en/search/?query=Lecce+Italy", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["BRI"] },
  { id: 23, name: "Marrakech", country: "Morocco", region: "africa", image: "🕌", vibe: "hidden", types: ["girls_trip", "baecation", "city", "wellness"], bestMonths: [3,4,5,10,11], budgetTier: "mid", highlight: "Riads, souks, hammams & rooftop dining in the medina",
    tasteTags: ["local_markets","spa_days","rooftop_bars","street_food","photo_spots","design_hotels","walking_neighborhoods","romantic"],
    hotels: [{ name: "Royal Mansour", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 1100, distinctions: ["Michelin Key", "Forbes 5-Star", "LHW"], checkPriceUrl: "https://www.royalmansour.com", comparePriceUrl: "https://maxmypoint.com" },{ name: "Four Seasons Marrakech", chain: "Independent (Amex FHR)", category: "FHR", pointsPerNight: null, cashPerNight: 650, distinctions: ["Forbes 5-Star", "FHR"], checkPriceUrl: "https://www.fourseasons.com/marrakech", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Regency Casablanca", chain: "Hyatt", category: "Cat 3", pointsPerNight: 12000, cashPerNight: 110, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Casablanca+Morocco", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["RAK"] },
  { id: 24, name: "Namibia", country: "Namibia", region: "africa", image: "🦓", vibe: "hidden", types: ["adventure", "solo", "baecation"], bestMonths: [5,6,7,8,9,10], budgetTier: "luxury", highlight: "Sossusvlei dunes, skeleton coast & stargazing safaris",
    tasteTags: ["off_grid","sunrise_hike","photo_spots","chill_slow","luxury_splurge","safari"],
    hotels: [{ name: "Zannier Sonop", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 1400, distinctions: ["Condé Nast Hot List"], checkPriceUrl: "https://www.zannierhotels.com/sonop", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hilton Windhoek", chain: "Hilton", category: "Cat 20", pointsPerNight: 30000, cashPerNight: 120, checkPriceUrl: "https://www.hilton.com/en/search/?query=Windhoek+Namibia", comparePriceUrl: "https://maxmypoint.com" },{ name: "&Beyond Sossusvlei Desert Lodge", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 950, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.andbeyond.com/our-lodges/africa/namibia/sossusvlei-desert/sossusvlei-desert-lodge", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["WDH"] },
  { id: 25, name: "Niseko", country: "Japan", region: "asia", image: "🎿", vibe: "hidden", types: ["ski", "adventure", "guys_trip", "family"], bestMonths: [12,1,2,3], budgetTier: "luxury", highlight: "Japan's powder paradise — world-class skiing, onsens & izakayas",
    tasteTags: ["street_food","fine_dining","spa_days","off_grid","luxury_splurge","craft_cocktails"],
    hotels: [{ name: "Park Hyatt Niseko Hanazono", chain: "Hyatt", category: "Cat 7", pointsPerNight: 30000, cashPerNight: 800, distinctions: ["Forbes 5-Star"], checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Niseko+Japan", comparePriceUrl: "https://maxmypoint.com" },{ name: "Higashiyama Niseko Village (Ritz)", chain: "Marriott", category: "Cat 8", pointsPerNight: 85000, cashPerNight: 650, distinctions: ["Forbes 4-Star"], checkPriceUrl: "https://www.marriott.com/search/default.mi?destinationAddress=Niseko+Japan", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hilton Niseko Village", chain: "Hilton", category: "Cat 40", pointsPerNight: 60000, cashPerNight: 350, checkPriceUrl: "https://www.hilton.com/en/search/?query=Niseko+Japan", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["CTS"] },
  { id: 26, name: "Comporta", country: "Portugal", region: "europe", image: "🌾", vibe: "hidden", types: ["beach", "baecation", "wellness", "girls_trip"], bestMonths: [5,6,7,8,9], budgetTier: "luxury", highlight: "Portugal's barefoot-luxury coast — rice paddies, wild beaches & seafood shacks",
    tasteTags: ["beach_clubs","natural_wine","farm_to_table","chill_slow","design_hotels","romantic","coffee_culture","photo_spots"],
    hotels: [{ name: "Sublime Comporta", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 500, distinctions: ["LHW", "Forbes 4-Star"], checkPriceUrl: "https://www.sublimecomporta.pt", comparePriceUrl: "https://maxmypoint.com" },{ name: "Pestana Comporta", chain: "Independent", category: "N/A", pointsPerNight: null, cashPerNight: 350, checkPriceUrl: "https://www.pestanacollection.com/en/hotel/pestana-comporta", comparePriceUrl: "https://maxmypoint.com" },{ name: "Hyatt Regency Lisboa", chain: "Hyatt", category: "Cat 4", pointsPerNight: 17000, cashPerNight: 220, checkPriceUrl: "https://www.hyatt.com/shop/rooms?location=Lisbon+Portugal", comparePriceUrl: "https://maxmypoint.com" }],
    destinationAirports: ["LIS"] },
];

// ============ ICONS ============
const I = {
  plane: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>,
  hotel: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14M3 21h18M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  compass: (s=16) => <svg width={s} height={s} viewBox="0 0 48 48" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}><circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1"/><path d="M24 8 L24 40" stroke="currentColor" strokeWidth="0.8"/><path d="M8 24 L40 24" stroke="currentColor" strokeWidth="0.8"/><path d="M24 8 L26 14 L24 12 L22 14 Z" fill="currentColor"/><circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.2"/><circle cx="24" cy="24" r="1.2" fill="currentColor"/><path d="M13 13 L35 35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 2"/><path d="M35 13 L13 35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 2"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  starO: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

// ============ UTILITY COMPONENTS ============
const serif = "'Cormorant Garamond', serif";

function StarRating({ rating, onRate, size = 16 }) {
  return (
    <div style={{ display: "flex", gap: 3, cursor: onRate ? "pointer" : "default" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onRate?.(i)} style={{ color: i <= rating ? "#B8965A" : "#D4CCC2", transition: "color 0.2s", transform: `scale(${size/14})`, transformOrigin: "center" }}>
          {i <= rating ? I.star : I.starO}
        </span>
      ))}
    </div>
  );
}

function Badge({ children, color = "var(--sage)", bg }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 500, letterSpacing: "0.03em", color, background: bg || `${color}14`, border: `1px solid ${color}20` }}>{children}</span>;
}

function Button({ children, variant = "primary", onClick, style = {}, disabled }) {
  const base = { padding: "10px 22px", borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s", opacity: disabled ? 0.4 : 1, letterSpacing: "0.02em" };
  const variants = {
    primary: { ...base, background: "var(--sage)", color: "#fff" },
    secondary: { ...base, background: "var(--cream-dark)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" },
    ghost: { ...base, background: "transparent", color: "var(--text-secondary)" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...variants[variant], ...style }}>{children}</button>;
}

function Modal({ isOpen, onClose, title, children, width = 580 }) {
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(58,50,40,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--cream-light)", borderRadius: 16, border: "1px solid var(--border-strong)", width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto", boxShadow: "var(--shadow-lg)", animation: "fadeUp 0.3s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--cream-light)", zIndex: 2, borderRadius: "16px 16px 0 0" }}>
          <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500 }}>{title}</h3>
          <span onClick={onClose} style={{ cursor: "pointer", color: "var(--text-muted)" }}>{I.close}</span>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, marginBottom: 6 }}>{title}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, maxWidth: 340, margin: "0 auto 20px" }}>{subtitle}</p>
      {action}
    </div>
  );
}

function SelectPill({ icon, label, desc, color, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: desc ? "12px 16px" : "8px 16px", borderRadius: desc ? 12 : 24,
      border: `1.5px solid ${active ? color : "var(--border-strong)"}`,
      background: active ? `${color}10` : "var(--card-bg)", color: active ? color : "var(--text-secondary)",
      cursor: "pointer", fontSize: 13, fontWeight: 400, transition: "all 0.2s",
      display: "flex", alignItems: desc ? "flex-start" : "center", gap: 8, textAlign: "left", width: desc ? "100%" : "auto",
      boxShadow: active ? `0 0 0 1px ${color}30` : "none",
    }}>
      <span style={{ fontSize: desc ? 20 : 15 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 500, marginBottom: desc ? 2 : 0, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>{desc}</div>}
      </div>
      {active && <span style={{ marginLeft: "auto", flexShrink: 0, alignSelf: "center", color }}>{I.check}</span>}
    </button>
  );
}

// ============ HELPERS ============
function formatDate(d) {
  if (!d) return "";
  try { const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch { return d; }
}

const DISTINCTION_MAP = {
  "Michelin Key": { icon: "🔑", color: "#C4715B", label: "Michelin Key" },
  "Forbes 5-Star": { icon: "⭐", color: "#B8965A", label: "Forbes 5★" },
  "Forbes 4-Star": { icon: "⭐", color: "#B8965A", label: "Forbes 4★" },
  "LHW": { icon: "🏛️", color: "#8B7B8E", label: "LHW" },
  "FHR": { icon: "💎", color: "#7EA5B8", label: "Amex FHR" },
  "Condé Nast Hot List": { icon: "🔥", color: "#C4715B", label: "CN Hot List" },
};

function DistinctionBadges({ distinctions, compact = false }) {
  if (!distinctions?.length) return null;
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: compact ? 0 : 3 }}>
      {distinctions.map(d => {
        const info = DISTINCTION_MAP[d];
        if (!info) return null;
        return compact ? (
          <span key={d} title={info.label} style={{ fontSize: 10 }}>{info.icon}</span>
        ) : (
          <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 2, padding: "1px 6px", borderRadius: 6, fontSize: 9, fontWeight: 600, color: info.color, background: `${info.color}0A`, border: `1px solid ${info.color}15`, letterSpacing: "0.02em" }}>{info.icon} {info.label}</span>
        );
      })}
    </div>
  );
}

function getGoogleFlightsUrl(origin, destAirport, travelDates) {
  const startDate = (travelDates?.flexibility !== "flexible" && travelDates?.startDate) || null;
  const endDate = (travelDates?.flexibility !== "flexible" && travelDates?.endDate) || null;
  let q = `flights from ${origin} to ${destAirport}`;
  if (startDate) {
    const fmt = (d) => { const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); };
    q += ` departing ${fmt(startDate)}`;
    if (endDate) q += ` returning ${fmt(endDate)}`;
  }
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

function buildCheckPriceUrl(hotel, dest, travelDates) {
  const chain = hotel.chain || "";
  const startDate = (travelDates?.flexibility !== "flexible" && travelDates?.startDate) || null;
  const endDate = (travelDates?.flexibility !== "flexible" && travelDates?.endDate) || null;

  // Independent, Minor, or unknown chains → use direct hotel URL
  if (chain.includes("Independent") || chain.includes("Minor") || chain.includes("Amex FHR")) {
    return hotel.checkPriceUrl || null;
  }

  const hotelQuery = `${hotel.name}, ${dest.name}, ${dest.country}`.replace(/ /g, "+");
  const locQuery = `${hotel.name}+${dest.name}+${dest.country}`.replace(/ /g, "+");

  // Hyatt — /shop/rooms path with location search + dates
  if (chain.includes("Hyatt")) {
    let url = `https://www.hyatt.com/shop/rooms?location=${locQuery}&rooms=1&adults=1&kids=0`;
    if (startDate && endDate) url += `&checkinDate=${startDate}&checkoutDate=${endDate}`;
    return url;
  }

  // Marriott (includes Autograph, Delta, Luxury Collection) — /search/default.mi
  if (chain.includes("Marriott") || chain.includes("Autograph") || chain.includes("Luxury Collection")) {
    let url = `https://www.marriott.com/search/default.mi?destinationAddress=${hotelQuery}&roomCount=1&numAdultsPerRoom=1`;
    if (startDate && endDate) {
      const fmtM = (d) => { const [y,m,dd] = d.split("-"); return `${m}/${dd}/${y}`; };
      url += `&fromDate=${fmtM(startDate)}&toDate=${fmtM(endDate)}`;
    }
    return url;
  }

  // Hilton — /en/search/ with dates
  if (chain.includes("Hilton")) {
    let url = `https://www.hilton.com/en/search/?query=${hotelQuery}&numRooms=1&numAdults=1&numChildren=0`;
    if (startDate && endDate) url += `&arrivalDate=${startDate}&departureDate=${endDate}&flexibleDates=false`;
    return url;
  }

  // IHG — rewards redemption search with dates
  if (chain.includes("IHG")) {
    let url = `https://www.ihg.com/rewardsclub/us/en/redeem-rewards/hotel-rewards?query=${locQuery}`;
    if (startDate && endDate) {
      const [sy,sm,sd] = startDate.split("-");
      const [ey,em,ed] = endDate.split("-");
      url += `&checkInDate=${parseInt(sd)}&checkInMonthYear=${sm}${sy}&checkOutDate=${parseInt(ed)}&checkOutMonthYear=${em}${ey}`;
    }
    return url;
  }

  // Accor / Fairmont — keep existing URL (no reliable date params)
  if (chain.includes("Accor") || chain.includes("Fairmont")) {
    return hotel.checkPriceUrl || null;
  }

  // Fallback
  return hotel.checkPriceUrl || null;
}

// ============ LIVE PRICING HELPER ============
function slugifyHotel(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getEffectivePricing(hotel, livePricing) {
  if (!livePricing || !hotel) return { pointsPerNight: hotel?.pointsPerNight, cashPerNight: hotel?.cashPerNight, isLive: false };
  const key = slugifyHotel(hotel.name);
  const live = livePricing[key];
  if (live && live.pointsPerNight) {
    const staleThreshold = 72 * 60 * 60 * 1000; // 72 hours
    const isStale = live.cachedAt && (Date.now() - live.cachedAt > staleThreshold);
    return {
      pointsPerNight: live.pointsPerNight,
      cashPerNight: hotel.cashPerNight, // cash stays hardcoded for now
      isLive: true,
      isStale,
      availability: live.availability,
      medianCPP: live.medianCPP,
    };
  }
  return { pointsPerNight: hotel?.pointsPerNight, cashPerNight: hotel?.cashPerNight, isLive: false };
}

function getBestHotelPoints(dest) {
  const r = dest.hotels.filter(h => h.pointsPerNight);
  if (!r.length) return null;
  return r.reduce((b, h) => (!b || h.pointsPerNight < b.pointsPerNight) ? h : b, null);
}
function getBestFlightMiles(flights) {
  if (!flights?.length) return null;
  const econ = flights.filter(f => f.cabin.toLowerCase().includes("economy") || f.cabin.toLowerCase().includes("wanna"));
  return (econ.length > 0 ? econ : flights).reduce((b, f) => (!b || f.miles < b.miles) ? f : b, null);
}

// Generate dynamic flight options based on user's home airport and destination
function generateFlightOptions(homeAirport, dest) {
  if (!homeAirport || !dest.destinationAirports?.length) return [];

  const region = dest.region;
  const isDomestic = region === "north_america";
  const origin = isDomestic ? homeAirport.airports[0] : homeAirport.primaryIntl;
  const destAirport = dest.destinationAirports[0];
  const tier = REGION_TO_TIER[region] || "transatlantic";
  const routes = AIRLINE_ROUTES[tier];
  if (!routes) return [];

  // Build route string: "ORD → NRT" or "ORD → DPS (via NRT)" for connecting
  const buildRoute = (airline) => {
    const hubs = AIRLINE_HUBS[airline] || [];
    const connectHub = AIRLINE_CONNECT_HUBS[airline];
    const isDirect = hubs.includes(origin) || isDomestic;
    if (isDirect || !connectHub) return `${origin} → ${destAirport}`;
    return `${origin} → ${destAirport} (via ${connectHub})`;
  };

  const flights = [];
  const seen = new Set();

  // Add 2 economy + 1-2 business options from different airlines
  let econCount = 0;
  let bizCount = 0;
  for (const r of routes) {
    const econKey = `${r.airline}-econ`;
    const bizKey = `${r.airline}-biz`;
    if (econCount < 2 && !seen.has(econKey)) {
      const route = buildRoute(r.airline);
      const cabin = r.econCabin || "Economy";
      // Slight variation: ±10% randomized per airline for realism
      const jitter = 1 + ((r.airline.length % 5) - 2) * 0.03;
      const tierData = DISTANCE_TIERS[tier];
      flights.push({
        airline: r.airline,
        route,
        cabin,
        miles: r.econMiles || Math.round(tierData.economy * jitter / 500) * 500,
        cash: Math.round((tierData.cash_econ * jitter) / 10) * 10,
      });
      seen.add(econKey);
      econCount++;
    }
    if (bizCount < 2 && r.bizMiles && r.bizCabin && !seen.has(bizKey)) {
      const route = buildRoute(r.airline);
      const tierData = DISTANCE_TIERS[tier];
      const jitter = 1 + ((r.airline.length % 3) - 1) * 0.04;
      flights.push({
        airline: r.airline,
        route,
        cabin: r.bizCabin,
        miles: r.bizMiles || Math.round(tierData.business * jitter / 1000) * 1000,
        cash: Math.round((tierData.cash_biz * jitter) / 50) * 50,
      });
      seen.add(bizKey);
      bizCount++;
    }
    if (econCount >= 2 && bizCount >= 2) break;
  }

  // Ensure at least 1 business option if we have any routes
  if (bizCount === 0 && routes.length > 0) {
    const r = routes.find(r2 => r2.bizMiles && r2.bizCabin);
    if (r) {
      flights.push({
        airline: r.airline,
        route: buildRoute(r.airline),
        cabin: r.bizCabin,
        miles: r.bizMiles,
        cash: DISTANCE_TIERS[tier]?.cash_biz || 2000,
      });
    }
  }

  return flights;
}

// ============ MAIN APP ============
export default function TravelConcierge() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userCards, setUserCards] = useState([]);
  const [userLoyalty, setUserLoyalty] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [budgetPref, setBudgetPref] = useState("any");
  const [vibePref, setVibePref] = useState("mix");
  const [regionPrefs, setRegionPrefs] = useState([]);
  const [homeAirport, setHomeAirport] = useState(null);
  const [travelDates, setTravelDates] = useState(null);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddLoyalty, setShowAddLoyalty] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedDest, setSelectedDest] = useState(null);
  const [playbookDest, setPlaybookDest] = useState(null);
  const [surpriseResult, setSurpriseResult] = useState(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [newTrip, setNewTrip] = useState({ destination: "", type: "", ratings: { food:0, nightlife:0, activities:0, value:0, culture:0 }, notes: "", date: "", hotel: "", flight: "", pointsSpent: "", cashSaved: "", highlights: "" });
  const [plannedTrips, setPlannedTrips] = useState([]);
  const [goals, setGoals] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [inspoBoard, setInspoBoard] = useState([]);
  const [recapTrip, setRecapTrip] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [livePricing, setLivePricing] = useState({});

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voyageur_data");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.homeAirport) setHomeAirport(d.homeAirport);
        if (d.travelDates) setTravelDates(d.travelDates);
        if (d.preferences?.length) setPreferences(d.preferences);
        if (d.budgetPref) setBudgetPref(d.budgetPref);
        if (d.vibePref) setVibePref(d.vibePref);
        if (d.regionPrefs?.length) setRegionPrefs(d.regionPrefs);
        if (d.userCards?.length) setUserCards(d.userCards);
        if (d.userLoyalty?.length) setUserLoyalty(d.userLoyalty);
        if (d.tripHistory?.length) setTripHistory(d.tripHistory);
        if (d.inspoBoard?.length) setInspoBoard(d.inspoBoard);
        if (d.plannedTrips?.length) setPlannedTrips(d.plannedTrips);
        if (d.goals?.length) setGoals(d.goals);
        if (d.showOnboarding === false) setShowOnboarding(false);
      }
    } catch (e) { /* ignore corrupted localStorage */ }
    setHydrated(true);
  }, []);

  // Fetch live pricing from API on mount
  useEffect(() => {
    fetch("/api/hotels/prices")
      .then(res => res.ok ? res.json() : {})
      .then(data => setLivePricing(data || {}))
      .catch(() => {}); // Fail silently — hardcoded fallbacks always available
  }, []);

  // Save to localStorage on every state change (debounced)
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("voyageur_data", JSON.stringify({
          homeAirport, travelDates, preferences, budgetPref, vibePref, regionPrefs,
          userCards, userLoyalty, tripHistory, inspoBoard, plannedTrips,
          goals, showOnboarding,
        }));
      } catch (e) { /* localStorage full or unavailable */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [homeAirport, travelDates, preferences, budgetPref, vibePref, regionPrefs,
      userCards, userLoyalty, tripHistory, inspoBoard, plannedTrips,
      goals, showOnboarding, hydrated]);

  const totalPoints = userCards.reduce((s,c) => s+(c.points||0), 0) + userLoyalty.reduce((s,l) => s+(l.points||0), 0);

  // Compute taste profile from inspo board
  const tasteProfile = (() => {
    const counts = {};
    inspoBoard.forEach(item => { (item.tags||[]).forEach(t => { counts[t] = (counts[t]||0) + 1; }); });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]).map(([id, count]) => ({ id, count, tag: ALL_TASTE_TAGS.find(t=>t.id===id) })).filter(x=>x.tag);
  })();

  // Generate flight options dynamically from user's home airport
  const getFlights = useCallback((dest) => {
    if (!homeAirport) return [];
    return generateFlightOptions(homeAirport, dest);
  }, [homeAirport]);

  const getRecommendations = useCallback(() => {
    return DESTINATIONS.map(dest => {
      let score = 0;
      score += dest.types.filter(t => preferences.includes(t)).length * 30;
      if (budgetPref !== "any") { if (dest.budgetTier === budgetPref) score += 20; else score -= 5; }
      if (vibePref === "popular" && dest.vibe === "popular") score += 30;
      if (vibePref === "popular" && dest.vibe === "hidden") score -= 20;
      if (vibePref === "hidden" && dest.vibe === "hidden") score += 30;
      if (vibePref === "hidden" && dest.vibe === "popular") score -= 20;
      if (vibePref === "mix") score += 5;
      if (regionPrefs.length > 0) { if (regionPrefs.includes(dest.region)) score += 25; else score -= 10; }
      const bh = getBestHotelPoints(dest); const bf = getBestFlightMiles(getFlights(dest));
      const needed = (bh ? bh.pointsPerNight*4 : 100000) + (bf ? bf.miles : 50000);
      if (totalPoints >= needed) score += 25; else if (totalPoints >= needed*0.6) score += 10;
      tripHistory.forEach(trip => { const cr = trip.ratings ? Object.values(trip.ratings).reduce((a,b)=>a+b,0)/RATING_CATEGORIES.length : (trip.rating||0); if (cr >= 4) { const pd = DESTINATIONS.find(d => d.name === trip.destination); if (pd) score += dest.types.filter(t => pd.types.includes(t)).length * cr * 3; }});
      if (dest.bestMonths.includes(new Date().getMonth()+1)) score += 15;
      if (tripHistory.some(t => t.destination === dest.name)) score -= 10;
      // TASTE MATCHING — the key new signal
      if (tasteProfile.length > 0 && dest.tasteTags) {
        const topTastes = tasteProfile.slice(0, 10);
        let tasteScore = 0;
        topTastes.forEach(tp => {
          if (dest.tasteTags.includes(tp.id)) tasteScore += tp.count * 8;
        });
        score += tasteScore;
      }
      // Compute taste match % for display
      let tasteMatch = 0;
      if (tasteProfile.length > 0 && dest.tasteTags) {
        const userTasteIds = tasteProfile.slice(0, 12).map(t => t.id);
        const matched = dest.tasteTags.filter(t => userTasteIds.includes(t)).length;
        tasteMatch = Math.round(matched / Math.max(userTasteIds.length, 1) * 100);
      }
      return { ...dest, score, tasteMatch };
    }).sort((a,b) => b.score - a.score);
  }, [preferences, budgetPref, vibePref, regionPrefs, totalPoints, tripHistory, tasteProfile, getFlights]);

  const recommendations = getRecommendations();
  const handleSurpriseMe = () => { const top = recommendations.slice(0,5); setSurpriseResult(top[Math.floor(Math.random()*top.length)]); };

  // ============ HYDRATION GUARD ============
  if (!hydrated) {
    return (<div style={{ minHeight: "100vh", background: "var(--cream)" }}><style>{FONTS_CSS}</style></div>);
  }

  // ============ ONBOARDING ============
  if (showOnboarding) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "var(--cream)" }}>
        <style>{FONTS_CSS}</style>
        <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
          {onboardingStep === 0 && (
            <div className="fade-up">
              <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="var(--sage)" strokeWidth="1"/>
                  <path d="M24 8 L24 40" stroke="var(--sage)" strokeWidth="0.8"/>
                  <path d="M8 24 L40 24" stroke="var(--sage)" strokeWidth="0.8"/>
                  <path d="M24 8 L26 14 L24 12 L22 14 Z" fill="var(--sage)"/>
                  <circle cx="24" cy="24" r="3" fill="var(--sage)" opacity="0.2"/>
                  <circle cx="24" cy="24" r="1.2" fill="var(--sage)"/>
                  <path d="M13 13 L35 35" stroke="var(--sage)" strokeWidth="0.5" strokeDasharray="1.5 2"/>
                  <path d="M35 13 L13 35" stroke="var(--sage)" strokeWidth="0.5" strokeDasharray="1.5 2"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: serif, fontSize: 52, fontWeight: 400, marginBottom: 8, lineHeight: 1.1, color: "var(--text-primary)" }}>voyageur</h1>
              <div style={{ width: 40, height: 1, background: "var(--sage)", margin: "16px auto 20px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 40, maxWidth: 420, margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 300 }}>Your personal travel concierge. Maximize your points, discover perfect destinations, and craft unforgettable trips.</p>
              <Button onClick={() => setOnboardingStep(1)} style={{ padding: "14px 44px", fontSize: 13, borderRadius: 8, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Where To Next?</Button>
            </div>
          )}
          {onboardingStep === 1 && (
            <div className="fade-up">
              <p style={{ color: "var(--sage)", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", marginBottom: 14 }}>TRAVEL PROFILE · 1 OF 6</p>
              <h2 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, marginBottom: 6 }}>Where do you fly from?</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, fontWeight: 300 }}>Select your home city so we can show you the best routes.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32, maxHeight: 320, overflowY: "auto", padding: "4px 0" }}>
                {US_METRO_AREAS.map(m => <SelectPill key={m.city} icon="✈️" label={m.city} desc={m.airports.join(", ")} color="var(--sky)" active={homeAirport?.city === m.city} onClick={() => setHomeAirport(m)} />)}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Button variant="secondary" onClick={() => setOnboardingStep(0)}>Back</Button>
                <Button onClick={() => setOnboardingStep(2)} disabled={!homeAirport}>Continue</Button>
              </div>
            </div>
          )}
          {onboardingStep === 2 && (
            <div className="fade-up">
              <p style={{ color: "var(--sage)", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", marginBottom: 14 }}>TRAVEL PROFILE · 2 OF 6</p>
              <h2 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, marginBottom: 6 }}>What kind of traveler are you?</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 28, fontWeight: 300 }}>Select all that apply.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
                {TRIP_TYPES.map(t => <SelectPill key={t.id} icon={t.icon} label={t.label} color={t.color} active={preferences.includes(t.id)} onClick={() => setPreferences(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])} />)}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Button variant="secondary" onClick={() => setOnboardingStep(1)}>Back</Button>
                <Button onClick={() => setOnboardingStep(3)} disabled={!preferences.length}>Continue</Button>
              </div>
            </div>
          )}
          {onboardingStep === 3 && (
            <div className="fade-up">
              <p style={{ color: "var(--sage)", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", marginBottom: 14 }}>TRAVEL PROFILE · 3 OF 6</p>
              <h2 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, marginBottom: 6 }}>What's your ideal budget?</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, fontWeight: 300 }}>Per-night hotel range.</p>
              <div style={{ display: "grid", gap: 8, maxWidth: 400, margin: "0 auto 28px" }}>
                {BUDGET_OPTIONS.map(o => <SelectPill key={o.id} icon={o.icon} label={o.label} desc={o.desc} color={o.color} active={budgetPref === o.id} onClick={() => setBudgetPref(o.id)} />)}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}><Button variant="secondary" onClick={() => setOnboardingStep(2)}>Back</Button><Button onClick={() => setOnboardingStep(4)}>Continue</Button></div>
            </div>
          )}
          {onboardingStep === 4 && (() => {
            const selFlex = travelDates?.flexibility || "";
            const startDate = travelDates?.startDate || null;
            const endDate = travelDates?.endDate || null;
            const isFlexible = selFlex === "flexible";
            const canContinue = isFlexible || (startDate && endDate && selFlex);
            const FLEX_OPTIONS = [
              { id: "exact", icon: "📍", label: "Exact dates", color: "var(--sage)" },
              { id: "3_days", icon: "📅", label: "± 3 days", color: "var(--sky)" },
              { id: "1_week", icon: "🗓️", label: "± 1 week", color: "var(--warm-gold)" },
              { id: "flexible", icon: "✨", label: "I'm flexible", color: "var(--terracotta)" },
            ];
            const today = new Date(); today.setHours(0,0,0,0);
            const MNAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            const DNAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];
            const toStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            const fromStr = (s) => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
            const fmtShort = (s) => { if (!s) return "—"; const d = fromStr(s); return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
            const handleDayClick = (dateStr) => {
              if (isFlexible) return;
              if (!startDate || (startDate && endDate)) { setTravelDates(prev => ({ flexibility: prev?.flexibility || "", startDate: dateStr, endDate: null })); }
              else if (dateStr < startDate) { setTravelDates(prev => ({ ...prev, startDate: dateStr, endDate: null })); }
              else { setTravelDates(prev => ({ ...prev, endDate: dateStr })); }
            };
            const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear-1); } else setCalMonth(calMonth-1); };
            const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear+1); } else setCalMonth(calMonth+1); };
            const renderMonth = (mo, yr) => {
              const first = new Date(yr, mo, 1); const days = new Date(yr, mo+1, 0).getDate(); const startDay = first.getDay();
              const cells = []; for (let i=0;i<startDay;i++) cells.push(null); for (let d=1;d<=days;d++) cells.push(d);
              return (
                <div style={{ minWidth: 220 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0, marginBottom: 4 }}>
                    {DNAMES.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, padding: "4px 0", letterSpacing: "0.05em" }}>{d}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
                    {cells.map((d, i) => {
                      if (!d) return <div key={`e${i}`} />;
                      const ds = toStr(new Date(yr, mo, d));
                      const isPast = new Date(yr,mo,d) < today;
                      const isStart = ds === startDate;
                      const isEnd = ds === endDate;
                      const inRange = startDate && endDate && ds > startDate && ds < endDate;
                      const isSelected = isStart || isEnd;
                      return (
                        <button key={ds} onClick={() => !isPast && handleDayClick(ds)} disabled={isPast || isFlexible}
                          style={{
                            width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: isSelected ? 600 : 400, border: "none", cursor: isPast || isFlexible ? "default" : "pointer",
                            borderRadius: isStart && isEnd ? 8 : isStart ? "8px 0 0 8px" : isEnd ? "0 8px 8px 0" : inRange ? 0 : 8,
                            background: isSelected ? "var(--sage)" : inRange ? "var(--sage-dim)" : "transparent",
                            color: isSelected ? "#fff" : isPast ? "var(--border-strong)" : inRange ? "var(--sage-dark)" : "var(--text-primary)",
                            transition: "all 0.15s",
                          }}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            };
            const m2 = calMonth === 11 ? 0 : calMonth + 1;
            const y2 = calMonth === 11 ? calYear + 1 : calYear;
            return (
            <div className="fade-up">
              <p style={{ color: "var(--sage)", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", marginBottom: 14 }}>TRAVEL PROFILE · 4 OF 6</p>
              <h2 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, marginBottom: 6 }}>When are you planning to travel?</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, fontWeight: 300 }}>Select your check-in and check-out dates.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
                <div style={{ padding: "8px 20px", borderRadius: 8, background: startDate ? "var(--sage-dim)" : "var(--cream)", border: `1px solid ${startDate ? "var(--sage)" : "var(--border-strong)"}`, textAlign: "center", minWidth: 110 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 2 }}>CHECK-IN</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: startDate ? "var(--sage-dark)" : "var(--text-muted)" }}>{fmtShort(startDate)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", fontSize: 16 }}>→</div>
                <div style={{ padding: "8px 20px", borderRadius: 8, background: endDate ? "var(--sage-dim)" : "var(--cream)", border: `1px solid ${endDate ? "var(--sage)" : "var(--border-strong)"}`, textAlign: "center", minWidth: 110 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 2 }}>CHECK-OUT</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: endDate ? "var(--sage-dark)" : "var(--text-muted)" }}>{fmtShort(endDate)}</div>
                </div>
              </div>
              <div style={{ opacity: isFlexible ? 0.35 : 1, transition: "opacity 0.2s", background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)", padding: "16px 12px", maxWidth: 500, margin: "0 auto 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
                  <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-secondary)", padding: "4px 8px" }}>‹</button>
                  <div style={{ display: "flex", gap: 32 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{MNAMES[calMonth]} {calYear}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{MNAMES[m2]} {y2}</span>
                  </div>
                  <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-secondary)", padding: "4px 8px" }}>›</button>
                </div>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                  {renderMonth(calMonth, calYear)}
                  {renderMonth(m2, y2)}
                </div>
              </div>
              {startDate && endDate && <p style={{ textAlign: "center", fontSize: 12, color: "var(--sage-dark)", marginBottom: 12, fontWeight: 500 }}>{Math.round((fromStr(endDate)-fromStr(startDate))/(1000*60*60*24))} nights · {fmtShort(startDate)} – {fmtShort(endDate)}</p>}
              <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 10, fontWeight: 300, textAlign: "center" }}>How flexible are your dates?</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
                {FLEX_OPTIONS.map(o => <SelectPill key={o.id} icon={o.icon} label={o.label} color={o.color} active={selFlex === o.id}
                  onClick={() => {
                    if (o.id === "flexible") { setTravelDates({ flexibility: "flexible", startDate: null, endDate: null }); }
                    else { setTravelDates(prev => ({ startDate: prev?.startDate || null, endDate: prev?.endDate || null, flexibility: o.id })); }
                  }} />)}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Button variant="secondary" onClick={() => setOnboardingStep(3)}>Back</Button>
                <Button onClick={() => setOnboardingStep(5)} disabled={!canContinue}>Continue</Button>
              </div>
            </div>
            );
          })()}
          {onboardingStep === 5 && (
            <div className="fade-up">
              <p style={{ color: "var(--sage)", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", marginBottom: 14 }}>TRAVEL PROFILE · 5 OF 6</p>
              <h2 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, marginBottom: 6 }}>Popular hotspots or hidden gems?</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, fontWeight: 300 }}>We'll tailor recommendations to your vibe.</p>
              <div style={{ display: "grid", gap: 8, maxWidth: 420, margin: "0 auto 28px" }}>
                {VIBE_OPTIONS.map(o => <SelectPill key={o.id} icon={o.icon} label={o.label} desc={o.desc} color={o.color} active={vibePref === o.id} onClick={() => setVibePref(o.id)} />)}
              </div>
              <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, marginBottom: 6 }}>Preferred regions</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 16, fontWeight: 300 }}>Select any, or leave blank for worldwide.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 28 }}>
                {REGIONS.map(r => <SelectPill key={r.id} icon={r.icon} label={r.label} color="#8B9E7E" active={regionPrefs.includes(r.id)} onClick={() => setRegionPrefs(p => p.includes(r.id) ? p.filter(x => x !== r.id) : [...p, r.id])} />)}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}><Button variant="secondary" onClick={() => setOnboardingStep(4)}>Back</Button><Button onClick={() => setOnboardingStep(6)}>Continue</Button></div>
            </div>
          )}
          {onboardingStep === 6 && (
            <div className="fade-up">
              <p style={{ color: "var(--sage)", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", marginBottom: 14 }}>TRAVEL PROFILE · 6 OF 6</p>
              <h2 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, marginBottom: 6 }}>Add your points & cards</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, fontWeight: 300 }}>You can always add more later.</p>
              {[...userCards.map((c,i) => { const info = CREDIT_CARDS.find(x=>x.id===c.id); return <div key={`c${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--card-bg)", borderRadius: 10, marginBottom: 6, border: "1px solid var(--border)" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 20, borderRadius: 4, background: info?.color }} /><span style={{ fontSize: 12, fontWeight: 500 }}>{info?.name}</span></div><span style={{ color: "var(--sage-dark)", fontWeight: 600, fontSize: 12 }}>{c.points?.toLocaleString()} pts</span></div>; }),
                ...userLoyalty.map((l,i) => { const info = LOYALTY_PROGRAMS.find(x=>x.id===l.id); return <div key={`l${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--card-bg)", borderRadius: 10, marginBottom: 6, border: "1px solid var(--border)" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 20, borderRadius: 4, background: info?.color }} /><span style={{ fontSize: 12, fontWeight: 500 }}>{info?.name}</span></div><span style={{ color: "var(--terracotta)", fontWeight: 600, fontSize: 12 }}>{l.points?.toLocaleString()} pts</span></div>; })
              ]}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "20px 0 28px" }}>
                <Button variant="secondary" onClick={() => setShowAddCard(true)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>{I.plus} Credit Card</Button>
                <Button variant="secondary" onClick={() => setShowAddLoyalty(true)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>{I.plus} Loyalty Program</Button>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Button variant="secondary" onClick={() => setOnboardingStep(5)}>Back</Button>
                <Button onClick={() => setShowOnboarding(false)} style={{ padding: "12px 36px" }}>{(userCards.length+userLoyalty.length) > 0 ? "Let's Go" : "Skip for Now"}</Button>
              </div>
            </div>
          )}
        </div>
        <AddCardModal isOpen={showAddCard} onClose={() => setShowAddCard(false)} userCards={userCards} onAdd={c => { setUserCards([...userCards, c]); setShowAddCard(false); }} />
        <AddLoyaltyModal isOpen={showAddLoyalty} onClose={() => setShowAddLoyalty(false)} userLoyalty={userLoyalty} onAdd={l => { setUserLoyalty([...userLoyalty, l]); setShowAddLoyalty(false); }} />
      </div>
    );
  }

  // ============ MAIN LAYOUT ============
  const tabs = [
    { id: "dashboard", label: "Home" }, { id: "inspo", label: "Inspo" }, { id: "explore", label: "Explore" }, { id: "planner", label: "Planner" }, { id: "wallet", label: "Wallet" }, { id: "trips", label: "My Trips" }, { id: "goals", label: "Goals" }, { id: "surprise", label: "Surprise" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <style>{FONTS_CSS}</style>
      <header style={{ padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", background: "var(--cream-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--sage)" }}>
          {I.compass(22)}
          <span style={{ fontFamily: serif, fontSize: 26, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>voyageur</span>
        </div>
        <div style={{ background: "var(--sage-dim)", padding: "5px 14px", borderRadius: 20, border: "1px solid var(--sage)20" }}><span style={{ color: "var(--sage-dark)", fontSize: 12, fontWeight: 500 }}>{totalPoints.toLocaleString()} points</span></div>
      </header>
      <nav style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", background: "var(--cream-light)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "12px 20px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", background: "transparent", color: activeTab === t.id ? "var(--sage-dark)" : "var(--text-muted)", borderBottom: activeTab === t.id ? "2px solid var(--sage)" : "2px solid transparent", transition: "all 0.2s", whiteSpace: "nowrap" }}>{t.label}</button>
        ))}
      </nav>
      <main style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
        {activeTab === "dashboard" && <DashboardView {...{userCards,userLoyalty,totalPoints,recommendations,preferences,tripHistory,goals,tasteProfile,inspoBoard,getFlights}} onExplore={()=>setActiveTab("explore")} onSelectDest={setSelectedDest} onGoals={()=>setActiveTab("goals")} onInspo={()=>setActiveTab("inspo")} onEditProfile={()=>{setOnboardingStep(1);setShowOnboarding(true);}} />}
        {activeTab === "inspo" && <InspoView {...{inspoBoard,setInspoBoard,tasteProfile}} />}
        {activeTab === "wallet" && <WalletView {...{userCards,setUserCards,userLoyalty,setUserLoyalty}} onAddCard={()=>setShowAddCard(true)} onAddLoyalty={()=>setShowAddLoyalty(true)} />}
        {activeTab === "explore" && <ExploreView {...{recommendations,totalPoints,compareList,setCompareList,getFlights}} onSelectDest={setSelectedDest} onCompare={()=>setShowCompare(true)} />}
        {activeTab === "planner" && <PlannerView {...{plannedTrips,setPlannedTrips,userCards,userLoyalty,totalPoints,getFlights}} />}
        {activeTab === "trips" && <TripsView {...{tripHistory,setTripHistory}} onAddTrip={()=>setShowTripModal(true)} onRecap={setRecapTrip} />}
        {activeTab === "goals" && <GoalsView {...{goals,setGoals,userCards,userLoyalty,totalPoints,getFlights}} />}
        {activeTab === "surprise" && <SurpriseView result={surpriseResult} onSurprise={handleSurpriseMe} totalPoints={totalPoints} hasWallet={(userCards.length+userLoyalty.length)>0} onPlaybook={d=>setPlaybookDest(d)} getFlights={getFlights} homeAirport={homeAirport} travelDates={travelDates} livePricing={livePricing} />}
      </main>
      <AddCardModal isOpen={showAddCard} onClose={()=>setShowAddCard(false)} userCards={userCards} onAdd={c=>{setUserCards([...userCards,c]);setShowAddCard(false);}} />
      <AddLoyaltyModal isOpen={showAddLoyalty} onClose={()=>setShowAddLoyalty(false)} userLoyalty={userLoyalty} onAdd={l=>{setUserLoyalty([...userLoyalty,l]);setShowAddLoyalty(false);}} />
      <DestinationModal dest={selectedDest} onClose={()=>setSelectedDest(null)} totalPoints={totalPoints} userCards={userCards} userLoyalty={userLoyalty} onPlaybook={d=>{setSelectedDest(null);setPlaybookDest(d);}} getFlights={getFlights} homeAirport={homeAirport} travelDates={travelDates} livePricing={livePricing} />
      <PlaybookModal dest={playbookDest} onClose={()=>setPlaybookDest(null)} userCards={userCards} userLoyalty={userLoyalty} totalPoints={totalPoints} getFlights={getFlights} homeAirport={homeAirport} travelDates={travelDates} livePricing={livePricing} />
      <AddTripModal isOpen={showTripModal} onClose={()=>setShowTripModal(false)} trip={newTrip} setTrip={setNewTrip} onSave={()=>{const hr=newTrip.ratings&&Object.values(newTrip.ratings).some(v=>v>0);if(newTrip.destination&&hr){setTripHistory([...tripHistory,{...newTrip,id:Date.now()}]);setNewTrip({destination:"",type:"",ratings:{food:0,nightlife:0,activities:0,value:0,culture:0},notes:"",date:"",hotel:"",flight:"",pointsSpent:"",cashSaved:"",highlights:""});setShowTripModal(false);}}} />
      <CompareModal isOpen={showCompare} onClose={()=>setShowCompare(false)} destinations={compareList.map(id=>DESTINATIONS.find(d=>d.id===id)).filter(Boolean)} totalPoints={totalPoints} onClear={()=>setCompareList([])} getFlights={getFlights} livePricing={livePricing} />
      <RecapModal trip={recapTrip} onClose={()=>setRecapTrip(null)} />
    </div>
  );
}

// ============ DESTINATION CARD ============
function DestinationCard({ dest, onClick, index=0, totalPoints, flights }) {
  const bh = getBestHotelPoints(dest); const bf = getBestFlightMiles(flights);
  const needed = (bh?bh.pointsPerNight*4:999999)+(bf?bf.miles:999999);
  const affordable = totalPoints >= needed;
  const budgetColors = { budget: "#8B9E7E", mid: "#B8965A", luxury: "#C4715B" };
  return (
    <div onClick={onClick} className={`fade-up fade-up-${(index%5)+1}`} style={{ background: "var(--card-bg)", borderRadius: 14, padding: 20, border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.3s", boxShadow: "var(--shadow-sm)" }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="var(--shadow-md)";e.currentTarget.style.transform="translateY(-3px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="var(--shadow-sm)";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: 32 }}>{dest.image}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "70%" }}>
          {affordable && <Badge color="var(--sage-dark)">✓ Redeemable</Badge>}
          {dest.tasteMatch > 0 && <Badge color="var(--terracotta)" bg="rgba(196,113,91,0.08)">{dest.tasteMatch}% match</Badge>}
          <Badge color={dest.vibe==="hidden"?"var(--sage)":"var(--terracotta)"}>{dest.vibe==="hidden"?"🗺️ Hidden Gem":"🔥 Popular"}</Badge>
        </div>
      </div>
      <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, marginBottom: 2 }}>{dest.name}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 8, fontWeight: 300 }}>{dest.country} · <span style={{ color: budgetColors[dest.budgetTier], fontWeight: 500 }}>{dest.budgetTier}</span></p>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 14, lineHeight: 1.6, fontWeight: 300 }}>{dest.highlight}</p>
      <div style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 12px", fontSize: 11 }}>
        {bh && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: bf?5:0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}>{I.hotel} <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{bh.name.length>28?bh.chain:bh.name}</span>{bh.distinctions && <DistinctionBadges distinctions={bh.distinctions} compact />}</div>
          <span style={{ color: "var(--sage-dark)", fontWeight: 600 }}>{bh.pointsPerNight.toLocaleString()}/nt</span>
        </div>}
        {bf && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)", flexWrap: "wrap" }}>{I.plane} <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{bf.airline}</span> <Badge color="var(--sky)">{bf.cabin}</Badge></div>
          <span style={{ color: "var(--sage-dark)", fontWeight: 600, whiteSpace: "nowrap" }}>{bf.miles.toLocaleString()} mi</span>
        </div>}
        {!bh&&!bf && <div style={{ color: "var(--text-muted)" }}>Cash bookings only</div>}
      </div>
    </div>
  );
}

// ============ VIEWS ============
function DashboardView({ userCards, userLoyalty, totalPoints, recommendations, preferences, onExplore, onSelectDest, tripHistory, goals, onGoals, tasteProfile, inspoBoard, onInspo, onEditProfile, getFlights }) {
  // Generate smart alerts
  const month = new Date().getMonth()+1;
  const alerts = [];
  recommendations.slice(0,8).forEach(d => {
    if (d.bestMonths.includes(month) || d.bestMonths.includes(month+1>12?1:month+1)) {
      const bh = getBestHotelPoints(d); const bf = getBestFlightMiles(getFlights(d));
      const needed = (bh?bh.pointsPerNight*4:0)+(bf?bf.miles:0);
      if (needed > 0 && totalPoints >= needed) alerts.push({ type: "book", icon: "🎯", color: "var(--sage-dark)", title: `Book ${d.name} now`, desc: `Peak season coming up. You have enough points (${needed.toLocaleString()} needed).`, dest: d });
      else if (d.bestMonths.includes(month+2>12?month-10:month+2) || d.bestMonths.includes(month+3>12?month-9:month+3)) alerts.push({ type: "plan", icon: "📅", color: "var(--warm-gold)", title: `Start planning ${d.name}`, desc: `Best months are ${d.bestMonths.slice(0,3).map(m=>new Date(2024,m-1).toLocaleString('default',{month:'short'})).join(", ")}. Book 2–3 months ahead for best award availability.`, dest: d });
    }
  });
  // Transfer bonus alerts (simulated)
  const bonuses = [
    { from: "Amex", to: "Marriott", bonus: 30, active: month % 3 === 0 },
    { from: "Chase", to: "Hyatt", bonus: 10, active: month % 4 === 1 },
    { from: "Capital One", to: "Turkish Airlines", bonus: 25, active: month % 2 === 0 },
  ];
  bonuses.forEach(b => { if (b.active && userCards.some(c => CREDIT_CARDS.find(x=>x.id===c.id)?.issuer === b.from)) alerts.push({ type: "bonus", icon: "🔥", color: "var(--terracotta)", title: `${b.bonus}% transfer bonus: ${b.from} → ${b.to}`, desc: `Transfer now to get ${b.bonus}% more points. Limited time.` }); });

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, marginBottom: 4 }}>Good {new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening"}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 300 }}>Your travel snapshot for {new Date().toLocaleString('default',{month:'long'})}.</p>
          </div>
          <button onClick={onEditProfile} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--cream-light)", cursor: "pointer", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>🧭 Edit Profile</button>
        </div>
      </div>

      {/* Alerts & Timing Intelligence */}
      {alerts.length > 0 && (
        <div className="fade-up fade-up-1" style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔔</span> Alerts & Timing
          </h2>
          <div style={{ display: "grid", gap: 8 }}>
            {alerts.slice(0,4).map((a,i) => (
              <div key={i} onClick={()=>a.dest&&onSelectDest(a.dest)} style={{ display: "flex", gap: 14, padding: "14px 18px", background: "var(--card-bg)", borderRadius: 12, border: "1px solid var(--border)", borderLeft: `3px solid ${a.color}`, cursor: a.dest?"pointer":"default", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}
                onMouseEnter={e=>{if(a.dest)e.currentTarget.style.boxShadow="var(--shadow-md)";}} onMouseLeave={e=>e.currentTarget.style.boxShadow="var(--shadow-sm)"}>
                <span style={{ fontSize: 22, flexShrink: 0, alignSelf: "center" }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: a.color, marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>{a.desc}</div>
                </div>
                {a.dest && <span style={{ color: "var(--text-muted)", alignSelf: "center" }}>{I.chevron}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fade-up fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
        {[{l:"Total Points",v:totalPoints.toLocaleString(),c:"var(--sage-dark)"},{l:"Cards & Programs",v:userCards.length+userLoyalty.length,c:"var(--terracotta)"},{l:"Trips Logged",v:tripHistory.length,c:"var(--warm-gold)"},{l:"Travel Styles",v:preferences.length,c:"var(--sky)"}].map((s,i) => (
          <div key={i} style={{ background: "var(--card-bg)", borderRadius: 12, padding: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 28, fontWeight: 300, color: s.c, fontFamily: serif }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Taste Profile Quick View */}
      {tasteProfile.length > 0 && (
        <div className="fade-up fade-up-2" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400 }}>🎨 Your Taste Profile</h2>
            <Button variant="ghost" onClick={onInspo} style={{ fontSize: 12, color: "var(--sage)" }}>{inspoBoard.length} saves →</Button>
          </div>
          <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 18, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tasteProfile.slice(0,10).map((tp,i) => (
                <div key={tp.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, background: `${tp.tag.groupColor}0A`, border: `1px solid ${tp.tag.groupColor}18`, fontSize: 12 }}>
                  <span>{tp.tag.icon}</span>
                  <span style={{ fontWeight: 500, color: tp.tag.groupColor }}>{tp.tag.label}</span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, background: "var(--cream)", borderRadius: 8, padding: "1px 5px" }}>{tp.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals Quick View */}
      {goals.length > 0 && (
        <div className="fade-up fade-up-2" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400 }}>🎯 Active Goals</h2>
            <Button variant="ghost" onClick={onGoals} style={{ fontSize: 12, color: "var(--sage)" }}>Manage →</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {goals.slice(0,3).map((g,i) => {
              const dest = DESTINATIONS.find(d=>d.id===g.destId);
              const pct = Math.min(100, Math.round(totalPoints / g.pointsNeeded * 100));
              return (
                <div key={i} style={{ background: "var(--card-bg)", borderRadius: 12, padding: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{dest?.image||"✈️"}</span>
                    <div><div style={{ fontSize: 13, fontWeight: 500 }}>{dest?.name||g.label}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{g.pointsNeeded.toLocaleString()} pts needed</div></div>
                  </div>
                  <div style={{ height: 6, background: "var(--cream-dark)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct>=100?"var(--sage)":"var(--warm-gold)", borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: pct>=100?"var(--sage-dark)":"var(--text-muted)", fontWeight: 500 }}>{pct}%</span>
                    <span style={{ color: "var(--text-muted)" }}>{pct>=100?"Ready to book!":` ${(g.pointsNeeded-totalPoints).toLocaleString()} to go`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="fade-up fade-up-2" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <div><h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 400, marginBottom: 2 }}>Recommended for You</h2><p style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 300 }}>Based on your preferences</p></div>
          <Button variant="ghost" onClick={onExplore} style={{ fontSize: 12, color: "var(--sage)" }}>View All →</Button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))", gap: 14 }}>
          {recommendations.slice(0,4).map((d,i) => <DestinationCard key={d.id} dest={d} onClick={()=>onSelectDest(d)} index={i} totalPoints={totalPoints} flights={getFlights(d)} />)}
        </div>
      </div>
      {(userCards.length+userLoyalty.length)>0 && (
        <div className="fade-up fade-up-3">
          <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 400, marginBottom: 16 }}>Points Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
            {userCards.map((c,i) => { const info = CREDIT_CARDS.find(x=>x.id===c.id); return (
              <div key={i} style={{ background: "var(--card-bg)", borderRadius: 12, padding: 18, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><div style={{ width: 40, height: 26, borderRadius: 5, background: info?.color }} /><div><div style={{ fontSize: 12, fontWeight: 500 }}>{info?.name}</div><div style={{ fontSize: 10, color: "var(--text-muted)" }}>{info?.portalMultiplier}x portal</div></div></div>
                <div style={{ fontSize: 24, fontWeight: 300, color: "var(--sage-dark)", fontFamily: serif }}>{c.points?.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>≈ ${((c.points*(info?.portalMultiplier||1))/100).toFixed(0)} value</div>
              </div>); })}
            {userLoyalty.map((l,i) => { const info = LOYALTY_PROGRAMS.find(x=>x.id===l.id); return (
              <div key={`l${i}`} style={{ background: "var(--card-bg)", borderRadius: 12, padding: 18, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><div style={{ width: 40, height: 26, borderRadius: 5, background: info?.color }} /><div><div style={{ fontSize: 12, fontWeight: 500 }}>{info?.name}</div><div style={{ fontSize: 10, color: "var(--text-muted)" }}>{info?.type}</div></div></div>
                <div style={{ fontSize: 24, fontWeight: 300, color: "var(--terracotta)", fontFamily: serif }}>{l.points?.toLocaleString()}</div>
              </div>); })}
          </div>
        </div>
      )}
    </div>
  );
}

function WalletView({ userCards, setUserCards, userLoyalty, setUserLoyalty, onAddCard, onAddLoyalty }) {
  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 24 }}><h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, marginBottom: 4 }}>Points Wallet</h1><p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 300 }}>Manage your credit cards and loyalty programs.</p></div>
      <div className="fade-up fade-up-1" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400 }}>Credit Cards</h2><Button variant="secondary" onClick={onAddCard} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", fontSize: 12 }}>{I.plus} Add Card</Button></div>
        {!userCards.length ? <EmptyState icon="💳" title="No cards yet" subtitle="Add your travel credit cards." action={<Button onClick={onAddCard}>Add Card</Button>} /> : (
          <div style={{ display: "grid", gap: 10 }}>{userCards.map((c,i) => { const info = CREDIT_CARDS.find(x=>x.id===c.id); return (
            <div key={i} style={{ background: "var(--card-bg)", borderRadius: 12, padding: 18, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 54, height: 34, borderRadius: 6, background: info?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 700 }}>{info?.issuer?.slice(0,4)?.toUpperCase()}</div><div><div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{info?.name}</div><div style={{ display: "flex", gap: 6 }}><Badge color="var(--sage)">{info?.transferPartners?.length} partners</Badge><Badge color="var(--warm-gold)">{info?.portalMultiplier}x</Badge></div></div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}><input type="number" value={c.points} onChange={e=>{const u=[...userCards];u[i].points=parseInt(e.target.value)||0;setUserCards(u);}} style={{ background: "var(--cream)", border: "1px solid var(--border-strong)", borderRadius: 8, color: "var(--sage-dark)", fontSize: 16, fontWeight: 600, padding: "7px 12px", width: 130, textAlign: "right" }} /><div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>≈ ${((c.points*(info?.portalMultiplier||1))/100).toFixed(0)} value</div></div>
                <button onClick={()=>setUserCards(userCards.filter((_,j)=>j!==i))} style={{ background: "var(--terracotta-dim)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "var(--terracotta)" }}>{I.close}</button>
              </div>
            </div>); })}</div>)}
      </div>
      <div className="fade-up fade-up-2">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400 }}>Loyalty Programs</h2><Button variant="secondary" onClick={onAddLoyalty} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", fontSize: 12 }}>{I.plus} Add Program</Button></div>
        {!userLoyalty.length ? <EmptyState icon="🏨" title="No loyalty programs" subtitle="Add hotel & airline accounts." action={<Button onClick={onAddLoyalty}>Add Program</Button>} /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>{userLoyalty.map((l,i) => { const info = LOYALTY_PROGRAMS.find(x=>x.id===l.id); return (
            <div key={i} style={{ background: "var(--card-bg)", borderRadius: 12, padding: 18, border: "1px solid var(--border)", position: "relative", boxShadow: "var(--shadow-sm)" }}>
              <button onClick={()=>setUserLoyalty(userLoyalty.filter((_,j)=>j!==i))} style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>{I.close}</button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><div style={{ width: 36, height: 24, borderRadius: 4, background: info?.color }} /><div><div style={{ fontSize: 13, fontWeight: 500 }}>{info?.name}</div><Badge color={info?.type==="Hotel"?"var(--sage)":"var(--sky)"}>{info?.type}</Badge></div></div>
              <input type="number" value={l.points} onChange={e=>{const u=[...userLoyalty];u[i].points=parseInt(e.target.value)||0;setUserLoyalty(u);}} style={{ background: "var(--cream)", border: "1px solid var(--border-strong)", borderRadius: 8, color: "var(--terracotta)", fontSize: 20, fontWeight: 600, padding: "9px 12px", width: "100%", textAlign: "center" }} />
            </div>); })}</div>)}
      </div>

      {/* Transfer Map */}
      {userCards.length > 0 && (
        <div className="fade-up fade-up-3" style={{ marginTop: 28 }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, marginBottom: 4 }}>Transfer Map</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16, fontWeight: 300 }}>Where your points can go. Amounts shown are your current balances.</p>
          <div style={{ display: "grid", gap: 12 }}>
            {userCards.map((uc,i) => {
              const info = CREDIT_CARDS.find(c=>c.id===uc.id);
              if (!info) return null;
              const hotelPartners = info.transferPartners.filter(p => ["Hyatt","Hilton","Marriott","IHG","Wyndham","Accor"].includes(p));
              const airlinePartners = info.transferPartners.filter(p => !hotelPartners.includes(p));
              return (
                <div key={i} style={{ background: "var(--card-bg)", borderRadius: 14, padding: 20, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 30, borderRadius: 6, background: info.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 700 }}>{info.issuer?.slice(0,4)?.toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{info.name}</div>
                      <div style={{ fontSize: 12, color: "var(--sage-dark)", fontWeight: 600 }}>{uc.points?.toLocaleString()} pts available</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* Center line */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: "var(--sage-dark)", marginBottom: 8 }}>HOTEL PARTNERS</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {hotelPartners.map(p => {
                          const lp = userLoyalty.find(l => LOYALTY_PROGRAMS.find(x=>x.id===l.id)?.name?.includes(p));
                          return (
                            <div key={p} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "var(--sage-dim)", borderRadius: 8, border: "1px solid var(--sage)20" }}>
                              <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-primary)" }}>{p}</span>
                              {lp && <span style={{ fontSize: 9, color: "var(--sage-dark)", fontWeight: 600 }}>{lp.points?.toLocaleString()}</span>}
                            </div>
                          );
                        })}
                        {hotelPartners.length === 0 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>None</span>}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: "var(--terracotta)", marginBottom: 8 }}>AIRLINE PARTNERS</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {airlinePartners.map(p => {
                          const lp = userLoyalty.find(l => LOYALTY_PROGRAMS.find(x=>x.id===l.id)?.name?.includes(p));
                          return (
                            <div key={p} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "var(--terracotta-dim)", borderRadius: 8, border: "1px solid var(--terracotta)15" }}>
                              <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-primary)" }}>{p}</span>
                              {lp && <span style={{ fontSize: 9, color: "var(--terracotta)", fontWeight: 600 }}>{lp.points?.toLocaleString()}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--cream)", borderRadius: 8, fontSize: 11, color: "var(--text-muted)", fontWeight: 300 }}>
                    💡 Portal value: {info.portalMultiplier}¢/pt — {uc.points?.toLocaleString()} pts ≈ ${((uc.points*(info.portalMultiplier))/100).toFixed(0)} through {info.name} portal
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ExploreView({ recommendations, totalPoints, onSelectDest, compareList, setCompareList, onCompare, getFlights }) {
  const [tf, setTf] = useState("all"); const [vf, setVf] = useState("all");
  let filtered = recommendations;
  if (tf !== "all") filtered = filtered.filter(d => d.types.includes(tf));
  if (vf !== "all") filtered = filtered.filter(d => d.vibe === vf);
  const toggleCompare = (id) => setCompareList(prev => prev.includes(id) ? prev.filter(x=>x!==id) : prev.length < 3 ? [...prev, id] : prev);
  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div><h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, marginBottom: 4 }}>Explore</h1><p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 300 }}>{filtered.length} destinations ranked for you. Tap 📌 to compare.</p></div>
          {compareList.length >= 2 && <Button onClick={onCompare} style={{ display: "flex", alignItems: "center", gap: 6 }}>⚖️ Compare ({compareList.length})</Button>}
        </div>
      </div>
      <div className="fade-up fade-up-1" style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {[{id:"all",l:"All",i:"🌍"},{id:"popular",l:"Popular",i:"🔥"},{id:"hidden",l:"Hidden Gems",i:"🗺️"}].map(v => (
          <button key={v.id} onClick={()=>setVf(v.id)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${vf===v.id?"var(--sage)":"var(--border-strong)"}`, background: vf===v.id?"var(--sage-dim)":"var(--card-bg)", color: vf===v.id?"var(--sage-dark)":"var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{v.i} {v.l}</button>
        ))}
      </div>
      <div className="fade-up fade-up-1" style={{ display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap" }}>
        <button onClick={()=>setTf("all")} style={{ padding: "5px 12px", borderRadius: 18, border: `1px solid ${tf==="all"?"var(--sage)":"var(--border-strong)"}`, background: tf==="all"?"var(--sage-dim)":"var(--card-bg)", color: tf==="all"?"var(--sage-dark)":"var(--text-muted)", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>All Types</button>
        {TRIP_TYPES.map(t => <button key={t.id} onClick={()=>setTf(t.id)} style={{ padding: "5px 12px", borderRadius: 18, border: `1px solid ${tf===t.id?t.color:"var(--border-strong)"}`, background: tf===t.id?`${t.color}10`:"var(--card-bg)", color: tf===t.id?t.color:"var(--text-muted)", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>{t.icon} {t.label}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))", gap: 14 }}>
        {filtered.map((d,i) => (
          <div key={d.id} style={{ position: "relative" }}>
            <DestinationCard dest={d} onClick={()=>onSelectDest(d)} index={i} totalPoints={totalPoints} flights={getFlights(d)} />
            <button onClick={(e)=>{e.stopPropagation();toggleCompare(d.id);}} style={{
              position: "absolute", bottom: 14, right: 14, width: 30, height: 30, borderRadius: "50%",
              border: `1.5px solid ${compareList.includes(d.id)?"var(--sage)":"var(--border-strong)"}`,
              background: compareList.includes(d.id)?"var(--sage)":"var(--card-bg)",
              color: compareList.includes(d.id)?"white":"var(--text-muted)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
              boxShadow: "var(--shadow-sm)", transition: "all 0.2s", zIndex: 2,
            }} title="Pin to compare">{compareList.includes(d.id)?"✓":"📌"}</button>
          </div>
        ))}
      </div>
      {!filtered.length && <EmptyState icon="🔍" title="No matches" subtitle="Try adjusting your filters." />}
    </div>
  );
}

function TripsView({ tripHistory, setTripHistory, onAddTrip, onRecap }) {
  const getConsolidated = (r) => { if (!r) return 0; const v = Object.values(r).filter(x=>x>0); return v.length ? v.reduce((a,b)=>a+b,0)/v.length : 0; };
  const updateCat = (id, cat, val) => setTripHistory(tripHistory.map(t => t.id===id ? { ...t, ratings: { ...t.ratings, [cat]: val }} : t));
  return (
    <div>
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div><h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, marginBottom: 4 }}>My Trips</h1><p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 300 }}>Rate across categories to sharpen recommendations.</p></div>
        <Button onClick={onAddTrip} style={{ display: "flex", alignItems: "center", gap: 6 }}>{I.plus} Log a Trip</Button>
      </div>
      {!tripHistory.length ? <EmptyState icon="🗺️" title="No trips logged yet" subtitle="Log past trips and rate them." action={<Button onClick={onAddTrip}>Log Your First Trip</Button>} /> : (
        <div style={{ display: "grid", gap: 14 }}>{tripHistory.map((trip,i) => {
          const dest = DESTINATIONS.find(d=>d.name===trip.destination);
          const con = getConsolidated(trip.ratings);
          const col = con>=4?"var(--sage-dark)":con>=3?"var(--warm-gold)":con>=2?"var(--terracotta)":"var(--text-muted)";
          return (
          <div key={trip.id} className={`fade-up fade-up-${(i%5)+1}`} style={{ background: "var(--card-bg)", borderRadius: 14, padding: 20, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 32 }}>{dest?.image||"🌍"}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500, fontFamily: serif }}>{trip.destination}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>{trip.type && <Badge>{TRIP_TYPES.find(t=>t.id===trip.type)?.icon} {TRIP_TYPES.find(t=>t.id===trip.type)?.label}</Badge>}{trip.date && <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>{formatDate(trip.date)}</span>}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={()=>onRecap(trip)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--cream-light)", cursor: "pointer", fontSize: 11, fontWeight: 500, color: "var(--sage-dark)", display: "flex", alignItems: "center", gap: 4 }}>🪩 Share Recap</button>
                <button onClick={()=>setTripHistory(tripHistory.filter(t=>t.id!==trip.id))} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--cream-light)", cursor: "pointer", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center" }} title="Delete trip">{I.close}</button>
                <div style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 300, color: col, fontFamily: serif, lineHeight: 1 }}>{con.toFixed(1)}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.06em", marginTop: 3 }}>OVERALL</div>
                </div>
              </div>
            </div>
            {/* Hotel & Flight badges */}
            {(trip.hotel || trip.flight) && (
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {trip.hotel && <Badge color="var(--sage-dark)">{I.hotel} {trip.hotel}</Badge>}
                {trip.flight && <Badge color="var(--terracotta)">{I.plane} {trip.flight}</Badge>}
                {trip.pointsSpent && <Badge color="var(--warm-gold)">✨ {parseInt(trip.pointsSpent).toLocaleString()} pts used</Badge>}
                {trip.cashSaved && <Badge color="var(--sage)">💰 ${parseInt(trip.cashSaved).toLocaleString()} saved</Badge>}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
              {RATING_CATEGORIES.map(cat => (
                <div key={cat.id} style={{ background: "var(--cream)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><span style={{ fontSize: 13 }}>{cat.icon}</span><span style={{ fontSize: 11, fontWeight: 500, color: cat.color }}>{cat.label}</span></div>
                  <StarRating rating={trip.ratings?.[cat.id]||0} onRate={r=>updateCat(trip.id,cat.id,r)} size={14} />
                </div>
              ))}
            </div>
            {trip.highlights && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 12, lineHeight: 1.6, fontWeight: 300 }}>✨ {trip.highlights}</p>}
            {trip.notes && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: trip.highlights?6:12, fontStyle: "italic", lineHeight: 1.5 }}>"{trip.notes}"</p>}
          </div>); })}</div>)}
    </div>
  );
}

function SurpriseView({ result, onSurprise, totalPoints, hasWallet, onPlaybook, getFlights, homeAirport, travelDates, livePricing }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="fade-up" style={{ marginBottom: 36, paddingTop: 16 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✨</div>
        <h1 style={{ fontFamily: serif, fontSize: 40, fontWeight: 400, marginBottom: 8 }}>Surprise Me</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.7, fontWeight: 300 }}>Based on your points, preferences, and past trips — we'll find your next perfect getaway.</p>
        <Button onClick={onSurprise} style={{ padding: "14px 40px", fontSize: 13, borderRadius: 8, letterSpacing: "0.06em" }}>Find My Next Trip</Button>
      </div>
      {result && (
        <div className="fade-up" style={{ maxWidth: 520, margin: "0 auto", background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--sage)", padding: 28, textAlign: "left", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>{result.image}</div>
            <h2 style={{ fontFamily: serif, fontSize: 28, fontWeight: 400 }}>{result.name}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 6, fontWeight: 300 }}>{result.country}</p>
            <Badge color={result.vibe==="hidden"?"var(--sage)":"var(--terracotta)"}>{result.vibe==="hidden"?"🗺️ Hidden Gem":"🔥 Popular"}</Badge>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, lineHeight: 1.6, textAlign: "center", fontWeight: 300 }}>{result.highlight}</p>
          <HotelFlightBlock dest={result} totalPoints={totalPoints} flights={getFlights(result)} homeAirport={homeAirport} travelDates={travelDates} livePricing={livePricing} />
          <div style={{ textAlign: "center", marginTop: 16, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {hasWallet && <Button onClick={()=>onPlaybook?.(result)}>📋 Booking Playbook</Button>}
            <Button onClick={onSurprise} variant="secondary">↻ Try Another</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ SHARED HOTEL/FLIGHT BLOCK ============
function HotelFlightBlock({ dest, totalPoints, flights, homeAirport, travelDates, livePricing }) {
  const origin = homeAirport?.primaryIntl || "JFK";
  const destAirport = dest.destinationAirports?.[0] || "";
  return (
    <>
      <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--sage-dark)", marginBottom: 10, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>{I.hotel} HOTEL OPTIONS</div>
        {dest.hotels.map((h,i) => {
          const ep = getEffectivePricing(h, livePricing);
          return (
          <div key={i} style={{ padding: "10px 0", borderBottom: i<dest.hotels.length-1?"1px solid var(--border)":"none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div><div style={{ display: "flex", gap: 4, marginTop: 2, flexWrap: "wrap", alignItems: "center" }}><Badge color="var(--dusty-rose)">{h.chain}</Badge>{h.category!=="N/A" && <Badge color="var(--text-muted)">{h.category}</Badge>}{ep.isLive && <Badge color="var(--sage-dark)">● Live</Badge>}</div>
                <DistinctionBadges distinctions={h.distinctions} />
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {ep.pointsPerNight ? <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sage-dark)" }}>{ep.isLive ? "" : "Est. ~"}{ep.pointsPerNight.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 400 }}>pts/nt</span></div> : <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Cash only</div>}
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>${h.cashPerNight}/nt cash</div>
              </div>
            </div>
            {(() => { const url = buildCheckPriceUrl(h, dest, travelDates); return url ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 8, padding: "10px 16px", borderRadius: 8, background: "var(--sage)", color: "#fff", fontSize: 12, fontWeight: 500, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>Check Live Price →</a> : null; })()}
            {h.comparePriceUrl && <a href={`https://search.maxmypoint.com/?query=${encodeURIComponent(h.name)}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--text-muted)", textAlign: "center", textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}>Compare on MaxMyPoint</a>}
          </div>
        ); })}
      </div>
      <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--terracotta)", marginBottom: 10, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5 }}>{I.plane} FLIGHT OPTIONS (RT)</div>
        {(flights||[]).map((f,i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i<(flights||[]).length-1?"1px solid var(--border)":"none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div><div style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>{f.airline} <Badge color="var(--sky)">{f.cabin}</Badge></div><div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{f.route}</div></div>
              <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: "var(--sage-dark)" }}>Est. ~{f.miles.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 400 }}>mi</span></div><div style={{ fontSize: 10, color: "var(--text-muted)" }}>${f.cash} cash</div></div>
            </div>
            {destAirport && <a href={getGoogleFlightsUrl(origin, destAirport, travelDates)} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 8, padding: "10px 16px", borderRadius: 8, background: "var(--terracotta)", color: "#fff", fontSize: 12, fontWeight: 500, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>Search Flights →</a>}
          </div>
        ))}
      </div>
    </>
  );
}

// ============ DESTINATION MODAL ============
function DestinationModal({ dest, onClose, totalPoints, userCards, userLoyalty, onPlaybook, getFlights, homeAirport, travelDates, livePricing }) {
  if (!dest) return null;
  const bm = dest.bestMonths.map(m=>new Date(2024,m-1).toLocaleString('default',{month:'short'}));
  const hasW = (userCards?.length||0)+(userLoyalty?.length||0)>0;
  return (
    <Modal isOpen={!!dest} onClose={onClose} title={`${dest.image} ${dest.name}`} width={620}>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 10, fontWeight: 300 }}>{dest.country} · {REGIONS.find(r=>r.id===dest.region)?.label||dest.region}</p>
      <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14, fontWeight: 300 }}>{dest.highlight}</p>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {dest.types.map(t=>{const tp=TRIP_TYPES.find(x=>x.id===t);return tp?<Badge key={t} color={tp.color}>{tp.icon} {tp.label}</Badge>:null;})}
        <Badge color={dest.vibe==="hidden"?"var(--sage)":"var(--terracotta)"}>{dest.vibe==="hidden"?"🗺️ Hidden Gem":"🔥 Popular"}</Badge>
      </div>
      <div style={{ marginBottom: 16 }}><Badge color="var(--sky)">📅 Best: {bm.join(", ")}</Badge></div>
      {hasW && <button onClick={()=>onPlaybook?.(dest)} style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: "1.5px solid var(--sage)", background: "var(--sage-dim)", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }}
        onMouseEnter={e=>e.currentTarget.style.background="var(--sage-wash)"} onMouseLeave={e=>e.currentTarget.style.background="var(--sage-dim)"}>
        <span style={{ fontSize: 16 }}>📋</span>
        <div style={{ textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 600, color: "var(--sage-dark)" }}>Generate Booking Playbook</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Step-by-step plan using your points</div></div>
        {I.chevron}
      </button>}
      <HotelFlightBlock dest={dest} totalPoints={totalPoints} flights={getFlights(dest)} homeAirport={homeAirport} travelDates={travelDates} livePricing={livePricing} />
    </Modal>
  );
}

// ============ BOOKING PLAYBOOK ============
function generatePlaybook(dest, userCards, userLoyalty, flights) {
  const C2L = { Hyatt:"hyatt", Hilton:"hilton", Marriott:"marriott", "Marriott (Autograph)":"marriott", "Marriott (Delta)":"marriott", IHG:"ihg" };
  const getCardFor = (partner) => userCards.filter(uc => { const info = CREDIT_CARDS.find(c=>c.id===uc.id); return info?.transferPartners?.includes(partner); }).map(uc=>({...uc,info:CREDIT_CARDS.find(c=>c.id===uc.id)}));
  const getLoyBal = (lid) => { const lp = userLoyalty.find(l=>l.id===lid); return lp?lp.points:0; };
  const nights = 4; const hotelOpts = []; const flightOpts = [];

  dest.hotels.forEach(hotel => {
    if (!hotel.pointsPerNight) { hotelOpts.push({hotel,method:"cash",totalCost:hotel.cashPerNight*nights,cashCost:hotel.cashPerNight*nights,pointsCost:0,cppValue:0,steps:[`Book ${hotel.name} for $${(hotel.cashPerNight*nights).toLocaleString()} (${nights} nights)`],source:"Cash",priority:0}); return; }
    const tp = hotel.pointsPerNight*nights; const cv = hotel.cashPerNight*nights; const lid = C2L[hotel.chain]||C2L[hotel.chain?.split(" ")[0]];
    if (lid) { const bal = getLoyBal(lid); if (bal>=tp) { const cpp = (cv/tp*100).toFixed(1); hotelOpts.push({hotel,method:"direct_loyalty",totalCost:tp,cashCost:0,pointsCost:tp,cppValue:parseFloat(cpp),steps:[`Book ${hotel.name} using ${tp.toLocaleString()} ${LOYALTY_PROGRAMS.find(l=>l.id===lid)?.name||hotel.chain} points`,`Value: ${cpp}¢/pt ($${cv.toLocaleString()} room)`],source:LOYALTY_PROGRAMS.find(l=>l.id===lid)?.name||hotel.chain,priority:3}); }}
    const pn = hotel.chain?.includes("Hyatt")?"Hyatt":hotel.chain?.includes("Hilton")?"Hilton":hotel.chain?.includes("Marriott")||hotel.chain?.includes("Autograph")?"Marriott":hotel.chain?.includes("IHG")?"IHG":hotel.chain?.includes("Wyndham")?"Wyndham":hotel.chain?.includes("Accor")||hotel.chain?.includes("Fairmont")?"Accor":null;
    if (pn) { getCardFor(pn).forEach(card => { if (card.points>=tp) { const cpp=(cv/tp*100).toFixed(1); hotelOpts.push({hotel,method:"transfer",totalCost:tp,cashCost:0,pointsCost:tp,cppValue:parseFloat(cpp),steps:[`Transfer ${tp.toLocaleString()} ${card.info.name} points → ${pn}`,`Book ${hotel.name} for ${hotel.pointsPerNight.toLocaleString()} pts/night × ${nights} nights`,`Value: ${cpp}¢/pt ($${cv.toLocaleString()} room)`],source:card.info.name,priority:4,cardId:card.id}); }}); }
    userCards.forEach(uc => { const info = CREDIT_CARDS.find(c=>c.id===uc.id); if (!info) return; const pp = Math.ceil(cv/(info.portalMultiplier*0.01)); if (uc.points>=pp) { hotelOpts.push({hotel,method:"portal",totalCost:pp,cashCost:0,pointsCost:pp,cppValue:info.portalMultiplier,steps:[`Book ${hotel.name} via ${info.name} portal`,`Cost: ${pp.toLocaleString()} pts for $${cv.toLocaleString()} (${info.portalMultiplier}¢/pt)`],source:`${info.name} Portal`,priority:info.portalMultiplier>=1.5?2:1,cardId:uc.id}); }});
  });

  (flights||[]).forEach(flight => {
    const al = {United:"united",Delta:"delta","American Airlines":"american",American:"american",Southwest:"southwest"}[flight.airline];
    if (al) { const bal = getLoyBal(al); if (bal>=flight.miles) { const cpp=(flight.cash/flight.miles*100).toFixed(1); flightOpts.push({flight,method:"direct_loyalty",totalCost:flight.miles,cashCost:0,pointsCost:flight.miles,cppValue:parseFloat(cpp),steps:[`Book ${flight.airline} ${flight.route} in ${flight.cabin} using ${flight.miles.toLocaleString()} miles`,`Value: ${cpp}¢/mi ($${flight.cash} ticket)`],source:LOYALTY_PROGRAMS.find(l=>l.id===al)?.name||flight.airline,priority:3}); }}
    getCardFor(flight.airline).forEach(card => { if (card.points>=flight.miles) { const cpp=(flight.cash/flight.miles*100).toFixed(1); flightOpts.push({flight,method:"transfer",totalCost:flight.miles,cashCost:0,pointsCost:flight.miles,cppValue:parseFloat(cpp),steps:[`Transfer ${flight.miles.toLocaleString()} ${card.info.name} points → ${flight.airline}`,`Book ${flight.route} in ${flight.cabin}`,`Value: ${cpp}¢/mi ($${flight.cash} ticket)`],source:card.info.name,priority:4,cardId:card.id}); }});
    userCards.forEach(uc => { const info = CREDIT_CARDS.find(c=>c.id===uc.id); if (!info) return; const pp = Math.ceil(flight.cash/(info.portalMultiplier*0.01)); if (uc.points>=pp) { flightOpts.push({flight,method:"portal",totalCost:pp,cashCost:0,pointsCost:pp,cppValue:info.portalMultiplier,steps:[`Book ${flight.airline} ${flight.route} (${flight.cabin}) via ${info.name} portal`,`Cost: ${pp.toLocaleString()} pts for $${flight.cash} (${info.portalMultiplier}¢/pt)`],source:`${info.name} Portal`,priority:info.portalMultiplier>=1.5?2:1,cardId:uc.id}); }});
    flightOpts.push({flight,method:"cash",totalCost:flight.cash,cashCost:flight.cash,pointsCost:0,cppValue:0,steps:[`Book ${flight.airline} ${flight.route} in ${flight.cabin} for $${flight.cash}`],source:"Cash",priority:0});
  });

  const sc = o => o.cppValue*10+o.priority*5-(o.method==="cash"?50:0);
  hotelOpts.sort((a,b)=>sc(b)-sc(a)); flightOpts.sort((a,b)=>sc(b)-sc(a));
  let bestH = hotelOpts[0]||null; let bestF = flightOpts[0]||null;
  if (bestH&&bestF&&bestH.cardId&&bestF.cardId&&bestH.cardId===bestF.cardId) { const card = userCards.find(c=>c.id===bestH.cardId); if (card&&card.points<bestH.pointsCost+bestF.pointsCost) { const alt = flightOpts.find(f=>f.cardId!==bestH.cardId||f.method==="cash"||f.method==="direct_loyalty"); if (alt) bestF=alt; }}
  return { hotelOptions: hotelOpts, flightOptions: flightOpts, bestHotel: bestH, bestFlight: bestF, nights };
}

function PlaybookModal({ dest, onClose, userCards, userLoyalty, totalPoints, getFlights, homeAirport, travelDates, livePricing }) {
  if (!dest) return null;
  if ((userCards?.length||0)+(userLoyalty?.length||0)===0) return <Modal isOpen={!!dest} onClose={onClose} title="Booking Playbook"><EmptyState icon="💳" title="Add cards first" subtitle="Add credit cards and loyalty programs to generate a playbook." /></Modal>;
  const pb = generatePlaybook(dest, userCards, userLoyalty, getFlights(dest));
  const { bestHotel: bH, bestFlight: bF, nights } = pb;
  let tPts=0; let tCash=0; const src={};
  if (bH) { tPts+=bH.pointsCost; tCash+=bH.cashCost; if(bH.source)src[bH.source]=(src[bH.source]||0)+bH.pointsCost; }
  if (bF) { tPts+=bF.pointsCost; tCash+=bF.cashCost; if(bF.source)src[bF.source]=(src[bF.source]||0)+bF.pointsCost; }
  const retail = (bH?bH.hotel.cashPerNight*nights:0)+(bF?bF.flight.cash:0);
  const mCol = m => m==="transfer"?"var(--sage-dark)":m==="direct_loyalty"?"var(--dusty-rose)":m==="portal"?"var(--warm-gold)":"var(--text-muted)";
  const mLab = m => m==="transfer"?"Transfer":m==="direct_loyalty"?"Direct":m==="portal"?"Portal":"Cash";
  const origin = homeAirport?.primaryIntl || "JFK";
  const destAirport = dest.destinationAirports?.[0] || "";
  // Determine transfer card info for step 3
  const transferCard = bH?.method==="transfer" ? userCards.find(c=>c.id===bH.cardId) : (bF?.method==="transfer" ? userCards.find(c=>c.id===bF.cardId) : null);
  const transferCardInfo = transferCard ? CREDIT_CARDS.find(c=>c.id===transferCard.id) : null;
  const transferProgram = bH?.method==="transfer" ? (bH.hotel.chain?.includes("Hyatt")?"Hyatt":bH.hotel.chain?.includes("Hilton")?"Hilton":bH.hotel.chain?.includes("Marriott")?"Marriott":bH.hotel.chain?.includes("IHG")?"IHG":bH.hotel.chain) : (bF?.method==="transfer" ? bF.flight.airline : null);

  return (
    <Modal isOpen={!!dest} onClose={onClose} title="📋 Booking Playbook" width={640}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px 20px", background: "var(--sage-dim)", borderRadius: 14, border: "1px solid var(--sage)20" }}>
        <div style={{ fontSize: 36 }}>{dest.image}</div>
        <div style={{ flex: 1 }}><div style={{ fontFamily: serif, fontSize: 22, fontWeight: 500 }}>{dest.name}</div><div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 300 }}>{dest.country} · {nights} nights</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.06em" }}>RETAIL</div><div style={{ fontSize: 20, fontWeight: 300, color: "var(--text-muted)", textDecoration: "line-through", fontFamily: serif }}>${retail.toLocaleString()}</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{l:"POINTS USED",v:tPts.toLocaleString(),c:"var(--sage-dark)"},{l:"CASH OUT OF POCKET",v:`$${tCash.toLocaleString()}`,c:tCash>0?"var(--terracotta)":"var(--sage-dark)"},{l:"YOU SAVE",v:`$${(retail-tCash).toLocaleString()}`,c:"var(--sage-dark)"}].map((s,i) => (
          <div key={i} style={{ background: "var(--cream)", borderRadius: 10, padding: "14px 12px", textAlign: "center", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 300, color: s.c, fontFamily: serif }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sage-dark)", marginBottom: 10, letterSpacing: "0.08em" }}>RECOMMENDED STRATEGY</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {bH && <div style={{ flex: 1, minWidth: 200, background: "var(--card-bg)", borderRadius: 12, padding: 14, borderLeft: `3px solid ${mCol(bH.method)}`, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)" }}>HOTEL</div><Badge color={mCol(bH.method)}>{mLab(bH.method)}</Badge></div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{bH.hotel.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300 }}>{bH.source}</div>
            {bH.cppValue>0 && <div style={{ fontSize: 11, color: "var(--sage-dark)", marginTop: 4, fontWeight: 500 }}>{bH.cppValue.toFixed(1)}¢/pt value</div>}
          </div>}
          {bF && <div style={{ flex: 1, minWidth: 200, background: "var(--card-bg)", borderRadius: 12, padding: 14, borderLeft: `3px solid ${mCol(bF.method)}`, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)" }}>FLIGHT</div><Badge color={mCol(bF.method)}>{mLab(bF.method)}</Badge></div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{bF.flight.airline} · {bF.flight.cabin}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300 }}>{bF.flight.route}</div>
            {bF.cppValue>0 && <div style={{ fontSize: 11, color: "var(--sage-dark)", marginTop: 4, fontWeight: 500 }}>{bF.cppValue.toFixed(1)}¢/pt value</div>}
          </div>}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--terracotta)", marginBottom: 10, letterSpacing: "0.08em" }}>YOUR NEXT STEPS</div>
        <div style={{ display: "grid", gap: 8 }}>
          {/* Step 1: Check live award pricing */}
          {bH && <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, borderLeft: "3px solid var(--sage)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--sage-dim)", color: "var(--sage-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>1</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Check live award pricing</div><div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 300 }}>{bH.hotel.name} · {(() => { const ep = getEffectivePricing(bH.hotel, livePricing); return ep.isLive ? `${ep.pointsPerNight.toLocaleString()} pts/nt` : `Est. ~${(bH.hotel.pointsPerNight||0).toLocaleString()} pts/nt`; })()}</div></div>
            </div>
            {(() => { const url = buildCheckPriceUrl(bH.hotel, dest, travelDates); return url ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "10px 16px", borderRadius: 8, background: "var(--sage)", color: "#fff", fontSize: 12, fontWeight: 500, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em", cursor: "pointer" }}>Check Live Price →</a> : null; })()}
          </div>}
          {/* Step 2: Search award flights */}
          {bF && <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, borderLeft: "3px solid var(--terracotta)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--terracotta-dim)", color: "var(--terracotta)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>2</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Search award flights</div><div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 300 }}>{bF.flight.airline} · {bF.flight.route} · {bF.flight.cabin}</div></div>
            </div>
            {destAirport && <a href={getGoogleFlightsUrl(origin, destAirport, travelDates)} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "10px 16px", borderRadius: 8, background: "var(--terracotta)", color: "#fff", fontSize: 12, fontWeight: 500, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em", cursor: "pointer" }}>Search Flights →</a>}
          </div>}
          {/* Step 3: Transfer your points */}
          {(bH?.method==="transfer" || bF?.method==="transfer") && <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, borderLeft: "3px solid var(--warm-gold)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(184,150,90,0.1)", color: "var(--warm-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>3</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Transfer your points</div></div>
            </div>
            {transferCardInfo && transferProgram && <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, marginLeft: 38, lineHeight: 1.6 }}>Transfer <strong style={{ fontWeight: 600 }}>{transferCardInfo.name}</strong> → <strong style={{ fontWeight: 600 }}>{transferProgram}</strong>{bH?.hotel?.chain?.includes("Hyatt")?" (instant transfer)":" (1–2 days)"}<br/>Points needed: {tPts.toLocaleString()}</div>}
          </div>}
          {/* Step 4: Book directly */}
          {bH && <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, borderLeft: "3px solid var(--dusty-rose)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(196,155,138,0.12)", color: "var(--dusty-rose)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{(bH?.method==="transfer" || bF?.method==="transfer") ? 4 : 3}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Book directly</div><div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 300 }}>Book through the loyalty program for best value</div></div>
            </div>
            {(() => { const url = buildCheckPriceUrl(bH.hotel, dest, travelDates); return url ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "10px 16px", borderRadius: 8, background: "var(--dusty-rose)", color: "#fff", fontSize: 12, fontWeight: 500, textAlign: "center", textDecoration: "none", letterSpacing: "0.04em", cursor: "pointer" }}>Book on {bH.hotel.chain?.split(" ")[0]}.com →</a> : null; })()}
          </div>}
        </div>
      </div>
      <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--dusty-rose)", marginBottom: 10, letterSpacing: "0.08em" }}>POINTS IMPACT</div>
        {Object.entries(src).filter(([,v])=>v>0).map(([s,p]) => <div key={s} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, fontWeight: 300 }}><span style={{ color: "var(--text-secondary)" }}>{s}</span><span style={{ color: "var(--terracotta)", fontWeight: 600 }}>−{p.toLocaleString()}</span></div>)}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300 }}>Remaining after booking</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "var(--sage-dark)", fontFamily: serif }}>{(totalPoints-tPts).toLocaleString()}</span>
        </div>
      </div>
      <div style={{ marginTop: 16, background: "var(--sage-dim)", borderRadius: 12, padding: 16, border: "1px solid var(--sage)20" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--sage-dark)", marginBottom: 8, letterSpacing: "0.08em" }}>PRO TIPS</div>
        <div style={{ display: "grid", gap: 4, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 300 }}>
          {bH?.method==="transfer" && <div>• Transfer 1–3 days before — {bH.hotel.chain==="Hyatt"?"Hyatt transfers are instant":"may take 1–2 days"}</div>}
          {bF?.method==="transfer" && <div>• Check award availability on {bF.flight.airline}'s site before transferring</div>}
          <div>• Points bookings through loyalty programs are usually fully refundable</div>
          <div>• Check for 5th-night-free promotions with hotel loyalty programs</div>
        </div>
      </div>
    </Modal>
  );
}

// ============ ADD MODALS ============
function AddCardModal({ isOpen, onClose, userCards, onAdd }) {
  const [sel, setSel] = useState(""); const [pts, setPts] = useState("");
  const avail = CREDIT_CARDS.filter(c=>!userCards.some(u=>u.id===c.id));
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Credit Card">
      <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>Select Card</label>
        <div style={{ display: "grid", gap: 8 }}>{avail.map(c => (
          <button key={c.id} onClick={()=>setSel(c.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${sel===c.id?"var(--sage)":"var(--border-strong)"}`, background: sel===c.id?"var(--sage-dim)":"var(--card-bg)", cursor: "pointer", width: "100%", textAlign: "left" }}>
            <div style={{ width: 44, height: 28, borderRadius: 5, background: c.color }} />
            <div><div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.portalMultiplier}x portal · {c.transferPartners.length} partners</div></div>
            {sel===c.id && <span style={{ marginLeft: "auto", color: "var(--sage)" }}>{I.check}</span>}
          </button>))}
          {!avail.length && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>All cards added!</p>}
        </div>
      </div>
      {sel && <div style={{ marginBottom: 20 }}><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>Points Balance</label><input type="number" value={pts} onChange={e=>setPts(e.target.value)} placeholder="e.g., 80000" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 16 }} /></div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={()=>{if(sel&&pts){onAdd({id:sel,points:parseInt(pts)});setSel("");setPts("");}}} disabled={!sel||!pts}>Add Card</Button></div>
    </Modal>
  );
}

function AddLoyaltyModal({ isOpen, onClose, userLoyalty, onAdd }) {
  const [sel, setSel] = useState(""); const [pts, setPts] = useState("");
  const avail = LOYALTY_PROGRAMS.filter(l=>!userLoyalty.some(u=>u.id===l.id));
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Loyalty Program">
      <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>Select Program</label>
        <div style={{ display: "grid", gap: 8 }}>{avail.map(p => (
          <button key={p.id} onClick={()=>setSel(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${sel===p.id?"var(--sage)":"var(--border-strong)"}`, background: sel===p.id?"var(--sage-dim)":"var(--card-bg)", cursor: "pointer", width: "100%", textAlign: "left" }}>
            <div style={{ width: 40, height: 28, borderRadius: 5, background: p.color }} />
            <div><div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.type}</div></div>
            {sel===p.id && <span style={{ marginLeft: "auto", color: "var(--sage)" }}>{I.check}</span>}
          </button>))}
          {!avail.length && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>All programs added!</p>}
        </div>
      </div>
      {sel && <div style={{ marginBottom: 20 }}><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>Points Balance</label><input type="number" value={pts} onChange={e=>setPts(e.target.value)} placeholder="e.g., 150000" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 16 }} /></div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={()=>{if(sel&&pts){onAdd({id:sel,points:parseInt(pts)});setSel("");setPts("");}}} disabled={!sel||!pts}>Add Program</Button></div>
    </Modal>
  );
}

// ============ INSPO BOARD ============
function InspoView({ inspoBoard, setInspoBoard, tasteProfile }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ link: "", note: "", tags: [], destId: "" });
  const [tagFilter, setTagFilter] = useState("all");
  const [expandProfile, setExpandProfile] = useState(false);

  const saveInspo = () => {
    if (!form.note && !form.link) return;
    setInspoBoard([...inspoBoard, { ...form, id: Date.now(), createdAt: new Date().toLocaleDateString() }]);
    setForm({ link: "", note: "", tags: [], destId: "" });
    setAdding(false);
  };

  const toggleTag = (tagId) => setForm(f => ({ ...f, tags: f.tags.includes(tagId) ? f.tags.filter(t=>t!==tagId) : [...f.tags, tagId] }));

  const filtered = tagFilter === "all" ? inspoBoard : inspoBoard.filter(item => item.tags?.some(t => {
    const tag = ALL_TASTE_TAGS.find(x=>x.id===t);
    return tag?.group === tagFilter;
  }));

  return (
    <div>
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, marginBottom: 4 }}>Inspo Board</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 300 }}>Save what inspires you. We'll learn your taste and tailor everything to match.</p>
        </div>
        <Button onClick={()=>setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>{I.plus} Save Inspo</Button>
      </div>

      {/* Taste Profile */}
      {tasteProfile.length > 0 && (
        <div className="fade-up fade-up-1" style={{ background: "var(--card-bg)", borderRadius: 16, padding: 22, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, marginBottom: 2 }}>Your Taste DNA</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 300 }}>Built from {inspoBoard.length} save{inspoBoard.length!==1?"s":""} · {tasteProfile.length} unique signals</p>
            </div>
            <button onClick={()=>setExpandProfile(!expandProfile)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--sage)", fontSize: 12, fontWeight: 500 }}>{expandProfile ? "Show less" : "Show all"}</button>
          </div>

          {/* Top tags as bars */}
          <div style={{ display: "grid", gap: 6 }}>
            {tasteProfile.slice(0, expandProfile ? 30 : 8).map((tp,i) => {
              const maxCount = tasteProfile[0]?.count || 1;
              const pct = Math.round(tp.count / maxCount * 100);
              return (
                <div key={tp.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 130, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>{tp.tag.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{tp.tag.label}</span>
                  </div>
                  <div style={{ flex: 1, height: 8, background: "var(--cream-dark)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: tp.tag.groupColor, borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, width: 24, textAlign: "right" }}>{tp.count}</span>
                </div>
              );
            })}
          </div>

          {/* Group breakdown */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {TASTE_TAGS.map(group => {
              const groupTags = tasteProfile.filter(tp => tp.tag.group === group.group);
              const total = groupTags.reduce((s,t) => s+t.count, 0);
              if (total === 0) return null;
              return (
                <div key={group.group} style={{ padding: "8px 14px", borderRadius: 10, background: `${group.color}08`, border: `1px solid ${group.color}15`, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 300, color: group.color, fontFamily: serif }}>{total}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.04em", marginTop: 1 }}>{group.group}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Inspo Form */}
      {adding && (
        <div className="fade-up" style={{ background: "var(--card-bg)", borderRadius: 16, padding: 24, border: "1px solid var(--sage)", boxShadow: "var(--shadow-md)", marginBottom: 24 }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, marginBottom: 16 }}>Save Something That Inspired You</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500, letterSpacing: "0.06em" }}>PASTE A LINK (optional)</label>
              <input type="text" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="TikTok, Instagram, Pinterest, Lemon8, YouTube..." style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500, letterSpacing: "0.06em" }}>WHAT INSPIRED YOU?</label>
              <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder='e.g., "That rooftop bar in Tulum with the vine ceiling and mezcal cocktails" or "The hidden waterfall hike in Bali everyone was talking about"' rows={3} style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13, resize: "vertical", lineHeight: 1.6 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500, letterSpacing: "0.06em" }}>LINK TO A DESTINATION (optional)</label>
              <select value={form.destId} onChange={e=>setForm({...form,destId:e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }}>
                <option value="">None / General</option>{DESTINATIONS.map(d=><option key={d.id} value={d.id}>{d.image} {d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 500, letterSpacing: "0.06em" }}>TAG WHAT YOU LIKED ABOUT IT</label>
              <div style={{ display: "grid", gap: 14 }}>
                {TASTE_TAGS.map(group => (
                  <div key={group.group}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: group.color, marginBottom: 6, letterSpacing: "0.06em" }}>{group.group.toUpperCase()}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {group.tags.map(tag => {
                        const active = form.tags.includes(tag.id);
                        return (
                          <button key={tag.id} onClick={()=>toggleTag(tag.id)} style={{
                            display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 18,
                            border: `1.5px solid ${active ? group.color : "var(--border-strong)"}`,
                            background: active ? `${group.color}10` : "var(--cream-light)",
                            color: active ? group.color : "var(--text-muted)",
                            cursor: "pointer", fontSize: 11, fontWeight: active ? 500 : 400, transition: "all 0.15s",
                          }}>
                            <span style={{ fontSize: 12 }}>{tag.icon}</span> {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {form.tags.length > 0 && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--sage-dim)", borderRadius: 8, fontSize: 12, color: "var(--sage-dark)", fontWeight: 300 }}>
                  {form.tags.length} tag{form.tags.length!==1?"s":""} selected — these teach the algorithm what you love.
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <Button variant="secondary" onClick={()=>{setAdding(false);setForm({link:"",note:"",tags:[],destId:""});}}>Cancel</Button>
            <Button onClick={saveInspo} disabled={!form.note && !form.link}>Save</Button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {inspoBoard.length > 0 && (
        <div className="fade-up fade-up-1" style={{ display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap" }}>
          <button onClick={()=>setTagFilter("all")} style={{ padding: "6px 14px", borderRadius: 18, border: `1px solid ${tagFilter==="all"?"var(--sage)":"var(--border-strong)"}`, background: tagFilter==="all"?"var(--sage-dim)":"var(--card-bg)", color: tagFilter==="all"?"var(--sage-dark)":"var(--text-muted)", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>All ({inspoBoard.length})</button>
          {TASTE_TAGS.map(g => {
            const count = inspoBoard.filter(item => item.tags?.some(t => ALL_TASTE_TAGS.find(x=>x.id===t)?.group === g.group)).length;
            if (count === 0) return null;
            return <button key={g.group} onClick={()=>setTagFilter(g.group)} style={{ padding: "6px 14px", borderRadius: 18, border: `1px solid ${tagFilter===g.group?g.color:"var(--border-strong)"}`, background: tagFilter===g.group?`${g.color}10`:"var(--card-bg)", color: tagFilter===g.group?g.color:"var(--text-muted)", cursor: "pointer", fontSize: 11, fontWeight: 500 }}>{g.group} ({count})</button>;
          })}
        </div>
      )}

      {/* Inspo Cards */}
      {!inspoBoard.length && !adding && (
        <EmptyState icon="💡" title="Your inspo board is empty" subtitle={"Save content from TikTok, Instagram, Pinterest, Lemon8 and more. Tag what you loved and we'll build a taste profile that makes every recommendation personal to you."} action={<Button onClick={()=>setAdding(true)}>Save Your First Inspo</Button>} />
      )}

      {filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map((item, i) => {
            const dest = item.destId ? DESTINATIONS.find(d=>d.id===parseInt(item.destId)) : null;
            return (
              <div key={item.id} className={`fade-up fade-up-${(i%5)+1}`} style={{ background: "var(--card-bg)", borderRadius: 14, padding: 18, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", position: "relative" }}>
                <button onClick={()=>setInspoBoard(inspoBoard.filter(x=>x.id!==item.id))} style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", opacity: 0.5 }}>{I.close}</button>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--sage)", fontWeight: 500, marginBottom: 8, textDecoration: "none", padding: "3px 8px", background: "var(--sage-dim)", borderRadius: 6 }}>
                    🔗 {item.link.includes("tiktok") ? "TikTok" : item.link.includes("instagram") ? "Instagram" : item.link.includes("pinterest") ? "Pinterest" : item.link.includes("lemon8") ? "Lemon8" : item.link.includes("youtube") ? "YouTube" : "Link"}
                  </a>
                )}
                {dest && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{dest.image}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{dest.name}, {dest.country}</span>
                  </div>
                )}
                {item.note && <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12, fontWeight: 300, color: "var(--text-primary)" }}>{item.note}</p>}
                {item.tags?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {item.tags.map(tagId => {
                      const tag = ALL_TASTE_TAGS.find(t=>t.id===tagId);
                      if (!tag) return null;
                      return <span key={tagId} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 500, color: tag.groupColor, background: `${tag.groupColor}0A`, border: `1px solid ${tag.groupColor}15` }}>{tag.icon} {tag.label}</span>;
                    })}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10 }}>{item.createdAt}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ TRIP PLANNER ============
function PlannerView({ plannedTrips, setPlannedTrips, userCards, userLoyalty, totalPoints, getFlights }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ destId: "", dates: "", nights: 4, hotelIdx: 0, flightIdx: 0, notes: "", days: [] });

  const startNew = () => {
    setForm({ destId: "", dates: "", nights: 4, hotelIdx: 0, flightIdx: 0, notes: "", days: [] });
    setEditing("new");
  };

  const dest = DESTINATIONS.find(d => d.id === parseInt(form.destId));
  const destFlights = dest ? getFlights(dest) : [];

  const generateDays = (n, d) => {
    if (!d) return [];
    const df = getFlights(d);
    const days = [];
    days.push({ day: 1, title: "Arrival Day", items: [`Arrive via ${df[0]?.route || "flight"}`, `Check into ${d.hotels[0]?.name || "hotel"}`, "Explore the neighborhood, settle in"] });
    for (let i = 2; i < n; i++) {
      const activs = d.types.includes("beach") ? ["Beach morning, water sports", "Lunch at local spot", "Sunset drinks"] : d.types.includes("city") ? ["Walking tour of historic district", "Museum or gallery visit", "Dinner reservation at top-rated restaurant"] : d.types.includes("adventure") ? ["Morning hike or excursion", "Local lunch experience", "Afternoon activity"] : d.types.includes("wellness") ? ["Morning yoga or meditation", "Spa treatment", "Healthy dinner"] : ["Morning activity", "Afternoon exploration", "Evening experience"];
      days.push({ day: i, title: `Day ${i} — Explore`, items: activs });
    }
    days.push({ day: n, title: "Departure Day", items: ["Pack up and check out", "Last-minute shopping or sightseeing", `Depart via ${df[0]?.route || "flight"}`] });
    return days;
  };

  const saveTrip = () => {
    const trip = { ...form, id: Date.now(), dest: dest?.name, days: form.days.length ? form.days : generateDays(form.nights, dest) };
    setPlannedTrips([...plannedTrips, trip]);
    setEditing(null);
  };

  return (
    <div>
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div><h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, marginBottom: 4 }}>Trip Planner</h1><p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 300 }}>Build your itinerary, pick hotels & flights, and plan day-by-day.</p></div>
        <Button onClick={startNew} style={{ display: "flex", alignItems: "center", gap: 6 }}>{I.plus} New Trip</Button>
      </div>

      {editing === "new" && (
        <div className="fade-up" style={{ background: "var(--card-bg)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", marginBottom: 24 }}>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, marginBottom: 18 }}>Plan a New Trip</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
              <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500, letterSpacing: "0.06em" }}>DESTINATION</label>
                <select value={form.destId} onChange={e=>{ const did = e.target.value; const d = DESTINATIONS.find(x=>x.id===parseInt(did)); setForm({...form, destId: did, days: d ? generateDays(form.nights, d) : []}); }} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }}>
                  <option value="">Select...</option>{DESTINATIONS.map(d=><option key={d.id} value={d.id}>{d.image} {d.name}, {d.country}</option>)}
                </select></div>
              <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500, letterSpacing: "0.06em" }}>CHECK-IN</label><input type="date" value={form.dates} onChange={e=>setForm({...form,dates:e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }} /></div>
              <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500, letterSpacing: "0.06em" }}>NIGHTS</label><input type="number" min="1" max="21" value={form.nights} onChange={e=>{const n=parseInt(e.target.value)||4; setForm({...form, nights: n, days: dest ? generateDays(n, dest) : []});}} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }} /></div>
            </div>

            {dest && (
              <>
                {/* Hotel Selection */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--sage-dark)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.08em" }}>SELECT HOTEL</label>
                  <div style={{ display: "grid", gap: 6 }}>
                    {dest.hotels.map((h,i) => (
                      <button key={i} onClick={()=>setForm({...form,hotelIdx:i})} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${form.hotelIdx===i?"var(--sage)":"var(--border)"}`, background: form.hotelIdx===i?"var(--sage-dim)":"var(--cream-light)", cursor: "pointer", textAlign: "left" }}>
                        <div><div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{h.chain} {h.category!=="N/A"?`· ${h.category}`:""}</div><DistinctionBadges distinctions={h.distinctions} /></div>
                        <div style={{ textAlign: "right" }}>{h.pointsPerNight ? <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sage-dark)" }}>{(h.pointsPerNight*form.nights).toLocaleString()} pts</div> : null}<div style={{ fontSize: 11, color: "var(--text-muted)" }}>${(h.cashPerNight*form.nights).toLocaleString()}</div></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flight Selection */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--terracotta)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.08em" }}>SELECT FLIGHT</label>
                  <div style={{ display: "grid", gap: 6 }}>
                    {destFlights.map((f,i) => (
                      <button key={i} onClick={()=>setForm({...form,flightIdx:i})} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${form.flightIdx===i?"var(--terracotta)":"var(--border)"}`, background: form.flightIdx===i?"var(--terracotta-dim)":"var(--cream-light)", cursor: "pointer", textAlign: "left" }}>
                        <div><div style={{ fontSize: 13, fontWeight: 500 }}>{f.airline} · {f.cabin}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.route}</div></div>
                        <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 600, color: "var(--sage-dark)" }}>{f.miles.toLocaleString()} mi</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>${f.cash}</div></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day-by-Day Itinerary */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--warm-gold)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.08em" }}>DAY-BY-DAY ITINERARY</label>
                  <div style={{ display: "grid", gap: 8 }}>
                    {(form.days.length ? form.days : generateDays(form.nights, dest)).map((day,di) => (
                      <div key={di} style={{ background: "var(--cream)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--warm-gold)", marginBottom: 6 }}>{day.title}</div>
                        {day.items.map((item,ii) => (
                          <div key={ii} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                            <span style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 3 }}>•</span>
                            <input type="text" value={item} onChange={e=>{const d=[...form.days.length?form.days:generateDays(form.nights,dest)]; d[di].items[ii]=e.target.value; setForm({...form,days:d});}} style={{ flex: 1, background: "transparent", border: "none", fontSize: 12, color: "var(--text-primary)", fontWeight: 300, padding: "2px 0", borderBottom: "1px solid transparent" }} onFocus={e=>e.target.style.borderBottom="1px solid var(--border-strong)"} onBlur={e=>e.target.style.borderBottom="1px solid transparent"} />
                          </div>
                        ))}
                        <button onClick={()=>{const d=[...form.days.length?form.days:generateDays(form.nights,dest)]; d[di].items.push("New activity"); setForm({...form,days:d});}} style={{ background: "transparent", border: "none", color: "var(--sage)", cursor: "pointer", fontSize: 11, marginTop: 4, fontWeight: 500 }}>+ Add item</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Summary */}
                <div style={{ background: "var(--sage-dim)", borderRadius: 12, padding: 16, border: "1px solid var(--sage)20" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--sage-dark)", marginBottom: 10, letterSpacing: "0.08em" }}>TRIP COST ESTIMATE</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Hotel ({form.nights} nights)</span><span style={{ fontWeight: 500 }}>{dest.hotels[form.hotelIdx]?.pointsPerNight ? `${(dest.hotels[form.hotelIdx].pointsPerNight*form.nights).toLocaleString()} pts` : `$${(dest.hotels[form.hotelIdx]?.cashPerNight*form.nights).toLocaleString()}`}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Flight (RT)</span><span style={{ fontWeight: 500 }}>{destFlights[form.flightIdx]?.miles.toLocaleString()} mi</span></div>
                  </div>
                </div>
              </>
            )}

            <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500 }}>NOTES</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} placeholder="Anything to remember..." style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13, resize: "vertical" }} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <Button variant="secondary" onClick={()=>setEditing(null)}>Cancel</Button>
            <Button onClick={saveTrip} disabled={!form.destId}>Save Trip Plan</Button>
          </div>
        </div>
      )}

      {!plannedTrips.length && !editing && <EmptyState icon="📋" title="No trips planned" subtitle="Create your first trip with a full itinerary, hotel & flight picks, and a day-by-day plan." action={<Button onClick={startNew}>Plan a Trip</Button>} />}

      {plannedTrips.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          {plannedTrips.map((trip,i) => {
            const d = DESTINATIONS.find(x => x.id === parseInt(trip.destId));
            return (
              <div key={trip.id} className={`fade-up fade-up-${(i%5)+1}`} style={{ background: "var(--card-bg)", borderRadius: 14, padding: 20, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 32 }}>{d?.image||"✈️"}</span>
                    <div>
                      <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 500 }}>{d?.name||"Trip"}</h3>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 300 }}>{trip.dates ? formatDate(trip.dates) + " · " : ""}{trip.nights} nights · {d?.country}</div>
                    </div>
                  </div>
                  <button onClick={()=>setPlannedTrips(plannedTrips.filter(t=>t.id!==trip.id))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>{I.close}</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  {d?.hotels[trip.hotelIdx] && <Badge color="var(--sage-dark)">{I.hotel} {d.hotels[trip.hotelIdx].name}</Badge>}
                  {d && getFlights(d)[trip.flightIdx] && <Badge color="var(--terracotta)">{I.plane} {getFlights(d)[trip.flightIdx].airline} · {getFlights(d)[trip.flightIdx].cabin}</Badge>}
                </div>
                {trip.days?.length > 0 && (
                  <div style={{ display: "grid", gap: 6 }}>
                    {trip.days.map((day,di) => (
                      <div key={di} style={{ background: "var(--cream)", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--warm-gold)", marginBottom: 4 }}>{day.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.6 }}>{day.items.join(" → ")}</div>
                      </div>
                    ))}
                  </div>
                )}
                {trip.notes && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, fontStyle: "italic" }}>{trip.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ GOALS TRACKER ============
function GoalsView({ goals, setGoals, userCards, userLoyalty, totalPoints, getFlights }) {
  const [adding, setAdding] = useState(false);
  const [gForm, setGForm] = useState({ destId: "", cabin: "economy", hotelIdx: 0, earnRate: 5000 });

  const calcNeeded = () => {
    const dest = DESTINATIONS.find(d=>d.id===parseInt(gForm.destId));
    if (!dest) return 0;
    const hotel = dest.hotels[gForm.hotelIdx];
    const allFlights = getFlights(dest);
    const flights = gForm.cabin === "business" ? allFlights.filter(f=>f.cabin.toLowerCase().includes("business")||f.cabin.toLowerCase().includes("first")) : allFlights.filter(f=>f.cabin.toLowerCase().includes("economy")||f.cabin.toLowerCase().includes("wanna"));
    const flight = flights.length ? flights.reduce((b,f)=>(!b||f.miles<b.miles)?f:b,null) : allFlights[0];
    return (hotel?.pointsPerNight ? hotel.pointsPerNight * 4 : 0) + (flight?.miles || 0);
  };

  const saveGoal = () => {
    const dest = DESTINATIONS.find(d=>d.id===parseInt(gForm.destId));
    if (!dest) return;
    const needed = calcNeeded();
    setGoals([...goals, { id: Date.now(), destId: dest.id, label: dest.name, pointsNeeded: needed, cabin: gForm.cabin, hotelIdx: gForm.hotelIdx, earnRate: gForm.earnRate }]);
    setAdding(false);
    setGForm({ destId: "", cabin: "economy", hotelIdx: 0, earnRate: 5000 });
  };

  return (
    <div>
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div><h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 400, marginBottom: 4 }}>Points Goals</h1><p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 300 }}>Set a target trip and track your progress toward booking it.</p></div>
        <Button onClick={()=>setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>{I.plus} New Goal</Button>
      </div>

      {adding && (
        <div className="fade-up" style={{ background: "var(--card-bg)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", marginBottom: 24 }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, marginBottom: 16 }}>Set a Goal</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500 }}>DESTINATION</label>
              <select value={gForm.destId} onChange={e=>setGForm({...gForm,destId:e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }}>
                <option value="">Select...</option>{DESTINATIONS.map(d=><option key={d.id} value={d.id}>{d.image} {d.name}</option>)}
              </select></div>
            {gForm.destId && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500 }}>CABIN CLASS</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["economy","business"].map(c => <button key={c} onClick={()=>setGForm({...gForm,cabin:c})} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${gForm.cabin===c?"var(--sage)":"var(--border-strong)"}`, background: gForm.cabin===c?"var(--sage-dim)":"var(--card-bg)", cursor: "pointer", fontSize: 12, fontWeight: 500, color: gForm.cabin===c?"var(--sage-dark)":"var(--text-muted)", textTransform: "capitalize" }}>{c}</button>)}
                    </div></div>
                  <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 5, fontWeight: 500 }}>MONTHLY EARN RATE</label><input type="number" value={gForm.earnRate} onChange={e=>setGForm({...gForm,earnRate:parseInt(e.target.value)||0})} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }} /></div>
                </div>
                <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>POINTS NEEDED</div>
                  <div style={{ fontSize: 32, fontWeight: 300, color: "var(--sage-dark)", fontFamily: serif }}>{calcNeeded().toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 300, marginTop: 4 }}>
                    {totalPoints >= calcNeeded() ? <span style={{ color: "var(--sage-dark)", fontWeight: 500 }}>You have enough points now!</span> :
                    gForm.earnRate > 0 ? `~${Math.ceil((calcNeeded()-totalPoints)/gForm.earnRate)} months at ${gForm.earnRate.toLocaleString()}/mo` : "Set earn rate to estimate timeline"}
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <Button variant="secondary" onClick={()=>setAdding(false)}>Cancel</Button>
            <Button onClick={saveGoal} disabled={!gForm.destId}>Set Goal</Button>
          </div>
        </div>
      )}

      {!goals.length && !adding && <EmptyState icon="🎯" title="No goals yet" subtitle="Pick a dream trip and track how close you are to booking it with points." action={<Button onClick={()=>setAdding(true)}>Set Your First Goal</Button>} />}

      {goals.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          {goals.map((g,i) => {
            const dest = DESTINATIONS.find(d=>d.id===g.destId);
            const pct = Math.min(100, Math.round(totalPoints / g.pointsNeeded * 100));
            const gap = Math.max(0, g.pointsNeeded - totalPoints);
            const months = g.earnRate > 0 ? Math.ceil(gap / g.earnRate) : null;
            return (
              <div key={g.id} className={`fade-up fade-up-${(i%5)+1}`} style={{ background: "var(--card-bg)", borderRadius: 14, padding: 22, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 36 }}>{dest?.image||"✈️"}</span>
                    <div>
                      <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500 }}>{dest?.name||g.label}</h3>
                      <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                        <Badge color="var(--sky)">{g.cabin}</Badge>
                        <Badge color="var(--text-muted)">{g.pointsNeeded.toLocaleString()} pts needed</Badge>
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>setGoals(goals.filter(x=>x.id!==g.id))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>{I.close}</button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 300 }}>Progress</span>
                    <span style={{ fontWeight: 600, color: pct>=100?"var(--sage-dark)":"var(--text-primary)" }}>{pct}%</span>
                  </div>
                  <div style={{ height: 10, background: "var(--cream-dark)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct>=100?"var(--sage)":"linear-gradient(90deg, var(--warm-gold), var(--sage-light))", borderRadius: 5, transition: "width 0.8s ease" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div style={{ background: "var(--cream)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>YOU HAVE</div>
                    <div style={{ fontSize: 18, fontWeight: 300, color: "var(--sage-dark)", fontFamily: serif }}>{totalPoints.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "var(--cream)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>STILL NEED</div>
                    <div style={{ fontSize: 18, fontWeight: 300, color: gap>0?"var(--terracotta)":"var(--sage-dark)", fontFamily: serif }}>{gap > 0 ? gap.toLocaleString() : "0"}</div>
                  </div>
                  <div style={{ background: "var(--cream)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>ETA</div>
                    <div style={{ fontSize: 18, fontWeight: 300, color: "var(--warm-gold)", fontFamily: serif }}>{pct>=100?"Now!":months?`${months}mo`:"—"}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ COMPARE MODAL ============
function CompareModal({ isOpen, onClose, destinations, totalPoints, onClear, getFlights, livePricing }) {
  if (!isOpen || destinations.length < 2) return null;
  const cols = destinations.length;
  const Cell = ({ children, header, highlight }) => (
    <div style={{ padding: "10px 12px", fontSize: header ? 11 : 12, fontWeight: header ? 600 : 300, color: header ? "var(--text-muted)" : highlight ? "var(--sage-dark)" : "var(--text-primary)", letterSpacing: header ? "0.06em" : 0, background: header ? "var(--cream)" : "transparent", borderBottom: "1px solid var(--border)" }}>{children}</div>
  );
  return (
    <Modal isOpen={isOpen} onClose={()=>{onClose();onClear();}} title="⚖️ Compare Destinations" width={Math.min(740, 200+cols*200)}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `140px repeat(${cols}, 1fr)`, minWidth: 140+cols*160 }}>
          {/* Header */}
          <Cell header> </Cell>
          {destinations.map(d => <div key={d.id} style={{ padding: "14px 12px", textAlign: "center", borderBottom: "1px solid var(--border)", background: "var(--cream)" }}>
            <div style={{ fontSize: 28 }}>{d.image}</div>
            <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 500, marginTop: 4 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.country}</div>
          </div>)}

          <Cell header>VIBE</Cell>
          {destinations.map(d => <Cell key={d.id}><Badge color={d.vibe==="hidden"?"var(--sage)":"var(--terracotta)"}>{d.vibe==="hidden"?"Hidden":"Popular"}</Badge></Cell>)}

          <Cell header>BUDGET TIER</Cell>
          {destinations.map(d => <Cell key={d.id} highlight>{d.budgetTier}</Cell>)}

          <Cell header>REGION</Cell>
          {destinations.map(d => <Cell key={d.id}>{REGIONS.find(r=>r.id===d.region)?.label}</Cell>)}

          <Cell header>BEST MONTHS</Cell>
          {destinations.map(d => <Cell key={d.id}>{d.bestMonths.slice(0,4).map(m=>new Date(2024,m-1).toLocaleString('default',{month:'short'})).join(", ")}</Cell>)}

          <Cell header>TRIP TYPES</Cell>
          {destinations.map(d => <Cell key={d.id}><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{d.types.slice(0,3).map(t=><Badge key={t} color="var(--text-muted)">{TRIP_TYPES.find(x=>x.id===t)?.icon}</Badge>)}</div></Cell>)}

          <Cell header>BEST HOTEL (PTS)</Cell>
          {destinations.map(d => { const h=getBestHotelPoints(d); if (!h) return <Cell key={d.id}>Cash only</Cell>; const ep=getEffectivePricing(h, livePricing); return <Cell key={d.id} highlight>{ep.isLive?"":"~"}{ep.pointsPerNight.toLocaleString()}/nt{ep.isLive?" ●":""}</Cell>; })}

          <Cell header>HOTEL (4 NIGHTS)</Cell>
          {destinations.map(d => { const h=getBestHotelPoints(d); if (!h) return <Cell key={d.id}>{d.hotels[0]?`$${(d.hotels[0].cashPerNight*4).toLocaleString()}`:"—"}</Cell>; const ep=getEffectivePricing(h, livePricing); return <Cell key={d.id} highlight={totalPoints>=ep.pointsPerNight*4}>{(ep.pointsPerNight*4).toLocaleString()} pts</Cell>; })}

          <Cell header>BEST FLIGHT (MI)</Cell>
          {destinations.map(d => { const f=getBestFlightMiles(getFlights(d)); return <Cell key={d.id} highlight>{f?`${f.miles.toLocaleString()} mi`:"—"}</Cell>; })}

          <Cell header>FLIGHT CASH</Cell>
          {destinations.map(d => { const f=getBestFlightMiles(getFlights(d)); return <Cell key={d.id}>{f?`$${f.cash}`:"—"}</Cell>; })}

          <Cell header>TOTAL POINTS</Cell>
          {destinations.map(d => { const h=getBestHotelPoints(d); const f=getBestFlightMiles(getFlights(d)); const ep=h?getEffectivePricing(h,livePricing):null; const t=(ep?ep.pointsPerNight*4:0)+(f?f.miles:0); const ok=t>0&&totalPoints>=t; return <Cell key={d.id} highlight={ok}><span style={{ fontWeight: 600, color: ok?"var(--sage-dark)":"var(--text-primary)" }}>{t>0?t.toLocaleString():"N/A"}</span>{ok?" ✓":""}</Cell>; })}

          <Cell header>CASH EQUIVALENT</Cell>
          {destinations.map(d => { const h=d.hotels[0]; const f=getBestFlightMiles(getFlights(d)); return <Cell key={d.id}>${((h?.cashPerNight||0)*4+(f?.cash||0)).toLocaleString()}</Cell>; })}
        </div>
      </div>
    </Modal>
  );
}

// ============ ADD MODALS ============
function AddTripModal({ isOpen, onClose, trip, setTrip, onSave }) {
  const rated = trip.ratings ? Object.values(trip.ratings).filter(v=>v>0) : [];
  const avg = rated.length ? rated.reduce((a,b)=>a+b,0)/rated.length : 0;
  const allRated = trip.ratings && Object.values(trip.ratings).every(v=>v>0);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log a Trip" width={600}>
      <div style={{ display: "grid", gap: 16 }}>
        <div><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>Destination</label>
          <select value={trip.destination} onChange={e=>setTrip({...trip,destination:e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 14 }}>
            <option value="">Select destination...</option>{DESTINATIONS.map(d=><option key={d.id} value={d.name}>{d.image} {d.name}, {d.country}</option>)}<option value="Other">Other</option>
          </select></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>Trip Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{TRIP_TYPES.map(t => <button key={t.id} onClick={()=>setTrip({...trip,type:t.id})} style={{ padding: "5px 10px", borderRadius: 14, border: `1px solid ${trip.type===t.id?t.color:"var(--border-strong)"}`, background: trip.type===t.id?`${t.color}10`:"var(--card-bg)", color: trip.type===t.id?t.color:"var(--text-muted)", cursor: "pointer", fontSize: 11 }}>{t.icon} {t.label}</button>)}</div></div>
          <div><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>When?</label><input type="date" value={trip.date} onChange={e=>setTrip({...trip,date:e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13 }} /></div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 500 }}>Rate your experience</label>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontWeight: 300 }}>These combine into your overall score.</p>
          <div style={{ display: "grid", gap: 8 }}>
            {RATING_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: trip.ratings[cat.id]>0?`${cat.color}06`:"var(--cream)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${trip.ratings[cat.id]>0?`${cat.color}22`:"var(--border)"}`, transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>{cat.icon}</span><span style={{ fontSize: 13, fontWeight: 500, color: trip.ratings[cat.id]>0?cat.color:"var(--text-primary)" }}>{cat.label}</span></div>
                <StarRating rating={trip.ratings[cat.id]} onRate={r=>setTrip({...trip,ratings:{...trip.ratings,[cat.id]:r}})} size={15} />
              </div>
            ))}
          </div>
          {rated.length>0 && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "var(--cream)", borderRadius: 12, padding: "14px 20px", border: "1px solid var(--border)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: avg>=4?"var(--sage-dark)":avg>=3?"var(--warm-gold)":"var(--terracotta)", fontFamily: serif, lineHeight: 1 }}>{avg.toFixed(1)}</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.06em", marginTop: 3 }}>OVERALL</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--border)" }} />
              <div style={{ display: "flex", gap: 10 }}>{RATING_CATEGORIES.map(cat => { const v=trip.ratings[cat.id]; if (!v) return null; return <div key={cat.id} style={{ textAlign: "center" }}><div style={{ fontSize: 13, fontWeight: 600, color: cat.color }}>{v}</div><div style={{ fontSize: 9, color: "var(--text-muted)" }}>{cat.icon}</div></div>; })}</div>
            </div>
          )}
        </div>
        <div><label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>Notes</label><textarea value={trip.notes} onChange={e=>setTrip({...trip,notes:e.target.value})} placeholder="What stood out? Best meal? Favorite moment?" rows={3} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 14, resize: "vertical" }} /></div>
        {/* Trip Details for Recap */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--sage-dark)", letterSpacing: "0.1em", marginBottom: 10 }}>TRIP DETAILS (for sharing recaps)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>Where'd you stay?</label><input type="text" value={trip.hotel||""} onChange={e=>setTrip({...trip,hotel:e.target.value})} placeholder="e.g., Hyatt Ziva Riviera" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 12 }} /></div>
            <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>How'd you fly?</label><input type="text" value={trip.flight||""} onChange={e=>setTrip({...trip,flight:e.target.value})} placeholder="e.g., JetBlue Mint JFK→CUN" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 12 }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>Points spent</label><input type="text" value={trip.pointsSpent||""} onChange={e=>setTrip({...trip,pointsSpent:e.target.value})} placeholder="e.g., 100000" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 12 }} /></div>
            <div><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>Cash saved (est.)</label><input type="text" value={trip.cashSaved||""} onChange={e=>setTrip({...trip,cashSaved:e.target.value})} placeholder="e.g., 2100" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 12 }} /></div>
          </div>
          <div style={{ marginTop: 8 }}><label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>Trip highlights (what should friends know?)</label><input type="text" value={trip.highlights||""} onChange={e=>setTrip({...trip,highlights:e.target.value})} placeholder="e.g., Day trip to cenotes, dinner at Hartwood, beach club at Papaya Playa" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 12 }} /></div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} disabled={!trip.destination||!rated.length}>{allRated?`Save · ${avg.toFixed(1)} ★`:rated.length>0?`Save (${rated.length}/5 rated)`:"Rate to Save"}</Button>
      </div>
    </Modal>
  );
}

// ============ TRIP RECAP & SHARE ============
function RecapModal({ trip, onClose }) {
  if (!trip) return null;
  const dest = DESTINATIONS.find(d => d.name === trip.destination);
  const rated = trip.ratings ? Object.values(trip.ratings).filter(v=>v>0) : [];
  const avg = rated.length ? rated.reduce((a,b)=>a+b,0)/rated.length : 0;
  const col = avg>=4?"var(--sage-dark)":avg>=3?"var(--warm-gold)":avg>=2?"var(--terracotta)":"var(--text-muted)";
  const tripType = TRIP_TYPES.find(t=>t.id===trip.type);

  return (
    <Modal isOpen={!!trip} onClose={onClose} title="" width={480}>
      {/* Shareable card — designed for screenshots */}
      <div id="recap-card" style={{ background: "var(--cream-light)", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, var(--sage) 0%, var(--sage-dark) 100%)", padding: "28px 24px 22px", textAlign: "center", color: "#fff", position: "relative" }}>
          <div style={{ position: "absolute", top: 12, left: 16, fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", opacity: 0.7, fontFamily: sans, display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: "#fff" }}>{I.compass(12)}</span>VOYAGEUR TRIP RECAP</div>
          <div style={{ fontSize: 44, marginBottom: 6 }}>{dest?.image || "🌍"}</div>
          <h2 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, marginBottom: 4 }}>{trip.destination}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 12, opacity: 0.85, fontWeight: 300 }}>
            {dest && <span>{dest.country}</span>}
            {trip.date && <><span>·</span><span>{formatDate(trip.date)}</span></>}
            {tripType && <><span>·</span><span>{tripType.icon} {tripType.label}</span></>}
          </div>
        </div>

        <div style={{ padding: "20px 22px" }}>
          {/* Logistics */}
          {(trip.hotel || trip.flight) && (
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              {trip.hotel && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 18 }}>{I.hotel}</span>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em" }}>STAYED AT</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{trip.hotel}</div>
                  </div>
                </div>
              )}
              {trip.flight && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 18 }}>{I.plane}</span>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em" }}>FLEW</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{trip.flight}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Points & Savings */}
          {(trip.pointsSpent || trip.cashSaved) && (
            <div style={{ display: "grid", gridTemplateColumns: trip.pointsSpent && trip.cashSaved ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 16 }}>
              {trip.pointsSpent && (
                <div style={{ background: "var(--card-bg)", borderRadius: 10, padding: "12px 14px", textAlign: "center", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>POINTS USED</div>
                  <div style={{ fontSize: 22, fontWeight: 300, color: "var(--warm-gold)", fontFamily: serif }}>{parseInt(trip.pointsSpent).toLocaleString()}</div>
                </div>
              )}
              {trip.cashSaved && (
                <div style={{ background: "var(--card-bg)", borderRadius: 10, padding: "12px 14px", textAlign: "center", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>CASH SAVED</div>
                  <div style={{ fontSize: 22, fontWeight: 300, color: "var(--sage-dark)", fontFamily: serif }}>${parseInt(trip.cashSaved).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {/* Highlights */}
          {trip.highlights && (
            <div style={{ background: "var(--card-bg)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>HIGHLIGHTS</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, fontWeight: 300, color: "var(--text-primary)" }}>✨ {trip.highlights}</p>
            </div>
          )}

          {/* Ratings */}
          {rated.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 300, color: col, fontFamily: serif, lineHeight: 1 }}>{avg.toFixed(1)}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", marginTop: 4 }}>OVERALL RATING</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {RATING_CATEGORIES.map(cat => {
                  const v = trip.ratings?.[cat.id] || 0;
                  if (!v) return <div key={cat.id} />;
                  return (
                    <div key={cat.id} style={{ textAlign: "center", background: "var(--card-bg)", borderRadius: 8, padding: "8px 4px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 16 }}>{cat.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: cat.color, fontFamily: serif, marginTop: 2 }}>{v}</div>
                      <div style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 500, marginTop: 1 }}>{cat.label.split(" ")[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {trip.notes && (
            <div style={{ background: "var(--card-bg)", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 300, margin: 0 }}>"{trip.notes}"</p>
            </div>
          )}

          {/* Footer branding */}
          <div style={{ textAlign: "center", paddingTop: 4 }}>
            <span style={{ fontFamily: serif, fontSize: 14, color: "var(--text-muted)", fontWeight: 400, display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ color: "var(--sage)" }}>{I.compass(14)}</span>voyageur</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 6, fontWeight: 300 }}>· trip recap</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 300, marginBottom: 10 }}>Screenshot this card to share with friends & family</p>
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}
