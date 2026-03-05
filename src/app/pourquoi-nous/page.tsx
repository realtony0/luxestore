import Link from "next/link";
import type { Metadata } from "next";
import { getProductsByUniverse } from "@/lib/products-server";
import { getModeSubcategories } from "@/lib/categories-data";
import { resolveModeDisplayCategory } from "@/lib/universe-categories";
import {
  BRAND_KEYWORDS,
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  getCanonicalUrl,
  getSiteUrl,
} from "@/lib/seo";

const siteUrl = getSiteUrl();
const socialImage = DEFAULT_SOCIAL_IMAGE;
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8619706419469").replace(/\D+/g, "");

const commitments = [
  {
    title: "Curated Streetwear Selection",
    description:
      "Every item is selected for style, quality, and real customer demand across Fashion categories.",
  },
  {
    title: "Fast, Clear Ordering",
    description:
      "Simple flow: add items to cart, confirm your details, and finalize instantly through WhatsApp and email.",
  },
  {
    title: "Real Human Support",
    description:
      "From availability checks to delivery follow-up, our team supports you at every step.",
  },
  {
    title: "International Delivery",
    description:
      "We ship worldwide with clear communication and fast handling from order to delivery.",
  },
] as const;

const testimonials = [
  {
    name: "Lina M.",
    city: "Paris",
    rating: 5,
    quote:
      "Great quality and fast replies. The product looked exactly like the photos.",
    purchase: "Fashion order",
  },
  {
    name: "Tara K.",
    city: "Dubai",
    rating: 5,
    quote:
      "Very smooth WhatsApp support and clear updates during the whole process.",
    purchase: "Fashion order",
  },
  {
    name: "Amelia R.",
    city: "London",
    rating: 5,
    quote:
      "Strong selection, clean packaging, and reliable delivery. I will order again.",
    purchase: "Mixed order",
  },
] as const;

const faqs = [
  {
    question: "How does ordering work?",
    answer:
      "Add products to your cart, submit your request, then confirm on WhatsApp. We validate details before final processing.",
  },
  {
    question: "Are products always in stock?",
    answer:
      "Stock updates frequently. If an item is limited, we contact you quickly with alternatives.",
  },
  {
    question: "How long does processing take?",
    answer:
      "After confirmation, we prepare your order quickly and share tracking updates through WhatsApp.",
  },
  {
    question: "Can I get help choosing products?",
    answer:
      "Yes. We help with size, fit, style, and usage before you finalize your order.",
  },
] as const;

export const metadata: Metadata = {
  title: "About",
  description: "Why choose Luxe Store: commitments, customer reviews, and FAQ.",
  keywords: [...BRAND_KEYWORDS, "about luxe store", "faq boutique mode"],
  alternates: {
    canonical: "/pourquoi-nous",
  },
  openGraph: {
    title: `Why choose ${SITE_NAME}`,
    description: "Commitments, customer reviews, and a clear professional order flow.",
    url: getCanonicalUrl("/pourquoi-nous"),
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: `Why choose ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Why choose ${SITE_NAME}`,
    description: "Commitments, customer reviews, and a clear professional order flow.",
    images: [socialImage],
  },
};

export default async function PourquoiNousPage() {
  const products = await getProductsByUniverse("mode");
  const modeSubcategories = await getModeSubcategories();
  const mappedCategoryCounts = new Map<string, number>();

  for (const product of products) {
    const category = resolveModeDisplayCategory(product.category, modeSubcategories).category;
    mappedCategoryCounts.set(category, (mappedCategoryCounts.get(category) ?? 0) + 1);
  }

  const topCategories = [...mappedCategoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/pourquoi-nous#webpage`,
        url: `${siteUrl}/pourquoi-nous`,
        name: "About - Luxe Store",
        inLanguage: "en",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
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
            name: "About",
            item: `${siteUrl}/pourquoi-nous`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="border-b border-[var(--border)] bg-white/70">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 text-center sm:px-6 md:pb-14 md:pt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-xs">
            About Luxe Store
          </p>
          <h1 className="font-display mt-3 text-4xl leading-[0.9] tracking-[0.08em] text-[var(--foreground)] min-[430px]:text-5xl sm:text-6xl md:text-7xl">
            WHY
            <br />
            US
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            A store built for clarity: strong products, clean selection, fast ordering, and reliable support.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-14">
        <div className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:mb-12 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Most requested categories
          </p>
          {topCategories.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No categories available yet.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {topCategories.map(([category, count]) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]"
                >
                  {category}
                  <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] text-[var(--accent)]">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        <header className="mb-6 text-center sm:mb-8">
          <span className="inline-flex rounded-full bg-[var(--accent)]/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Our commitments
          </span>
          <h2 className="font-display mt-4 text-3xl leading-[0.92] tracking-[0.08em] text-[var(--foreground)] min-[420px]:text-4xl sm:text-5xl">
            A professional
            <br />
            shopping experience
          </h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {commitments.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_10px_25px_rgba(17,13,16,0.06)]"
            >
              <h3 className="font-heading text-xl font-semibold text-[var(--foreground)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white/60 py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <header className="mb-6 text-center sm:mb-8">
            <span className="inline-flex rounded-full bg-[var(--accent)]/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              Customer reviews
            </span>
            <h2 className="font-display mt-4 text-3xl leading-[0.92] tracking-[0.08em] text-[var(--foreground)] min-[420px]:text-4xl sm:text-5xl">
              What our clients
              <br />
              say about us
            </h2>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((review) => (
              <article
                key={`${review.name}-${review.city}`}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_20px_rgba(17,13,16,0.05)]"
              >
                <p className="text-sm leading-relaxed text-[var(--foreground)]">&ldquo;{review.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-1 text-[var(--accent)]" aria-label={`${review.rating} stars`}>
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <span key={index} className="text-base leading-none">★</span>
                  ))}
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {review.name} · {review.city}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">{review.purchase}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div>
          <header className="mb-5">
            <span className="inline-flex rounded-full bg-[var(--accent)]/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
              Frequently asked questions
            </span>
            <h2 className="font-display mt-4 text-3xl leading-[0.92] tracking-[0.08em] text-[var(--foreground)] min-[420px]:text-4xl">
              FAQ
            </h2>
          </header>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-[var(--border)] bg-white px-4 py-3"
              >
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-[var(--foreground)]">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Need help?
          </p>
          <h3 className="font-display mt-3 text-3xl leading-[0.92] tracking-[0.06em] text-[var(--foreground)]">
            Let&apos;s talk about your order
          </h3>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Our team replies quickly on sizing, availability, and delivery details.
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-deep)]"
            >
              Write on WhatsApp
            </a>
            <Link
              href="/panier"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Open cart
            </Link>
          </div>
        </aside>
      </section>

      <section className="border-t border-[var(--border)] py-12">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="font-display text-4xl leading-[0.9] tracking-[0.08em] text-[var(--foreground)] sm:text-5xl">
            READY TO SHOP
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            Explore collections, add products, and complete your order in minutes.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/mode"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--accent-deep)]"
            >
              Shop Fashion
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
