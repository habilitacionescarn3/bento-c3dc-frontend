// Default threshold for font size adjustment in the chart. 
// The value 999 was chosen as a high threshold to ensure font size adjustments are only applied in extreme cases.
// This threshold was determined based on observed data visualization needs, such as overlapping numbers when numbers are above 999.
export const DEFAULT_FONT_SIZE_THRESHOLD = 999;
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