import type { PrintModel } from "@/lib/types";

/**
 * Built-in fallback feed. These are well-known free/community models. Source
 * links point at the source site's search so they always resolve (no 404s),
 * and thumbnails are generated locally as SVG data-URLs so the app renders with
 * zero network access or API keys. Live providers replace these when configured.
 */
type Seed = {
  title: string;
  creator: string;
  query: string;
  tags: string[];
  hue: number;
  emoji: string;
};

const SEEDS: Seed[] = [
  { title: "3DBenchy — The Jolly Torture Test", creator: "CreativeTools", query: "3DBenchy", tags: ["calibration", "boat", "classic"], hue: 200, emoji: "🚢" },
  { title: "Articulated Dragon", creator: "McGybeer", query: "articulated+dragon", tags: ["articulated", "flexi", "dragon"], hue: 280, emoji: "🐉" },
  { title: "XYZ Calibration Cube", creator: "iDig3Dprinting", query: "xyz+calibration+cube", tags: ["calibration", "cube", "tuning"], hue: 30, emoji: "🧊" },
  { title: "Flexi Rex", creator: "DrLex", query: "flexi+rex", tags: ["articulated", "dinosaur", "toy"], hue: 120, emoji: "🦖" },
  { title: "Self-Watering Planter", creator: "parallelgoods", query: "self+watering+planter", tags: ["home", "plants", "useful"], hue: 150, emoji: "🪴" },
  { title: "Adjustable Phone Stand", creator: "Bambu", query: "phone+stand", tags: ["desk", "useful", "stand"], hue: 210, emoji: "📱" },
  { title: "Cable Drop Clips", creator: "Sugru", query: "cable+clip", tags: ["organization", "desk", "useful"], hue: 50, emoji: "🔌" },
  { title: "Low-Poly Pokemon Set", creator: "FLOWALISTIK", query: "low+poly+pokemon", tags: ["lowpoly", "figure", "art"], hue: 0, emoji: "🎮" },
  { title: "Gridfinity Storage Bins", creator: "Zack Freedman", query: "gridfinity", tags: ["organization", "modular", "storage"], hue: 190, emoji: "🗄️" },
  { title: "Octopus Fidget Toy", creator: "McGybeer", query: "octopus+fidget", tags: ["articulated", "toy", "fidget"], hue: 320, emoji: "🐙" },
  { title: "Skull Planter", creator: "Helle", query: "skull+planter", tags: ["home", "art", "plants"], hue: 260, emoji: "💀" },
  { title: "Whistle (Loud)", creator: "Joe", query: "whistle", tags: ["fun", "quickprint", "gadget"], hue: 90, emoji: "🎵" },
  { title: "Hex Wrench Holder", creator: "MakeAnything", query: "hex+wrench+holder", tags: ["workshop", "organization", "tools"], hue: 20, emoji: "🔧" },
  { title: "Spiral Vase Mode Lamp", creator: "PrintThatThing", query: "spiral+vase+lamp", tags: ["home", "lighting", "vase"], hue: 40, emoji: "💡" },
];

function svgThumb(s: Seed): string {
  const h = s.hue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h},70%,55%)"/>
      <stop offset="1" stop-color="hsl(${(h + 60) % 360},70%,35%)"/>
    </linearGradient>
    <radialGradient id="r" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stop-color="rgba(255,255,255,0.35)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <rect width="600" height="800" fill="url(#r)"/>
  <text x="300" y="360" font-size="180" text-anchor="middle" dominant-baseline="middle">${s.emoji}</text>
  <text x="300" y="540" font-size="34" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="white" text-anchor="middle">3D MODEL</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getSeedFeed(): PrintModel[] {
  return SEEDS.map((s, i) => ({
    id: `seed:${i}`,
    source: "seed" as const,
    title: s.title,
    creator: s.creator,
    thumbnail: svgThumb(s),
    sourceUrl: `https://www.printables.com/search/models?q=${s.query}`,
    license: "Varies — see source",
    tags: s.tags,
  }));
}
