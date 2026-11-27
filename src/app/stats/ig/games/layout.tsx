import type { Metadata } from "next";
import { igMetadata } from "@/components/stats/ig/seo";

export const metadata: Metadata = igMetadata({
  title: "Games",
  description: "Search every tracked Instant Gaming product with its current price, discount, savings and stock, plus price and availability history.",
  path: "/stats/ig/games",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
