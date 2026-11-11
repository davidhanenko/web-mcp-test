"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { CenteredMessage } from "@/app/checkout/components/CenteredMessage";
import { ColorSwatch } from "@/app/components/ColorSwatch";
import { useIsSavedCartLoaded } from "@/hooks/useIsSavedCartLoaded";
import { useCartDetails } from "@/hooks/useCartDetails";
import { formatPrice } from "@/lib/format";
import {
  normalizePromoCode,
  payTotal,
  PROMO_CODE,
  promoDiscount,
} from "@/lib/promo";
import { useAgentCartChanges } from "@/stores/agent-cart-changes";
import { useCartDrawer } from "@/stores/cart-drawer";
import { saveAppliedCode, useMarketing } from "@/stores/marketing";
import { useOrder } from "@/stores/order";

type Errors = Record<string, string>;

const REQUIRED: Record<string, string> = {
  email: "Enter your email.",
  "first-name": "Enter your first name.",
  "last-name": "Enter your last name.",
  address: "Enter your address.",
  city: "Enter your city.",
  state: "Enter your state.",
  zip: "Enter your ZIP code.",
  phone: "Enter your phone number.",
  "card-number": "Enter your card number.",
  "card-expiry": "Enter the expiration date.",
  "card-cvc": "Enter the security code.",
  "card-name": "Enter the name on the card.",
};

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

// Basic checks only. Nothing here is sent anywhere.
function validate(data: FormData): Errors {
  const value = (name: string) => String(data.get(name) ?? "").trim();
  const errors: Errors = {};
  for (const name of Object.keys(REQUIRED)) {
    if (!value(name)) errors[name] = REQUIRED[name];
  }

  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) {
    errors.email = "Enter a valid email address.";
  }
  if (!errors.zip && !/^\d{5}(-\d{4})?$/.test(value("zip"))) {
    errors.zip = "Enter a 5-digit ZIP code.";
  }
  if (!errors.phone && value("phone").replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a 10-digit phone number.";
  }
  if (!errors["card-number"]) {
    const digits = value("card-number").replace(/[\s-]/g, "");
    if (!/^\d{13,19}$/.test(digits) || !luhn(digits)) {
      errors["card-number"] = "Enter a valid card number.";
    }
  }
  if (!errors["card-expiry"]) {
    const match = value("card-expiry").match(/^(\d{2})\s*\/?\s*(\d{2})$/);
    const month = match ? Number(match[1]) : 0;
    const year = match ? 2000 + Number(match[2]) : 0;
    const now = new Date();
    const expired =
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1);
    if (!match || month < 1 || month > 12) {
      errors["card-expiry"] = "Use the format MM / YY.";
    } else if (expired) {
      errors["card-expiry"] = "This card has expired.";
    }
  }
  if (!errors["card-cvc"] && !/^\d{3,4}$/.test(value("card-cvc"))) {
    errors["card-cvc"] = "Enter the 3 or 4 digit code.";
  }
  return errors;
}

function Field({
  label,
  name,
  error,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id">) {
  const id = `checkout-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
        className={`h-12 w-full rounded-md border bg-white px-3 placeholder:text-muted ${error ? "border-red-600" : "border-line"}`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-white"
    >
      {n}
    </span>
  );
}

export function CheckoutClient() {
  const { items, total, totalQuantity } = useCartDetails();
  const router = useRouter();
  const openCart = useCartDrawer((s) => s.open);
  const isSavedCartLoaded = useIsSavedCartLoaded();
  const marketing = useMarketing();
  const [codeDraft, setCodeDraft] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [isPaying, setIsPaying] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const payTimer = useRef<number | undefined>(undefined);
  const codeValue = codeDraft ?? (marketing.ready ? marketing.appliedCode : "");
  const discount = promoDiscount(items, marketing.appliedCode);
  const due = payTotal(total, discount);
  const codeApplied = normalizePromoCode(marketing.appliedCode) === PROMO_CODE;

  function applyPromo(event: FormEvent) {
    event.preventDefault();
    const next = normalizePromoCode(codeValue);
    if (!next) {
      saveAppliedCode("");
      setCodeDraft("");
      setCodeError(null);
      return;
    }
    if (next !== PROMO_CODE) {
      setCodeError(
        "That code isn't valid.",
      );
      return;
    }
    saveAppliedCode(PROMO_CODE);
    setCodeDraft(PROMO_CODE);
    setCodeError(null);
  }

  function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPaying) return;
    const form = event.currentTarget;
    const found = validate(new FormData(form));
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      form.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // Mock: nothing is charged and the card details are not kept. After a short wait the
    // cart becomes an order, the same way the old Place order button worked.
    setIsPaying(true);
    payTimer.current = window.setTimeout(() => {
      setIsPlaced(true);
      const result = useOrder.getState().placeOrder();
      if (result && "error" in result) {
        setIsPlaced(false);
        setIsPaying(false);
        return;
      }
      router.replace("/checkout/confirmation");
    }, 1800);
  }

  useEffect(() => () => window.clearTimeout(payTimer.current), []);

  // Changes the agent made before this page opened are already in what the customer sees.
  // Only changes made while the customer is reviewing need a notice.
  const cartChangedByAgent = useAgentCartChanges((s) => s.count > s.countAtCheckoutOpen);

  // With cacheComponents, Next keeps this page hidden after the customer leaves instead of
  // unmounting it, and runs this effect again when they come back.
  // https://nextjs.org/docs/app/guides/preserving-ui-state#resetting-stale-status-messages
  useLayoutEffect(() => {
    useAgentCartChanges.getState().markCheckoutOpened();
  }, []);

  if (!isSavedCartLoaded || isPlaced) {
    // Reserve the page height until the saved cart is read, avoiding a flash of the empty state.
    return (
      <div className="min-h-[480px]">
        <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <CenteredMessage
        title="Your cart is empty"
        body="Add something from the shop, then come back here to place your order."
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_420px] lg:gap-12">
        <form
          id="payment-form"
          aria-label="Checkout"
          noValidate
          onSubmit={pay}
          className="space-y-10"
        >
          <fieldset className="space-y-4">
            <legend className="mb-4 flex items-center gap-3 text-xl font-bold">
              <StepNumber n={1} /> Contact
            </legend>
            <Field label="Email" name="email" error={errors["email"]} type="email" autoComplete="email" />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 flex items-center gap-3 text-xl font-bold">
              <StepNumber n={2} /> Shipping address
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" name="first-name" error={errors["first-name"]} autoComplete="given-name" />
              <Field label="Last name" name="last-name" error={errors["last-name"]} autoComplete="family-name" />
            </div>
            <Field label="Address" name="address" error={errors["address"]} autoComplete="address-line1" />
            <Field
              label="Apartment, suite, etc. (optional)"
              name="address2"
              autoComplete="address-line2"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" name="city" error={errors["city"]} autoComplete="address-level2" />
              <Field label="State" name="state" error={errors["state"]} autoComplete="address-level1" />
              <Field label="ZIP code" name="zip" error={errors["zip"]} autoComplete="postal-code" />
            </div>
            <Field label="Phone" name="phone" error={errors["phone"]} type="tel" autoComplete="tel" />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 flex items-center gap-3 text-xl font-bold">
              <StepNumber n={3} /> Delivery method
            </legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-ink px-4 py-4">
              <input
                type="radio"
                name="delivery"
                value="standard"
                defaultChecked
                className="h-5 w-5 accent-ink"
              />
              <span className="flex-1">
                <span className="block font-semibold">Standard shipping</span>
                <span className="block text-sm text-muted">5–7 business days</span>
              </span>
              <span className="font-semibold">Free</span>
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 flex items-center gap-3 text-xl font-bold">
              <StepNumber n={4} /> Payment
            </legend>
            <Field
              label="Card number"
              name="card-number" error={errors["card-number"]}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Expiration (MM / YY)"
                name="card-expiry" error={errors["card-expiry"]}
                autoComplete="cc-exp"
                placeholder="MM / YY"
              />
              <Field
                label="Security code"
                name="card-cvc" error={errors["card-cvc"]}
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </div>
            <Field label="Name on card" name="card-name" error={errors["card-name"]} autoComplete="cc-name" />
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="billing-same"
                defaultChecked
                className="h-5 w-5 accent-ink"
              />
              Billing address is the same as shipping
            </label>
          </fieldset>

          <div>
            <button
              type="submit"
              disabled={isPaying}
              className="h-14 w-full rounded-md bg-accent text-lg font-bold text-ink hover:bg-accent-hover disabled:opacity-60 sm:w-auto sm:px-12"
            >
              {isPaying ? "Processing payment…" : "Pay now"}
            </button>
            {Object.keys(errors).length > 0 ? (
              <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
                Check the highlighted fields and try again.
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              By paying, you agree to the Northline Supply terms of sale.
            </p>
          </div>
        </form>

        <aside
          aria-labelledby="summary-heading"
          className="self-start rounded-lg bg-panel p-8 lg:sticky lg:top-6"
        >
          <h2
            id="summary-heading"
            className="border-b border-line pb-5 text-sm font-bold tracking-[0.14em] uppercase [font-stretch:115%]"
          >
            Order summary ({totalQuantity})
          </h2>
          <ul>
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex items-center gap-4 border-b border-line/70 py-4"
              >
                <Image
                  src={item.image}
                  alt=""
                  width={600}
                  height={600}
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-muted">
                    <ColorSwatch hex={item.colorHex} size={12} /> {item.colorName}{" "}
                    · Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-bold">
                  {formatPrice(item.subtotal, { cents: true })}
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={openCart}
            className="mt-4 text-sm font-semibold underline underline-offset-2"
          >
            Edit cart
          </button>

          <form onSubmit={applyPromo} className="mt-6">
            <label htmlFor="promo-code" className="label-caps mb-2 block">
              Promo code
            </label>
            <div className="flex gap-2">
              <input
                id="promo-code"
                value={codeValue}
                onChange={(event) => {
                  setCodeDraft(event.target.value);
                  setCodeError(null);
                }}
                autoComplete="off"
                className="h-12 min-w-0 flex-1 rounded-md border border-line bg-white px-3"
              />
              <button
                type="submit"
                className="h-12 rounded-md border border-ink bg-white px-4 font-semibold hover:bg-ink hover:text-white"
              >
                Apply
              </button>
            </div>
            <p role="status" className="mt-2 min-h-6 text-sm">
              {codeError
                ? codeError
                : codeApplied && discount === 0
                  ? `${PROMO_CODE} applies to the Ember Down Jacket.`
                  : null}
            </p>
          </form>

          <div className="mt-4 space-y-3">
            <p className="flex items-baseline justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">
                {formatPrice(total, { cents: true })}
              </span>
            </p>
            <p className="flex items-baseline justify-between">
              <span>Shipping</span>
              <span className="font-semibold">Free</span>
            </p>
            {codeApplied && discount > 0 ? (
              <>
                <p className="flex items-baseline justify-between">
                  <span>Promo {PROMO_CODE}</span>
                  <span className="font-semibold">
                    −{formatPrice(discount, { cents: true })}
                  </span>
                </p>
                <p className="flex items-baseline justify-between border-t border-line pt-4">
                  <span className="text-lg font-semibold">Pay total</span>
                  <span className="text-4xl font-extrabold [font-stretch:110%]">
                    {formatPrice(due, { cents: true })}
                  </span>
                </p>
              </>
            ) : (
              <p className="flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-4xl font-extrabold [font-stretch:110%]">
                  {formatPrice(total, { cents: true })}
                </span>
              </p>
            )}
          </div>
          <div
            // Always rendered, so screen readers announce the notice when it appears.
            role="status"
          >
            {cartChangedByAgent ? (
              <p className="mt-6 rounded-md border border-ink bg-white px-4 py-3 font-semibold">
                Your cart was changed. Check it before paying.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
