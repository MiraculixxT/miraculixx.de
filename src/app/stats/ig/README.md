# Instant Gaming Analytics UI

This folder contains a ready-to-run frontend for exploring Instant Gaming snapshots.

## Implemented pages

- `/stats/ig`: Dashboard with filters and Recharts time-series visualizations
- `/stats/ig/games`: Sortable and filterable games table

## Frontend API contract (used by UI)

Base URL: `https://api.miraculixx.de/stats/ig`

### `GET /meta`
Returns shared metadata for filters.

```json
{
  "platforms": ["Steam", "Xbox"],
  "latestSnapshotTs": "2026-04-14T00:00:00.000Z",
  "earliestSnapshotTs": "2025-10-16T00:00:00.000Z"
}
```

### `GET /overview`
Query parameters:

- `from` (`YYYY-MM-DD`)
- `to` (`YYYY-MM-DD`)
- `interval` (`day|week|month`)
- `platform` (`all|...`)
- `includeDlc` (`true|false`, optional)
- `includePreorder` (`true|false`, optional)

Response:

```json
{
  "points": [
    {
      "snapshotTs": "2026-04-14T00:00:00.000Z",
      "gameCount": 3210,
      "avgDiscount": 42.1,
      "minDiscount": 5,
      "maxDiscount": 96,
      "avgAbsDiscount": 13.7,
      "minAbsDiscount": 0.5,
      "maxAbsDiscount": 83.4
    }
  ],
  "query": {}
}
```

### `GET /games`
Query parameters:

- `snapshotTs` (`YYYY-MM-DD`)
- `platform` (`all|...`)
- `search` (string)
- `prepaid`, `isDlc`, `preorder` (`true|false`, optional)
  - `prepaid=true` means prepaid entries including subscriptions (`is_sub` is treated as prepaid)
- `sortBy` (`discount|absDiscount|price|retail|name`)
- `sortDir` (`asc|desc`)
- `page` (1-based)
- `pageSize` (max 200)

Response:

```json
{
  "rows": [],
  "total": 0,
  "page": 1,
  "pageSize": 50,
  "query": {}
}
```



## Efficient backend retrieval strategy

1. Pre-aggregate daily metrics in a materialized table keyed by `(snapshot_date, platform, flags)` for dashboard queries.
2. Store a compact game snapshot table partitioned by `snapshot_ts` and index for filters/sorts:
   - `(snapshot_ts, platform, has_stock)`
   - `(snapshot_ts, discount DESC)`
   - `(snapshot_ts, abs_discount DESC)`
   - `(snapshot_ts, price ASC)`
3. Use keyset pagination for large tables in production (`cursor` over `(sort_field, prod_id)`), even if UI keeps page numbers.
4. Return only fields shown on screen; avoid large text blobs.
5. Cache dashboard query results by normalized query key (`from|to|interval|filters`) with short TTL.
6. Use `ETag`/`If-None-Match` so unchanged snapshots return `304`.

## OpenAPI

See `src/app/stats/ig/openapi.yaml` for a complete schema of query params and response objects.

