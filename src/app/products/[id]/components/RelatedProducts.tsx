import Image from "next/image";
import Link from "next/link";
import { getSimilarProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

// Cards only link; nothing is added from here.
export function RelatedProducts({ product }: { product: Product }) {
  const related = getSimilarProducts(product, 4);
  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="mt-14 border-t border-line/70 pt-10"
    >
      <h2 id="related-heading" className="label-caps">
        You may also like
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {related.map((item) => (
          <li key={item.id}>
            <Link href={`/products/${item.id}`} className="group block">
              <Image
                src={item.image}
                alt=""
                width={400}
                height={400}
                className="aspect-square w-full rounded-md object-cover group-hover:brightness-95"
              />
              <p className="mt-2 font-bold group-hover:underline">{item.name}</p>
              <p className="text-muted">{formatPrice(item.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
