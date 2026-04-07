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
 * Inline card uses a smaller canvas; expanded modal can use most of the available area.
 */
export const VENN_CANVAS_SIZE_SCALE_NORMAL = 0.001;
export const VENN_CANVAS_SIZE_SCALE_EXPANDED = 0.1;

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