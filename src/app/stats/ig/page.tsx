"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchMeta, fetchOverview } from "@/components/stats/ig/clientApi";
import type { Interval, MetaResponse, OverviewPoint, OverviewQuery } from "@/components/stats/ig/types";
import { CHART, ChartTooltip, ErrorNote, Field, Panel, Segmented, Toggle, formatDate, formatMoney, inputClass, localDay } from "@/components/stats/ig/ui";

const RANGES = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 365, label: "Last year" },
];
const DEFAULT_RANGE = 90;
const INTERVALS: { value: Interval; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

type ChartPoint = OverviewPoint & { t: number };

function dateRange(days: number) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return { from: localDay(start), to: localDay(now) };
}

function parseRange(raw: string | null) {
  return RANGES.find((r) => String(r.value) === raw)?.value ?? DEFAULT_RANGE;
}

export default function InstantGamingDashboard() {
  return (
    <Suspense fallback={<p className="text-sm text-ig-light">Loading...</p>}>
      <InstantGamingDashboardInner />
    </Suspense>
  );
}

function InstantGamingDashboardInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [points, setPoints] = useState<OverviewPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [range, setRange] = useState(() => parseRange(searchParams.get("range")));
  const [interval, setInterval] = useState<Interval>(() => (searchParams.get("interval") as Interval) ?? "day");
  const [type, setType] = useState(() => searchParams.get("type") ?? "all");
  const [onlyTopseller, setOnlyTopseller] = useState(() => searchParams.get("topseller") === "1");
  const [includePreorder, setIncludePreorder] = useState(() => searchParams.get("preorder") === "1");
  const [includeGiftcard, setIncludeGiftcard] = useState(() => searchParams.get("giftcard") === "1");

  useEffect(() => {
    setMounted(true);

    const controller = new AbortController();
    fetchMeta(controller.signal)
      .then(setMeta)
      .catch(() => setError("Could not load metadata"));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (range !== DEFAULT_RANGE) params.set("range", String(range));
    if (interval !== "day") params.set("interval", interval);
    if (type !== "all") params.set("type", type);
    if (onlyTopseller) params.set("topseller", "1");
    if (includePreorder) params.set("preorder", "1");
    if (includeGiftcard) params.set("giftcard", "1");

    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      router.replace(next, { scroll: false });
    }
  }, [range, interval, type, onlyTopseller, includePreorder, includeGiftcard, pathname, router]);

  useEffect(() => {
    const controller = new AbortController();
    const query: OverviewQuery = { ...dateRange(range), interval, type, onlyTopseller, includePreorder, includeGiftcard };
    setLoading(true);
    setError(null);
    fetchOverview(query, controller.signal)
      .then((response) => setPoints(response.points))
      .catch(() => setError("Could not load chart data"))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [range, interval, type, onlyTopseller, includePreorder, includeGiftcard]);

  const chartPoints = useMemo<ChartPoint[]>(() => points.map((p) => ({ ...p, t: Date.parse(p.snapshotTs) })), [points]);
  const first = points[0];
  const latest = points[points.length - 1];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Market overview</h1>
          <p className="mt-1 text-ig-light">
            Daily snapshots of the Instant Gaming catalog
            {meta ? <> · tracked since {formatDate(meta.earliestSnapshotTs)} · last update {formatDate(meta.latestSnapshotTs)}</> : null}
          </p>
        </div>
        {loading ? <span className="text-sm text-ig-medium-light">Updating…</span> : null}
      </header>

      <Panel>
        <div className="grid gap-4 lg:grid-cols-[auto_auto_1fr]">
          <Field label="Time range">
            <Segmented options={RANGES} value={range} onChange={setRange} />
          </Field>
          <Field label="Interval">
            <Segmented options={INTERVALS} value={interval} onChange={setInterval} />
          </Field>
          <Field label="Platform">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All platforms</option>
              {meta?.types.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-10 border-t border-white/10 pt-3 [&>button]:w-auto">
          <Toggle label="Only topsellers" checked={onlyTopseller} onChange={setOnlyTopseller} />
          <Toggle label="Include pre-orders" checked={includePreorder} disabled={onlyTopseller} onChange={setIncludePreorder} />
          <Toggle label="Include gift cards" checked={includeGiftcard} disabled={onlyTopseller} onChange={setIncludeGiftcard} />
        </div>
      </Panel>

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Games in stock" value={latest ? latest.gameCount.toLocaleString("en-GB") : "–"} delta={first && latest ? latest.gameCount - first.gameCount : null} format={(v) => v.toLocaleString("en-GB")} />
        <Kpi label="Average discount" value={latest ? `${latest.avgDiscount.toFixed(1)}%` : "–"} delta={first && latest ? latest.avgDiscount - first.avgDiscount : null} format={(v) => `${v.toFixed(1)} pts`} />
        <Kpi label="Average saving" value={latest ? formatMoney(latest.avgAbsDiscount) : "–"} delta={first && latest ? latest.avgAbsDiscount - first.avgAbsDiscount : null} format={formatMoney} />
        <Kpi label="Biggest discount" value={latest ? `-${latest.maxDiscount}%` : "–"} sub={latest ? `up to ${formatMoney(latest.maxAbsDiscount)} off` : undefined} highlight />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <TrendChart
          title="Games in stock"
          mounted={mounted}
          points={chartPoints}
          dataKey="gameCount"
          formatAxis={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
          rows={(p) => [{ name: "Games in stock", value: p.gameCount.toLocaleString("en-GB"), color: CHART.primary }]}
        />
        <TrendChart
          title="Average discount"
          mounted={mounted}
          points={chartPoints}
          dataKey="avgDiscount"
          formatAxis={(v) => `${v}%`}
          rows={(p) => [
            { name: "Average", value: `${p.avgDiscount.toFixed(1)}%`, color: CHART.primary },
            { name: "Smallest", value: `${p.minDiscount}%` },
            { name: "Biggest", value: `${p.maxDiscount}%` },
          ]}
        />
        <TrendChart
          title="Average saving"
          mounted={mounted}
          points={chartPoints}
          dataKey="avgAbsDiscount"
          formatAxis={(v) => `${v} €`}
          rows={(p) => [
            { name: "Average", value: formatMoney(p.avgAbsDiscount), color: CHART.primary },
            { name: "Smallest", value: formatMoney(p.minAbsDiscount) },
            { name: "Biggest", value: formatMoney(p.maxAbsDiscount) },
          ]}
        />
      </div>
      <p className="-mt-2 text-xs text-ig-medium-light">Data older than a month is kept as weekly averages.</p>
    </>
  );
}

function Kpi({ label, value, delta, format, sub, highlight }: { label: string; value: string; delta?: number | null; format?: (v: number) => string; sub?: string; highlight?: boolean }) {
  const showDelta = delta !== null && delta !== undefined && format && Math.abs(delta) > 0.005;
  return (
    <article className={`rounded-ig p-5 ${highlight ? "bg-fire" : "bg-ig-very-dark"}`}>
      <p className={`text-sm font-bold ${highlight ? "text-white/85" : "text-ig-light"}`}>{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {showDelta ? (
        <p className="mt-1 text-xs text-ig-light">
          <span className="font-bold text-ig-very-light">{delta > 0 ? "▲ +" : "▼ −"}{format(Math.abs(delta))}</span> since range start
        </p>
      ) : sub ? <p className="mt-1 text-xs text-white/85">{sub}</p> : <p className="mt-1 text-xs">&nbsp;</p>}
    </article>
  );
}

function TrendChart({ title, mounted, points, dataKey, formatAxis, rows }: {
  title: string;
  mounted: boolean;
  points: ChartPoint[];
  dataKey: keyof OverviewPoint;
  formatAxis: (v: number) => string;
  rows: (p: ChartPoint) => { name: string; value: string; color?: string }[];
}) {
  const gradientId = `fill-${dataKey}`;
  return (
    <Panel title={title}>
      <div className="h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={points} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={(v) => formatDate(v).replace(/ \d{4}$/, "")} minTickGap={40} stroke={CHART.axis} tickLine={false} axisLine={false} fontSize={12} />
              <YAxis width={48} tickFormatter={formatAxis} stroke={CHART.axis} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as ChartPoint | undefined;
                  return point ? <ChartTooltip active={active} label={formatDate(point.t)} rows={rows(point)} /> : null;
                }}
              />
              <Area type="monotone" dataKey={dataKey} stroke={CHART.primary} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4, stroke: "#1d1d1d", strokeWidth: 2 }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </Panel>
  );
}
