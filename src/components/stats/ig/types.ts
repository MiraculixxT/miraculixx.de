export type Interval = "day" | "week" | "month";

export type SortDirection = "asc" | "desc";

export type GameSortField = "discount" | "absDiscount" | "price" | "retail" | "name";

export interface OverviewPoint {
  snapshotTs: string;
  gameCount: number;
  avgDiscount: number;
  minDiscount: number;
  maxDiscount: number;
  avgAbsDiscount: number;
  minAbsDiscount: number;
  maxAbsDiscount: number;
}

export interface MetaResponse {
  types: string[];
  latestSnapshotTs: string;
  earliestSnapshotTs: string;
  supportedIntervals?: Interval[];
}

export interface OverviewQuery {
  from: string;
  to: string;
  interval: Interval;
  type?: string;
  onlyTopseller?: boolean;
  includePreorder?: boolean;
  includeGiftcard?: boolean;
}

export interface OverviewResponse {
  points: OverviewPoint[];
  query: OverviewQuery;
}

export interface GameRow {
  snapshotTs: string;
  id: number;
  name: string;
  type: string;
  url: string;
  categories: string[];
  description?: string | null;
  topseller: boolean;
  preorder: boolean;
  giftcard: boolean;
  inStock: boolean;
  steamId?: number | null;
  retail: number;
  price: number;
  discount: number;
  absDiscount: number;
}

export interface GamesQuery {
  snapshotTs?: string;
  type?: string;
  search?: string;
  preorder?: boolean;
  giftcard?: boolean;
  topseller?: boolean;
  inStock?: boolean;
  sortBy?: GameSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface GamesResponse {
  rows: GameRow[];
  total: number;
  page: number;
  pageSize: number;
  query: GamesQuery;
}

export interface GameHistoryQuery {
  id: number;
  from?: string;
  to?: string;
}

export interface GameHistoryPoint {
  snapshotTs: string;
  price: number;
  retail: number;
  discount: number;
  absDiscount: number;
}

export interface GameHistoryResponse {
  id: number;
  name: string;
  type: string;
  url: string;
  points: GameHistoryPoint[];
}
