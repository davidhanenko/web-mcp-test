import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article>
      <Link href={`/products/${product.id}`} className="group block">
        <div className="aspect-[4/5] w-full overflow-hidden bg-[#243044]">
          <img
            src={product.image}
            alt={product.name}
            width={480}
            height={600}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <h2 className="font-medium">{product.name}</h2>
          <p className="shrink-0 text-sm">{formatPrice(product.price)}</p>
        </div>
        <p className="text-sm capitalize text-[#1c2e24]/70">{product.category}</p>
      </Link>
    </article>
  );
}
