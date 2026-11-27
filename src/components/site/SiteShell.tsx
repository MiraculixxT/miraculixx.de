import Link from "next/link";
import type {ReactNode} from "react";
import FooterGame from "./FooterGame";
import {siteFonts} from "./fonts";
import "./site.css";

export const GITHUB = "https://github.com/MiraculixxT";

const nav = [
    {href: "/#minecraft", label: "Minecraft"},
    {href: "/#stats", label: "Stats"},
    {href: "/#bots", label: "Discord Bots"},
];

export default function SiteShell({children}: { children: ReactNode }) {
    return (
        <div className={`${siteFonts} site-root flex min-h-screen flex-col overflow-x-hidden font-body text-site-text`}>
            <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 border-b-4 border-[#241c44] px-4 py-5">
                <Link href="/" className="font-pixel text-sm text-white transition-[text-shadow] duration-150 [text-shadow:1px_1px_0_#ff4d6d] hover:[text-shadow:3px_3px_0_#ff4d6d] focus-visible:[text-shadow:3px_3px_0_#ff4d6d]">MIRACULIXX</Link>
                <nav className="flex flex-wrap gap-x-6 gap-y-2 font-silk text-sm text-site-soft">
                    {nav.map(n => <Link key={n.href} href={n.href} className="hover:text-white">{n.label}</Link>)}
                    <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-site-accent hover:text-white">GitHub ↗</a>
                </nav>
            </header>
            <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
            <footer className="mt-16 border-t-4 border-[#241c44]">
                <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-7 gap-y-2 px-4 pt-5 font-silk text-xs text-site-dim">
                    <span>© {new Date().getFullYear()} Miraculixx</span>
                    <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-site-soft">GitHub</a>
                    <a href="https://mutils.net" target="_blank" rel="noopener noreferrer" className="hover:text-site-soft">mutils.net</a>
                </div>
                <FooterGame/>
            </footer>
        </div>
    );
}
