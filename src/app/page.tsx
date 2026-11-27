import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import PixelSprite from "@/components/site/PixelSprite";
import {HERO} from "@/components/site/sprites";
import {currentWork} from "@/components/home/data";
import MinecraftSection from "@/components/home/MinecraftSection";
import StatsSection from "@/components/home/StatsSection";
import BotsSection from "@/components/home/BotsSection";

export const revalidate = 600;

export default function Home() {
    return (
        <SiteShell>
            <section className="flex flex-col items-center gap-8 py-14 text-center sm:flex-row sm:text-left">
                <PixelSprite sprite={HERO} scale={9} className="shrink-0"/>
                <div>
                    <h1 className="px-shadow font-pixel text-3xl leading-tight text-white sm:text-5xl">HEY, I&apos;M JULIUS</h1>
                    <p className="mt-5 font-silk text-base text-site-soft">aka Miraculixx</p>
                    <p className="mt-3 max-w-2xl text-xl text-[#cfc8f5]">
                        I love building Minecraft projects, small data tools or Discord bots, stuff thats fun. Below you find what I&apos;m working on right now and public projects some people might like.
                    </p>
                </div>
            </section>

            <section className="notch mb-10 bg-[#0f1f17] px-5 py-4 ![--notch:#2f8f5b]">
                <h2 className="mb-4 font-pixel text-xs text-site-muted"><span className="text-[#2f8f5b]">◆</span> <span className="text-white">CURRENTLY WORKING ON</span></h2>
                {currentWork.map(w => (
                    <article key={w.title} className="grid gap-5 border-t-[3px] border-dashed border-[#24543b] pt-4 first-of-type:border-t-0 first-of-type:pt-0 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                        {w.youtube && (
                            <div className="notch aspect-video bg-[#071a10] ![--notch:#2f8f5b]">
                                <iframe src={`https://www.youtube-nocookie.com/embed/${w.youtube}`} title={`${w.title} trailer`} loading="lazy" className="h-full w-full"
                                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
                            </div>
                        )}
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-[#55ff88] px-2 py-1 font-pixel text-[9px] text-site-bg">{w.tag}</span>
                                {w.href ? <Link href={w.href} className="font-pixel text-lg text-white hover:text-[#55ff88]">{w.title}</Link> : <h3 className="font-pixel text-lg text-white">{w.title}</h3>}
                            </div>
                            <p className="mt-2 text-[#8dffb0]">{w.tagline}</p>
                            {w.text.map(t => <p key={t} className="mt-2 text-[17px] text-[#d2eadb]">{t}</p>)}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {w.facts.map(f => <span key={f} className="bg-[#173526] px-2 py-1 font-silk text-[11px] text-[#a8f0c4]">{f}</span>)}
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            <MinecraftSection/>
            <StatsSection/>
            <BotsSection/>
        </SiteShell>
    );
}
