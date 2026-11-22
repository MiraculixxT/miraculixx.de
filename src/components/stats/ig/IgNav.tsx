"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/stats/ig", label: "Dashboard" },
  { href: "/stats/ig/games", label: "Games" },
];

export default function IgNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 bg-ig-ultra-dark/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/stats/ig" className="flex items-center gap-2.5">
          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-ig-sm bg-fire text-sm font-bold">%</span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold">Price Tracker</span>
            <span className="hidden text-[11px] font-bold uppercase tracking-widest text-ig-medium-light sm:block">Instant Gaming data</span>
          </span>
        </Link>
        <ul className="flex gap-1 text-[15px] font-bold">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-full px-4 py-2 transition ${active ? "bg-fire text-white" : "text-ig-very-light hover:bg-ig-medium-dark hover:text-white"}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
