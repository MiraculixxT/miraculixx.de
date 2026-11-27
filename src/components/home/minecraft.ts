import {API_URL} from "@/app/config";

export interface PlatformProject {
    id: string;
    slug: string;
    name: string;
    summary: string;
    icon: string | null;
    downloads: number;
    url: string;
    type: string;
    loaders: string[];
    updated: string | null;
}

export interface PlatformProfile {
    url: string;
    downloads: number;
    projectCount: number;
    projects: PlatformProject[];
}

export interface MinecraftProjects {
    downloads: number;
    projectCount: number;
    modrinth?: PlatformProfile;
    curseforge?: PlatformProfile;
    updatedAt: string;
}

export interface Project {
    name: string;
    summary: string;
    icon: string | null;
    type: string;
    downloads: number;
    modrinth?: PlatformProject;
    curseforge?: PlatformProject;
}

export async function fetchMinecraft(): Promise<MinecraftProjects | null> {
    try {
        const res = await fetch(`${API_URL}/projects/minecraft`, {next: {revalidate: 600}});
        return res.ok ? await res.json() : null;
    } catch {
        return null;
    }
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function mergeProjects(data: MinecraftProjects | null, cfSlugs: Record<string, string> = {}): Project[] {
    const list: Project[] = (data?.modrinth?.projects ?? []).map(p => ({
        name: p.name, summary: p.summary, icon: p.icon, type: p.type, downloads: p.downloads, modrinth: p,
    }));
    for (const cf of data?.curseforge?.projects ?? []) {
        const match = list.find(p => !p.curseforge && p.modrinth && cfSlugs[p.modrinth.slug] === cf.slug)
            ?? list.find(p => !p.curseforge && p.modrinth && (norm(p.name) === norm(cf.name) || norm(p.modrinth.slug) === norm(cf.slug)));
        if (match) {
            match.curseforge = cf;
            match.downloads += cf.downloads;
            match.icon ??= cf.icon;
        } else list.push({name: cf.name, summary: cf.summary, icon: cf.icon, type: cf.type, downloads: cf.downloads, curseforge: cf});
    }
    return list.sort((a, b) => b.downloads - a.downloads);
}

const compact = new Intl.NumberFormat("en", {notation: "compact", maximumFractionDigits: 1});
export const formatCount = (n: number | undefined) => n === undefined ? "—" : compact.format(n);
