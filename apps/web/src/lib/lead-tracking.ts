import { apiPost } from './api-client';

type LeadEventPayload = {
  type: 'WHATSAPP_CLICK' | 'PHONE_REVEAL' | 'EMAIL_CLICK' | 'STORE_VIEW' | 'PRODUCT_VIEW';
  storeId: string;
  productId?: string | undefined;
  source?: string | undefined;
  anonymousId?: string | undefined;
};

export async function trackLeadEvent(payload: LeadEventPayload): Promise<void> {
  try {
    await apiPost('/leads', payload);
  } catch {
    // Lead tracking must never block the buyer from contacting the seller.
  }
}
