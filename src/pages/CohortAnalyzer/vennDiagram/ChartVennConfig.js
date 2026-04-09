// Default threshold for font size adjustment in the chart. 
// The value 999 was chosen as a high threshold to ensure font size adjustments are only applied in extreme cases.
// This threshold was determined based on observed data visualization needs, such as overlapping numbers when numbers are above 999.
export const DEFAULT_FONT_SIZE_THRESHOLD = 999;

/** Extra space around the Venn plot so cohort labels are not clipped (Chart.js layout padding). */
export const VENN_CHART_LAYOUT_PADDING = {
  left: 52,
  right: 52,
  top: 44,
  bottom: 44,
};

/**
 * Scale applied to canvas width/height so circles + external labels fit inside the slot.
 * Inline card: three cohorts vs two use different scales (two-circle layout needs its own tuning).
 * Expanded modal uses VENN_CANVAS_SIZE_SCALE_EXPANDED regardless of cohort count.
 * At {@link VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH}+, inline uses {@link VENN_CANVAS_SIZE_SCALE_BIG_SCREEN}.
 */
/** Inline card with three cohorts — was 0.001 (effectively zero); scale to slot so resize is visible. */
export const VENN_CANVAS_SIZE_SCALE_NORMAL = 0.92;
/** Inline card when exactly two cohorts are selected (two-set Venn). */
export const VENN_CANVAS_SIZE_SCALE_NORMAL_TWO_COHORTS = 0.92;
/** Expanded modal — match slot similarly to inline. */
export const VENN_CANVAS_SIZE_SCALE_EXPANDED = 0.95;
/** Viewport width (px) at or above which inline Venn uses {@link VENN_CANVAS_SIZE_SCALE_BIG_SCREEN}. */
export const VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH = 1800;
/** Inline Venn on very wide viewports — use a bit more of the slot; labels have more room. */
export const VENN_CANVAS_SIZE_SCALE_BIG_SCREEN = 0.95;

/**
 * Max characters of cohort name shown on Venn circles; longer names use `…` (ellipsis).
 * Does not include the trailing ` (participantCount)`.
 */
export const VENN_COHORT_NAME_MAX_CHARS = 13;

/**
 * Single-line Venn set label: `Name (n)` or `Longer na… (n)` when over {@link VENN_COHORT_NAME_MAX_CHARS}.
 */
export function buildVennCohortSetLabel(
  cohortName,
  participantCount,
  maxNameChars = VENN_COHORT_NAME_MAX_CHARS,
) {
  const name = String(cohortName || '').trim();
  const shortName = name.length > maxNameChars ? `${name.slice(0, maxNameChars)}...` : name;
  return `${shortName} (${participantCount})`;
}

export const nodes = ["participant_pk","diagnosis","treatment_type"];


// Utility Functions
export const hexToRgba = (hex, alpha = 1) => {
  const rgb = hex.replace("#", "").match(/.{2}/g).map(x => parseInt(x, 16));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
};

// Constants for color opacity adjustments
const REDUCED_OPACITY = 0.85; // Opacity for the third color to make it visually distinct
const THIRD_COLOR_INDEX = 2; // Index of the third color in the array
/** Primary set fills — aligned with cohort analyzer Venn reference (SVG). */
export const baseColorArray = ['#FAF3CF', '#D2F1E0', '#C9E8FC'].map((color, index) =>
  hexToRgba(color, index === THIRD_COLOR_INDEX ? REDUCED_OPACITY : 1),
);