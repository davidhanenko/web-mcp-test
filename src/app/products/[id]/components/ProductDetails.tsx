import { getProductDetails } from "@/lib/product-details";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span aria-hidden className="tracking-[0.15em] text-accent">
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function ProductDetails({ productId }: { productId: string }) {
  const details = getProductDetails(productId);
  if (!details) return null;

  return (
    <div className="mt-14 grid gap-10 border-t border-line/70 pt-10 lg:grid-cols-2 lg:gap-12">
      <section aria-labelledby="specs-heading">
        <h2 id="specs-heading" className="label-caps">
          Specs
        </h2>
        <dl className="mt-4 divide-y divide-line/70 border-y border-line/70">
          {details.specs.map((spec) => (
            <div key={spec.label} className="flex justify-between gap-6 py-3">
              <dt className="text-muted">{spec.label}</dt>
              <dd className="text-right font-semibold">{spec.value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-6 py-3">
            <dt className="text-muted">Fit</dt>
            <dd className="text-right font-semibold capitalize">
              {details.fit}, based on reviews
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="label-caps">
          Reviews
        </h2>
        <p className="mt-4 flex items-center gap-3">
          <Stars rating={details.rating} />
          <span className="font-semibold">
            {details.rating.toFixed(1)} out of 5
          </span>
          <span className="text-muted">({details.reviewCount} reviews)</span>
        </p>
        <ul className="mt-4 divide-y divide-line/70 border-y border-line/70">
          {details.reviews.map((review) => (
            <li key={review.author} className="py-4">
              <p className="font-bold">{review.title}</p>
              <p className="mt-1 leading-7">{review.text}</p>
              <p className="mt-1 text-sm text-muted">{review.author}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
