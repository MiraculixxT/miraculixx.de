"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchMeta, fetchOverview } from "@/components/stats/ig/clientApi";
import type { Interval, MetaResponse, OverviewPoint, OverviewQuery } from "@/components/stats/ig/types";

const DEFAULT_FROM_OFFSET = 90;

function toDateInput(value: string) {
  return value.slice(0, 10);
}

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function InstantGamingDashboard() {
  const [mounted, setMounted] = useState(false);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [points, setPoints] = useState<OverviewPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [interval, setInterval] = useState<Interval>("day");
  const [platform, setPlatform] = useState("all");
  const [includeDlc, setIncludeDlc] = useState(false);
  const [includePreorder, setIncludePreorder] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(now);
    start.setDate(start.getDate() - DEFAULT_FROM_OFFSET);

    setFrom(toLocalDateString(start));
    setTo(toLocalDateString(now));

    const controller = new AbortController();
    fetchMeta(controller.signal)
      .then((data) => setMeta(data))
      .catch(() => setError("Could not load metadata"));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!from || !to) {
      return;
    }

    const controller = new AbortController();
    const query: OverviewQuery = {
      from,
      to,
      interval,
      platform,
      includeDlc,
      includePreorder,
    };

    setLoading(true);
    setError(null);

    fetchOverview(query, controller.signal)
      .then((response) => setPoints(response.points))
      .catch(() => setError("Could not load chart data"))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [from, to, interval, platform, includeDlc, includePreorder]);

  const latest = useMemo(() => points[points.length - 1], [points]);

  return (
    <section className="flex flex-col gap-5">
      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          Date from
          <input
            className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Date to
          <input
            className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Interval
          <select
            className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3"
            value={interval}
            onChange={(event) => setInterval(event.target.value as Interval)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Platform
          <select
            className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3"
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
          >
            <option value="all">All platforms</option>
            {meta?.platforms.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 self-end rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-900 accent-indigo-500"
            checked={includeDlc}
            onChange={(event) => setIncludeDlc(event.target.checked)}
          />
          Include DLC
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 self-end rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-900 accent-indigo-500"
            checked={includePreorder}
            onChange={(event) => setIncludePreorder(event.target.checked)}
          />
          Include preorder
        </label>
      </div>

      {error ? <p className="rounded-lg bg-rose-500/10 p-3 text-rose-300">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Games in latest snapshot</p>
          <p className="mt-2 text-3xl font-bold text-indigo-300">{latest?.gameCount ?? "-"}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Average discount</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">
            {latest ? `${latest.avgDiscount.toFixed(2)}%` : "-"}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Average absolute discount</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">
            {latest ? `${latest.avgAbsDiscount.toFixed(2)} EUR` : "-"}
          </p>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-xl font-semibold">Discount trend vs game count</h2>
        <div className="h-96 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={points} margin={{ top: 10, right: 18, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="snapshotTs" tickFormatter={toDateInput} minTickGap={35} stroke="#94a3b8" />
                <YAxis yAxisId="count" stroke="#94a3b8" />
                <YAxis yAxisId="discount" orientation="right" stroke="#94a3b8" domain={[0,100]}/>
                <Tooltip
                  labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
                />
                <Legend />
                <Line yAxisId="count" dataKey="gameCount" stroke="#818cf8" dot={false} name="Game count" />
                <Line yAxisId="discount" dataKey="avgDiscount" stroke="#34d399" dot={false} name="Avg discount %" />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-xl font-semibold">Absolute discount envelope</h2>
        <div className="h-96 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={points} margin={{ top: 10, right: 18, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="snapshotTs" tickFormatter={toDateInput} minTickGap={35} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
                />
                <Legend />
                <Area type="monotone" dataKey="minAbsDiscount" stroke="#facc15" fill="#facc15" fillOpacity={0.2} />
                <Area type="monotone" dataKey="avgAbsDiscount" stroke="#fb923c" fill="#fb923c" fillOpacity={0.2} />
                <Area type="monotone" dataKey="maxAbsDiscount" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </article>

      {loading ? <p className="text-sm text-slate-400">Loading updated chart data...</p> : null}
    </section>
  );
}

