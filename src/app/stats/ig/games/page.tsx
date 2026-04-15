"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchGameHistory, fetchGames, fetchMeta } from "@/components/stats/ig/clientApi";
import type {
  GameHistoryResponse,
  GameHistoryPoint,
  GameRow,
  GameSortField,
  GamesResponse,
  MetaResponse,
  SortDirection,
} from "@/components/stats/ig/types";

const SORT_FIELDS: { value: GameSortField; label: string }[] = [
  { value: "discount", label: "Discount %" },
  { value: "absDiscount", label: "Abs discount" },
  { value: "price", label: "Price" },
  { value: "retail", label: "Retail" },
  { value: "name", label: "Name" },
];

function formatMoney(value: number) {
  return `${value.toFixed(2)} €`;
}


export default function InstantGamingGamesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
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
  const [historyPoints, setHistoryPoints] = useState<GameHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const [snapshotTs, setSnapshotTs] = useState(() => searchParams.get("date") ?? "");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [type, setType] = useState(() => searchParams.get("type") ?? "all");
  const [sortBy, setSortBy] = useState<GameSortField>(
    () => (searchParams.get("sortBy") as GameSortField) ?? "discount",
  );
  const [sortDir, setSortDir] = useState<SortDirection>(
    () => (searchParams.get("sortDir") as SortDirection) ?? "desc",
  );
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get("pageSize")) || 50);

  const pendingGameIdRef = useRef<string | null>(searchParams.get("game"));

  useEffect(() => {
    const controller = new AbortController();
    fetchMeta(controller.signal)
      .then((response) => {
        setMeta(response);
        setSnapshotTs((current) => current || response.latestSnapshotTs.slice(0, 10));
      })
      .catch(() => setError("Could not load metadata"));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    const defaultDate = meta?.latestSnapshotTs.slice(0, 10);
    if (snapshotTs && snapshotTs !== defaultDate) params.set("date", snapshotTs);
    if (search) params.set("q", search);
    if (type !== "all") params.set("type", type);
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
  }, [snapshotTs, search, type, sortBy, sortDir, page, pageSize, selectedGame, pathname, router, meta]);

  useEffect(() => {
    const pending = pendingGameIdRef.current;
    if (!pending || !data?.rows?.length) return;
    const match = data.rows.find((row) => String(row.id) === pending);
    if (match) setSelectedGame(match);
    pendingGameIdRef.current = null;
  }, [data]);

  useEffect(() => {
    if (!snapshotTs) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchGames(
      {
        snapshotTs,
        type,
        search,
        sortBy,
        sortDir,
        page,
        pageSize,
      },
      controller.signal,
    )
      .then((response) => setData(response))
      .catch(() => setError("Could not load game data"))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [snapshotTs, type, search, sortBy, sortDir, page, pageSize]);

  const maxPage = useMemo(() => {
    if (!data) {
      return 1;
    }
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  const bannerCandidates = useMemo(() => {
    if (!selectedGame) {
      return [];
    }

    const productId = String(selectedGame.id);
    const seoName = encodeURIComponent(selectedGame.url);

    return [
      `https://gaming-cdn.com/img/products/${productId}/pcover/${productId}.jpg`,
      `https://gaming-cdn.com/images/products/${productId}/616x353/${seoName}-cover.jpg`,
    ];
  }, [selectedGame]);

  useEffect(() => {
    setBannerIndex(0);
  }, [selectedGame]);

  useEffect(() => {
    if (!selectedGame) {
      return;
    }

    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryError(null);

    fetchGameHistory(
      {
        id: selectedGame.id,
        from: meta?.earliestSnapshotTs.slice(0, 10),
        to: meta?.latestSnapshotTs.slice(0, 10),
      },
      controller.signal,
    )
      .then((response: GameHistoryResponse) => setHistoryPoints(response.points))
      .catch(() => {
        setHistoryPoints([]);
        setHistoryError("Could not load game history");
      })
      .finally(() => setHistoryLoading(false));

    return () => controller.abort();
  }, [selectedGame, meta]);

  useEffect(() => {
    if (!selectedGame) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedGame(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedGame]);

  const graphPoints = useMemo(() => {
    if (historyPoints.length > 0) {
      return historyPoints;
    }
    if (!selectedGame) {
      return [];
    }

    return [
      {
        snapshotTs: selectedGame.snapshotTs,
        price: selectedGame.price,
        retail: selectedGame.retail,
        discount: selectedGame.discount,
        absDiscount: selectedGame.absDiscount,
      },
    ];
  }, [historyPoints, selectedGame]);

  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-5">
        <label className="flex flex-col gap-1 text-sm">
          Snapshot date
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 h-10"
            type="date"
            value={snapshotTs}
            onChange={(event) => {
              setSnapshotTs(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Search game
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 h-10"
            type="text"
            value={search}
            placeholder="Minecraft, Ori, ..."
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Type
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-3 h-10"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All types</option>
            {meta?.types.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sort
          <div className="flex gap-2">
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 h-10"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as GameSortField);
                setPage(1);
              }}
            >
              {SORT_FIELDS.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-slate-700 bg-slate-950 px-3 h-10"
              value={sortDir}
              onChange={(event) => {
                setSortDir(event.target.value as SortDirection);
                setPage(1);
              }}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </label>
      </div>

      {error ? <p className="rounded-lg bg-rose-500/10 p-3 text-rose-300">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-800/70 text-slate-300">
              <tr>
                <th className="px-3 py-2">Game List</th>
                <th className="px-3 py-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-t border-slate-800 hover:bg-slate-800/40"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedGame(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedGame(row);
                    }
                  }}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={"https://gaming-cdn.com/images/products/"+ row.id +"/380x218/"+ row.url +"-cover.jpg"}
                        alt={`${row.name} cover`}
                        loading="lazy"
                        className="h-12 w-20 shrink-0 rounded-md border border-slate-800 bg-slate-950 object-cover md:h-16 md:w-28"
                        onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }}
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium leading-snug">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/img/stats/${row.type.replace("|", "")}.svg`}
                            alt={row.type}
                            title={row.type}
                            width={16}
                            height={16}
                            className="h-4 w-4 shrink-0 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          {row.name}
                        </p>
                        <p className="mt-0.5 text-xs">
                          <span className="mr-1 text-slate-400 line-through">{formatMoney(row.retail)}</span>
                          <span className="mr-1 text-slate-500">➜</span>
                          <span className="mr-1 text-amber-300">{formatMoney(row.price)}</span>
                          <span className="text-emerald-400">(-{formatMoney(row.absDiscount)} / {row.discount}%)</span>
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.inStock
                            ? <span className="rounded px-1.5 py-0.5 text-xs bg-emerald-500/15 text-emerald-300">In stock</span>
                            : <span className="rounded px-1.5 py-0.5 text-xs bg-rose-500/15 text-rose-300">Out of stock</span>
                          }
                          {row.topseller && <span className="rounded px-1.5 py-0.5 text-xs bg-yellow-500/15 text-yellow-300">Topseller</span>}
                          {row.preorder && <span className="rounded px-1.5 py-0.5 text-xs bg-blue-500/15 text-blue-300">Preorder</span>}
                          {row.giftcard && <span className="rounded px-1.5 py-0.5 text-xs bg-orange-500/15 text-orange-300">Giftcard</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <a
                      href={"https://www.instant-gaming.com/en/" + row.id + "-buy-" + row.url + "?igr=miraculixx"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${row.name} in a new tab`}
                      className="inline-flex items-center rounded-sm text-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M14 3h7v7" />
                        <path d="M10 14L21 3" />
                        <path d="M21 14v7h-7" />
                        <path d="M3 10v11h11" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm">
        <p>
          Showing page {data?.page ?? 1} / {maxPage} ({data?.total ?? 0} total games)
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            Page size
            <select
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <button
            className="rounded-md border border-slate-700 px-3 py-1 disabled:opacity-40"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <button
            className="rounded-md border border-slate-700 px-3 py-1 disabled:opacity-40"
            disabled={page >= maxPage || loading}
            onClick={() => {setPage((current) => Math.min(maxPage, current + 1)); window.scrollTo(0, 0) }}
          >
            Next
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading games...</p> : null}

      {selectedGame ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedGame(null)}>
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            {bannerCandidates[bannerIndex] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerCandidates[bannerIndex]}
                alt={`${selectedGame.name} artwork`}
                className="h-52 w-full rounded-t-2xl object-cover"
                onError={() => setBannerIndex((current) => current + 1)}
              />
            ) : (
              <div className="flex h-52 w-full items-center justify-center rounded-t-2xl bg-slate-950 text-slate-500">
                No image available
              </div>
            )}

            <div className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedGame.name}</h2>
                  <p className="text-sm text-slate-400">Product ID {selectedGame.id}</p>
                </div>
                <div>
                  <a
                    className="rounded-md border border-slate-700 px-3 py-2.5 text-sm font-semibold text-amber-300 mx-3 hover:bg-slate-800"
                    href={"https://www.instant-gaming.com/en/" + selectedGame.id + "-buy-" + selectedGame.url + "?igr=miraculixx"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${selectedGame.name} on Instant Gaming in a new tab`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    Open on IG
                  </a>
                  <button
                      className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                      onClick={() => setSelectedGame(null)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/img/stats/${selectedGame.type.replace("|", "")}.svg`}
                    alt={selectedGame.type}
                    title={selectedGame.type}
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="font-medium">{selectedGame.type}</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="text-base text-slate-400 line-through">{formatMoney(selectedGame.retail)}</span>
                  <span className="text-slate-500">➜</span>
                  <span className="text-xl font-semibold text-amber-300">{formatMoney(selectedGame.price)}</span>
                  <span className="text-emerald-400">(-{formatMoney(selectedGame.absDiscount)} / {selectedGame.discount}%)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedGame.inStock
                    ? <span className="rounded-md px-2 py-1 bg-emerald-500/15 text-emerald-300">In stock</span>
                    : <span className="rounded-md px-2 py-1 bg-rose-500/15 text-rose-300">Out of stock</span>
                  }
                  {selectedGame.topseller && <span className="rounded-md px-2 py-1 bg-yellow-500/15 text-yellow-300">Topseller</span>}
                  {selectedGame.preorder && <span className="rounded-md px-2 py-1 bg-blue-500/15 text-blue-300">Preorder</span>}
                  {selectedGame.giftcard && <span className="rounded-md px-2 py-1 bg-orange-500/15 text-orange-300">Giftcard</span>}
                  {selectedGame.categories?.map((category) => (
                    <span key={category} className="rounded-md px-2 py-1 bg-indigo-500/15 text-indigo-300">
                      {category}
                    </span>
                  ))}
                </div>
                {selectedGame.description ? (
                  <p className="whitespace-pre-line text-slate-300">{selectedGame.description}</p>
                ) : null}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <h3 className="mb-3 text-lg font-semibold">Price and discount over time</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={graphPoints} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="snapshotTs" tickFormatter={(value) => String(value).slice(0, 10)} stroke="#94a3b8" />
                      <YAxis yAxisId="price" stroke="#94a3b8" />
                      <YAxis yAxisId="discount" orientation="right" stroke="#94a3b8" domain={[0, 100]}/>
                      <Tooltip
                        labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
                        formatter={(value, name) => {
                          const numericValue = Number(value ?? 0);
                          if (name === "Discount") {
                            return `${numericValue.toFixed(2)} %`;
                          }
                          return `${numericValue.toFixed(2)} €`;
                        }}
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
                      />
                      <Legend />
                      <Line yAxisId="price" type="monotone" dataKey="price" name="Price" stroke="#f59e0b" dot={false} />
                      <Line yAxisId="price" type="monotone" dataKey="retail" name="Retail" stroke="#c3b6a1" dot={false} />
                      <Line yAxisId="discount" type="monotone" dataKey="discount" name="Discount" stroke="#34d399" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {historyLoading ? <p className="mt-3 text-sm text-slate-400">Loading game history...</p> : null}
                {historyError ? <p className="mt-3 text-sm text-rose-300">{historyError}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

