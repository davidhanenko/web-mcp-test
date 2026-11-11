"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartDetails } from "@/hooks/useCartDetails";
import { firstAvailableVariant, getProduct, getSuggestedProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/stores/cart";
import { useCartDrawer } from "@/stores/cart-drawer";
import { useToast } from "@/stores/toast";
import type { Category } from "@/lib/types";

/**
 * "You may also like" row in the cart drawer. Quick add puts the first color and size that
 * has stock in the cart, the way many stores do, without asking which one.
 */
export function CartSuggestions() {
  const { items } = useCartDetails();
  const addToCart = useCart((s) => s.addToCart);
  const close = useCartDrawer((s) => s.close);
  const showToast = useToast((s) => s.show);

  if (items.length === 0) return null;

  const inCart = [...new Set(items.map((item) => item.productId))];
  const categories = [
    ...new Set(
      inCart.flatMap((id) => {
        const product = getProduct(id);
        return product ? [product.category] : [];
      }),
    ),
  ] as Category[];
  const suggestions = getSuggestedProducts({
    categories,
    excludeIds: inCart,
    count: 3,
  });
  if (suggestions.length === 0) return null;

  function quickAdd(productId: string) {
    const product = getProduct(productId);
    const variant = product && firstAvailableVariant(product);
    if (!product || !variant) return;
    try {
      addToCart(product.id, variant.size, variant.colorId, 1);
      showToast(`Added ${product.name} to your cart.`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not add to cart.",
      );
    }
  }

  return (
    <section aria-labelledby="suggestions-heading" className="border-t border-line/70 px-6 py-5">
      <h3 id="suggestions-heading" className="label-caps mb-3">
        You may also like
      </h3>
      <ul className="grid grid-cols-3 gap-3">
        {suggestions.map((product) => (
          <li key={product.id} className="flex flex-col">
            <Link
              href={`/products/${product.id}`}
              onClick={close}
              className="group block"
            >
              <Image
                src={product.image}
                alt=""
                width={200}
                height={200}
                className="aspect-square w-full rounded-md object-cover group-hover:brightness-95"
              />
              <p className="mt-2 text-sm font-bold group-hover:underline">
                {product.name}
              </p>
            </Link>
            <p className="text-sm text-muted">{formatPrice(product.price)}</p>
            <button
              type="button"
              onClick={() => quickAdd(product.id)}
              className="mt-2 h-9 rounded-md border border-ink bg-white text-sm font-semibold hover:bg-ink hover:text-white"
            >
              Quick add<span className="sr-only"> {product.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
