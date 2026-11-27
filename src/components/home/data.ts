export interface WorkItem {
    tag: string;
    title: string;
    tagline: string;
    text: string[];
    facts: string[];
    youtube?: string;
    href?: string;
}

export const currentWork: WorkItem[] = [
    {
        tag: "MAP", title: "Island of Time", youtube: "rILRXIBM6W0",
        tagline: "Puzzle adventure map for 2 players, themed around time travel",
        text: [
            "You and your friend finally got time for a relaxing vacation on the famous island atoll Horlosi – until a curious tourist shows you an ancient book about a civilization from before our time.",
            "After the split, both players see a completely different world and have to connect what they see into one solution. Every chapter hides two collectibles, and a quest system offers optional hints if you get stuck.",
            "Made for Papaplatte & BastiGHG with over 3,000 hours of work since spring 2023.",
        ],
        facts: ["2 players · co-op", "5 chapters · ~20h", "puzzle · action"],
    },
];

export interface Featured {
    modrinth: string;
    title: string;
    color: string;
    sceneBg: string;
    extra?: { label: string; href: string };
}

export const featured: Featured[] = [
    {modrinth: "veinminer", title: "VeinMiner", color: "#55ffff", sceneBg: "linear-gradient(#0d2a33,#145566)"},
    {
        modrinth: "challenge", title: "MUtils · MChallenge", color: "#ff5555", sceneBg: "linear-gradient(#3a0d14,#7a1622)",
        extra: {label: "mutils.net", href: "https://mutils.net"},
    },
    {modrinth: "mca-selector", title: "MCA-Selector Ingame", color: "#55ff55", sceneBg: "linear-gradient(#10301a,#1d5a2c)"},
];

// Modrinth slug -> CurseForge slug, where names differ between the platforms
export const curseforgeSlugs: Record<string, string> = {
    "veinminer": "veinminer-mod",
    "veinminer-client": "veinminer-hotkey",
    "veinminer-enchantment": "veinminer-enchant",
    "world": "better-world",
};
