import type { Metadata } from "next";
import { igMetadata } from "@/components/stats/ig/seo";

export const metadata: Metadata = igMetadata({
  title: "Giveaways",
  description: "All active Instant Gaming giveaways in one place: official country giveaways and creator giveaways with next draw date and last winner.",
  path: "/stats/ig/giveaways",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
