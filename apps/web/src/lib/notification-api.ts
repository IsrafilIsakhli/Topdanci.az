import { apiGet, apiPatch, apiPost } from './api-client';

export type AppNotification = {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED';
  title: string;
  message: string;
  href?: string | null;
  metadata?: unknown;
  readAt?: string | null;
  createdAt: string;
};

export function getNotifications(limit = 12) {
  return apiGet<{ data: AppNotification[]; meta: { unreadCount: number } }>(`/notifications?limit=${limit}`);
}

export function markNotificationRead(id: string) {
  return apiPatch<{ data: AppNotification; changed: boolean }>(`/notifications/${encodeURIComponent(id)}/read`, {});
}

export function markAllNotificationsRead() {
  return apiPost<{ data: { updated: number } }>('/notifications/read-all', {});
}
