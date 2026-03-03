"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/products";

const DEFAULT_WHATSAPP_NUMBER = "8619706419469";
const DEFAULT_ORDER_EMAIL = "Sandralassanah19@gmail.com";
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER).replace(/\D+/g, "");
const ORDER_EMAIL = (process.env.NEXT_PUBLIC_ORDER_EMAIL || DEFAULT_ORDER_EMAIL).trim();
const phoneRegex = /^[\d\s+.-]{8,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildEmailUrl(message: string): string {
  const subject = "New order - Luxe Store";
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export default function CommandeForm() {
  const searchParams = useSearchParams();
  const { items, hydrated, itemCount, subtotal } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [article, setArticle] = useState(() => {
    const value = searchParams.get("article");
    return value ? decodeURIComponent(value) : "";
  });
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const hasCartItems = hydrated && items.length > 0;

  const cartLabel = useMemo(() => {
    if (!hasCartItems) return "";
    return `${itemCount} item${itemCount > 1 ? "s" : ""} - ${formatPrice(subtotal)}`;
  }, [hasCartItems, itemCount, subtotal]);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!name.trim()) next.name = "Name is required.";
    else if (name.trim().length < 2) next.name = "At least 2 characters.";

    if (email.trim() && !emailRegex.test(email.trim())) next.email = "Invalid email.";

    if (phone.trim() && !phoneRegex.test(phone.trim())) {
      next.phone = "Invalid phone number.";
    }

    if (!message.trim()) next.message = "Message is required.";
    else if (message.trim().length < 8) next.message = "Minimum 8 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function composeOrderMessage(): string {
    const lines = [
      "Hello Luxe Store,",
      "",
      "I would like to place an order.",
      "",
      `Name: ${name.trim()}`,
      `Email: ${email.trim() || "Not provided"}`,
      `Phone: ${phone.trim() || "Not provided"}`,
    ];

    if (hasCartItems) {
      lines.push("", "Cart:");
      items.forEach((item) => {
        const options = [item.color ? `Color: ${item.color}` : "", item.size ? `Size: ${item.size}` : ""]
          .filter(Boolean)
          .join(", ");
        const optionText = options ? ` (${options})` : "";
        lines.push(`- ${item.name}${optionText} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`);
      });
      lines.push(`Cart total: ${formatPrice(subtotal)}`);
    } else {
      lines.push(`Item: ${article.trim() || "Not specified"}`);
    }

    lines.push("", "Message:", message.trim());
    return lines.join("\n");
  }

  function openUrl(url: string) {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = url;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);
    if (!validate()) return;

    setLoading(true);
    const messageText = composeOrderMessage();
    openUrl(buildWhatsAppUrl(messageText));
    window.location.href = buildEmailUrl(messageText);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Fill out this form. Your order will open automatically on WhatsApp and email.
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Auto-send: WhatsApp (+{WHATSAPP_NUMBER}) + Email ({ORDER_EMAIL})
        </p>

        {hasCartItems && (
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--background)]/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--foreground)]">Order from cart</p>
              <Link
                href="/panier"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                Edit cart
              </Link>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">{cartLabel}</p>
            <ul className="mt-3 space-y-1 text-xs text-[var(--foreground)]/85">
              {items.map((item) => (
                <li key={item.lineId} className="flex items-center justify-between gap-3">
                  <span className="truncate pr-2">
                    {item.name}
                    {item.color || item.size ? (
                      <span className="text-[var(--muted)]">
                        {" "}
                        ({[item.color ? `Color: ${item.color}` : "", item.size ? `Size: ${item.size}` : ""].filter(Boolean).join(", ")})
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0">
                    x{item.quantity} - {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5 sm:mt-8" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="Your name"
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-[var(--accent-deep)]" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-[var(--accent-deep)]" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className={`grid gap-4 ${hasCartItems ? "" : "sm:grid-cols-2"}`}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)]">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="Ex. +86 1970 641 9469"
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-[var(--accent-deep)]" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>

            {!hasCartItems && (
              <div>
                <label htmlFor="article" className="block text-sm font-medium text-[var(--foreground)]">
                  Item
                </label>
                <input
                  id="article"
                  type="text"
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                  placeholder="Item name"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[var(--foreground)]">
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
              className="mt-1 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              placeholder="Add details (quantity, size, color, delivery city, preferred timeline)."
            />
            {errors.message && (
              <p id="message-error" className="mt-1 text-sm text-[var(--accent-deep)]" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          {sent && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Your order request is ready. Both channels were opened.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? "Opening..." : "Send order"}
          </button>
        </form>
      </div>
    </div>
  );
}
