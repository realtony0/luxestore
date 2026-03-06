import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      { source: "/mode", destination: "/fashion", permanent: true },
      { source: "/pourquoi-nous", destination: "/about", permanent: true },
      { source: "/panier", destination: "/cart", permanent: true },
      { source: "/commande", destination: "/checkout", permanent: true },
      { source: "/tout", destination: "/fashion", permanent: true },
      { source: "/univers", destination: "/fashion", permanent: true },
    ];
  },
};

export default nextConfig;
