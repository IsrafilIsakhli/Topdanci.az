const fallbackSiteUrl = 'https://topdanci-az.vercel.app';

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;
  return value.replace(/\/+$/, '');
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
