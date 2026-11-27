export type Sprite = { rows: string[]; palette: Record<string, string> };

const heroPalette = {
    k: "#14101c", h: "#4a4448", H: "#6e676b", s: "#f1d2b8", b: "#3f4bd1", m: "#d99a8a", n: "#050506",
    r: "#b01e25", R: "#6a0f14", q: "#2e0709", p: "#2a2a31", g: "#4a4a52", w: "#f2f2f2",
};
const heroTop = [
    "...kkkkkk...",
    "..khhHhhhk..",
    ".khhhhhHhhk.",
    ".khhshhshhk.",
    ".khsbssbshk.",
    ".kssssssssk.",
    "..kssmmssk..",
    "..rRknnkRr..",
    "..krRrrRrk..",
    ".krRqRRqRrk.",
    "ksrRrrRrrRsk",
    "ksRqRRqRRqsk",
    ".kkrRrrRrkk.",
    "..kppgpppk..",
];

export const HERO: Sprite = { rows: [...heroTop, "..kppk.kppk.", "..kwwk.kwwk."], palette: heroPalette };
export const HERO_STEP: Sprite = { rows: [...heroTop, "...kppppk...", "...kwwwwk..."], palette: heroPalette };
const blockyPalette = {
    k: "#14101c", h: "#4a4448", H: "#6e676b", s: "#f1d2b8", e: "#e8eef8", b: "#3f4bd1", n: "#0d0d0f",
    r: "#a3191f", R: "#6a0f14", q: "#3a0a0d", p: "#1a1a1e", g: "#4a4a52", w: "#eeeeee", W: "#b8b8bd",
};
const blockyTop = [
    "..rkkkkkkk..",
    ".rkhhhhhhhk.",
    ".rkhHhhhHhhk",
    ".rkhhhhhhhhk",
    ".rkhhsshsshk",
    ".rksebssbesk",
    ".rkssssssssk",
    ".Rrknnnnnkr.",
    "krrRrrRrrRrk",
    "kRRqRRqRRqRk",
    "krrRrrRrrRrk",
    "krRRrrRrrRRk",
    ".kqqqqqqqqk.",
    "..kpgppgpk..",
];

export const BLOCKY: Sprite = { rows: [...blockyTop, "..kppk.kppk.", "..kwWk.kwWk."], palette: blockyPalette };
export const BLOCKY_STEP: Sprite = { rows: [...blockyTop, "...kppppk...", "...kwwwWk..."], palette: blockyPalette };
export const COIN: Sprite = {
    rows: ["..kkkk..", ".kyyyyk.", "kyywyyyk", "kyywyoyk", "kyywyoyk", "kyyyyoyk", ".kyooyk.", "..kkkk.."],
    palette: { k: "#1a1028", y: "#ffcc33", w: "#fff2b0", o: "#e0a800" },
};
