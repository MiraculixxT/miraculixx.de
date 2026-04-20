# Sperrmüll-Karte Bonn

Web tool that shows upcoming **Sperrmüll** (bulky waste) collection dates per
street in Bonn on an interactive map.

## What the user sees

- An OpenStreetMap map centered on Bonn.
- A controls bar: address search, radius slider (0.2–5 km), and two date
  pickers (`Von` / `Bis`), plus quick buttons for next week / month / year.
- Clicking on the map sets the center. A circle shows the selected radius.
- Every street with a Sperrmüll pickup in the chosen window and radius is shown
  as a pin. Hovering a pin shows street name, PLZ, district, and all pickup
  dates; clicking opens a popup with the full list and distance.

## APIs and data sources

There is **no unified Germany-wide Sperrmüll API**. Since the project is
scoped to Bonn, we use the official open-data feed published by the city.

| Purpose                         | API / source                                                                       | How we use it                                                                                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sperrmüll dates per street**  | `https://opendata.bonn.de/sites/default/files/Abfuhrtermine2025.csv`               | Official CSV from _bonnorange AöR_ (Bonn's waste utility) published on [opendata.bonn.de](https://opendata.bonn.de/dataset/abfallplaner-müllabfuhrtermine-2025). ISO-8859-1, semicolon-delimited. One row per street × waste-type with up to 181 `TERMIN000…TERMIN180` date columns in `DD.MM.YYYY` format. We filter `PLAN_BEZ == "Sperrmüll"`. |
| **Street coordinates (bulk)**   | **OSM Overpass API** — `https://overpass-api.de/api/interpreter`                   | One POST query returns every `highway` way inside the Bonn admin boundary with its center. We normalize street names and join by name (matches ~99 % of CSV streets).   |
| **Map tiles**                   | **OpenStreetMap** — `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`           | Rendered client-side via Leaflet / react-leaflet. Attribution is shown as required.                                                                                     |
| **Address search (geocoding)**  | **OSM Nominatim** — `https://nominatim.openstreetmap.org/search`                   | Called from the browser when the user types an address and clicks "Suchen". Query is appended with `, Bonn, Germany` to keep results local. Low volume, within policy. |

## Data pipeline

`scripts/build-sperrmuell-data.mjs` runs once at setup time and writes the
static file `sperrmuell-bonn.json` next to this README. The script:

1. Downloads the Bonn CSV and decodes it as ISO-8859-1.
2. Keeps only Sperrmüll rows; converts each `TERMIN…` cell to ISO date.
3. Groups by `street|plz`, deduplicating dates.
4. Calls Overpass once to fetch all named Bonn streets with coordinates.
5. Joins CSV streets to Overpass coordinates by normalized name.
6. Writes the result as JSON.

Re-run with:

```bash
node scripts/build-sperrmuell-data.mjs
```

## Runtime flow

```
┌──────────────┐   GET /api/sperrmuell?lat&lng&radiusKm&from&to   ┌─────────────────────┐
│ SperrmuellMap│ ─────────────────────────────────────────────▶  │ Next.js route       │
│  (client)    │                                                  │ src/app/api/sperrmuell/route.ts
└──────────────┘                                                  └──────────┬──────────┘
       ▲                                                                     │ reads sperrmuell-bonn.json once
       │ JSON { results: [{street, plz, dates, lat, lng, distanceKm}, …] }   │ (in-memory cache), filters by
       └─────────────────────────────────────────────────────────────────────┘ haversine radius + date window
```

- The JSON is loaded on the first request and cached for the life of the
  Node process.
- Distance filtering uses the haversine formula.
- Date filtering is a string compare — ISO `YYYY-MM-DD` sorts lexically.

## File layout

```
src/app/edu/sperrmuell/
├─ page.tsx                      Server page shell
├─ SperrmuellMap.client.tsx      Client wrapper for dynamic(ssr:false) import
├─ SperrmuellMap.tsx             Leaflet map + controls (client component)
├─ sperrmuell-bonn.json          Prebuilt Sperrmüll-with-coordinates dataset
└─ README.md                     (this file)

src/app/api/sperrmuell/route.ts  Radius + date filter endpoint
scripts/build-sperrmuell-data.mjs   One-off data-build script
```

## Why this architecture

- **Static prebuilt JSON** avoids hammering Overpass / Nominatim at request
  time and keeps the endpoint fast (pure in-memory filter).
- **Overpass for bulk geocoding** — Nominatim's 1 req/s policy would take
  ~40 min for 2268 streets; Overpass returns them all in one query.
- **Nominatim only on user-typed address input** — low volume, one request
  per manual search, which stays within their usage policy.
