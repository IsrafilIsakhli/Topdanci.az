export type CursorPaginationInput = {
  cursor?: string;
  limit?: number;
};

export type CursorPagination = {
  take: number;
  cursor?: { id: string };
  skip?: 1;
};

export function toCursorPagination(input: CursorPaginationInput, defaultLimit = 24, maxLimit = 100): CursorPagination {
  const take = Math.min(Math.max(input.limit ?? defaultLimit, 1), maxLimit);

  if (!input.cursor) {
    return { take };
  }

  return {
    take,
    cursor: { id: input.cursor },
    skip: 1,
  };
}
