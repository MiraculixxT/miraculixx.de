import { NextResponse } from "next/server";
import codes from "./codes.json";
import type { Giveaway, GiveawayWinner, GiveawaysResponse } from "@/components/stats/ig/types";

export const dynamic = "force-dynamic";

const TTL_MS = 3 * 60 * 60 * 1000;
const DRAW_RETRY_MS = 10 * 60 * 1000;
const CONCURRENCY = 8;
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

let cache: GiveawaysResponse | null = null;
let pending: Promise<GiveawaysResponse> | null = null;

function decodeEntities(value: string) {
  let out = value;
  while (out.includes("&amp;")) out = out.replaceAll("&amp;", "&");
  return out
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function extractJson<T>(html: string, marker: string): T | null {
  const start = html.indexOf(marker);
  if (start < 0) return null;
  const open = start + marker.length;
  let depth = 0;
  let inString = false;
  for (let i = open; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") {
      if (--depth === 0) {
        try { return JSON.parse(html.slice(open, i + 1)) as T; } catch { return null; }
      }
    }
  }
  return null;
}

function avatar(url?: string | null) {
  return url && !url.includes("avatar2.svg") ? url : null;
}

type RawWinner = { nickname: string; profile_url: string; avatar_url?: string; product?: { product_id: number; url: string } };

function parseWinner(raw?: RawWinner): GiveawayWinner | null {
  if (!raw) return null;
  const match = raw.product?.url.match(/\/(\d+)-buy-([^/?]+)/);
  return {
    nickname: decodeEntities(raw.nickname),
    profileUrl: raw.profile_url,
    avatarUrl: avatar(raw.avatar_url),
    product: match ? { id: Number(match[1]), slug: match[2] } : null,
  };
}

async function scrape(code: string): Promise<Giveaway | null> {
  const response = await fetch(`https://www.instant-gaming.com/en/giveaway/${encodeURIComponent(code)}`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) return null;
  const html = await response.text();

  const countdown = html.indexOf('id="giveaway-countdown"');
  const end = html.slice(countdown, countdown + 500).match(/data-end-date="(\d+)"/);
  if (countdown < 0 || !end) return null;

  const partner = extractJson<{ nickname: string; avatar_url?: string }>(html, "window.partner = ");
  const winners = extractJson<RawWinner[]>(html, "winners: ") ?? [];
  const readable = html.slice(countdown, countdown + 3000).match(/<span class="readable">\s*([^<]*?)\s*<\/span>/);

  return {
    code,
    name: decodeEntities(partner?.nickname ?? code),
    avatarUrl: avatar(partner?.avatar_url),
    endDate: new Date(Number(end[1]) * 1000).toISOString(),
    recurrence: readable ? readable[1].replace(/^A new winner\s*/i, "").replace(/!$/, "") : null,
    official: code.toUpperCase().startsWith("INSTANTGAMING"),
    lastWinner: parseWinner(winners[0]),
  };
}

async function load(): Promise<GiveawaysResponse> {
  const queue = [...codes];
  const giveaways: Giveaway[] = [];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    for (let code = queue.shift(); code; code = queue.shift()) {
      const entry = await scrape(code).catch(() => null);
      if (entry) giveaways.push(entry);
    }
  }));
  giveaways.sort((a, b) => a.endDate.localeCompare(b.endDate) || a.name.localeCompare(b.name));
  return { updatedAt: new Date().toISOString(), giveaways };
}

function refresh() {
  pending ??= load()
    .then((data) => (cache = data))
    .finally(() => { pending = null; });
  return pending;
}

export async function GET() {
  if (!cache) await refresh();
  else {
    const age = Date.now() - new Date(cache.updatedAt).getTime();
    const drawPassed = cache.giveaways.some((g) => new Date(g.endDate).getTime() <= Date.now());
    if (age > TTL_MS || (drawPassed && age > DRAW_RETRY_MS)) refresh().catch(() => {});
  }
  return NextResponse.json(cache, { headers: { "Cache-Control": "public, max-age=300" } });
}
