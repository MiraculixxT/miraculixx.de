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
  platforms: string[];
  latestSnapshotTs: string;
  earliestSnapshotTs: string;
}

export interface OverviewQuery {
  from: string;
  to: string;
  interval: Interval;
  platform?: string;
  includeDlc?: boolean;
  includePreorder?: boolean;
}

export interface OverviewResponse {
  points: OverviewPoint[];
  query: OverviewQuery;
}

export interface GameRow {
  snapshotTs: string;
  prodId: number;
  name: string;
  platform: string;
  seoName: string;
  isSub: boolean;
  isPrepaid: boolean;
  isDlc: boolean;
  preorder: boolean;
  hasStock: boolean;
  retail: number;
  price: number;
  discount: number;
  absDiscount: number;
}

export interface GamesQuery {
  snapshotTs?: string;
  platform?: string;
  search?: string;
  prepaid?: boolean;
  isDlc?: boolean;
  preorder?: boolean;
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
  prodId: number;
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
  prodId: number;
  seoName: string;
  name: string;
  points: GameHistoryPoint[];
}

