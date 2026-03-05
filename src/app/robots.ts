import type { MetadataRoute } from "next";
import { getCanonicalUrl, getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api", "/api/*"],
      },
    ],
    host: siteUrl,
    sitemap: getCanonicalUrl("/sitemap.xml"),
  };
}
