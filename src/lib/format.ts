export function formatPrice(
  amount: number,
  options: { cents?: boolean } = {},
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options.cents ? 2 : 0,
    maximumFractionDigits: options.cents ? 2 : 0,
  }).format(amount);
}
