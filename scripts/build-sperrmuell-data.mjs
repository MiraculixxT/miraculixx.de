#!/usr/bin/env node
// Builds src/app/edu/sperrmuell/sperrmuell-bonn.json from the Bonn open-data CSV.
//
// Sources:
//   - CSV (current year): https://opendata.bonn.de/sites/default/files/ABFUHRTERMINE2026OpenData.csv  (UTF-8 BOM)
//   - CSV (prior year):   https://opendata.bonn.de/sites/default/files/Abfuhrtermine2025.csv          (ISO-8859-1)
//   - Dataset index: https://opendata.bonn.de/group/bonnorange-aör
//   - Geocoding: OSM Overpass API (bulk street lookup for Bonn). https://overpass-api.de/

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "src", "app", "edu", "sperrmuell");
const OUT_FILE = path.join(OUT_DIR, "sperrmuell-bonn.json");
const CSV_SOURCES = [
  { url: "https://opendata.bonn.de/sites/default/files/ABFUHRTERMINE2026OpenData.csv", encoding: "utf-8" },
  { url: "https://opendata.bonn.de/sites/default/files/Abfuhrtermine2025.csv", encoding: "iso-8859-1" },
];
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "miraculixx.de-edu-sperrmuell/1.0 (https://miraculixx.de)";

function parseCsv(text) {
  // Strip UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(";");
  return lines.slice(1).map((line) => {
    const cols = line.split(";");
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = cols[i] ?? "";
    return row;
  });
}

function normalizeStreet(s) {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/str\.?$/i, "strasse")
    .replace(/straße/gi, "strasse")
    .replace(/[-\s.]/g, "")
    .trim();
}

function extractSperrmuell(rows) {
  const termCols = Array.from({ length: 181 }, (_, i) => `TERMIN${String(i).padStart(3, "0")}`);
  const byStreet = new Map();
  for (const r of rows) {
    if ((r.PLAN_BEZ || "").toLowerCase() !== "sperrmüll") continue;
    const street = r.STRASSE1?.trim();
    const plz = r.PLZ1?.trim();
    if (!street || !plz) continue;
    const key = `${street}|${plz}`;
    const dates = termCols
      .map((c) => r[c])
      .filter((d) => d && /^\d{2}\.\d{2}\.\d{4}$/.test(d))
      .map((d) => {
        const [dd, mm, yyyy] = d.split(".");
        return `${yyyy}-${mm}-${dd}`;
      });
    if (!dates.length) continue;
    const existing = byStreet.get(key);
    if (existing) {
      existing.dates = Array.from(new Set([...existing.dates, ...dates])).sort();
    } else {
      byStreet.set(key, {
        street,
        district: r.ORTSTEIL1?.trim() || r.ORT1?.trim() || r.MREVBEZ?.trim() || "Bonn",
        plz,
        dates: dates.sort(),
      });
    }
  }
  return [...byStreet.values()];
}

async function fetchBonnStreets() {
  // All named highways inside Bonn's admin boundary, with center points.
  const query = `
[out:json][timeout:120];
area["name"="Bonn"]["admin_level"="6"]->.b;
(
  way["highway"]["name"](area.b);
);
out tags center;
`;
  console.log("Querying Overpass for Bonn streets …");
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: "data=" + encodeURIComponent(query),
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const json = await res.json();
  const byNorm = new Map();
  const byNormPlz = new Map();
  for (const el of json.elements ?? []) {
    const name = el.tags?.name;
    const plz = el.tags?.["addr:postcode"];
    if (!name || !el.center) continue;
    const n = normalizeStreet(name);
    const rec = { name, lat: el.center.lat, lng: el.center.lon, plz };
    if (!byNorm.has(n)) byNorm.set(n, rec);
    if (plz) {
      const pk = `${n}|${plz}`;
      if (!byNormPlz.has(pk)) byNormPlz.set(pk, rec);
    }
  }
  console.log(`Overpass: ${byNorm.size} unique street names (${byNormPlz.size} with PLZ).`);
  return { byNorm, byNormPlz };
}

async function fetchCsvRows() {
  for (const src of CSV_SOURCES) {
    const res = await fetch(src.url);
    if (!res.ok) {
      console.log(`  ${res.status} ${src.url} — skipping`);
      continue;
    }
    console.log(`Using ${src.url} (${src.encoding})`);
    const buf = await res.arrayBuffer();
    const text = new TextDecoder(src.encoding).decode(buf);
    return parseCsv(text);
  }
  throw new Error("no CSV source reachable");
}

async function main() {
  const rows = await fetchCsvRows();
  const sperr = extractSperrmuell(rows);
  console.log(`Found ${sperr.length} unique Sperrmüll street entries.`);

  const { byNorm, byNormPlz } = await fetchBonnStreets();

  let matched = 0;
  const out = [];
  for (const entry of sperr) {
    const n = normalizeStreet(entry.street);
    const rec = byNormPlz.get(`${n}|${entry.plz}`) ?? byNorm.get(n);
    if (!rec) continue;
    out.push({ ...entry, lat: rec.lat, lng: rec.lng });
    matched++;
  }
  console.log(`Matched ${matched}/${sperr.length} streets to Overpass coordinates.`);

  await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUT_FILE} (${(await fs.stat(OUT_FILE)).size} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
