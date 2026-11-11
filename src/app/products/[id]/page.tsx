import Link from "next/link";
import { notFound } from "next/navigation";
import { HiddenInjection } from "./components/HiddenInjection";
import { ProductDetails } from "./components/ProductDetails";
import { ProductView } from "./components/ProductView";
import { RelatedProducts } from "./components/RelatedProducts";
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
      <nav aria-label="Breadcrumb" className="mb-4 text-sm">
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

      <ProductView product={product}>
        <ul className="flex flex-wrap gap-2" aria-label="Features">
          {product.tags.map((tag, index) => (
            <li key={tag}>
              <Badge tone={index === 0 ? "dark" : "light"}>{tag}</Badge>
            </li>
          ))}
        </ul>
        <h1 className="font-display mt-3 text-3xl sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 text-2xl font-extrabold">
          {formatPrice(product.price)}
        </p>
        <p className="mt-3 text-base leading-7 text-slate-700">
          {product.description}
          <HiddenInjection productId={product.id} />
        </p>
      </ProductView>

      <ProductDetails productId={product.id} />
      <RelatedProducts product={product} />
    </div>
  );
}
