const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

function dateParts(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  const parts = dateParts(value);
  return parts ? `${parts.day}.${parts.month}.${parts.year} ${parts.hour}:${parts.minute}` : '-';
}

export function formatDayLabel(value: string | Date): string {
  const parts = dateParts(value);
  return parts ? `${parts.day}.${parts.month}` : '-';
}

export function formatLongDate(value: string | Date): string {
  const parts = dateParts(value);
  return parts ? `${Number(parts.day)} ${months[Number(parts.month) - 1]} ${parts.year}` : '-';
}

export function percentage(value: number, total: number): number {
  return total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;
}
