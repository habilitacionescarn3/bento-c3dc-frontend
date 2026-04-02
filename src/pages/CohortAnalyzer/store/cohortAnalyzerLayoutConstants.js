/**
 * Built-in layout slot ids (top row). Strip charts use their own stable keys from chart config.
 */
export const CA_LAYOUT_SLOT = {
  VENN: 'venn',
  SURVIVAL: 'survival',
};

/** Registry kind strings — add new kinds without changing reducer shape. */
export const CA_PANEL_KIND = {
  VENN: 'venn',
  SURVIVAL: 'survival',
  HISTOGRAM: 'histogram',
};

/** Gap between Venn and survival columns (`vennSurvivalRow` flex gap). */
export const CA_TOP_ROW_GAP_PX = 26;

/** Venn card outer size bounds (matches VennDiagramContainer). */
export const CA_VENN_OUTER_MIN_W = 400;
export const CA_VENN_OUTER_MAX_W = 2000;
export const CA_VENN_OUTER_MIN_H = 280;
export const CA_VENN_OUTER_MAX_H = 900;

/**
 * Overall survival card (beside Venn + strip): cannot resize below min; can grow up to max.
 */
export const CA_SURVIVAL_CARD_MIN_WIDTH = 554;
export const CA_SURVIVAL_CARD_MAX_WIDTH = 2000;
/** Also the default Venn outer height when no saved layout (top-row peers align). */
export const CA_SURVIVAL_CARD_MIN_HEIGHT = 444;
export const CA_SURVIVAL_CARD_MAX_HEIGHT = 980;
