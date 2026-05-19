import type { LeadType } from '@prisma/client';

const userActionLeadTypes: LeadType[] = ['WHATSAPP_CLICK', 'PHONE_REVEAL', 'EMAIL_CLICK'];
const deduplicatedLeadTypes: LeadType[] = [
  'WHATSAPP_CLICK',
  'PHONE_REVEAL',
  'EMAIL_CLICK',
  'STORE_VIEW',
  'PRODUCT_VIEW',
];

export function isBillableLeadCandidate(type: LeadType): boolean {
  return userActionLeadTypes.includes(type);
}

export function shouldDeduplicateLead(type: LeadType): boolean {
  return deduplicatedLeadTypes.includes(type);
}
