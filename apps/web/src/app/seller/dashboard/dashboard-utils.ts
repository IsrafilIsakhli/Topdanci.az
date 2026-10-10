import type { LucideIcon } from 'lucide-react';
import { Eye, Mail, MessageSquare, Phone, Store } from 'lucide-react';
import type { SellerLead } from '../../../lib/seller-api';

export const leadLabels: Record<SellerLead['type'], string> = {
  PRODUCT_VIEW: 'Məhsul baxışı',
  STORE_VIEW: 'Mağaza baxışı',
  WHATSAPP_CLICK: 'WhatsApp klik',
  PHONE_REVEAL: 'Telefon göstərildi',
  EMAIL_CLICK: 'E-poçt klik',
};

export const statusLabels: Record<string, { label: string; tone: string }> = {
  ACTIVE: { label: 'Aktiv', tone: 'is-active' },
  PENDING_REVIEW: { label: 'Yoxlamada', tone: 'is-pending' },
  DRAFT: { label: 'Qaralama', tone: 'is-draft' },
  PASSIVE: { label: 'Passiv', tone: 'is-passive' },
  REJECTED: { label: 'Rədd edilib', tone: 'is-rejected' },
  DELETED: { label: 'Silinib', tone: 'is-rejected' },
};

export type DaySeries = { label: string; total: number; whatsapp: number };

/** Son 7 günü gün-gün qruplaşdırır (dashboard qrafiki üçün real məlumat). */
export function buildWeekSeries(leads: SellerLead[]): DaySeries[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));

    const dayLeads = leads.filter((lead) => {
      const created = new Date(lead.createdAt);
      return (
        created.getFullYear() === date.getFullYear() &&
        created.getMonth() === date.getMonth() &&
        created.getDate() === date.getDate()
      );
    });

    return {
      label: date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' }),
      total: dayLeads.length,
      whatsapp: dayLeads.filter((lead) => lead.type === 'WHATSAPP_CLICK').length,
    };
  });
}

export function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);

  if (minutes < 1) return 'indi';
  if (minutes < 60) return `${minutes} dəq əvvəl`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat əvvəl`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün əvvəl`;

  return new Date(iso).toLocaleDateString('az-AZ');
}

export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Sabahınız xeyir';
  if (hour >= 12 && hour < 18) return 'Gününüz yaxşı keçsin';
  return 'Axşamınız xeyir';
}

export function leadTone(type: SellerLead['type']): string {
  if (type === 'WHATSAPP_CLICK') return 'is-whatsapp';
  if (type === 'PHONE_REVEAL') return 'is-phone';
  if (type === 'EMAIL_CLICK') return 'is-email';
  if (type === 'STORE_VIEW') return 'is-store';
  return 'is-view';
}

export function leadIcon(type: SellerLead['type']): LucideIcon {
  if (type === 'WHATSAPP_CLICK') return MessageSquare;
  if (type === 'PHONE_REVEAL') return Phone;
  if (type === 'EMAIL_CLICK') return Mail;
  if (type === 'STORE_VIEW') return Store;
  return Eye;
}
