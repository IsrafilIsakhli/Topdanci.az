'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight, CheckCircle2, Circle } from 'lucide-react';

export type OnboardingStep = {
  key: string;
  label: string;
  completed: boolean;
  href: string;
};

type OnboardingRingProps = {
  completed: number;
  total: number;
  percentage: number;
  steps: OnboardingStep[];
};

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Radial (dairəvi) mağaza tamamlanma üzüyü + addım siyahısı. */
export function OnboardingRing({ completed, total, percentage, steps }: OnboardingRingProps) {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  const targetOffset = CIRCUMFERENCE * (1 - safePercentage / 100);

  return (
    <div className="dash2-onboard">
      <div className="dash2-onboard-ring">
        <svg viewBox="0 0 128 128" role="img" aria-label={`Mağaza profili ${safePercentage}% tamamlandı`}>
          <defs>
            <linearGradient id="tb-ring-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <circle className="dash2-ring-track" cx="64" cy="64" fill="none" r={RADIUS} strokeWidth="10" />
          <circle
            className="dash2-ring-value"
            cx="64"
            cy="64"
            fill="none"
            r={RADIUS}
            stroke="url(#tb-ring-gradient)"
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            strokeWidth="10"
            style={{ '--ring-target': targetOffset } as CSSProperties}
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div className="dash2-ring-label">
          <strong>{safePercentage}%</strong>
          <span>
            {completed}/{total} addım
          </span>
        </div>
      </div>

      <ul className="dash2-onboard-steps">
        {steps.map((step) => (
          <li key={step.key}>
            <Link className={step.completed ? 'is-done' : ''} href={step.href}>
              {step.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              <span>{step.label}</span>
              {step.completed ? null : <ArrowUpRight size={14} />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
