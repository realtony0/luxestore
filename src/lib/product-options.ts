export type ColorImagesMap = Record<string, string[]>;

export function normalizeColorName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  noir: "#000000",
  white: "#ffffff",
  blanc: "#ffffff",
  gray: "#808080",
  grey: "#808080",
  gris: "#808080",
  silver: "#c0c0c0",
  argent: "#c0c0c0",
  charcoal: "#36454f",
  anthracite: "#36454f",
  red: "#ff0000",
  rouge: "#ff0000",
  burgundy: "#800020",
  wine: "#800020",
  bordeau: "#800020",
  bordeaux: "#800020",
  blue: "#0000ff",
  bleu: "#0000ff",
  navy: "#000080",
  "bleu marine": "#000080",
  marine: "#000080",
  "sky blue": "#87ceeb",
  "bleu ciel": "#87ceeb",
  green: "#008000",
  vert: "#008000",
  khaki: "#bdb76b",
  kaki: "#bdb76b",
  olive: "#808000",
  yellow: "#ffff00",
  jaune: "#ffff00",
  orange: "#ffa500",
  pink: "#ffc0cb",
  blush: "#ffc0cb",
  rose: "#ffc0cb",
  purple: "#800080",
  violet: "#800080",
  beige: "#f5f5dc",
  nude: "#f5deb3",
  "off white": "#f5f5f4",
  ecru: "#f5f5dc",
  cream: "#f5f5dc",
  ivory: "#f5f5dc",
  creme: "#f5f5dc",
  cremee: "#f5f5dc",
  brown: "#8b4513",
  marron: "#8b4513",
  chocolate: "#7b3f00",
  caramel: "#c68e17",
  camel: "#c19a6b",
  gold: "#ffd700",
  or: "#ffd700",
  dore: "#ffd700",
  copper: "#b87333",
  cuivre: "#b87333",
  transparent: "#ffffff",
  translucent: "#ffffff",
  clear: "#ffffff",
  multicolor: "#d1d5db",
  "multi color": "#d1d5db",
  "multi-color": "#d1d5db",
};

const COLOR_KEYWORD_RULES: Array<{ pattern: RegExp; swatch: string }> = [
  { pattern: /\b(black|noir|charcoal|anthracite)\b/, swatch: "#000000" },
  { pattern: /\b(white|blanc)\b/, swatch: "#ffffff" },
  { pattern: /\b(gray|grey|gris)\b/, swatch: "#808080" },
  { pattern: /\b(silver|argent)\b/, swatch: "#c0c0c0" },
  { pattern: /\b(red|rouge)\b/, swatch: "#ff0000" },
  { pattern: /\b(burgundy|wine|bordeaux|bordeau)\b/, swatch: "#800020" },
  { pattern: /\b(navy|marine)\b/, swatch: "#000080" },
  { pattern: /\b(blue|bleu)\b/, swatch: "#0000ff" },
  { pattern: /\b(sky)\b/, swatch: "#87ceeb" },
  { pattern: /\b(green|vert)\b/, swatch: "#008000" },
  { pattern: /\b(khaki|kaki)\b/, swatch: "#bdb76b" },
  { pattern: /\b(olive)\b/, swatch: "#808000" },
  { pattern: /\b(yellow|jaune)\b/, swatch: "#ffff00" },
  { pattern: /\b(orange)\b/, swatch: "#ffa500" },
  { pattern: /\b(pink|rose|fuchsia|blush)\b/, swatch: "#ffc0cb" },
  { pattern: /\b(purple|violet|lilac|lavender)\b/, swatch: "#800080" },
  { pattern: /\b(beige|cream|creme|cremee|ivory|ecru)\b/, swatch: "#f5f5dc" },
  { pattern: /\b(off[\s-]?white)\b/, swatch: "#f5f5f4" },
  { pattern: /\b(nude)\b/, swatch: "#f5deb3" },
  { pattern: /\b(brown|marron)\b/, swatch: "#8b4513" },
  { pattern: /\b(chocolate)\b/, swatch: "#7b3f00" },
  { pattern: /\b(caramel)\b/, swatch: "#c68e17" },
  { pattern: /\b(camel)\b/, swatch: "#c19a6b" },
  { pattern: /\b(gold|or|dore)\b/, swatch: "#ffd700" },
  { pattern: /\b(copper|cuivre)\b/, swatch: "#b87333" },
  { pattern: /\b(transparent|translucent|clear)\b/, swatch: "#ffffff" },
  { pattern: /\b(multi[\s-]?color|multicolor)\b/, swatch: "#d1d5db" },
];

function matchColorKeyword(value: string): string | null {
  for (const rule of COLOR_KEYWORD_RULES) {
    if (rule.pattern.test(value)) {
      return rule.swatch;
    }
  }
  return null;
}

export function parseColorList(raw?: string): string[] {
  if (!raw) return [];
  const values = raw
    .split(/[,;/|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return [...new Set(values)];
}

export function colorToSwatch(color: string): string {
  const value = color.trim();
  if (!value) return "#d1d5db";

  if (/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(value)) {
    return value;
  }
  if (/^(rgb|hsl)a?\(/i.test(value)) {
    return value;
  }

  const key = normalizeColorName(value);
  if (COLOR_MAP[key]) {
    return COLOR_MAP[key];
  }

  const byKeyword = matchColorKeyword(key);
  if (byKeyword) {
    return byKeyword;
  }

  return "#d1d5db";
}

function toImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function uniqueImageUrls(values: unknown[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const url = toImageUrl(value);
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    output.push(url);
  }

  return output;
}

export function normalizeColorImagesMap(input: unknown): ColorImagesMap {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const entries = Object.entries(input as Record<string, unknown>);
  const output: ColorImagesMap = {};

  for (const [rawColor, rawImages] of entries) {
    const color = rawColor.trim();
    if (!color) continue;
    if (!Array.isArray(rawImages)) continue;

    const images = uniqueImageUrls(rawImages);
    if (images.length === 0) continue;

    const existing = output[color] ?? [];
    output[color] = uniqueImageUrls([...existing, ...images]);
  }

  return output;
}

export function getColorImages(colorImages: ColorImagesMap | undefined, color: string | undefined): string[] {
  if (!colorImages || !color) return [];

  const target = normalizeColorName(color);
  if (!target) return [];

  for (const [key, images] of Object.entries(colorImages)) {
    if (normalizeColorName(key) !== target) continue;
    return uniqueImageUrls(images);
  }

  return [];
}
