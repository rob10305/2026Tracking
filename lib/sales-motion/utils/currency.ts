export function parseCurrency(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.\-]/g, '')) || 0;
}

export function formatCurrency(val: number): string {
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
