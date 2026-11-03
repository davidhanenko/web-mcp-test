import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartForm } from "./components/AddToCartForm";
import { Badge } from "@/app/components/Badge";
import { getAllProducts, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ id: product.id }));
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-2 text-muted">
          <li>
            <Link href="/" className="underline underline-offset-2 hover:text-ink">
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/?category=${product.category}`}
              className="underline underline-offset-2 hover:text-ink"
            >
              {categoryLabel}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-semibold text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <article className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <div className="aspect-square w-full overflow-hidden rounded-lg">
          <img
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="max-w-xl">
          <ul className="flex flex-wrap gap-2" aria-label="Features">
            {product.tags.map((tag, index) => (
              <li key={tag}>
                <Badge tone={index === 0 ? "dark" : "light"}>{tag}</Badge>
              </li>
            ))}
          </ul>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl lg:text-[3.5rem]">
            {product.name}
          </h1>
          <p className="mt-5 text-3xl font-extrabold">
            {formatPrice(product.price)}
          </p>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            {product.description}
          </p>
          <AddToCartForm product={product} />
        </div>
      </article>
    </div>
  );
}
