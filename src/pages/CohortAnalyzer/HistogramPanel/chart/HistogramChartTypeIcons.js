import React, { useRef } from 'react';
import { CHART_TYPE_KEYS } from './HistogramDatasetChart';

const stroke = '#5C5C5C';

let chartVerticalBarClipIdSeq = 0;

function useVerticalBarClipId() {
  const ref = useRef(null);
  if (ref.current === null) {
    ref.current = `chart-vbar-${++chartVerticalBarClipIdSeq}`;
  }
  return ref.current;
}

let chartSelectIconClipIdSeq = 0;

function useSelectArtClipId() {
  const ref = useRef(null);
  if (ref.current === null) {
    ref.current = `ct-select-clip-${++chartSelectIconClipIdSeq}`;
  }
  return ref.current;
}

/**
 * `compact` — small scalable icons for strip, tabs, and chart rows.
 * `select` — full-fidelity art for the add-chart “choose chart type” step.
 */
export function ChartTypeIcon({ type, size = 20 }) {
  return <ChartTypeIconBase type={type} size={size} iconVariant="compact" />;
}

export function ChartTypeSelectIcon({ type, size = 20 }) {
  return <ChartTypeIconBase type={type} size={size} iconVariant="select" />;
}

function ChartTypeIconBase({ type, size = 20, iconVariant = 'compact' }) {
  const s = size;
  const isSelect = iconVariant === 'select';
  const verticalBarClipId = useVerticalBarClipId();
  const selectArtClipId = useSelectArtClipId();

  switch (type) {
    case CHART_TYPE_KEYS.PIE:
      if (isSelect) {
        return (
          <svg
            width={s}
            height={s}
            viewBox="0 0 74 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <g clipPath={`url(#${selectArtClipId})`}>
              <path
                d="M70.4542 40.6391H70.3944C68.8416 40.3163 67.3126 41.3205 66.9901 42.8746C65.3416 50.9801 60.6472 57.9498 53.7548 62.5165C46.8625 67.0833 38.6203 68.6852 30.5215 67.0355C22.4227 65.3857 15.4586 60.6874 10.8956 53.7895C6.33253 46.9034 4.73188 38.6426 6.38031 30.5372C8.85296 18.3671 18.3135 8.88686 30.4856 6.40025C31.2501 6.24483 31.9071 5.8025 32.3371 5.15694C32.7672 4.51137 32.9225 3.7343 32.7672 2.96919C32.6119 2.20408 32.1699 1.54656 31.5249 1.11618C30.8798 0.685806 30.1034 0.530392 29.327 0.685806C19.7231 2.65836 11.4689 8.2413 6.06974 16.4304C0.682467 24.6076 -1.20487 34.3986 0.754138 44.0103C4.30185 61.3689 19.6275 73.3596 36.6852 73.3596C39.122 73.3596 41.5827 73.1205 44.0554 72.6065C58.4373 69.6536 69.6538 58.4519 72.6162 44.0821C72.7835 43.3289 72.6521 42.5518 72.234 41.9063C71.8279 41.2607 71.1828 40.8064 70.4303 40.6391H70.4542Z"
                fill={stroke}
              />
              <path
                d="M37.9753 38.2457H70.5378C72.0907 38.2457 73.3569 36.9784 73.3569 35.4243C73.3688 15.89 57.4937 0.00195312 37.9753 0.00195312C36.4224 0.00195312 35.1562 1.26917 35.1562 2.82331V35.4123C35.1562 36.9665 36.4224 38.2337 37.9753 38.2337V38.2457ZM60.8145 16.3084C60.9459 16.4638 61.0653 16.6312 61.1848 16.7986L61.6267 17.3844C61.8656 17.6952 62.2359 18.1614 62.4868 18.532C62.6899 18.8309 62.7974 19.0102 62.8929 19.1896L63.2991 19.859C63.5021 20.1818 63.753 20.5763 63.9441 20.923C64.1113 21.2219 64.2188 21.4251 64.3263 21.6403L64.5175 22.0109C64.6966 22.3576 64.9714 22.9314 65.1744 23.4096C65.282 23.6726 65.3775 23.8878 65.4492 24.0911L65.6642 24.6171C65.8195 24.9877 66.0345 25.5735 66.1778 26.0636L66.2256 26.231C66.357 26.6494 66.4406 26.9244 66.5601 27.3189C66.6795 27.7373 66.8229 28.3111 66.9423 28.873C67.0498 29.3393 67.0976 29.6142 67.1573 29.9251L67.1932 30.1402C67.2648 30.5587 67.3604 31.1803 67.4201 31.6944C67.456 32.0172 67.4918 32.2802 67.5037 32.5432H40.7824V5.77617L43.1834 6.08699L44.4615 6.32609L46.3847 6.84015C46.6714 6.92384 46.9461 6.99557 47.2328 7.10316C47.6389 7.24662 48.2123 7.44985 48.6782 7.64113L49.2157 7.85632C49.4427 7.94 49.6457 8.02369 49.8727 8.11933C50.2549 8.28669 50.8044 8.5497 51.2583 8.7888C51.4614 8.89639 51.6406 8.98008 51.8078 9.06376C52.0109 9.1594 52.1901 9.24309 52.3812 9.36263C52.6798 9.53 53.0979 9.79301 53.4921 10.0321L54.7583 10.8211C55.0927 11.0483 55.4033 11.2874 55.7139 11.5384L56.562 12.184C56.7053 12.2916 56.8128 12.3633 56.9681 12.4948C57.3981 12.8535 57.8162 13.236 58.2343 13.6066L58.7599 14.0848C58.8674 14.1805 58.963 14.2761 59.0585 14.3837L59.2377 14.575C59.8827 15.2086 60.3725 15.7705 60.7906 16.3323L60.8145 16.3084Z"
                fill={stroke}
              />
            </g>
            <defs>
              <clipPath id={selectArtClipId}>
                <rect width="73.3672" height="73.3672" fill="white" />
              </clipPath>
            </defs>
          </svg>
        );
      }
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke={stroke} strokeWidth="1.2" fill="none" />
          <path
            d="M10 3 A7 7 0 0 1 17 10 L10 10 Z"
            fill={stroke}
            fillOpacity="0.35"
            stroke={stroke}
            strokeWidth="1"
          />
        </svg>
      );
    case CHART_TYPE_KEYS.VERTICAL_BAR: {
      if (isSelect) {
        return (
          <svg
            width={s}
            height={s}
            viewBox="0 0 78 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M11.3969 58.2667H65.8635C70.0562 58.2667 73.4635 54.8593 73.4635 50.6667V7.6C73.4635 3.40733 70.0562 0 65.8635 0H54.4635C50.2709 0 46.8635 3.40733 46.8635 7.6V12.6667H32.9302C28.7375 12.6667 25.3302 16.074 25.3302 20.2667V27.8667H11.3969C7.20421 27.8667 3.79688 31.274 3.79688 35.4667V50.6667C3.79688 54.8593 7.20421 58.2667 11.3969 58.2667ZM51.9302 7.6C51.9302 6.20667 53.0702 5.06667 54.4635 5.06667H65.8635C67.2569 5.06667 68.3969 6.20667 68.3969 7.6V50.6667C68.3969 52.06 67.2569 53.2 65.8635 53.2H51.9302V7.6ZM30.3969 20.2667C30.3969 18.8733 31.5369 17.7333 32.9302 17.7333H46.8635V53.2H30.3969V20.2667ZM8.86354 35.4667C8.86354 34.0733 10.0035 32.9333 11.3969 32.9333H25.3302V53.2H11.3969C10.0035 53.2 8.86354 52.06 8.86354 50.6667V35.4667Z"
              fill={stroke}
            />
            <path
              d="M2.53333 76.0042H74.7333C76.1267 76.0042 77.2667 74.8642 77.2667 73.4708C77.2667 72.0775 76.1267 70.9375 74.7333 70.9375H2.53333C1.14 70.9375 0 72.0775 0 73.4708C0 74.8642 1.14 76.0042 2.53333 76.0042Z"
              fill={stroke}
            />
          </svg>
        );
      }
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <g clipPath={`url(#${verticalBarClipId})`}>
            <rect x={15.5} y={4.5} width={6} height={14} rx={1} fill="white" />
            <rect x={10.5} y={8.5} width={6} height={10} rx={1} fill="white" />
            <rect x={4.5} y={11.5} width={6} height={7} rx={1} fill="white" />
            <path
              d="M5.96364 19H20.0364C21.1196 19 22 18.1228 22 17.0435V5.95652C22 4.87717 21.1196 4 20.0364 4H17.0909C16.0076 4 15.1273 4.87717 15.1273 5.95652V7.26087H11.5273C10.444 7.26087 9.56364 8.13804 9.56364 9.21739V11.1739H5.96364C4.88036 11.1739 4 12.0511 4 13.1304V17.0435C4 18.1228 4.88036 19 5.96364 19ZM16.4364 5.95652C16.4364 5.59783 16.7309 5.30435 17.0909 5.30435H20.0364C20.3964 5.30435 20.6909 5.59783 20.6909 5.95652V17.0435C20.6909 17.4022 20.3964 17.6957 20.0364 17.6957H16.4364V5.95652ZM10.8727 9.21739C10.8727 8.8587 11.1673 8.56522 11.5273 8.56522H15.1273V17.6957H10.8727V9.21739ZM5.30909 13.1304C5.30909 12.7717 5.60364 12.4783 5.96364 12.4783H9.56364V17.6957H5.96364C5.60364 17.6957 5.30909 17.4022 5.30909 17.0435V13.1304Z"
              fill={stroke}
            />
            <path
              d="M3.65574 22H22.3443C22.7049 22 23 21.775 23 21.5C23 21.225 22.7049 21 22.3443 21H13H3.65574C3.29508 21 3 21.225 3 21.5C3 21.775 3.29508 22 3.65574 22Z"
              fill={stroke}
            />
          </g>
          <defs>
            <clipPath id={verticalBarClipId}>
              <rect width="20" height="20" fill="white" transform="translate(3 3)" />
            </clipPath>
          </defs>
        </svg>
      );
    }
    case CHART_TYPE_KEYS.HORIZONTAL_BAR: {
      // Same asset as vertical bar, rotated 90°.
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
            <ChartTypeIconBase type={CHART_TYPE_KEYS.VERTICAL_BAR} size={s} iconVariant={iconVariant} />
          </span>
        </span>
      );
    }
    case CHART_TYPE_KEYS.LINE:
      if (isSelect) {
        return (
          <svg
            width={s}
            height={s}
            viewBox="0 0 79 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <g clipPath={`url(#${selectArtClipId})`}>
              <path
                d="M2.53333 75.9905H74.7333C76.1267 75.9905 77.2667 74.8505 77.2667 73.4572C77.2667 72.0638 76.1267 70.9238 74.7333 70.9238H2.53333C1.14 70.9238 0 72.0638 0 73.4572C0 74.8505 1.14 75.9905 2.53333 75.9905Z"
                fill={stroke}
              />
            </g>
            <path
              d="M75.8453 18.6406H64.9482C63.5455 18.6406 62.4185 19.7197 62.4185 21.0455C62.4185 22.3713 63.5536 23.4504 64.9482 23.4504H69.7238L43.0405 48.8173L25.7624 32.3916C24.7733 31.4512 23.1679 31.4512 22.1787 32.3916L3.11688 50.5284C2.12771 51.4688 2.12771 52.995 3.11688 53.9353C4.10605 54.8757 5.71143 54.8757 6.7006 53.9353L23.9787 37.5097L41.2567 53.9353C41.7513 54.4055 42.4 54.6368 43.0486 54.6368C43.6972 54.6368 44.3459 54.4055 44.8405 53.9353L73.3156 26.865V31.405C73.3156 32.7385 74.4508 33.8099 75.8453 33.8099C77.2399 33.8099 78.375 32.7308 78.375 31.405V21.0455C78.375 19.712 77.2399 18.6406 75.8453 18.6406Z"
              fill={stroke}
            />
            <defs>
              <clipPath id={selectArtClipId}>
                <rect width="77.2667" height="76" fill="white" />
              </clipPath>
            </defs>
          </svg>
        );
      }
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
  { type: CHART_TYPE_KEYS.VERTICAL_BAR, label: 'Bar Chart' },
  { type: CHART_TYPE_KEYS.HORIZONTAL_BAR, label: 'Stack Chart' },
  { type: CHART_TYPE_KEYS.LINE, label: 'Line Graph' },
];
