"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons under bundlers (leaflet references PNGs relative to CSS).
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const pickupIcon = L.divIcon({
  className: "sperr-pin",
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 0 1px #000"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

type Entry = {
  street: string;
  district: string;
  plz: string;
  dates: string[];
  lat: number;
  lng: number;
  distanceKm: number;
};

const BONN_CENTER: [number, number] = [50.7374, 7.0982];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function SperrmuellMap() {
  const [center, setCenter] = useState<[number, number]>(BONN_CENTER);
  const [radiusKm, setRadiusKm] = useState(1);
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(addDaysIso(todayIso(), 30));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lat: String(center[0]),
          lng: String(center[1]),
          radiusKm: String(radiusKm),
          from,
          to,
        });
        const res = await fetch(`/api/sperrmuell?${params}`);
        const json = await res.json();
        if (!cancelled) setResults(json.results ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "request failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [center, radiusKm, from, to]);

  async function handleSearch() {
    if (!query.trim()) return;
    setGeocoding(true);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", `${query}, Bonn, Germany`);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "de" },
      });
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data.length) {
        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        setError("Adresse nicht gefunden");
      }
    } finally {
      setGeocoding(false);
    }
  }

  const markers = useMemo(
    () => results.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng)),
    [results],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Straße oder Ort in Bonn …"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
          />
          <button
            onClick={handleSearch}
            disabled={geocoding}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {geocoding ? "…" : "Suchen"}
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          Radius
          <input
            type="range"
            min={0.2}
            max={5}
            step={0.1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
          />
          <span className="w-14 text-right tabular-nums">{radiusKm.toFixed(1)} km</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          Von
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          Bis
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => {
            setFrom(todayIso());
            setTo(addDaysIso(todayIso(), 7));
          }}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 hover:border-indigo-500"
        >
          Nächste Woche
        </button>
        <button
          onClick={() => {
            setFrom(todayIso());
            setTo(addDaysIso(todayIso(), 30));
          }}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 hover:border-indigo-500"
        >
          Nächster Monat
        </button>
        <button
          onClick={() => {
            setFrom(todayIso());
            setTo(addDaysIso(todayIso(), 365));
          }}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 hover:border-indigo-500"
        >
          Nächstes Jahr
        </button>
        <span className="ml-auto text-slate-400">
          {loading ? "lädt …" : `${results.length} Straßen im Umkreis`}
          {error ? ` · ${error}` : null}
        </span>
      </div>

      <div className="h-[70vh] overflow-hidden rounded-2xl border border-slate-800">
        <MapContainer
          center={BONN_CENTER}
          zoom={12}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter center={center} />
          <ClickHandler onPick={(lat, lng) => setCenter([lat, lng])} />
          <Marker position={center}>
            <Popup>
              Ausgewählter Punkt
              <br />
              {center[0].toFixed(5)}, {center[1].toFixed(5)}
            </Popup>
          </Marker>
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#6366f1", fillOpacity: 0.05 }}
          />
          {markers.map((m) => (
            <Marker
              key={`${m.street}-${m.plz}`}
              position={[m.lat, m.lng]}
              icon={pickupIcon}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>{m.street}</strong>
                <br />
                {m.plz} {m.district}
                <br />
                {m.dates.map(formatDate).join(" · ")}
              </Tooltip>
              <Popup>
                <strong>{m.street}</strong>
                <br />
                {m.plz} {m.district}
                <br />
                <em>Entfernung {m.distanceKm.toFixed(2)} km</em>
                <ul className="mt-1">
                  {m.dates.map((d) => (
                    <li key={d}>{formatDate(d)}</li>
                  ))}
                </ul>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="text-xs text-slate-400">
        Klick auf die Karte setzt den Mittelpunkt. Bewegen des Reglers ändert den Radius. Daten:
        offene Daten der Stadt Bonn / bonnorange AöR. Geokodierung: OpenStreetMap Nominatim.
      </p>
    </div>
  );
}
