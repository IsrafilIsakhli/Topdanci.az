'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { trackLeadEvent } from '../lib/lead-tracking';

type LeadEventType = 'WHATSAPP_CLICK' | 'PHONE_REVEAL' | 'STORE_VIEW' | 'PRODUCT_VIEW';

type LeadBaseProps = {
  storeId?: string | undefined;
  productId?: string | undefined;
  source?: string | undefined;
};

export function LeadViewTracker({ type, storeId, productId, source }: LeadBaseProps & { type: LeadEventType }) {
  useEffect(() => {
    if (!storeId) {
      return;
    }

    void trackLeadEvent({
      type,
      storeId,
      productId,
      source,
      anonymousId: getAnonymousId(),
    });
  }, [productId, source, storeId, type]);

  return null;
}

export function LeadWhatsAppLink({
  storeId,
  productId,
  phone,
  productTitle,
  storeName,
  className,
  source,
  children,
}: LeadBaseProps & {
  phone?: string | null | undefined;
  productTitle?: string | undefined;
  storeName?: string | undefined;
  className?: string | undefined;
  children?: ReactNode;
}) {
  const href = useMemo(() => buildWhatsappUrl(phone, productTitle, storeName), [phone, productTitle, storeName]);

  return (
    <a
      className={className}
      href={href}
      rel={href.startsWith('https://') ? 'noopener noreferrer' : undefined}
      target={href.startsWith('https://') ? '_blank' : undefined}
      onClick={() => {
        if (!storeId) {
          return;
        }

        void trackLeadEvent({
          type: 'WHATSAPP_CLICK',
          storeId,
          productId,
          source,
          anonymousId: getAnonymousId(),
        });
      }}
    >
      {children ?? (
        <>
          <MessageCircle size={17} />
          WhatsApp
        </>
      )}
    </a>
  );
}

export function PhoneRevealButton({
  storeId,
  productId,
  phone,
  className,
  source,
  children,
}: LeadBaseProps & {
  phone?: string | null | undefined;
  className?: string | undefined;
  children?: ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        setIsVisible(true);

        if (!storeId) {
          return;
        }

        void trackLeadEvent({
          type: 'PHONE_REVEAL',
          storeId,
          productId,
          source,
          anonymousId: getAnonymousId(),
        });
      }}
    >
      {isVisible ? (
        phone || 'Telefon mövcud deyil'
      ) : (
        children ?? (
          <>
            <Phone size={17} />
            Telefonu göstər
          </>
        )
      )}
    </button>
  );
}

function buildWhatsappUrl(phone?: string | null, productTitle?: string, storeName?: string): string {
  const digits = normalizePhone(phone);

  if (!digits) {
    const params = new URLSearchParams();
    if (storeName) params.set('store', storeName);
    if (productTitle) params.set('product', productTitle);
    return `/contact?${params.toString()}`;
  }

  const message = productTitle
    ? `Salam, TopdanBazar-da "${productTitle}" məhsulu ilə maraqlanıram.`
    : `Salam, TopdanBazar-da ${storeName ?? 'mağazanız'} ilə əlaqə saxlamaq istəyirəm.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function normalizePhone(phone?: string | null): string {
  if (!phone) {
    return '';
  }

  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('00') ? digits.slice(2) : digits;
}

function getAnonymousId(): string {
  const key = 'tb_anon_id';

  try {
    const existing = window.localStorage.getItem(key);
    if (existing) {
      return existing;
    }

    const created = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(key, created);
    return created;
  } catch {
    return `anon-${Date.now()}`;
  }
}
