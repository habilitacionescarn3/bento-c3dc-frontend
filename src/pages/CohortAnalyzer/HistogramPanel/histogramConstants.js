export const BESIDE_PEER_DRAG_STYLE = {
  boxShadow: 'none',
  filter: 'brightness(0.96)',
  transition: 'filter 0.15s ease, opacity 0.15s ease',
};

/** SSR/tests fallback; in browser use `defaultHistogramPlotHeightPx()` from cohortAnalyzerViewPercentDefaults. */
export const HISTOGRAM_CHART_PLOT_HEIGHT = 240;
/** Plot area min height hint as % of viewport height. */
export const HISTOGRAM_CHART_PLOT_MIN_VH = 22;
/** Card shell min height as % of viewport height (plot + chrome). */
export const HISTOGRAM_CARD_SHELL_MIN_VH = 28;
/** Plot + header, padding, borders, resize grip (~ full ChartWrapper height minus plot). */
export const HISTOGRAM_CARD_CHROME_HEIGHT = 132;
/** Extra width for the dashed “drop here” preview vs the card layout width (visual breathing room). */
export const HISTOGRAM_STRIP_DROP_SLOT_WIDTH_EXTRA_PX = 16;
export const HISTOGRAM_CARD_MIN_WIDTH = 280;
export const HISTOGRAM_CARD_MAX_WIDTH = 2000;
export const HISTOGRAM_PLOT_MIN_HEIGHT = 120;
export const HISTOGRAM_PLOT_MAX_HEIGHT = 800;

export const MAX_BARS_DISPLAYED = 6;
export const MAX_BARS_DISPLAYED_EXPANDED = 21;

/** `activeTab` / `expandedChart` value for Venn in the shared ExpandedChartModal. */
export const CA_EXPANDED_CHART_MODAL_TAB_VENN = 'venn';

/** X/Y axis tick label size (px) for histogram + survival charts in the expanded modal. */
export const HISTOGRAM_EXPANDED_AXIS_FONT_SIZE = 13;
