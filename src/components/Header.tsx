"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCartUi } from "@/lib/cart-ui";

export function Header() {
  const openCart = useCartUi((s) => s.open);
  const count = useCart((s) => s.items.reduce((sum, line) => sum + line.qty, 0));

  return (
    <header className="border-b border-[#d7c4a3]/30 bg-[#1c2e24] text-[#f7f1e6]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-serif text-xl tracking-wide">
          Northline Supply
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Shop
          </Link>
          <Link href="/support" className="hover:underline">
            Support
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-10 items-center gap-2 rounded-sm border border-[#d7c4a3]/50 px-3 hover:bg-white/5"
            aria-label="Open cart"
          >
            Cart
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#d7c4a3] px-1 text-xs font-semibold text-[#1c2e24]">
              {count}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
