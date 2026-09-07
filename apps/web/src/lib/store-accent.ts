export type StoreAccent = { bg: string; fg: string };

const STORE_ACCENTS: StoreAccent[] = [
  { bg: '#0f5b3a', fg: '#ffffff' },
  { bg: '#1e3a8a', fg: '#ffffff' },
  { bg: '#7c2d92', fg: '#ffffff' },
  { bg: '#b54708', fg: '#ffffff' },
  { bg: '#0f766e', fg: '#ffffff' },
  { bg: '#be185d', fg: '#ffffff' },
  { bg: '#0369a1', fg: '#ffffff' },
  { bg: '#4d2c3a', fg: '#ffffff' },
];

export function storeAccent(slug: string): StoreAccent {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) & 0x7fffffff;
  }
  return STORE_ACCENTS[hash % STORE_ACCENTS.length]!;
}
