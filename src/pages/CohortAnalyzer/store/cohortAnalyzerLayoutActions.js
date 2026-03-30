import {
  CA_LAYOUT_SET_TOP_ROW_ORDER,
  CA_LAYOUT_SET_STRIP_ORDER,
  CA_LAYOUT_SET_BESIDE_STRIP_PANEL,
  CA_LAYOUT_PATCH_VISIBILITY,
  CA_LAYOUT_SET_PANEL_SIZE,
  CA_LAYOUT_SET_PANEL_SIZE_FOR_ID,
  CA_LAYOUT_UPSERT_PANEL_REGISTRY,
  CA_LAYOUT_PATCH_UI_FLAGS,
  CA_LAYOUT_PATCH_CHART_VISUALS,
  CA_LAYOUT_SET_WORKSPACE_GRID,
  CA_LAYOUT_HYDRATE,
  CA_LAYOUT_RESET,
} from './cohortAnalyzerLayoutActionTypes';

/** @param {string[]} order */
export function setTopRowOrder(order) {
  return { type: CA_LAYOUT_SET_TOP_ROW_ORDER, payload: order };
}

/** @deprecated use setTopRowOrder */
export const setTopRowPanelOrder = setTopRowOrder;

/** @param {string[]} orderedStripPanelIds */
export function setStripOrder(order) {
  return { type: CA_LAYOUT_SET_STRIP_ORDER, payload: order };
}

/** @deprecated use setStripOrder */
export const setHistogramQueueOrder = setStripOrder;

/** @param {string|null} panelId */
export function setBesideStripPanelId(panelId) {
  return { type: CA_LAYOUT_SET_BESIDE_STRIP_PANEL, payload: panelId };
}

/** @deprecated use setBesideStripPanelId */
export const setBesideVennHistogramId = setBesideStripPanelId;

/**
 * Merge panel definitions (new graph = add entry here; `kind` + optional meta only).
 * @param {Record<string, { kind: string, chartKey?: string, label?: string, meta?: object }>} patch
 */
export function upsertPanelRegistry(patch) {
  return { type: CA_LAYOUT_UPSERT_PANEL_REGISTRY, payload: patch };
}

/** @param {Record<string, boolean>} patch */
export function patchPanelVisibility(patch) {
  return { type: CA_LAYOUT_PATCH_VISIBILITY, payload: patch };
}

/** @deprecated use patchPanelVisibility */
export const setPanelVisibility = patchPanelVisibility;

/** @param {Record<string, *>} patch */
export function patchUiFlags(patch) {
  return { type: CA_LAYOUT_PATCH_UI_FLAGS, payload: patch };
}

/**
 * Merge histogram chart visual selections (panel id -> type from CHART_TYPE_OPTIONS).
 * @param {Record<string, string>} patch
 */
export function patchChartVisuals(patch) {
  return { type: CA_LAYOUT_PATCH_CHART_VISUALS, payload: patch };
}

/** Preferred: size by canonical panel id (venn, survival, or strip chart id). */
export function setPanelSizeForId(panelId, size) {
  return { type: CA_LAYOUT_SET_PANEL_SIZE_FOR_ID, payload: { panelId, size } };
}

/**
 * Legacy shape from chart components (maps to ids internally).
 * @param {{ panel: 'venn'|'survival'|'histogram', dataset?: string, size: object|null }} payload
 */
export function setPanelSize(payload) {
  return { type: CA_LAYOUT_SET_PANEL_SIZE, payload };
}

export function setWorkspaceGridLayout(layout) {
  return { type: CA_LAYOUT_SET_WORKSPACE_GRID, payload: layout };
}

export function hydrateCohortAnalyzerLayout(partialState) {
  return { type: CA_LAYOUT_HYDRATE, payload: partialState };
}

export function resetCohortAnalyzerLayout() {
  return { type: CA_LAYOUT_RESET };
}

export function setSurvivalBesideFromSelection(active) {
  return patchUiFlags({ survivalBesideFromSelection: Boolean(active) });
}
