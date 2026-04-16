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
        <svg
    width={26}
    height={26}
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_11685_48008)">
      <rect x={15.5} y={4.5} width={6} height={14} rx={1} fill="white" />
      <rect x={10.5} y={8.5} width={6} height={10} rx={1} fill="white" />
      <rect x={4.5} y={11.5} width={6} height={7} rx={1} fill="white" />
      <path
        d="M5.96364 19H20.0364C21.1196 19 22 18.1228 22 17.0435V5.95652C22 4.87717 21.1196 4 20.0364 4H17.0909C16.0076 4 15.1273 4.87717 15.1273 5.95652V7.26087H11.5273C10.444 7.26087 9.56364 8.13804 9.56364 9.21739V11.1739H5.96364C4.88036 11.1739 4 12.0511 4 13.1304V17.0435C4 18.1228 4.88036 19 5.96364 19ZM16.4364 5.95652C16.4364 5.59783 16.7309 5.30435 17.0909 5.30435H20.0364C20.3964 5.30435 20.6909 5.59783 20.6909 5.95652V17.0435C20.6909 17.4022 20.3964 17.6957 20.0364 17.6957H16.4364V5.95652ZM10.8727 9.21739C10.8727 8.8587 11.1673 8.56522 11.5273 8.56522H15.1273V17.6957H10.8727V9.21739ZM5.30909 13.1304C5.30909 12.7717 5.60364 12.4783 5.96364 12.4783H9.56364V17.6957H5.96364C5.60364 17.6957 5.30909 17.4022 5.30909 17.0435V13.1304Z"
        fill="#5C5C5C"
      />
      <path
        d="M3.65574 22H22.3443C22.7049 22 23 21.775 23 21.5C23 21.225 22.7049 21 22.3443 21H13H3.65574C3.29508 21 3 21.225 3 21.5C3 21.775 3.29508 22 3.65574 22Z"
        fill="#5C5C5C"
      />
    </g>
    <defs>
      <clipPath id="clip0_11685_48008">
        <rect width={20} height={20} fill="white" transform="translate(3 3)" />
      </clipPath>
    </defs>
  </svg>

      );
    case CHART_TYPE_KEYS.HORIZONTAL_BAR:
      // Same asset as vertical bar, rotated 90° (horizontal bar chart affordance).
      return (
        <span
          style={{
            display: 'inline-flex',
            width: s,
            height: s,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden
        >
          <span
            style={{
              display: 'inline-flex',
              transform: 'rotate(90deg)',
              transformOrigin: 'center center',
            }}
          >
            <ChartTypeIcon type={CHART_TYPE_KEYS.VERTICAL_BAR} size={s} />
          </span>
        </span>
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
