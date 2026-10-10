export function formatCount(value: number): string {
  if (value >= 1000) {
    return `${Math.floor(value / 1000)}K+`;
  }

  return String(value);
}

export function formatLeadPrice(price: string | number | null): string {
  if (price === null || price === '') {
    return 'Razilasma yolu ile';
  }

  return `${price} AZN`;
}
