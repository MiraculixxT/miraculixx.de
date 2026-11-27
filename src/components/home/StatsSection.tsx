import Link from "next/link";
import type {CSSProperties} from "react";
import Display from "@/components/site/Display";
import type {MetaResponse, OverviewResponse} from "@/components/stats/ig/types";

const BASE = process.env.NEXT_PUBLIC_IG_STATS_API_BASE ?? "https://api.miraculixx.de/stats/ig";

async function get<T>(path: string): Promise<T | null> {
    try {
        const res = await fetch(`${BASE}/${path}`, {next: {revalidate: 3600}});
        return res.ok ? await res.json() : null;
    } catch {
        return null;
    }
}

function line(values: number[]) {
    const min = Math.min(...values), span = Math.max(...values) - min || 1;
    return values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 600},${100 - ((v - min) / span) * 84 - 8}`).join(" ");
}

function Kpi({label, value, color}: { label: string; value: string; color: string }) {
    return (
        <div className="neon-box px-4 py-2.5 font-silk text-xs" style={{"--n": color, color} as CSSProperties}>
            {label}<b className="block text-2xl text-white" style={{textShadow: `0 0 8px ${color}`}}>{value}</b>
        </div>
    );
}

function load() {
    const day = (d: number) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
    return Promise.all([
        get<MetaResponse>("meta"),
        get<OverviewResponse>(`overview?interval=day&from=${day(-30)}&to=${day(1)}`),
    ]);
}

export default async function StatsSection() {
    const [meta, overview] = await load();
    const points = overview?.points ?? [];
    const latest = points.at(-1);
    const since = meta ? new Date(meta.earliestSnapshotTs) : null;

    return (
        <Display id="stats" index="02" title="STATS & TOOLS" led="#00fff0" meta="1 LIVE">
            <div className="neon-grid p-5 text-[#d7f9ff] sm:p-7">
                <h2 className="neon-c font-silk text-3xl tracking-wider">{"// STATS"}</h2>
                <p className="text-[#7aa7b8]">Small data tools – scraping and tracking things i probably shouldnt (numbers are awesome)</p>
                <div className="mt-5 grid gap-5 md:grid-cols-[1fr_280px]">
                    <Link href="/stats/ig" className="neon-box group flex flex-col px-5 py-4 transition hover:bg-[#ff2bd60d]" style={{"--n": "#ff2bd6"} as CSSProperties}>
                        <h3 className="neon-m relative z-10 font-silk text-xl">INSTANT GAMING STATS</h3>
                        <p className="relative z-10 mt-1 text-[#b8d4e0]">Daily price & discount history of every game on Instant Gaming, plus giveaways and shop downtime.</p>
                        {points.length > 1 && (
                            <div className="relative -mt-5 min-h-28 flex-1 border-b-2 border-[#1f3b47] md:min-h-20">
                                <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-label="Average discount, last 30 days">
                                    <polyline fill="none" stroke="#00fff0" strokeWidth={2} strokeDasharray="6 6" vectorEffect="non-scaling-stroke" points={line(points.map(p => p.gameCount))}/>
                                    <polyline fill="none" stroke="#ff2bd6" strokeWidth={3} vectorEffect="non-scaling-stroke" points={line(points.map(p => p.avgDiscount))} style={{filter: "drop-shadow(0 0 4px #ff2bd6)"}}/>
                                </svg>
                            </div>
                        )}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-silk text-[11px] text-[#4e7585]">
                            <span><span className="text-[#ff2bd6]">━</span> avg discount · <span className="text-[#00fff0]">╍</span> games in stock · 30 days</span>
                            <span className="bg-[#00fff0] px-4 py-2 text-sm text-[#05060d] shadow-[0_0_12px_#00fff0] [text-shadow:1px_0_0_currentColor] group-hover:bg-white">OPEN /STATS/IG →</span>
                        </div>
                    </Link>
                    <div className="grid gap-3">
                        <Kpi label="GAMES IN STOCK" value={latest ? latest.gameCount.toLocaleString("en") : "—"} color="#00fff0"/>
                        <Kpi label="AVG DISCOUNT" value={latest ? `-${Math.round(latest.avgDiscount)}%` : "—"} color="#ff2bd6"/>
                        <Kpi label="TRACKED SINCE" value={since ? since.toLocaleDateString("en", {month: "short", year: "numeric"}) : "—"} color="#c6ff00"/>
                    </div>
                </div>
                <div className="mt-5 border-2 border-dashed border-[#24414d] px-4 py-3 font-silk text-xs text-[#4e7585]">+ maybe more soon, maybe not…</div>
            </div>
        </Display>
    );
}
