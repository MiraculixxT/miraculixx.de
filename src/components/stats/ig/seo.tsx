import type { Metadata } from "next";
import { ImageResponse } from "next/og";

export const IG_SITE_NAME = "Instant Gaming Price Tracker";
export const ogSize = { width: 1200, height: 630 };

export function igMetadata({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const fullTitle = title ? `${title} · ${IG_SITE_NAME}` : IG_SITE_NAME;
  return {
    metadataBase: new URL("https://miraculixx.de"),
    title: title ? { absolute: fullTitle } : IG_SITE_NAME,
    description,
    applicationName: IG_SITE_NAME,
    keywords: ["Instant Gaming", "price tracker", "game deals", "price history", "discounts", "giveaways", "Steam keys"],
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: IG_SITE_NAME, title: fullTitle, description, url: path, locale: "en_GB" },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

const FIRE = "linear-gradient(10deg, #ff8a15, #ff3131)";

export function igOgImage(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#1a1a1a", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 88, height: 88, borderRadius: 16, background: FIRE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 700 }}>%</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 700 }}>Price Tracker</span>
            <span style={{ fontSize: 22, letterSpacing: 4, color: "#a8a8a8" }}>INSTANT GAMING DATA</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 84, fontWeight: 700, lineHeight: 1 }}>{title}</span>
          <span style={{ fontSize: 34, color: "#d4d4d4", lineHeight: 1.3 }}>{subtitle}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: "#6d6d6d" }}>
          <span>miraculixx.de/stats/ig</span>
          <span style={{ height: 8, width: 240, borderRadius: 8, background: FIRE }} />
        </div>
      </div>
    ),
    ogSize,
  );
}
