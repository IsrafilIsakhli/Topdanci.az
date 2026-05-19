type ApiClientOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  credentials?: RequestCredentials;
  csrfToken?: string;
  headers?: HeadersInit;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiGet<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' }, options);
}

export async function apiPost<T>(path: string, body: unknown, options: ApiClientOptions = {}): Promise<T> {
  const csrfToken = options.csrfToken ?? getBrowserCookie('tb_csrf');

  return apiRequest<T>(
    path,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      },
      body: JSON.stringify(body),
    },
    options,
  );
}

async function apiRequest<T>(path: string, init: RequestInit, options: ApiClientOptions): Promise<T> {
  const baseUrl =
    options.baseUrl ??
    (typeof window === 'undefined' ? process.env.API_INTERNAL_BASE_URL : undefined) ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'http://localhost:4000/api/v1';
  const timeoutMs = options.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: mergeHeaders(options.headers, init.headers),
      credentials: options.credentials ?? 'include',
      signal: controller.signal,
      cache: 'no-store',
    });
    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new ApiClientError('API request failed', response.status, payload);
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  sources.forEach((source) => {
    if (!source) {
      return;
    }
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  });

  return headers;
}

function getBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  return document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}
