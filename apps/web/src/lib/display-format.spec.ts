import { describe, expect, it } from 'vitest';
import { formatDateTime, formatDayLabel, formatLongDate, percentage } from './display-format';

describe('display formatting', () => {
  it('formats Azerbaijani dates without depending on translated ICU month names', () => {
    expect(formatDateTime('2026-10-08T01:43:00Z')).toBe('08.10.2026 05:43');
    expect(formatDayLabel('2026-10-08T01:43:00Z')).toBe('08.10');
    expect(formatLongDate('2026-10-08T01:43:00Z')).toBe('8 oktyabr 2026');
    expect(formatDateTime('invalid')).toBe('-');
  });
  it('does not draw positive bars for zero values', () => {
    expect(percentage(0, 4)).toBe(0);
    expect(percentage(1, 4)).toBe(25);
    expect(percentage(0, 0)).toBe(0);
    expect(percentage(-1, 4)).toBe(0);
    expect(percentage(8, 4)).toBe(100);
  });
});
