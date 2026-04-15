import type {
  GameHistoryQuery,
  GameHistoryResponse,
  GamesQuery,
  GamesResponse,
  MetaResponse,
  OverviewQuery,
  OverviewResponse,
} from "./types";

const DEFAULT_STATS_API_BASE = "https://api.miraculixx.de/stats/ig";
const STATS_API_BASE = process.env.NEXT_PUBLIC_IG_STATS_API_BASE ?? DEFAULT_STATS_API_BASE;

function withSearchParams(path: string, params: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, STATS_API_BASE.endsWith("/") ? STATS_API_BASE : `${STATS_API_BASE}/`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return `${url.toString()}`;
}

export async function fetchMeta(signal?: AbortSignal): Promise<MetaResponse> {
  const response = await fetch(withSearchParams("meta", {}), { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch meta (${response.status})`);
  }
  return response.json();
}

export async function fetchOverview(query: OverviewQuery, signal?: AbortSignal): Promise<OverviewResponse> {
  const path = withSearchParams("overview", {
    from: query.from,
    to: query.to,
    interval: query.interval,
    type: query.type,
    onlyTopseller: query.onlyTopseller,
    includePreorder: query.includePreorder,
    includeGiftcard: query.includeGiftcard,
  });

  const response = await fetch(path, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch overview (${response.status})`);
  }
  return response.json();
}

export async function fetchGames(query: GamesQuery, signal?: AbortSignal): Promise<GamesResponse> {
  const path = withSearchParams("games", {
    snapshotTs: query.snapshotTs,
    type: query.type,
    search: query.search,
    preorder: query.preorder,
    giftcard: query.giftcard,
    topseller: query.topseller,
    inStock: query.inStock,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    page: query.page,
    pageSize: query.pageSize,
  });

  const response = await fetch(path, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch games (${response.status})`);
  }
  return response.json();
}

export async function fetchGameHistory(query: GameHistoryQuery, signal?: AbortSignal): Promise<GameHistoryResponse> {
  const path = withSearchParams("games/history", {
    id: query.id,
    from: query.from,
    to: query.to,
  });

  const response = await fetch(path, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch game history (${response.status})`);
  }
  return response.json();
}
