"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon, LogoMark } from "@/app/components/icons";
import { getTotalQuantity } from "@/lib/cart";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";

const NAV = [
  { href: "/", label: "Shop", match: (p: string) => p === "/" || p.startsWith("/products") },
  { href: "/support", label: "Support", match: (p: string) => p.startsWith("/support") },
];

export function Header() {
  const pathname = usePathname();
  const openCart = useCartDrawer((s) => s.open);
  const totalQuantity = useCart((s) => getTotalQuantity(s.items));

  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="text-accent" />
          <span className="font-display sr-only text-xl tracking-[0.04em] sm:not-sr-only">
            Northline Supply
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 sm:gap-8">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 py-1 font-medium ${
                  active
                    ? "border-accent text-white"
                    : "border-transparent text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={openCart}
            className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-3 font-bold sm:gap-2.5 sm:px-4 text-ink hover:bg-accent-hover"
          >
            <CartIcon />
            <span>Cart</span>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-bold text-white tabular-nums">
              {totalQuantity}
            </span>
            <span className="sr-only">items</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
