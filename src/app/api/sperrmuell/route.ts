import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

type Entry = {
  street: string;
  district: string;
  plz: string;
  dates: string[];
  lat: number;
  lng: number;
};

let cache: Entry[] | null = null;

async function loadData(): Promise<Entry[]> {
  if (cache) return cache;
  const file = path.join(process.cwd(), "src", "app", "edu", "sperrmuell", "sperrmuell-bonn.json");
  const raw = await fs.readFile(file, "utf8");
  cache = JSON.parse(raw) as Entry[];
  return cache;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radiusKm = parseFloat(searchParams.get("radiusKm") ?? "1");
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const data = await loadData();
  const center = { lat, lng };
  const results = data
    .map((e) => {
      const distanceKm = haversineKm(center, { lat: e.lat, lng: e.lng });
      const dates = e.dates.filter((d) => (!from || d >= from) && (!to || d <= to));
      return { ...e, distanceKm, dates };
    })
    .filter((e) => e.distanceKm <= radiusKm && e.dates.length > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({
    center,
    radiusKm,
    from,
    to,
    count: results.length,
    results,
  });
}
