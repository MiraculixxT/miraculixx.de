import Image from "next/image";
import Display from "@/components/site/Display";
import {curseforgeSlugs, featured} from "./data";
import {fetchMinecraft, formatCount, mergeProjects, type Project} from "./minecraft";

const tag = "inline-block px-2 py-0.5 font-silk text-[11px] text-[#1a1028]";

function Platforms({p}: { p: Project }) {
    return (
        <>
            {p.modrinth && <a href={p.modrinth.url} target="_blank" rel="noopener noreferrer" className={`${tag} bg-[#1bd96a] hover:brightness-110`}>Modrinth ↗</a>}
            {p.curseforge && <a href={p.curseforge.url} target="_blank" rel="noopener noreferrer" className={`${tag} bg-[#f16436] hover:brightness-110`}>CurseForge ↗</a>}
        </>
    );
}

export default async function MinecraftSection() {
    const data = await fetchMinecraft();
    const projects = mergeProjects(data, curseforgeSlugs);
    const featuredSlugs = new Set(featured.map(f => f.modrinth));
    const rest = projects.filter(p => !p.modrinth || !featuredSlugs.has(p.modrinth.slug));

    return (
        <Display id="minecraft" index="01" title="MINECRAFT" led="#55ff55" meta={projects.length ? `${projects.length} PROJECTS` : undefined}>
            <div className="mc-sky relative">
                <div className="mc-strip"/>
                <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
                    <h2 className="flex items-center gap-3 font-mc text-3xl text-white mc-text sm:text-4xl">
                        <Image unoptimized src="/img/mc/diamond_pickaxe.png" alt="" width={40} height={40} className="px"/>Minecraft
                    </h2>
                    <div className="notch mc-card px-4 py-3">
                        <span className="font-silk text-xs text-[#ffff55]">TOTAL DOWNLOADS</span>
                        <b className="block font-mc text-3xl text-white mc-text">{formatCount(data?.downloads)}</b>
                        <span className="flex flex-wrap gap-x-3 text-sm text-[#a8a8a8]">
                            {projects.length || "—"} projects
                            {data?.modrinth && <a href={data.modrinth.url} target="_blank" rel="noopener noreferrer" className="text-[#1bd96a] hover:brightness-125">Modrinth ↗</a>}
                            {data?.curseforge && <a href={data.curseforge.url} target="_blank" rel="noopener noreferrer" className="text-[#f16436] hover:brightness-125">CurseForge ↗</a>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mc-body flex flex-col gap-4 px-4 pb-2 pt-4 sm:px-6">
                {featured.map(f => {
                    const p = projects.find(x => x.modrinth?.slug === f.modrinth);
                    return (
                        <article key={f.modrinth} className="notch mc-card flex flex-col sm:flex-row">
                            <div className="flex h-32 shrink-0 items-center justify-center border-b-4 border-[#050308] sm:h-auto sm:w-40 sm:border-b-0 sm:border-r-4" style={{background: f.sceneBg}}>
                                <Image unoptimized src={p?.icon ?? "/img/mc/diamond_pickaxe.png"} alt="" width={96} height={96} className="px drop-shadow-[4px_4px_0_rgba(0,0,0,.5)]"/>
                            </div>
                            <div className="flex-1 p-4">
                                <h3 className="font-mc text-xl mc-text" style={{color: f.color}}>
                                    {p?.modrinth ? <a href={p.modrinth.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{f.title}</a> : f.title}
                                </h3>
                                <p className="mt-2 line-clamp-2 text-[17px] text-[#d0d0d0]" title={p?.summary}>{p?.summary ?? "Loading project info failed – check the links below."}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {f.extra && <a href={f.extra.href} target="_blank" rel="noopener noreferrer" className={tag} style={{background: f.color}}>{f.extra.label} ↗</a>}
                                    {p && <Platforms p={p}/>}
                                    {p?.modrinth?.loaders.slice(0, 4).map(l => <span key={l} className={`${tag} bg-[#c4b5fd]`}>{l}</span>)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-1 border-t-4 border-[#050308] p-4 font-silk text-xs sm:flex-col sm:items-end sm:justify-center sm:border-t-0" style={{color: f.color}}>
                                DOWNLOADS<b className="font-mc text-xl text-white mc-text">{formatCount(p?.downloads)}</b>
                            </div>
                        </article>
                    );
                })}

                {rest.length > 0 && (
                    <details className="notch mc-card group">
                        <summary className="cursor-pointer list-none p-3 text-center font-mc text-[#ffff55] mc-text hover:brightness-125">
                            <span className="group-open:hidden">▾ Show all {projects.length} projects</span><span className="hidden group-open:inline">▴ Hide</span>
                        </summary>
                        <ul className="grid gap-x-6 border-t-4 border-[#050308] p-3 sm:grid-cols-2">
                            {rest.map(p => (
                                <li key={p.modrinth?.id ?? p.curseforge?.id} className="flex items-center gap-3 border-b-2 border-[#2a2340] py-2">
                                    {p.icon ? <Image unoptimized src={p.icon} alt="" width={32} height={32} className="px shrink-0"/> : <span className="h-8 w-8 shrink-0 bg-[#2a2340]"/>}
                                    <a href={p.modrinth?.url ?? p.curseforge?.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 hover:text-white">
                                        <span className="block truncate font-mc text-[15px] text-[#e0e0e0]">{p.name}</span>
                                        <span className="font-silk text-[10px] text-[#8a8a8a]">{p.type}{p.modrinth && " · MR"}{p.curseforge && " · CF"}</span>
                                    </a>
                                    <span className="font-mc text-sm text-[#ffff55]">{formatCount(p.downloads)}</span>
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
            </div>
            <div className="mc-bedrock"/>
        </Display>
    );
}
