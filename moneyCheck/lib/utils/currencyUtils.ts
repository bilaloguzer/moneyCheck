// Currency formatting utilities for Turkish Lira (₺)

export function formatCurrency(amount: number, locale = 'tr-TR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrency(text: string): number | null {
  // Remove Turkish Lira symbol and common separators
  const cleaned = text.replace(/[₺TL\s]/g, '').replace(',', '.');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
}
