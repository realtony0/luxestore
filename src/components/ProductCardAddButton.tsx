"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart/CartProvider";

type CartProductInput = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "image" | "universe" | "category"
>;

type Props = {
  product: CartProductInput;
};

export default function ProductCardAddButton({ product }: Props) {
  const timeoutRef = useRef<number | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleQuickAdd() {
    addItem(product);
    setAdded(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setAdded(false);
      timeoutRef.current = null;
    }, 1500);
  }

  return (
    <button
      type="button"
      onClick={handleQuickAdd}
      className="mt-2.5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:mt-3 sm:text-xs"
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
