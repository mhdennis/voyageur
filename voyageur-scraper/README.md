# Voyageur Scraper

Playwright-based hotel award price scraper + FastAPI backend for Voyageur.

Scrapes World of Hyatt award rates → stores in SQLite → serves to the React frontend via a REST API.

---

## Architecture

```
Playwright (headless Chrome)
        ↓
    hyatt.py  ← scrapes Hyatt booking pages
        ↓
  database.py ← SQLite cache (voyageur.db)
        ↓
  api/server.py ← FastAPI
        ↓
  GET /api/hotels/prices
        ↓
  TravelConcierge.jsx  ← setLivePricing(data)
```

---

## Setup

### 1. Install dependencies
```bash
cd voyageur-scraper
pip install -r requirements.txt
playwright install chromium
```

### 2. Run the scraper (first time)
```bash
# Dry run — see what will be scraped without hitting any sites
python run_scraper.py --dry-run

# Full run — scrape all 29 Hyatt properties across 6 dates
python run_scraper.py

# Single property (fast test)
python run_scraper.py --slug park-hyatt-tokyo

# Headful mode — watch the browser (good for debugging)
python run_scraper.py --slug park-hyatt-tokyo --headful

# Single date
python run_scraper.py --date 2026-04-15
```

### 3. Start the API server
```bash
python -m api.server
# → http://localhost:8000
```

### 4. Check what was scraped
```bash
python run_scraper.py --stats
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/hotels/prices` | All scraped prices (consumed by React app) |
| `GET` | `/api/hotels/{slug}/history` | Pricing history for one property |
| `GET` | `/api/hotels/{slug}/live` | Cached price + triggers background refresh |
| `GET` | `/api/stats` | Scraper coverage and health stats |
| `POST` | `/api/scrape/trigger` | Manually kick off a full scrape |
| `GET` | `/health` | Basic health check |

---

## Response Format

`GET /api/hotels/prices` returns:

```json
{
  "park-hyatt-tokyo": {
    "pointsPerNight": 30000,
    "cachedAt": 1710000000000,
    "availability": true,
    "rateTier": "standard",
    "chain": "hyatt",
    "medianCPP": null
  },
  "alila-villas-uluwatu": {
    "pointsPerNight": 40000,
    "cachedAt": 1710000000000,
    "availability": true,
    "rateTier": "peak",
    "chain": "hyatt",
    "medianCPP": null
  }
}
```

The React app's `getEffectivePricing()` function uses the slug key to look up live prices and overlays them on top of the hardcoded fallback values. Properties not in the API response silently fall back to hardcoded estimates.

---

## Connecting to the Frontend

In your React app (already wired up in `TravelConcierge.jsx`):

```js
// Development: proxy /api → localhost:8000
// Add to next.config.js or vite.config.js:
{
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' }]
  }
}

// Production: set NEXT_PUBLIC_API_URL=https://your-api.railway.app
// and update the fetch call in TravelConcierge.jsx:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels/prices`)
```

---

## Hyatt Category Chart Reference

| Cat | Off-Peak | Standard | Peak |
|-----|----------|----------|------|
| 1   | 3,500    | 5,000    | 6,500 |
| 2   | 6,000    | 8,000    | 10,000 |
| 3   | 9,000    | 12,000   | 15,000 |
| 4   | 12,000   | 15,000   | 18,000 |
| 5   | 17,000   | 20,000   | 25,000 |
| 6   | 21,000   | 25,000   | 30,000 |
| 7   | 26,000   | 30,000   | 35,000 |
| 8   | 35,000   | 40,000   | 50,000 |

⚠️ **Hyatt moves to 5-tier dynamic pricing in May 2026.** The category chart and tier classification logic in `config.py` and `hyatt.py` will need updating at that point.

---

## Debugging Failed Scrapes

1. Check screenshots in `/tmp/voyageur_screenshots/`
2. Run with `--headful` to watch the browser
3. Check `scraper.log` for error messages
4. Run `python run_scraper.py --stats` to see which properties succeeded

Common failure modes:
- **Hyatt blocks the request** → rotate user agent, increase delays, try different dates
- **DOM selectors changed** → update `SELECTORS` dict in `hyatt.py`
- **Page loads but no rates** → may need to click "Use Points" toggle; add selector to `_wait_for_rates()`
- **All-inclusive (Ziva) properties** → Ziva uses a different booking flow; may need separate scraper

---

## Scheduling Daily Scrapes

Quick cron setup (macOS/Linux):
```bash
# Edit crontab
crontab -e

# Run at 3 AM daily
0 3 * * * cd /path/to/voyageur-scraper && python run_scraper.py >> scraper.log 2>&1
```

For production, deploy on Railway or Render and use their cron job feature.

---

## File Structure

```
voyageur-scraper/
├── scraper/
│   ├── __init__.py
│   ├── config.py        ← Properties list, category chart, settings
│   ├── database.py      ← SQLite schema + async read/write
│   ├── base_scraper.py  ← Playwright base class (browser, delays, retries)
│   └── hyatt.py         ← Hyatt-specific scraper + DOM selectors
├── api/
│   ├── __init__.py
│   └── server.py        ← FastAPI server
├── run_scraper.py        ← CLI entry point
├── requirements.txt
└── README.md
```
