import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/AddToCartForm";
import { getAllProducts, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ id: product.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <article className="grid gap-10 md:grid-cols-2">
      <div className="aspect-[4/5] w-full overflow-hidden bg-[#243044]">
        <img
          src={product.image}
          alt={product.name}
          width={480}
          height={600}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="text-sm capitalize text-[#1c2e24]/70">{product.category}</p>
        <h1 className="mt-1 font-serif text-4xl">{product.name}</h1>
        <p className="mt-3 text-xl">{formatPrice(product.price)}</p>
        <p className="mt-4 max-w-md leading-7">{product.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {product.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-[#1c2e24]/15 px-3 py-1"
            >
              {tag}
            </li>
          ))}
        </ul>
        <AddToCartForm product={product} />
      </div>
    </article>
  );
}
