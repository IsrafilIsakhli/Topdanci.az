export type CursorPaginationQuery = {
  cursor?: string;
  limit?: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
};

export const DEFAULT_PAGE_LIMIT = 24;
export const MAX_PAGE_LIMIT = 100;

export function normalizeLimit(limit: number | undefined): number {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_PAGE_LIMIT;
  }

  return Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
}

