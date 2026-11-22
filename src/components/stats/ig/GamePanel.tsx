"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchGameHistory } from "./clientApi";
import type { AvailabilitySpan, GameHistoryPoint, GameRow } from "./types";
import { CHART, ChartTooltip, DiscountBadge, PlatformIcon, Tag, formatDate, formatMoney, productLink } from "./ui";

type ChartPoint = { t: number; price: number | null; retail: number | null; discount: number | null; samples: number; isolated?: boolean };
type SpanState = "in" | "out" | "partial";

const spanState = (span: AvailabilitySpan): SpanState => (span.inStock === 0 ? "out" : span.inStock >= span.tracked ? "in" : "partial");
const SPAN_CLASS: Record<SpanState, string> = { in: "bg-ig-green", out: "bg-ig-red", partial: "ig-stock-partial" };
const SPAN_LABEL: Record<SpanState, string> = { in: "In stock", out: "Out of stock", partial: "Partly in stock" };

export default function GamePanel({ game, onClose }: { game: GameRow; onClose: () => void }) {
  const [points, setPoints] = useState<GameHistoryPoint[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySpan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [zoom, setZoom] = useState<[number, number] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setBannerIndex(0);
    setZoom(null);
    fetchGameHistory({ id: game.id }, controller.signal)
      .then((response) => {
        setPoints(response.points);
        setAvailability(response.availability ?? []);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setPoints([]);
        setAvailability([]);
        setError(e instanceof Error ? e.message : "Could not load game history");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [game.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const banners = [
    `https://gaming-cdn.com/img/products/${game.id}/pcover/${game.id}.jpg`,
    `https://gaming-cdn.com/images/products/${game.id}/616x353/${encodeURIComponent(game.url)}-cover.jpg`,
  ];

  const priceRange = useMemo(() => {
    if (points.length === 0) return null;
    const low = points.reduce((a, b) => (b.price < a.price ? b : a));
    const high = points.reduce((a, b) => (b.price > a.price ? b : a));
    return { low, high };
  }, [points]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-2 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={game.name}
        className="relative my-auto w-full max-w-5xl overflow-hidden rounded-ig bg-ig-dark shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-56 w-full bg-ig-ultra-dark sm:h-72">
          {banners[bannerIndex] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banners[bannerIndex]} alt="" className="h-full w-full object-cover" onError={() => setBannerIndex((i) => i + 1)} />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ig-dark via-ig-dark/30 to-transparent" />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ig-ultra-dark/80 text-xl text-white transition hover:bg-ig-orange"
          >
            ×
          </button>
        </div>

        <div className="relative -mt-20 space-y-5 px-4 pb-6 sm:px-8">
          <div className="grid gap-5 md:grid-cols-[1fr_300px]">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold leading-tight drop-shadow">{game.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ig-very-light">
                <span className="flex items-center gap-1.5"><PlatformIcon type={game.type} size={18} />{game.type}</span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className={`h-2 w-2 rounded-full ${game.inStock ? "bg-ig-green" : "bg-ig-red"}`} />
                  {game.inStock ? "In stock" : "Out of stock"}
                </span>
                <span className="text-ig-medium-light">ID {game.id}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {game.topseller ? <Tag tone="orange">Topseller</Tag> : null}
                {game.preorder ? <Tag tone="orange">Pre-order</Tag> : null}
                {game.giftcard ? <Tag tone="orange">Gift card</Tag> : null}
                {game.categories?.map((category) => <Tag key={category}>{category}</Tag>)}
              </div>
              {game.description ? <p className="whitespace-pre-line text-ig-very-light">{game.description}</p> : null}
            </div>

            <aside className="h-fit space-y-3 rounded-ig bg-ig-very-dark p-5">
              <div className="flex items-center gap-2">
                <span className="text-ig-medium-light line-through">{formatMoney(game.retail)}</span>
                <DiscountBadge value={game.discount} />
              </div>
              <p className="text-4xl font-bold">{formatMoney(game.price)}</p>
              <p className="text-sm text-ig-light">You save <span className="font-bold text-white">{formatMoney(game.absDiscount)}</span></p>
              {!game.inStock ? <p className="text-xs text-ig-light">Last price seen on {formatDate(game.snapshotTs)}</p> : null}
              <a
                href={productLink(game.id, game.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center rounded-full bg-fire px-5 text-base font-bold transition hover:bg-fire-hover"
              >
                View on Instant Gaming
              </a>
            </aside>
          </div>

          {error ? <p role="alert" className="rounded-ig-sm bg-ig-red/10 px-4 py-3 text-sm text-ig-red">{error}</p> : null}

          <AvailabilitySection spans={availability} loading={loading} zoom={zoom} />

          <section className="rounded-ig bg-ig-very-dark p-5">
            <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Price history</h3>
                {zoom ? (
                  <button type="button" onClick={() => setZoom(null)} className="rounded-full bg-ig-medium-dark px-3 py-1 text-xs font-bold text-ig-very-light transition hover:bg-ig-orange hover:text-white">
                    Reset zoom
                  </button>
                ) : null}
              </div>
              {priceRange ? (
                <p className="text-sm text-ig-light">
                  Lowest <span className="font-bold text-white">{formatMoney(priceRange.low.price)}</span> ({formatDate(priceRange.low.snapshotTs)})
                  {" · "}Highest <span className="font-bold text-white">{formatMoney(priceRange.high.price)}</span>
                </p>
              ) : null}
            </header>
            <PriceChart points={points} spans={availability} fallback={game} zoom={zoom} onZoom={setZoom} />
          </section>
        </div>
      </div>
    </div>
  );
}

function AvailabilitySection({ spans, loading, zoom }: { spans: AvailabilitySpan[]; loading: boolean; zoom: [number, number] | null }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const summary = useMemo(() => {
    if (spans.length === 0) return null;
    const tracked = spans.reduce((sum, s) => sum + s.tracked, 0);
    const inStock = spans.reduce((sum, s) => sum + s.inStock, 0);
    const start = Date.parse(spans[0].from);
    const end = Date.parse(spans[spans.length - 1].to);
    return {
      pct: tracked > 0 ? Math.round((inStock / tracked) * 100) : 0,
      inStock,
      tracked,
      start,
      end,
      outages: spans.filter((s, i) => spanState(s) !== "in" && (i === 0 || spanState(spans[i - 1]) === "in")).length,
      last: spans[spans.length - 1],
    };
  }, [spans]);

  if (!summary) {
    return (
      <section className="rounded-ig bg-ig-very-dark p-5">
        <h3 className="text-lg font-bold">Availability</h3>
        <p className="mt-2 text-sm text-ig-light">{loading ? "Loading availability…" : "No availability data recorded."}</p>
      </section>
    );
  }

  const lastState = spanState(summary.last);
  const active = hovered !== null ? spans[hovered] : null;
  const [viewStart, viewEnd] = zoom ?? [summary.start, summary.end];
  const visible = spans
    .map((span, index) => ({ span, index, from: Math.max(Date.parse(span.from), viewStart), to: Math.min(Date.parse(span.to), viewEnd) }))
    .filter((v) => v.to > v.from);

  return (
    <section className="rounded-ig bg-ig-very-dark p-5">
      <h3 className="mb-4 text-lg font-bold">Availability</h3>
      <dl className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Current status" value={SPAN_LABEL[lastState]} sub={lastState === "partial" ? undefined : `since ${formatDate(summary.last.from)}`} />
        <Stat label="In stock" value={`${summary.pct}%`} sub={`${summary.inStock} of ${summary.tracked} days`} />
        <Stat label="Out-of-stock periods" value={String(summary.outages)} />
        <Stat label="Tracked since" value={formatDate(summary.start)} />
      </dl>

      <div className="flex h-7 w-full gap-px overflow-hidden rounded-ig-sm" onMouseLeave={() => setHovered(null)}>
        {visible.map(({ span, index, from, to }) => {
          const state = spanState(span);
          return (
            <button
              key={span.from}
              type="button"
              aria-label={`${formatDate(span.from)} – ${formatDate(span.to)}: ${SPAN_LABEL[state]} (${span.inStock}/${span.tracked} days)`}
              className={`h-full min-w-[3px] transition-opacity ${SPAN_CLASS[state]} ${hovered !== null && hovered !== index ? "opacity-50" : ""}`}
              style={{ flexGrow: to - from, flexBasis: 0 }}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-ig-medium-light">
        <span>{formatDate(viewStart)}</span>
        {zoom ? <span className="font-bold text-ig-hover">Zoomed</span> : null}
        <span>{formatDate(viewEnd)}</span>
      </div>
      <p className="mt-2 min-h-5 text-sm text-ig-very-light" aria-live="polite">
        {active
          ? <>{formatDate(active.from)} – {formatDate(active.to)}: <span className="font-bold text-white">{SPAN_LABEL[spanState(active)]}</span> · {active.inStock} of {active.tracked} days</>
          : <span className="text-ig-medium-light">Hover the bar for details</span>}
      </p>
      <ul className="mt-2 flex flex-wrap gap-4 text-xs text-ig-light">
        {(["in", "partial", "out"] as SpanState[]).map((state) => (
          <li key={state} className="flex items-center gap-1.5">
            <span aria-hidden className={`h-3 w-3 rounded-sm ${SPAN_CLASS[state]}`} />
            {SPAN_LABEL[state]}{state === "partial" ? " (weekly data)" : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ig-medium-light">{label}</dt>
      <dd className="mt-1 text-xl font-bold">{value}</dd>
      {sub ? <dd className="text-xs text-ig-light">{sub}</dd> : null}
    </div>
  );
}

function PriceChart({ points, spans, fallback, zoom, onZoom }: {
  points: GameHistoryPoint[];
  spans: AvailabilitySpan[];
  fallback: GameRow;
  zoom: [number, number] | null;
  onZoom: (range: [number, number] | null) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [drag, setDragState] = useState<{ a: number; b: number } | null>(null);
  const dragRef = useRef(drag);
  const setDrag = (next: { a: number; b: number } | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  useEffect(() => setMounted(true), []);

  const toArea = (s: AvailabilitySpan) => ({ x1: Date.parse(s.from), x2: Date.parse(s.to) });
  const outages = useMemo(() => spans.filter((s) => spanState(s) === "out").map(toArea), [spans]);
  const partials = useMemo(() => spans.filter((s) => spanState(s) === "partial").map(toArea), [spans]);

  const data = useMemo<ChartPoint[]>(() => {
    const source = points.length > 0 ? points : [{ ...fallback, samples: 1 }];
    const rows: ChartPoint[] = source.map((p) => ({ t: Date.parse(p.snapshotTs), price: p.price, retail: p.retail, discount: p.discount, samples: p.samples }));
    // Null rows at each outage start break the lines instead of bridging the gap
    outages.forEach((o) => rows.push({ t: o.x1, price: null, retail: null, discount: null, samples: 0 }));
    rows.sort((a, b) => a.t - b.t);
    return rows.map((row, i) => ({ ...row, isolated: row.price !== null && rows[i - 1]?.price == null && rows[i + 1]?.price == null }));
  }, [points, outages, fallback]);

  const fullDomain: [number, number] = [
    Math.min(data[0]?.t ?? 0, outages[0]?.x1 ?? Infinity),
    Math.max(data[data.length - 1]?.t ?? 0, outages[outages.length - 1]?.x2 ?? -Infinity),
  ];
  const domain = zoom ?? fullDomain;

  // Keep one neighbour on each side so lines run to the edges, and let the y-axis fit the visible range
  const view = useMemo(() => {
    if (!zoom) return data;
    const first = data.findIndex((d) => d.t >= zoom[0]);
    const last = data.findLastIndex((d) => d.t <= zoom[1]);
    return data.slice(Math.max(0, (first === -1 ? data.length : first) - 1), last + 2);
  }, [data, zoom]);

  const labelOf = (state: { activeLabel?: string | number }) => (state.activeLabel === undefined ? null : Number(state.activeLabel));
  // Recharts may call handlers from an older render, so drag state is read through the ref
  const finishDrag = () => {
    const current = dragRef.current;
    if (current && current.a !== current.b) onZoom([Math.min(current.a, current.b), Math.max(current.a, current.b)]);
    setDrag(null);
  };

  return (
    <>
      <div className="h-72 w-full cursor-crosshair select-none" onDoubleClick={() => onZoom(null)}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={view}
              margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
              onMouseDown={(state) => {
                const t = labelOf(state);
                if (t !== null) setDrag({ a: t, b: t });
              }}
              onMouseMove={(state) => {
                const t = labelOf(state);
                if (dragRef.current && t !== null) setDrag({ a: dragRef.current.a, b: t });
              }}
              onMouseUp={finishDrag}
              onMouseLeave={() => setDrag(null)}
            >
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="t" type="number" scale="time" domain={domain} allowDataOverflow tickFormatter={(v) => formatDate(v).replace(/ \d{4}$/, "")} minTickGap={40} stroke={CHART.axis} tickLine={false} axisLine={false} fontSize={12} />
              <YAxis width={56} tickFormatter={(v) => `${v} €`} stroke={CHART.axis} tickLine={false} axisLine={false} fontSize={12} domain={[0, "auto"]} />
              {partials.map((o) => (
                <ReferenceArea key={`p${o.x1}`} x1={o.x1} x2={o.x2} fill={CHART.outOfStock} fillOpacity={0.05} stroke="none" ifOverflow="hidden" />
              ))}
              {outages.map((o) => (
                <ReferenceArea key={o.x1} x1={o.x1} x2={o.x2} fill={CHART.outOfStock} fillOpacity={0.12} stroke="none" ifOverflow="hidden" />
              ))}
              {drag && drag.a !== drag.b ? (
                <ReferenceArea x1={Math.min(drag.a, drag.b)} x2={Math.max(drag.a, drag.b)} fill={CHART.primary} fillOpacity={0.15} stroke={CHART.primary} strokeOpacity={0.6} ifOverflow="hidden" />
              ) : null}
              <Tooltip
                cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as ChartPoint | undefined;
                  if (!p || p.price === null || drag) return null;
                  const label = p.samples > 1 ? `Week of ${formatDate(p.t)} · avg of ${p.samples} days` : formatDate(p.t);
                  return (
                    <ChartTooltip
                      active={active}
                      label={label}
                      rows={[
                        { name: "Price", value: formatMoney(p.price), color: CHART.primary },
                        { name: "Retail", value: formatMoney(p.retail ?? 0), color: CHART.reference, dashed: true },
                        { name: "Discount", value: `${p.discount}%` },
                      ]}
                    />
                  );
                }}
              />
              <Line type="stepAfter" dataKey="retail" name="Retail" stroke={CHART.reference} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="price" name="Price" stroke={CHART.primary} strokeWidth={2} dot={(props: { cx?: number; cy?: number; index?: number; payload?: ChartPoint }) => (
                  props.payload?.isolated ? <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill={CHART.primary} /> : <g key={props.index} />
                )} activeDot={{ r: 4, stroke: "#1d1d1d", strokeWidth: 2 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <ul className="mt-3 flex flex-wrap gap-4 text-xs text-ig-light">
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-4" style={{ background: CHART.primary }} />Price</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="w-4 border-t-2 border-dashed" style={{ borderColor: CHART.reference }} />Retail price</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded-sm bg-ig-red/30" />Out of stock</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3 w-3 rounded-sm bg-ig-red/15" />Partly out of stock</li>
        <li className="ml-auto text-ig-medium-light">{zoom ? "Double-click to reset zoom" : "Drag across the chart to zoom"}</li>
      </ul>
    </>
  );
}
