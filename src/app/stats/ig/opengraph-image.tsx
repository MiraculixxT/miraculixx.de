import { igOgImage, ogSize } from "@/components/stats/ig/seo";

export const alt = "Instant Gaming Price Tracker";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return igOgImage("Price Tracker", "Daily prices, discounts and price history for every Instant Gaming product.");
}
