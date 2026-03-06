import Image from "next/image";
import type { Metadata } from "next";
import { getProductsByUniverse } from "@/lib/products-server";
import { getModeSubcategories } from "@/lib/categories-data";
import {
  MODE_CATEGORIES,
  resolveModeDisplayCategory,
} from "@/lib/universe-categories";
import ProductCard, { type ProductCardProduct } from "@/components/ProductCard";
import ModeClothingSelector, { type ModeClothingProduct } from "@/components/ModeClothingSelector";
import { BRAND_KEYWORDS, DEFAULT_SOCIAL_IMAGE, SITE_NAME, getCanonicalUrl, getSiteUrl } from "@/lib/seo";

const heroImage =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80";
const siteUrl = getSiteUrl();
const canonicalPath = "/fashion";

export const metadata: Metadata = {
  title: "Fashion",
  description:
    "Explore Luxe Store's fashion collection: clothing, shoes, wigs, sunglasses, and accessories.",
  keywords: [...BRAND_KEYWORDS, "fashion collection", "shop fashion"],
  alternates: {
    canonical: canonicalPath,
  },
  openGraph: {
    title: `${SITE_NAME} — Fashion`,
    description:
      "Explore Luxe Store's fashion collection: clothing, shoes, wigs, sunglasses, and accessories.",
    url: getCanonicalUrl(canonicalPath),
    type: "website",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Fashion`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Fashion`,
    description:
      "Explore Luxe Store's fashion collection: clothing, shoes, wigs, sunglasses, and accessories.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

export const dynamic = "force-dynamic";

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, "-");
}

export default async function ModePage() {
  const products = await getProductsByUniverse("mode");
  const modeSubcategories = await getModeSubcategories();
  const mappedProducts: ModeClothingProduct[] = products.map((product) => {
    const modeDisplay = resolveModeDisplayCategory(product.category, modeSubcategories);
    const cardProduct: ProductCardProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      universe: product.universe,
      category: modeDisplay.category,
      ...(product.color ? { color: product.color } : {}),
    };

    return {
      ...cardProduct,
      subCategory: modeDisplay.subCategory,
    };
  });

  const categories = MODE_CATEGORIES.filter((category) =>
    mappedProducts.some((product) => product.category === category)
  );
  const productCount = mappedProducts.length;

  const byCategory = categories.map((category) => ({
    category,
    products: mappedProducts.filter((p) => p.category === category),
  }));
  const itemList = mappedProducts.slice(0, 24).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${siteUrl}/products/${product.slug}`,
    name: product.name,
  }));
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}${canonicalPath}#collection`,
        url: `${siteUrl}${canonicalPath}`,
        name: `${SITE_NAME} Fashion`,
        description:
          "Fashion collection: clothing, shoes, wigs, sunglasses, and accessories.",
        inLanguage: "en",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "ItemList",
        itemListElement: itemList,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Fashion",
            item: `${siteUrl}${canonicalPath}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative flex min-h-[38svh] items-center justify-center overflow-hidden sm:min-h-[42vh]">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover brightness-[0.5]" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="relative z-10 px-4 text-center">
          <h1 className="font-display text-4xl leading-[0.88] tracking-[0.1em] text-white min-[420px]:text-5xl sm:text-6xl md:text-7xl">
            SHOP
          </h1>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 sm:mt-4 sm:text-base sm:tracking-[0.2em]">
            {productCount} fashion items
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="sticky top-[5.25rem] z-30 border-b border-[var(--border)] bg-white/95 shadow-sm backdrop-blur md:top-16">
          <div className="mx-auto flex max-w-6xl items-center justify-start gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 md:justify-center md:py-3">
            {categories.map((category) => (
              <a
                key={category}
                href={`#${slug(category)}`}
                className="whitespace-nowrap rounded-full border border-[var(--border)] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:px-4 sm:text-xs sm:tracking-[0.16em]"
              >
                {category}
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 md:space-y-16 md:py-16">
        {byCategory.map(({ category, products: list }) => (
          <section key={category} id={slug(category)} className="scroll-mt-32 md:scroll-mt-24">
            <header className="mb-6 text-center sm:mb-8">
              <span className="inline-block rounded-full bg-[var(--accent)]/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)] sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                Selection
              </span>
              <h2 className="mt-3 font-display text-3xl leading-[0.92] tracking-[0.08em] text-[var(--foreground)] min-[420px]:text-4xl sm:mt-4 sm:text-5xl md:text-6xl">
                {category}
              </h2>
            </header>

            {category === "Clothes" ? (
              <ModeClothingSelector products={list} subcategories={modeSubcategories} />
            ) : (
              <div className="grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8">
                {list.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
