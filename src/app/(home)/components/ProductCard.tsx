import Link from "next/link";
import { Badge } from "@/app/components/Badge";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function isSoldOut(product: Product): boolean {
  return product.sizes.every((size) => (product.stock[size] ?? 0) <= 0);
}

export function ProductCard({ product }: { product: Product }) {
  const waterproof = product.tags.includes("waterproof");
  const soldOut = isSoldOut(product);

  return (
    <article>
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <img
            src={product.image}
            alt=""
            width={600}
            height={600}
            className="h-full w-full object-cover transition duration-200 group-hover:brightness-95"
          />
          {waterproof || soldOut ? (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {waterproof ? <Badge tone="dark">Waterproof</Badge> : null}
              {soldOut ? <Badge tone="white">Sold out</Badge> : null}
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold group-hover:underline">
            {product.name}
          </h2>
          <p className="shrink-0 text-lg font-bold">
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="text-sm capitalize text-muted">{product.category}</p>
      </Link>
    </article>
  );
}
