import type { Metadata } from "next";
import PanierView from "@/components/PanierView";

export const metadata: Metadata = {
  title: "Cart — Luxe Store",
  description: "Your Luxe Store cart.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/panier",
  },
};

export default function PanierPage() {
  return <PanierView />;
}
