"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchGiveaways } from "@/components/stats/ig/clientApi";
import type { Giveaway, GiveawaysResponse } from "@/components/stats/ig/types";
import { ErrorNote, Panel, Tag, coverUrl, giveawayLink, inputClass, productLink } from "@/components/stats/ig/ui";

function formatDraw(value: string) {
  return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function timeUntil(value: string, now: number) {
  const minutes = Math.floor((new Date(value).getTime() - now) / 60_000);
  if (minutes <= 0) return "draw pending";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return days > 0 ? `in ${days}d ${hours}h` : `in ${hours}h ${minutes % 60}m`;
}

function slugTitle(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default function InstantGamingGiveawaysPage() {
  const [data, setData] = useState<GiveawaysResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();
    fetchGiveaways(controller.signal)
      .then(setData)
      .catch(() => !controller.signal.aborted && setError("Could not load giveaways"));
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const [official, creators] = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = (data?.giveaways ?? []).filter((g) => !term || g.name.toLowerCase().includes(term) || g.code.toLowerCase().includes(term));
    return [rows.filter((g) => g.official), rows.filter((g) => !g.official)];
  }, [data, search]);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Giveaways</h1>
          <p className="mt-1 text-ig-light">All active Instant Gaming giveaways with their next draw and latest winner.</p>
        </div>
        <input className={`${inputClass} sm:w-72`} type="search" value={search} placeholder="Search creator or code" onChange={(e) => setSearch(e.target.value)} />
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-ig bg-[#5865f2]/15 px-4 py-3 text-sm">
        <p className="flex-1 text-ig-very-light">
          <span className="font-bold text-white">More giveaways on Discord:</span> the official Instant Gaming Discord server hosts its own giveaways every two weeks.
        </p>
        <a
          href="https://www.instant-gaming.com/en/discord?igr=miraculixx"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-[#5865f2] px-4 py-2 font-bold text-white transition hover:bg-[#4752c4]"
        >
          Join Discord
        </a>
      </div>

      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {!data && !error ? <p className="text-sm text-ig-light">Loading giveaways… the first load can take a minute.</p> : null}

      {data ? (
        <>
          <GiveawaySection title="Instant Gaming" rows={official} now={now} />
          <GiveawaySection title="Creators" rows={creators} now={now} />
          <p className="text-xs text-ig-medium-light">Updated {formatDraw(data.updatedAt)}</p>
        </>
      ) : null}
    </>
  );
}

function GiveawaySection({ title, rows, now }: { title: string; rows: Giveaway[]; now: number }) {
  return (
    <Panel title={<>{title} <span className="ml-1 text-ig-medium-light">{rows.length}</span></>}>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-ig-light">No giveaways found.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((g) => <GiveawayCard key={g.code} giveaway={g} now={now} />)}
        </ul>
      )}
    </Panel>
  );
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span aria-hidden style={{ width: size, height: size, fontSize: size / 2.4 }} className="flex shrink-0 items-center justify-center rounded-full bg-ig-medium font-bold text-white">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} loading="lazy" onError={() => setFailed(true)} className="shrink-0 rounded-full bg-ig-ultra-dark object-cover" style={{ width: size, height: size }} />;
}

function GiveawayCard({ giveaway: g, now }: { giveaway: Giveaway; now: number }) {
  const winner = g.lastWinner;
  return (
    <li className="flex flex-col gap-3 rounded-ig-sm bg-ig-medium-dark/60 p-4">
      <div className="flex items-center gap-3">
        <Avatar src={g.avatarUrl} name={g.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white" title={g.name}>{g.name}</p>
          <p className="truncate text-xs text-ig-medium-light">{g.code}</p>
        </div>
        <a
          href={giveawayLink(g.code)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-fire px-4 py-2 text-sm font-bold text-white transition hover:bg-fire-hover"
        >
          Join
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ig-light">Next draw</span>
        <span className="font-bold text-white">{formatDraw(g.endDate)}</span>
        <Tag tone="orange">{timeUntil(g.endDate, now)}</Tag>
        {g.recurrence ? <Tag className="first-letter:uppercase">{g.recurrence}</Tag> : null}
      </div>

      {winner ? (
        <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-sm">
          <span className="shrink-0 text-ig-light">Last winner</span>
          <a href={winner.profileUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex min-w-0 items-center gap-1.5 font-bold text-white hover:text-ig-hover">
            <Avatar src={winner.avatarUrl} name={winner.nickname} size={20} />
            <span className="truncate">{winner.nickname}</span>
          </a>
          {winner.product ? (
            <a
              href={productLink(winner.product.id, winner.product.slug)}
              target="_blank"
              rel="noopener noreferrer"
              title={slugTitle(winner.product.slug)}
              className="ml-auto shrink-0 overflow-hidden rounded bg-ig-ultra-dark"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl(winner.product.id, winner.product.slug)}
                alt={slugTitle(winner.product.slug)}
                loading="lazy"
                className="h-7 w-12 object-cover transition hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }}
              />
            </a>
          ) : null}
        </div>
      ) : (
        <p className="border-t border-white/10 pt-3 text-sm text-ig-medium-light">No winner yet</p>
      )}
    </li>
  );
}
