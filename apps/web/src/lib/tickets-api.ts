import { apiGet, apiPatch, apiPost } from './api-client';

export const ticketStatuses = {
  OPEN: 'Açıq',
  IN_PROGRESS: 'İcradadır',
  WAITING_SELLER: 'Mağazadan cavab gözlənilir',
  WAITING_SUPPORT: 'Dəstəkdən cavab gözlənilir',
  CLOSED: 'Bağlı',
} as const;
export const ticketReasons = {
  TECHNICAL: 'Texniki problem',
  STORE_PROFILE: 'Mağaza profili',
  PRODUCT_REVIEW: 'Məhsul yoxlaması',
  COMPLAINT: 'Şikayət',
  ACCOUNT: 'Hesab və giriş',
  OTHER: 'Digər',
} as const;
export const ticketPriorities = {
  LOW: 'Aşağı',
  NORMAL: 'Normal',
  HIGH: 'Yüksək',
  URGENT: 'Təcili',
} as const;
export type TicketStatus = keyof typeof ticketStatuses;
export type TicketReason = keyof typeof ticketReasons;
export type TicketPriority = keyof typeof ticketPriorities;
type Person = { id: string; fullName?: string | null; role: string };
export type TicketMessage = {
  id: string;
  body: string;
  kind: 'MESSAGE' | 'SYSTEM';
  authorRole: string;
  author?: Person | null;
  createdAt: string;
};
export type Ticket = {
  id: string;
  number: number;
  subject: string;
  reason: TicketReason;
  priority: TicketPriority;
  status: TicketStatus;
  version: number;
  assigneeId?: string | null;
  creator?: Person | null;
  assignee?: Person | null;
  store: { id: string; name: string; city: string; slug: string };
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  _count: { messages: number };
  messages?: TicketMessage[];
};
export type TicketList = {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    counts: Record<TicketStatus, number>;
  };
};
export type TicketDetail = {
  data: Ticket & { messages: TicketMessage[] };
  meta: { nextCursor: string | null };
};
export type TicketUpdate = {
  version: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  claim?: boolean;
  message?: string;
};
const endpoint = (admin: boolean) => `${admin ? '/admin' : '/seller'}/tickets`;
export function listTickets(
  admin: boolean,
  params: { page: number; q?: string; status?: string; reason?: string; priority?: string },
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== undefined) query.set(key, String(value));
  });
  return apiGet<TicketList>(`${endpoint(admin)}?${query}`);
}
export const getTicket = (admin: boolean, id: string) =>
  apiGet<TicketDetail>(`${endpoint(admin)}/${encodeURIComponent(id)}`);
export const getOlderTicketMessages = (admin: boolean, id: string, cursor: string) =>
  apiGet<{ data: TicketMessage[]; meta: { nextCursor: string | null } }>(
    `${endpoint(admin)}/${encodeURIComponent(id)}/messages?${new URLSearchParams({ cursor })}`,
  );
export const createTicket = (payload: {
  storeId: string;
  subject: string;
  reason: TicketReason;
  priority: TicketPriority;
  message: string;
}) => apiPost<{ data: Ticket }>('/seller/tickets', payload);
export const replyToTicket = (admin: boolean, id: string, message: string, version: number) =>
  apiPost<TicketDetail>(`${endpoint(admin)}/${encodeURIComponent(id)}/messages`, {
    message,
    version,
  });
export const updateTicket = (admin: boolean, id: string, payload: TicketUpdate) =>
  apiPatch<TicketDetail>(`${endpoint(admin)}/${encodeURIComponent(id)}`, payload);
