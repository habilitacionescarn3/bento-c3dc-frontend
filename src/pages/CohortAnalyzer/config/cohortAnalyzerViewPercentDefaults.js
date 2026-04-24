/**
 * Percent-of-viewport defaults for Cohort Analyzer histogram + Venn (replaces scattered pixel inits).
 *
 * INVENTORY — former hard-coded initial / fallback pixel values:
 *
 * Histogram — histogramConstants.js:
 *   HISTOGRAM_CHART_PLOT_HEIGHT (240), HISTOGRAM_CARD_CHROME_HEIGHT (132),
 *   HISTOGRAM_CARD_MIN_WIDTH (280), HISTOGRAM_PLOT_MIN/MAX_HEIGHT
 * Histogram — Histogram.js:
 *   Drop slot fallbacks 320×261; plot default HISTOGRAM_CHART_PLOT_HEIGHT
 * Histogram — HistogramPopup.js:
 *   Modal histogram height from defaultModalHistogramDatasetChartHeightPx(); chartHeight useState(350); vennModalSlot 920×520
 * Histogram — histogramMuiStyles.js: chartPlotArea height/minHeight 240
 * Histogram — HistogramPanel.styled ChartWrapper: min-width 320px, min-height 261px
 *
 * Venn — default outer height: 550px if viewport ≥1900px else 400px (see defaultVennOuterHeightPx); width from viewport %
 * Venn — VennDiagramContainer: VENN_OUTER_DEFAULT MIN_W × SURVIVAL_MIN_H; header % reserve;
 *   chartSlot from outer × CA_VENN_SLOT_WIDTH_PCT, height outer − header reserve
 * Venn — ChartVenn: default canvas 680×180 / 720×340; slot margins 48/72
 */

import {
  CA_VENN_OUTER_MIN_W,
  CA_VENN_OUTER_MAX_W,
  CA_VENN_OUTER_MIN_H,
  CA_VENN_OUTER_MAX_H,
} from '../store/cohortAnalyzerLayoutConstants';
import {
  HISTOGRAM_CARD_CHROME_HEIGHT,
  HISTOGRAM_PLOT_MIN_HEIGHT,
  HISTOGRAM_PLOT_MAX_HEIGHT,
} from '../HistogramPanel/histogramConstants';

const VIEWPORT_CAP_W = 2560;
const VIEWPORT_CAP_H = 1100;

/** Percent of capped inner width/height (see functions below). */
export const CA_VIEW_PCT = {
  vennOuterWidth: 30,
  /** Legacy catalog value; default Venn outer height uses {@link defaultVennOuterHeightPx}. */
  vennOuterHeight: 40,
  histogramPlotHeight: 22,
  histogramDropSlotWidth: 17,
  vennModalSlotWidth: 48,
  vennModalSlotHeight: 48,
  modalKmChartHeight: 34,
  /** Expanded histogram modal: taller plot area (viewport %, see defaultModalHistogramDatasetChartHeightPx). */
  modalHistogramDatasetHeight: 62,
  vennCanvasFallbackWidth2: 36,
  vennCanvasFallbackWidth3: 40,
  vennCanvasFallbackHeight2: 20,
  vennCanvasFallbackHeight3: 34,
};

/** % of Venn card outer height for toolbar/chrome above diagram slot. */
export const CA_VENN_HEADER_CHROME_PCT = 28;

/** % of outer width for diagram slot (horizontal padding implied). */
export const CA_VENN_SLOT_WIDTH_PCT = 96;

/** Viewport width (px) at or above which default Venn outer height is {@link DEFAULT_VENN_OUTER_HEIGHT_BIG_SCREEN_PX}. */
export const VENN_DEFAULT_OUTER_HEIGHT_VIEWPORT_BREAKPOINT_PX = 1800;

/** Default Venn card outer height on viewports ≥ {@link VENN_DEFAULT_OUTER_HEIGHT_VIEWPORT_BREAKPOINT_PX}. */
export const DEFAULT_VENN_OUTER_HEIGHT_BIG_SCREEN_PX = 580;

/** Default Venn card outer height on narrower viewports. */
export const DEFAULT_VENN_OUTER_HEIGHT_COMPACT_PX = 400;

/** Resolved default Venn outer height (px) from viewport; SSR uses compact. Clamped in {@link defaultVennOuterPx}. */
export function defaultVennOuterHeightPx() {
  if (typeof window === 'undefined') {
    return DEFAULT_VENN_OUTER_HEIGHT_COMPACT_PX;
  }
  return window.innerWidth >= VENN_DEFAULT_OUTER_HEIGHT_VIEWPORT_BREAKPOINT_PX
    ? DEFAULT_VENN_OUTER_HEIGHT_BIG_SCREEN_PX
    : DEFAULT_VENN_OUTER_HEIGHT_COMPACT_PX;
}

function capW() {
  if (typeof window === 'undefined') return VIEWPORT_CAP_W;
  return Math.min(window.innerWidth, VIEWPORT_CAP_W);
}

function capH() {
  if (typeof window === 'undefined') return VIEWPORT_CAP_H;
  return Math.min(window.innerHeight, VIEWPORT_CAP_H);
}

export function defaultVennOuterPx() {
  const height = Math.min(
    CA_VENN_OUTER_MAX_H,
    Math.max(CA_VENN_OUTER_MIN_H, defaultVennOuterHeightPx()),
  );
  if (typeof window === 'undefined') {
    return { width: CA_VENN_OUTER_MIN_W, height };
  }
  const w = Math.round((capW() * CA_VIEW_PCT.vennOuterWidth) / 100);
  return {
    width: Math.min(CA_VENN_OUTER_MAX_W, Math.max(CA_VENN_OUTER_MIN_W, w)),
    height,
  };
}

export function defaultHistogramPlotHeightPx() {
  if (typeof window === 'undefined') {
    return Math.round((VIEWPORT_CAP_H * CA_VIEW_PCT.histogramPlotHeight) / 100);
  }
  const ph = Math.round((capH() * CA_VIEW_PCT.histogramPlotHeight) / 100);
  return Math.min(HISTOGRAM_PLOT_MAX_HEIGHT, Math.max(HISTOGRAM_PLOT_MIN_HEIGHT, ph));
}

export function defaultHistogramStripDropSlotWidthPx() {
  if (typeof window === 'undefined') return 320;
  return Math.round((capW() * CA_VIEW_PCT.histogramDropSlotWidth) / 100);
}

export function defaultHistogramCardOuterMinHeightPx(plotHeightPx = defaultHistogramPlotHeightPx()) {
  return Math.max(
    Math.round(capH() * 0.2),
    plotHeightPx + HISTOGRAM_CARD_CHROME_HEIGHT,
  );
}

export function defaultVennModalSlotPx() {
  if (typeof window === 'undefined') {
    return {
      slotWidth: Math.round((VIEWPORT_CAP_W * CA_VIEW_PCT.vennModalSlotWidth) / 100),
      slotHeight: Math.round((VIEWPORT_CAP_H * CA_VIEW_PCT.vennModalSlotHeight) / 100),
    };
  }
  return {
    slotWidth: Math.max(260, Math.round((capW() * CA_VIEW_PCT.vennModalSlotWidth) / 100)),
    slotHeight: Math.max(140, Math.round((capH() * CA_VIEW_PCT.vennModalSlotHeight) / 100)),
  };
}

export function defaultModalKmChartHeightPx() {
  if (typeof window === 'undefined') {
    return Math.round((VIEWPORT_CAP_H * CA_VIEW_PCT.modalKmChartHeight) / 100);
  }
  return Math.max(260, Math.round((capH() * CA_VIEW_PCT.modalKmChartHeight) / 100));
}

export function defaultModalHistogramDatasetChartHeightPx() {
  if (typeof window === 'undefined') {
    return Math.round((VIEWPORT_CAP_H * CA_VIEW_PCT.modalHistogramDatasetHeight) / 100);
  }
  return Math.max(460, Math.round((capH() * CA_VIEW_PCT.modalHistogramDatasetHeight) / 100));
}

export function vennChartSlotDimensionsFromOuterPx(outerW, outerH) {
  const reserve = Math.max(100, Math.round((outerH * CA_VENN_HEADER_CHROME_PCT) / 100));
  const slotWidth = Math.max(200, Math.round((outerW * CA_VENN_SLOT_WIDTH_PCT) / 100) - 24);
  const slotHeight = Math.max(140, outerH - reserve);
  return { slotWidth, slotHeight };
}

export function chartVennFallbackCanvasDimensionsPx(cohortCount) {
  const vw = capW();
  const vh = capH();
  const isTwo = cohortCount === 2;
  const wp = isTwo ? CA_VIEW_PCT.vennCanvasFallbackWidth2 : CA_VIEW_PCT.vennCanvasFallbackWidth3;
  const hp = isTwo ? CA_VIEW_PCT.vennCanvasFallbackHeight2 : CA_VIEW_PCT.vennCanvasFallbackHeight3;
  return {
    width: Math.round((vw * wp) / 100),
    height: Math.round((vh * hp) / 100),
  };
}
