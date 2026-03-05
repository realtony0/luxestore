import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/products-server";
import { getModeSubcategories } from "@/lib/categories-data";
import { formatPrice } from "@/lib/products";
import { resolveModeDisplayCategory } from "@/lib/universe-categories";
import AddToCartActions from "@/components/AddToCartActions";
import ProductGallery from "@/components/ProductGallery";
import {
  BRAND_KEYWORDS,
  SITE_NAME,
  getCanonicalUrl,
  getSiteUrl,
  toMetaDescription,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
const siteUrl = getSiteUrl();

function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${siteUrl}${path}`;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getProducts();
  return products
    .filter((product) => product.universe === "mode")
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const modeDisplay = resolveModeDisplayCategory(product.category, await getModeSubcategories());
  const displayedCategory = modeDisplay.category || "Fashion";
  const displayedSubCategory = modeDisplay.subCategory || null;
  const description = toMetaDescription(product.description);
  const canonicalPath = `/products/${product.slug}`;
  const productUrl = getCanonicalUrl(canonicalPath);
  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];
  const absoluteGallery = gallery.map(toAbsoluteUrl);
  const colorKeywords = (product.color || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: `${product.name} (${formatPrice(product.price)})`,
    description,
    keywords: [
      ...BRAND_KEYWORDS,
      product.name,
      displayedCategory,
      ...(displayedSubCategory ? [displayedSubCategory] : []),
      ...colorKeywords,
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      type: "website",
      url: productUrl,
      images: absoluteGallery.map((url) => ({ url, alt: product.name })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: absoluteGallery,
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "USD",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.universe !== "mode") notFound();

  const backHref = "/mode";
  const modeDisplay = resolveModeDisplayCategory(product.category, await getModeSubcategories());
  const displayedCategory = modeDisplay.category || "Fashion";
  const displayedSubCategory = modeDisplay.subCategory || null;
  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];
  const absoluteGallery = gallery.map(toAbsoluteUrl);
  const canonicalPath = `/products/${product.slug}`;
  const productUrl = getCanonicalUrl(canonicalPath);
  const description = toMetaDescription(product.description);
  const productStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        image: absoluteGallery,
        description,
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        category: displayedSubCategory ? `${displayedCategory} > ${displayedSubCategory}` : displayedCategory,
        ...(product.color
          ? {
              color: product.color,
            }
          : {}),
        ...(product.sizes && product.sizes.length > 0
          ? {
              size: product.sizes.join(", "),
            }
          : {}),
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "USD",
          price: product.price,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: getCanonicalUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Fashion",
            item: getCanonicalUrl("/mode"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href={backHref}
          className="mb-5 inline-flex items-center rounded text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:mb-6 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal"
        >
          ← Back to shop
        </Link>

        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <ProductGallery name={product.name} images={gallery} />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
              {displayedCategory}
              {displayedSubCategory ? ` · ${displayedSubCategory}` : ""}
            </p>
            <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-semibold text-[var(--accent)] sm:mt-4 sm:text-3xl">
              {formatPrice(product.price)}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] sm:mt-6 sm:text-base">
              {product.description}
            </p>
            <AddToCartActions
              key={product.slug}
              backHref={backHref}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: gallery[0] || product.image,
                universe: product.universe,
                category: product.category,
                color: product.color,
                colorImages: product.colorImages,
                sizes: product.sizes,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
