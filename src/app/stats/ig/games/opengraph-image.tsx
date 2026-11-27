import { igOgImage, ogSize } from "@/components/stats/ig/seo";

export const alt = "Instant Gaming games with price history";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return igOgImage("Games", "Current price, discount and stock for every tracked product, with full history.");
}
