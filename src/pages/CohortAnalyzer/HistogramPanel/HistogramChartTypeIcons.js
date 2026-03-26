import React from 'react';
import { CHART_TYPE_KEYS } from './HistogramDatasetChart';

const stroke = '#5C5C5C';

export function ChartTypeIcon({ type, size = 20 }) {
  const s = size;
  switch (type) {
    case CHART_TYPE_KEYS.PIE:
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke={stroke} strokeWidth="1.2" fill="none" />
          <path d="M10 3 A7 7 0 0 1 17 10 L10 10 Z" fill={stroke} fillOpacity="0.35" stroke={stroke} strokeWidth="1" />
        </svg>
      );
    case CHART_TYPE_KEYS.VERTICAL_BAR:
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4 16V12M8 16V8M12 16V5M16 16V9"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M3 17H17" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case CHART_TYPE_KEYS.HORIZONTAL_BAR:
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 5H14M4 10H10M4 15H16" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 4V16" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case CHART_TYPE_KEYS.LINE:
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4 14 L8 10 L12 12 L16 6"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M3 17H17" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export const CHART_TYPE_OPTIONS = [
  { type: CHART_TYPE_KEYS.PIE, label: 'Pie chart' },
  { type: CHART_TYPE_KEYS.VERTICAL_BAR, label: 'Vertical bar chart' },
  { type: CHART_TYPE_KEYS.HORIZONTAL_BAR, label: 'Horizontal bar chart' },
  { type: CHART_TYPE_KEYS.LINE, label: 'Line chart' },
];
