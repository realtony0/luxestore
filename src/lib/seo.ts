const FALLBACK_SITE_URL = "https://luxe-store.vercel.app";

export const SITE_NAME = "Luxe Store";
export const DEFAULT_SOCIAL_IMAGE =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&h=630&q=80";
export const DEFAULT_DESCRIPTION =
  "Luxe Store: boutique en ligne de vetements, chaussures, perruques, lunettes et accessoires.";
export const BRAND_KEYWORDS = [
  "luxe store",
  "boutique mode en ligne",
  "streetwear femme",
  "streetwear homme",
  "chaussures tendance",
  "perruques",
  "lunettes de soleil",
  "sacs et accessoires",
];

function sanitizeUrl(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  const normalized = sanitizeUrl(raw || "");
  if (normalized && isHttpUrl(normalized)) {
    return normalized;
  }
  return FALLBACK_SITE_URL;
}

export function getCanonicalUrl(pathname: string): string {
  const siteUrl = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl}${path}`.replace(/\/+$/, "");
}

export function toMetaDescription(input: string, maxLength = 160): string {
  const value = input.replace(/\s+/g, " ").trim();
  if (!value) return DEFAULT_DESCRIPTION;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}
