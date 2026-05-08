import type { LeadType } from '@prisma/client';

const userActionLeadTypes: LeadType[] = ['WHATSAPP_CLICK', 'PHONE_REVEAL', 'EMAIL_CLICK'];

export function isBillableLeadCandidate(type: LeadType): boolean {
  return userActionLeadTypes.includes(type);
}

export function shouldDeduplicateLead(type: LeadType): boolean {
  return type === 'WHATSAPP_CLICK' || type === 'PHONE_REVEAL';
}
