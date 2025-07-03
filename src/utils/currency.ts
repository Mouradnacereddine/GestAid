export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2, // Toujours deux décimales
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback to simple formatting if currency code is invalid
    return `${amount.toLocaleString()} ${currency}`;
  }
}
