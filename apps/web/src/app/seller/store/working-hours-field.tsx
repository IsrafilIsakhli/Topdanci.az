'use client';

import { useId, useState } from 'react';

export function WorkingHoursField({ label, value, onChange, wide = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  const id = useId();
  const [lastHours, setLastHours] = useState('09:00 - 18:00');
  const match = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/.exec(value);
  const closed = /^(bağlıdır|baglidir|closed)$/i.test(value.trim());
  const custom = !match && !closed && value !== '';

  return (
    <fieldset className={`hours-field dash2-field${wide ? ' is-wide' : ''}`}>
      <legend>{label}</legend>
      {custom ? (
        <input aria-label={`${label}: iş saatları`} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <div className="hours-times">
          <input type="time" aria-label={`${label}: açılış`} disabled={closed} value={match?.[1] ?? '09:00'}
            onChange={(event) => onChange(`${event.target.value} - ${match?.[2] ?? '18:00'}`)} />
          <span aria-hidden="true">-</span>
          <input type="time" aria-label={`${label}: bağlanış`} disabled={closed} value={match?.[2] ?? '18:00'}
            onChange={(event) => onChange(`${match?.[1] ?? '09:00'} - ${event.target.value}`)} />
        </div>
      )}
      <label className="hours-check" htmlFor={id}>
        <input id={id} type="checkbox" checked={closed} onChange={(event) => {
          if (event.target.checked) {
            setLastHours(value || '09:00 - 18:00');
            onChange('Bağlıdır');
          } else {
            onChange(lastHours);
          }
        }} />
        Bağlıdır
      </label>
    </fieldset>
  );
}
