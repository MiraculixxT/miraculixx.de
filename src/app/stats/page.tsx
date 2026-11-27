import Link from "next/link";
import type {CSSProperties} from "react";
import SiteShell from "@/components/site/SiteShell";
import Display from "@/components/site/Display";

const tools = [
    {href: "/stats/ig", title: "Instant Gaming dashboard", text: "Game count, discount percentages and absolute discount trends over time.", color: "#ff2bd6"},
    {href: "/stats/ig/games", title: "Instant Gaming games", text: "Filter and sort every game by discount, absolute discount and price, with full history.", color: "#00fff0"},
    {href: "/stats/ig/giveaways", title: "Instant Gaming giveaways", text: "Current giveaways with codes that resolve on their own.", color: "#c6ff00"},
];

export default function StatisticsHome() {
    return (
        <SiteShell>
            <div className="py-12">
                <Display id="stats" index="02" title="STATS & TOOLS" led="#00fff0">
                    <div className="neon-grid p-5 text-[#d7f9ff] sm:p-7">
                        <h1 className="neon-c font-silk text-3xl tracking-wider">{"// STATS"}</h1>
                        <p className="text-[#7aa7b8]">Data analysis playground – pick a tool.</p>
                        <div className="mt-6 grid gap-5 md:grid-cols-3">
                            {tools.map(t => (
                                <Link key={t.href} href={t.href} className="neon-box block p-5 transition hover:bg-white/5" style={{"--n": t.color} as CSSProperties}>
                                    <h2 className="font-silk text-lg" style={{color: t.color, textShadow: `0 0 8px ${t.color}`}}>{t.title}</h2>
                                    <p className="mt-2 text-[#b8d4e0]">{t.text}</p>
                                    <span className="mt-4 inline-block font-silk text-xs" style={{color: t.color}}>OPEN →</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Display>
            </div>
        </SiteShell>
    );
}
