import { PROMO_CODE } from "@/lib/promo";

export function PromoStrip() {
  return (
    <div className="bg-accent text-ink">
      <p className="mx-auto max-w-7xl px-6 py-2.5 text-center text-sm font-semibold lg:px-8">
        $30 off the Ember Down Jacket with code {PROMO_CODE}
      </p>
    </div>
  );
}
