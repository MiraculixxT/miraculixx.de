import type { ReactNode } from "react";
import { Barlow } from "next/font/google";
import IgNav from "@/components/stats/ig/IgNav";
import "./ig.css";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-barlow" });

export default function InstantGamingLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`${barlow.variable} flex min-h-screen flex-col bg-ig-dark font-barlow text-[15px] leading-5 text-white`}>
      <IgNav />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 py-8 md:px-8">{children}</div>
      <footer className="bg-ig-ultra-dark">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 text-xs text-ig-medium-light md:px-8">
          This page is not associated with, endorsed by, or affiliated with Instant Gaming. No user data is collected. Some links contain referral codes.
        </div>
      </footer>
    </main>
  );
}
