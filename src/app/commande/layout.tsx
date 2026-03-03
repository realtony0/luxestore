import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Send your order request via WhatsApp and email.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/commande",
  },
};

export default function CommandeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
