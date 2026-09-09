'use client';

import { useId } from 'react';

export type LeadActivityPoint = {
  label: string;
  value: number;
};

type LeadActivityChartProps = {
  points: LeadActivityPoint[];
};

const WIDTH = 640;
const HEIGHT = 232;
const PADDING_X = 40;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 34;

/**
 * Xüsusi SVG area qrafik — heç bir qrafik kitabxanası olmadan,
 * gradient dolgu + animasiyalı çəkiliş ilə son 7 günün lead axını.
 */
export function LeadActivityChart({ points }: LeadActivityChartProps) {
  const rawId = useId();
  const gradientId = `tb-lead-grad-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (points.length === 0) {
    return null;
  }

  const maxValue = Math.max(...points.map((point) => point.value), 4);
  const innerWidth = WIDTH - PADDING_X * 2;
  const innerHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const baseY = PADDING_TOP + innerHeight;

  const coords = points.map((point, index) => ({
    label: point.label,
    value: point.value,
    x: PADDING_X + index * step,
    y: baseY - (point.value / maxValue) * innerHeight,
  }));

  const start = coords[0];
  const end = coords[coords.length - 1];
  if (!start || !end) {
    return null;
  }

  let linePath = '';
  coords.forEach((coord, index) => {
    if (index === 0) {
      linePath = `M ${coord.x} ${coord.y}`;
      return;
    }
    const previous = coords[index - 1];
    if (!previous) {
      return;
    }
    const midX = (previous.x + coord.x) / 2;
    linePath += ` C ${midX} ${previous.y}, ${midX} ${coord.y}, ${coord.x} ${coord.y}`;
  });

  const areaPath = `${linePath} L ${end.x} ${baseY} L ${start.x} ${baseY} Z`;

  return (
    <svg
      className="dash2-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Son 7 günün lead hadisələri qrafiki"
    >
      <defs>
        <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.30)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = baseY - ratio * innerHeight;
        return (
          <g key={ratio}>
            <line className="dash2-chart-gridline" x1={PADDING_X} x2={WIDTH - PADDING_X} y1={y} y2={y} />
            <text className="dash2-chart-gridlabel" x={PADDING_X - 8} y={y + 3.5} textAnchor="end">
              {Math.round(maxValue * ratio)}
            </text>
          </g>
        );
      })}
      <line className="dash2-chart-baseline" x1={PADDING_X} x2={WIDTH - PADDING_X} y1={baseY} y2={baseY} />

      <path className="dash2-chart-area" d={areaPath} fill={`url(#${gradientId}-area)`} />
      <path
        className="dash2-chart-line"
        d={linePath}
        fill="none"
        pathLength={1}
        stroke={`url(#${gradientId}-line)`}
        strokeLinecap="round"
        strokeWidth={3}
      />

      {coords.map((coord) => (
        <g key={coord.label}>
          <circle
            className="dash2-chart-dot"
            cx={coord.x}
            cy={coord.y}
            r={4.5}
            style={{ animationDelay: `${900 + coords.indexOf(coord) * 90}ms` }}
          >
            <title>{`${coord.label}: ${coord.value} hadisə`}</title>
          </circle>
          <text className="dash2-chart-xlabel" textAnchor="middle" x={coord.x} y={HEIGHT - 10}>
            {coord.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
