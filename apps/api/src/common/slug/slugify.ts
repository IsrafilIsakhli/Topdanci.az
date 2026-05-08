const transliterationMap: Record<string, string> = {
  ə: 'e',
  Ə: 'e',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ü: 'u',
  Ü: 'u',
  ş: 's',
  Ş: 's',
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
};

export function slugify(input: string): string {
  return input
    .split('')
    .map((char) => transliterationMap[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
