export type ApiMeta = {
  requestId?: string;
  total?: number;
  nextCursor?: string | null;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: ApiMeta;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
};
