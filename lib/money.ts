export function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(cents / 100);
}

export function parseCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) {
    return 0;
  }
  return Math.round(amount * 100);
}
