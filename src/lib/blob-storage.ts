import { del } from "@vercel/blob";
import type { Product } from "@/lib/products";

type ProductImagesShape = Pick<Product, "image" | "images" | "colorImages">;

function normalizeImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  return url ? url : null;
}

function isVercelPublicBlobUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function collectColorImages(colorImages: unknown): string[] {
  if (!colorImages || typeof colorImages !== "object" || Array.isArray(colorImages)) {
    return [];
  }

  const urls: string[] = [];
  for (const value of Object.values(colorImages as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      const normalized = normalizeImage(item);
      if (normalized) urls.push(normalized);
    }
  }
  return urls;
}

export function collectProductBlobImageUrls(product: ProductImagesShape | null | undefined): string[] {
  if (!product) return [];

  const primary = normalizeImage(product.image);
  const gallery = Array.isArray(product.images)
    ? product.images.map((img) => normalizeImage(img)).filter((img): img is string => Boolean(img))
    : [];
  const byColor = collectColorImages(product.colorImages);

  return unique([...(primary ? [primary] : []), ...gallery, ...byColor]).filter(isVercelPublicBlobUrl);
}

export function getRemovedBlobImageUrls(
  previous: ProductImagesShape | null | undefined,
  next: ProductImagesShape | null | undefined
): string[] {
  const previousSet = new Set(collectProductBlobImageUrls(previous));
  const nextSet = new Set(collectProductBlobImageUrls(next));
  return [...previousSet].filter((url) => !nextSet.has(url));
}

export async function deleteBlobUrls(urls: string[]): Promise<void> {
  const targets = unique(urls).filter(isVercelPublicBlobUrl);
  if (targets.length === 0) return;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;

  try {
    await del(targets, { token });
  } catch (error) {
    console.error("Failed to delete blob images:", error);
  }
}
