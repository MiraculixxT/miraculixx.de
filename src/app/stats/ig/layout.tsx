"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/stats/ig", label: "Dashboard" },
  { href: "/stats/ig/games", label: "Games Table" }
];

export default function InstantGamingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/stats/ig" className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-widest text-indigo-300">Analytics</span>
            <span className="text-lg font-bold">Instant Gaming Insights</span>
          </Link>
          <ul className="flex gap-1 text-sm">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "rounded-md bg-indigo-600 px-3 py-2 font-semibold text-white"
                        : "rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">{children}</div>

      <footer className="mt-8 border-t border-slate-800 bg-slate-900/60">
        <div className="mx-auto w-full max-w-7xl px-6 py-4 text-xs text-slate-400">
          This page is not associated with, endorsed by, or affiliated with Instant Gaming. No user data is collected. Some links contain referral codes
        </div>
      </footer>
    </main>
  );
}
