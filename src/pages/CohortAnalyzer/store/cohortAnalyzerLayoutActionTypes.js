/** Action types for Cohort Analyzer workspace layout (data-driven panels — new graphs = data + registry upsert). */

export const CA_LAYOUT_SET_TOP_ROW_ORDER = 'cohortAnalyzerLayout/SET_TOP_ROW_ORDER';
export const CA_LAYOUT_SET_STRIP_ORDER = 'cohortAnalyzerLayout/SET_STRIP_ORDER';
export const CA_LAYOUT_SET_BESIDE_STRIP_PANEL = 'cohortAnalyzerLayout/SET_BESIDE_STRIP_PANEL';
export const CA_LAYOUT_PATCH_VISIBILITY = 'cohortAnalyzerLayout/PATCH_VISIBILITY';
export const CA_LAYOUT_SET_PANEL_SIZE = 'cohortAnalyzerLayout/SET_PANEL_SIZE';
export const CA_LAYOUT_SET_PANEL_SIZE_FOR_ID = 'cohortAnalyzerLayout/SET_PANEL_SIZE_FOR_ID';
export const CA_LAYOUT_UPSERT_PANEL_REGISTRY = 'cohortAnalyzerLayout/UPSERT_PANEL_REGISTRY';
export const CA_LAYOUT_PATCH_UI_FLAGS = 'cohortAnalyzerLayout/PATCH_UI_FLAGS';
/** Per-panel histogram chart visual type (bar, pie, etc.) — keys match strip panel ids. */
export const CA_LAYOUT_PATCH_CHART_VISUALS = 'cohortAnalyzerLayout/PATCH_CHART_VISUALS';
export const CA_LAYOUT_SET_WORKSPACE_GRID = 'cohortAnalyzerLayout/SET_WORKSPACE_GRID';
export const CA_LAYOUT_HYDRATE = 'cohortAnalyzerLayout/HYDRATE';
export const CA_LAYOUT_RESET = 'cohortAnalyzerLayout/RESET';
