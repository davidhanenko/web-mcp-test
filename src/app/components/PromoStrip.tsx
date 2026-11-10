import { PROMO_CODE } from "@/lib/promo";

export function PromoStrip() {
  return (
    <div className="bg-accent text-ink">
      <p className="mx-auto max-w-7xl px-6 py-2.5 text-center text-sm font-semibold lg:px-8">
        {PROMO_CODE}: $30 off each Ember Down Jacket. $169, less than the
        Granite Insulated Jacket at $175, and warmer.
      </p>
    </div>
  );
}
