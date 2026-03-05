import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products-server";
import { getCanonicalUrl, getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();

function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${siteUrl}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getCanonicalUrl("/mode"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/pourquoi-nous"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product) => product.universe === "mode")
    .map((product) => ({
      url: getCanonicalUrl(`/products/${product.slug}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      images: Array.from(
        new Set(
          (Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : [product.image]
          ).map(toAbsoluteUrl)
        )
      ),
    }));

  return [...staticRoutes, ...productRoutes];
}
