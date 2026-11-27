import localFont from "next/font/local";

export const fontPixel = localFont({ src: "../../app/fonts/PressStart2P.woff2", variable: "--font-pixel", display: "swap" });
export const fontSilk = localFont({ src: "../../app/fonts/Silkscreen.woff2", variable: "--font-silk", display: "swap" });
export const fontBody = localFont({ src: "../../app/fonts/PixelifySans.woff2", variable: "--font-body", display: "swap" });
export const fontTerm = localFont({ src: "../../app/fonts/VT323.woff2", variable: "--font-term", display: "swap" });
export const fontMc = localFont({ src: "../../app/fonts/Minecraft.woff", variable: "--font-mc", display: "swap" });

export const siteFonts = [fontPixel, fontSilk, fontBody, fontTerm, fontMc].map(f => f.variable).join(" ");
