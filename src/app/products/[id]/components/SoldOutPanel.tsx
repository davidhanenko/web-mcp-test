"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getSimilarProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import type { Product, Size } from "@/lib/types";

/**
 * Shown when the chosen color and size is sold out: a back-in-stock form and a few similar
 * products. The email is never stored or sent.
 */
export function SoldOutPanel({
  product,
  colorName,
  size,
}: {
  product: Product;
  colorName: string;
  size: Size;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const similar = getSimilarProducts(product, 3);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSent(true);
  }

  return (
    <section
      aria-label="Sold out options"
      className="space-y-6 rounded-lg bg-panel p-5"
    >
      {sent ? (
        <p role="status" className="font-semibold">
          Thanks. We will email you if {colorName} comes back in size {size}.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="notify-email" className="label-caps mb-2 block">
            Notify me when it is back
          </label>
          <div className="flex gap-2">
            <input
              id="notify-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              autoComplete="off"
              placeholder="you@example.com"
              className="h-12 min-w-0 flex-1 rounded-md border border-line bg-white px-3 placeholder:text-muted"
            />
            <button
              type="submit"
              className="h-12 rounded-md border border-ink bg-white px-4 font-semibold hover:bg-ink hover:text-white"
            >
              Notify me
            </button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-sm text-red-700">
            {error}
          </p>
        </form>
      )}

      {similar.length > 0 ? (
        <div>
          <h2 className="label-caps mb-3">Similar items</h2>
          <ul className="grid grid-cols-3 gap-3">
            {similar.map((item) => (
              <li key={item.id}>
                <Link href={`/products/${item.id}`} className="group block">
                  <Image
                    src={item.image}
                    alt=""
                    width={300}
                    height={300}
                    className="aspect-square w-full rounded-md object-cover group-hover:brightness-95"
                  />
                  <p className="mt-2 text-sm font-bold group-hover:underline">
                    {item.name}
                  </p>
                  <p className="text-sm text-muted">{formatPrice(item.price)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
