import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-store.vercel.app").replace(/\/+$/, "");
const defaultSocialImage =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&h=630&q=80";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Luxe Store — Fashion & Lifestyle", template: "%s | Luxe Store" },
  description: "Clothes, shoes, wigs, sunglasses, bags & more.",
  applicationName: "Luxe Store",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Luxe Store — Fashion & Lifestyle",
    description: "Clothes, shoes, wigs, sunglasses, bags & more.",
    type: "website",
    url: "/",
    siteName: "Luxe Store",
    locale: "en_US",
    images: [
      {
        url: defaultSocialImage,
        width: 1200,
        height: 630,
        alt: "Luxe Store - Fashion and lifestyle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Store — Fashion & Lifestyle",
    description: "Clothes, shoes, wigs, sunglasses, bags & more.",
    images: [defaultSocialImage],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased font-sans">
        <CartProvider>
          <Header />
          <main id="main" className="flex min-h-screen flex-col" tabIndex={-1}>
            {children}
            <Footer />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
