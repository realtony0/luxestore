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

const COUNTRIES = [
  { name: "Liberia", code: "LR", dial: "+231" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "United Kingdom", code: "UK", dial: "+44" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Sierra Leone", code: "SL", dial: "+232" },
  { name: "Guinea", code: "GN", dial: "+224" },
  { name: "Ivory Coast", code: "CI", dial: "+225" },
  { name: "Senegal", code: "SN", dial: "+221" },
  { name: "Cameroon", code: "CM", dial: "+237" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "India", code: "IN", dial: "+91" },
];

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  zipCode?: string;
  address1?: string;
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Liberia");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [article, setArticle] = useState(() => {
    const value = searchParams.get("article");
    return value ? decodeURIComponent(value) : "";
  });
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const hasCartItems = hydrated && items.length > 0;

  const selectedCountry = COUNTRIES.find((c) => c.name === location) || COUNTRIES[0];

  const cartLabel = useMemo(() => {
    if (!hasCartItems) return "";
    return `${itemCount} item${itemCount > 1 ? "s" : ""} - ${formatPrice(subtotal)}`;
  }, [hasCartItems, itemCount, subtotal]);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!firstName.trim()) next.firstName = "First name is required.";
    else if (firstName.trim().length < 2) next.firstName = "At least 2 characters.";

    if (!lastName.trim()) next.lastName = "Last name is required.";
    else if (lastName.trim().length < 2) next.lastName = "At least 2 characters.";

    if (email.trim() && !emailRegex.test(email.trim())) next.email = "Invalid email.";

    if (!phone.trim()) next.phone = "Phone number is required.";
    else if (!phoneRegex.test(phone.trim())) next.phone = "Invalid phone number.";

    if (!city.trim()) next.city = "City is required.";

    if (!zipCode.trim()) next.zipCode = "Post/Zip code is required.";

    if (!address1.trim()) next.address1 = "Address is required.";

    if (!message.trim()) next.message = "Message is required.";
    else if (message.trim().length < 8) next.message = "Minimum 8 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function composeOrderMessage(): string {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const fullPhone = `${selectedCountry.dial} ${phone.trim()}`;
    const fullAddress = [
      address1.trim(),
      address2.trim(),
      city.trim(),
      stateProvince.trim(),
      zipCode.trim(),
      location,
    ]
      .filter(Boolean)
      .join(", ");

    const lines = [
      "Hello Luxe Store,",
      "",
      "I would like to place an order.",
      "",
      `Name: ${fullName}`,
      `Email: ${email.trim() || "Not provided"}`,
      `Phone: ${fullPhone}`,
      "",
      "Shipping Address:",
      `${fullAddress}`,
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

  const inputClass =
    "mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20";
  const labelClass = "block text-sm font-medium text-[var(--foreground)]";
  const errorClass = "mt-1 text-sm text-[var(--accent-deep)]";

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
                href="/cart"
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
          {/* Shipping Address Section */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Shipping Address</h2>

            {/* Location */}
            <div>
              <label htmlFor="location" className={labelClass}>
                Location *
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass + " appearance-none cursor-pointer"}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* First Name / Last Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClass}>
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  aria-invalid={errors.firstName ? "true" : "false"}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  className={inputClass}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p id="firstName-error" className={errorClass} role="alert">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className={labelClass}>
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  aria-invalid={errors.lastName ? "true" : "false"}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  className={inputClass}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p id="lastName-error" className={errorClass} role="alert">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Number with country code */}
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number *
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--muted)]">
                  {selectedCountry.code} {selectedCountry.dial}
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className="w-full rounded-r-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                  placeholder="Phone number"
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">Need Correct Phone Number for delivery.</p>
              {errors.phone && (
                <p id="phone-error" className={errorClass} role="alert">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* City / State */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className={labelClass}>
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  aria-invalid={errors.city ? "true" : "false"}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  className={inputClass}
                  placeholder="City"
                />
                {errors.city && (
                  <p id="city-error" className={errorClass} role="alert">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="stateProvince" className={labelClass}>
                  State/Province (Optional)
                </label>
                <input
                  id="stateProvince"
                  type="text"
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  className={inputClass}
                  placeholder="State or province"
                />
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zipCode" className={labelClass}>
                Post/Zip Code *
              </label>
              <input
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                aria-invalid={errors.zipCode ? "true" : "false"}
                aria-describedby={errors.zipCode ? "zipCode-error" : undefined}
                className={inputClass}
                placeholder="Postal or zip code"
              />
              {errors.zipCode && (
                <p id="zipCode-error" className={errorClass} role="alert">
                  {errors.zipCode}
                </p>
              )}
            </div>

            {/* Address Line 1 / Address Line 2 */}
            <div>
              <label htmlFor="address1" className={labelClass}>
                Address Line 1 *
              </label>
              <input
                id="address1"
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                required
                aria-invalid={errors.address1 ? "true" : "false"}
                aria-describedby={errors.address1 ? "address1-error" : undefined}
                className={inputClass}
                placeholder="Street address"
              />
              {errors.address1 && (
                <p id="address1-error" className={errorClass} role="alert">
                  {errors.address1}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="address2" className={labelClass}>
                Address Line 2
              </label>
              <input
                id="address2"
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className={inputClass}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
          </div>

          {/* Email (optional) */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClass}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p id="email-error" className={errorClass} role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Item field when cart is empty */}
          {!hasCartItems && (
            <div>
              <label htmlFor="article" className={labelClass}>
                Item
              </label>
              <input
                id="article"
                type="text"
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                className={inputClass}
                placeholder="Item name"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label htmlFor="message" className={labelClass}>
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={inputClass + " resize-y"}
              placeholder="Additional details (quantity, size, color, preferred timeline)."
            />
            {errors.message && (
              <p id="message-error" className={errorClass} role="alert">
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
