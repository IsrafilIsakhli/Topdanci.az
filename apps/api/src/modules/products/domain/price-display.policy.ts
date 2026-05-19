import type { PriceType } from '@prisma/client';

type PriceDisplayInput = {
  price: string | number | null;
  priceType: PriceType;
  currency?: string;
};

export function formatLeadMarketplacePrice(input: PriceDisplayInput): string {
  if (input.priceType === 'NEGOTIABLE' || input.price === null) {
    return 'Razılaşma yolu ilə';
  }

  return `${input.price} ${input.currency ?? 'AZN'}`;
}
