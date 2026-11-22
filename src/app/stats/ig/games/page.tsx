"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchGames, fetchMeta } from "@/components/stats/ig/clientApi";
import GamePanel from "@/components/stats/ig/GamePanel";
import type { GameRow, GameSortField, GamesResponse, MetaResponse, SortDirection } from "@/components/stats/ig/types";
import { DiscountBadge, ErrorNote, Field, PlatformIcon, StockDot, Tag, Toggle, coverUrl, formatDate, formatMoney, inputClass, localDay, productLink } from "@/components/stats/ig/ui";

const SORT_FIELDS: { value: GameSortField; label: string }[] = [
  { value: "discount", label: "Discount" },
  { value: "absDiscount", label: "Saving" },
  { value: "price", label: "Price" },
  { value: "retail", label: "Retail price" },
  { value: "name", label: "Name" },
];
const PAGE_SIZES = [25, 50, 100];

export default function InstantGamingGamesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ig-light">Loading...</p>}>
      <InstantGamingGamesPageInner />
    </Suspense>
  );
}

function InstantGamingGamesPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [data, setData] = useState<GamesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameRow | null>(null);

  const [snapshotTs, setSnapshotTs] = useState(() => searchParams.get("date") ?? "");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [type, setType] = useState(() => searchParams.get("type") ?? "all");
  const [inStockOnly, setInStockOnly] = useState(() => searchParams.get("inStock") === "1");
  const [topsellerOnly, setTopsellerOnly] = useState(() => searchParams.get("top") === "1");
  const [preorderOnly, setPreorderOnly] = useState(() => searchParams.get("pre") === "1");
  const [hideGiftcards, setHideGiftcards] = useState(() => searchParams.get("nogift") === "1");
  const [sortBy, setSortBy] = useState<GameSortField>(() => (searchParams.get("sortBy") as GameSortField) ?? "discount");
  const [sortDir, setSortDir] = useState<SortDirection>(() => (searchParams.get("sortDir") as SortDirection) ?? "desc");
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get("pageSize")) || 50);

  const pendingGameIdRef = useRef<string | null>(searchParams.get("game"));

  const update = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchMeta(controller.signal)
      .then((response) => {
        setMeta(response);
        setSnapshotTs((current) => current || localDay(response.latestSnapshotTs));
      })
      .catch(() => setError("Could not load metadata"));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (snapshotTs && snapshotTs !== (meta && localDay(meta.latestSnapshotTs))) params.set("date", snapshotTs);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (type !== "all") params.set("type", type);
    if (inStockOnly) params.set("inStock", "1");
    if (topsellerOnly) params.set("top", "1");
    if (preorderOnly) params.set("pre", "1");
    if (hideGiftcards) params.set("nogift", "1");
    if (sortBy !== "discount") params.set("sortBy", sortBy);
    if (sortDir !== "desc") params.set("sortDir", sortDir);
    if (page !== 1) params.set("page", String(page));
    if (pageSize !== 50) params.set("pageSize", String(pageSize));
    if (selectedGame) params.set("game", String(selectedGame.id));
    else if (pendingGameIdRef.current) params.set("game", pendingGameIdRef.current);

    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      router.replace(next, { scroll: false });
    }
  }, [snapshotTs, debouncedSearch, type, inStockOnly, topsellerOnly, preorderOnly, hideGiftcards, sortBy, sortDir, page, pageSize, selectedGame, pathname, router, meta]);

  useEffect(() => {
    const pending = pendingGameIdRef.current;
    if (!pending || !data?.rows?.length) return;
    const match = data.rows.find((row) => String(row.id) === pending);
    if (match) setSelectedGame(match);
    pendingGameIdRef.current = null;
  }, [data]);

  useEffect(() => {
    if (!snapshotTs) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchGames(
      {
        snapshotTs,
        type,
        search: debouncedSearch,
        inStock: inStockOnly ? true : undefined,
        topseller: topsellerOnly ? true : undefined,
        preorder: preorderOnly ? true : undefined,
        giftcard: hideGiftcards ? false : undefined,
        sortBy,
        sortDir,
        page,
        pageSize,
      },
      controller.signal,
    )
      .then(setData)
      .catch(() => !controller.signal.aborted && setError("Could not load game data"))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [snapshotTs, type, debouncedSearch, inStockOnly, topsellerOnly, preorderOnly, hideGiftcards, sortBy, sortDir, page, pageSize]);

  const maxPage = useMemo(() => (data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1), [data]);
  const closePanel = useCallback(() => setSelectedGame(null), []);
  const goTo = (target: number) => {
    setPage(Math.min(maxPage, Math.max(1, target)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold">Games</h1>
        <p className="mt-1 text-ig-light">Every tracked product with its price on the selected day. Click a game for price and stock history.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-ig bg-ig-very-dark p-5 lg:sticky lg:top-24">
          <Field label="Search">
            <input className={inputClass} type="search" value={search} placeholder="Minecraft, Ori, …" onChange={(e) => update(setSearch)(e.target.value)} />
          </Field>
          <Field label="Snapshot date">
            <input
              className={`${inputClass} ig-date`}
              type="date"
              value={snapshotTs}
              min={meta ? localDay(meta.earliestSnapshotTs) : undefined}
              max={meta ? localDay(meta.latestSnapshotTs) : undefined}
              onChange={(e) => update(setSnapshotTs)(e.target.value)}
            />
          </Field>
          <Field label="Platform">
            <select className={inputClass} value={type} onChange={(e) => update(setType)(e.target.value)}>
              <option value="all">All platforms</option>
              {meta?.types.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </Field>
          <div className="border-t border-white/10 pt-3">
            <Toggle label="In stock only" checked={inStockOnly} onChange={update(setInStockOnly)} />
            <Toggle label="Topsellers only" checked={topsellerOnly} onChange={update(setTopsellerOnly)} />
            <Toggle label="Pre-orders only" checked={preorderOnly} onChange={update(setPreorderOnly)} />
            <Toggle label="Hide gift cards" checked={hideGiftcards} onChange={update(setHideGiftcards)} />
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-ig-light">
              <span className="font-bold text-white">{data?.total.toLocaleString("en-GB") ?? "–"}</span> results
              {loading ? <span className="ml-2 text-ig-medium-light">· updating…</span> : null}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="ig-sort" className="whitespace-nowrap text-sm text-ig-light">Sort by</label>
              <select id="ig-sort" className={`${inputClass} w-40`} value={sortBy} onChange={(e) => update(setSortBy)(e.target.value as GameSortField)}>
                {SORT_FIELDS.map((field) => <option key={field.value} value={field.value}>{field.label}</option>)}
              </select>
              <button
                type="button"
                aria-label={sortDir === "desc" ? "Sorted descending, switch to ascending" : "Sorted ascending, switch to descending"}
                onClick={() => update(setSortDir)(sortDir === "desc" ? "asc" : "desc")}
                className="flex h-11 w-11 items-center justify-center rounded-ig-sm bg-ig-medium-dark text-lg font-bold transition hover:bg-ig-medium"
              >
                {sortDir === "desc" ? "↓" : "↑"}
              </button>
            </div>
          </div>

          {error ? <ErrorNote>{error}</ErrorNote> : null}

          <ul className={`rounded-ig bg-ig-very-dark px-2 transition-opacity sm:px-4 ${loading ? "opacity-60" : ""}`}>
            {data?.rows.map((row) => <GameListItem key={row.id} row={row} onSelect={setSelectedGame} />)}
            {data && data.rows.length === 0 ? <li className="py-12 text-center text-ig-light">No games match these filters.</li> : null}
          </ul>

          <Pagination page={data?.page ?? page} maxPage={maxPage} loading={loading} onPage={goTo} pageSize={pageSize} onPageSize={update(setPageSize)} />
        </section>
      </div>

      {selectedGame ? <GamePanel game={selectedGame} onClose={closePanel} /> : null}
    </>
  );
}

function GameListItem({ row, onSelect }: { row: GameRow; onSelect: (row: GameRow) => void }) {
  return (
    <li className="border-b border-white/10 last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(row)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(row);
          }
        }}
        className="group flex cursor-pointer items-center gap-3 rounded-ig-sm py-3 outline-none focus-visible:ring-2 focus-visible:ring-ig-orange sm:gap-4"
      >
        <div className="relative w-28 shrink-0 sm:w-40">
          <div className="aspect-[16/9.2] overflow-hidden rounded-ig-sm bg-ig-ultra-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl(row.id, row.url)}
              alt=""
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${row.inStock ? "" : "opacity-50 grayscale"}`}
              onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }}
            />
          </div>
          <span className="absolute left-1.5 top-1.5 rounded bg-ig-ultra-dark/80 p-0.5"><PlatformIcon type={row.type} size={14} /></span>
          <DiscountBadge value={row.discount} className="absolute -bottom-0.5 -left-0.5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 font-bold leading-snug text-white transition-colors group-hover:text-ig-hover">{row.name}</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ig-light">
            <span className="flex items-center gap-1.5">
              <StockDot inStock={row.inStock} />
              {row.inStock ? "In stock" : <>Out of stock · last seen {formatDate(row.snapshotTs)}</>}
            </span>
            <span className="text-ig-medium-light">·</span>
            <span>{row.type}</span>
            {row.categories.length > 0 ? <span className="hidden text-ig-medium-light md:inline">· {row.categories.slice(0, 3).join(", ")}</span> : null}
          </p>
          {row.topseller || row.preorder || row.giftcard ? (
            <div className="flex flex-wrap gap-1">
              {row.topseller ? <Tag tone="orange">Topseller</Tag> : null}
              {row.preorder ? <Tag tone="orange">Pre-order</Tag> : null}
              {row.giftcard ? <Tag tone="orange">Gift card</Tag> : null}
            </div>
          ) : null}
          {row.description ? <p className="hidden truncate text-xs text-ig-medium-light xl:block">{row.description}</p> : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          {row.retail > row.price ? <span className="text-xs text-ig-medium-light line-through">{formatMoney(row.retail)}</span> : null}
          <span className="text-lg font-bold sm:text-[21px] sm:leading-[26px]">{formatMoney(row.price)}</span>
          {row.absDiscount > 0 ? <span className="text-xs text-ig-light">save {formatMoney(row.absDiscount)}</span> : null}
        </div>

        <a
          href={productLink(row.id, row.url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${row.name} on Instant Gaming`}
          onClick={(event) => event.stopPropagation()}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ig-medium-dark text-ig-very-light transition hover:bg-fire hover:text-white sm:flex"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M14 4h6v6" />
            <path d="M10 14 20 4" />
            <path d="M20 14v6H4V4h6" />
          </svg>
        </a>
      </div>
    </li>
  );
}

function Pagination({ page, maxPage, loading, onPage, pageSize, onPageSize }: {
  page: number;
  maxPage: number;
  loading: boolean;
  onPage: (page: number) => void;
  pageSize: number;
  onPageSize: (size: number) => void;
}) {
  const start = Math.max(1, Math.min(page - 2, maxPage - 4));
  const pages = Array.from({ length: Math.min(5, maxPage) }, (_, i) => start + i);
  const buttonClass = "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <button type="button" className={`${buttonClass} bg-ig-medium-dark hover:bg-ig-medium`} disabled={page <= 1 || loading} onClick={() => onPage(page - 1)} aria-label="Previous page">‹</button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            disabled={loading}
            onClick={() => onPage(p)}
            className={`${buttonClass} ${p === page ? "bg-fire" : "text-ig-very-light hover:bg-ig-medium-dark"}`}
          >
            {p}
          </button>
        ))}
        <button type="button" className={`${buttonClass} bg-ig-medium-dark hover:bg-ig-medium`} disabled={page >= maxPage || loading} onClick={() => onPage(page + 1)} aria-label="Next page">›</button>
        <span className="ml-2 text-sm text-ig-medium-light">of {maxPage}</span>
      </div>
      <label className="flex items-center gap-2 whitespace-nowrap text-sm text-ig-light">
        Per page
        <select className={`${inputClass} h-10 w-20`} value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
          {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
    </nav>
  );
}
