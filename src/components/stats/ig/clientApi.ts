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
    platform: query.platform,
    includeDlc: query.includeDlc,
    includePreorder: query.includePreorder,
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
    platform: query.platform,
    search: query.search,
    prepaid: query.prepaid,
    isDlc: query.isDlc,
    preorder: query.preorder,
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
    prodId: query.prodId,
    from: query.from,
    to: query.to,
  });

  const response = await fetch(path, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch game history (${response.status})`);
  }
  return response.json();
}

