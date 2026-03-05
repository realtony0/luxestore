export type AdminLimits = {
  maxProducts: number;
  maxImagesPerProduct: number;
  maxImagesPerColor: number;
};

const DEFAULT_MAX_PRODUCTS = 300;
const DEFAULT_MAX_IMAGES_PER_PRODUCT = 12;
const DEFAULT_MAX_IMAGES_PER_COLOR = 8;

function parsePositiveInt(
  raw: string | undefined,
  fallback: number,
  options?: { min?: number; max?: number }
): number {
  const min = options?.min ?? 1;
  const max = options?.max ?? Number.MAX_SAFE_INTEGER;
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

function pickEnvValue(env: Record<string, string | undefined>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (value && value.trim()) return value;
  }
  return undefined;
}

export function resolveAdminLimits(env?: Record<string, string | undefined>): AdminLimits {
  const source = env ?? getRuntimeEnv();
  const maxProductsRaw = pickEnvValue(source, ["ADMIN_MAX_PRODUCTS", "NEXT_PUBLIC_ADMIN_MAX_PRODUCTS"]);
  const maxImagesPerProductRaw = pickEnvValue(source, [
    "ADMIN_MAX_IMAGES_PER_PRODUCT",
    "NEXT_PUBLIC_ADMIN_MAX_IMAGES_PER_PRODUCT",
  ]);
  const maxImagesPerColorRaw = pickEnvValue(source, [
    "ADMIN_MAX_IMAGES_PER_COLOR",
    "NEXT_PUBLIC_ADMIN_MAX_IMAGES_PER_COLOR",
  ]);

  const maxImagesPerProduct = parsePositiveInt(maxImagesPerProductRaw, DEFAULT_MAX_IMAGES_PER_PRODUCT, {
    min: 1,
    max: 50,
  });
  const maxImagesPerColor = parsePositiveInt(maxImagesPerColorRaw, DEFAULT_MAX_IMAGES_PER_COLOR, {
    min: 1,
    max: maxImagesPerProduct,
  });

  return {
    maxProducts: parsePositiveInt(maxProductsRaw, DEFAULT_MAX_PRODUCTS, { min: 1, max: 100000 }),
    maxImagesPerProduct,
    maxImagesPerColor,
  };
}

function getRuntimeEnv(): Record<string, string | undefined> {
  if (typeof process === "undefined" || !process.env) return {};
  return process.env as Record<string, string | undefined>;
}

export const ADMIN_LIMITS = resolveAdminLimits(getRuntimeEnv());

export function productLimitReachedMessage(current: number, max: number): string {
  return `Product limit reached (${current}/${max}). Delete an item before creating a new one.`;
}

export function imagesPerProductLimitMessage(max: number): string {
  return `Maximum ${max} images per product.`;
}

export function imagesPerColorLimitMessage(max: number, color?: string): string {
  return color
    ? `Maximum ${max} images for color "${color}".`
    : `Maximum ${max} images per color.`;
}
