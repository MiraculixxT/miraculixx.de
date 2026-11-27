import { igOgImage, ogSize } from "@/components/stats/ig/seo";

export const alt = "Active Instant Gaming giveaways";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return igOgImage("Giveaways", "Every active Instant Gaming and creator giveaway with next draw and last winner.");
}
