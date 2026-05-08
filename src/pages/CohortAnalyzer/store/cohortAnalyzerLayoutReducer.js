import {
  CA_LAYOUT_SET_TOP_ROW_ORDER,
  CA_LAYOUT_SET_STRIP_ORDER,
  CA_LAYOUT_SET_BESIDE_STRIP_PANEL,
  CA_LAYOUT_PROMOTE_BESIDE_STRIP,
  CA_LAYOUT_MOVE_TOP_ROW_INTO_STRIP,
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
import {
  filterTopRowOrderAfterMove,
  insertTopRowPanelIntoStripOrder,
} from './topRowStripOrder';
import {
  CA_SURVIVAL_CARD_MIN_WIDTH,
  CA_SURVIVAL_CARD_MAX_WIDTH,
  CA_SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT,
} from './cohortAnalyzerLayoutConstants';

/** Enforce overall survival card min/max width & height (persisted + resize). */
export function clampSurvivalPanelSize(size) {
  if (!size || typeof size !== 'object') return size;
  const w = size.width != null ? Number(size.width) : CA_SURVIVAL_CARD_MIN_WIDTH;
  const h = size.height != null ? Number(size.height) : CA_SURVIVAL_CARD_MIN_HEIGHT;
  return {
    ...size,
    width: Math.min(CA_SURVIVAL_CARD_MAX_WIDTH, Math.max(CA_SURVIVAL_CARD_MIN_WIDTH, Math.round(w))),
    height: Math.min(CA_SURVIVAL_CARD_MAX_HEIGHT, Math.max(CA_SURVIVAL_CARD_MIN_HEIGHT, Math.round(h))),
  };
}

function sizesWithSurvivalClamped(sizes) {
  if (!sizes || !sizes.survival) return sizes;
  return { ...sizes, survival: clampSurvivalPanelSize(sizes.survival) };
}

/**
 * Data-driven workspace layout: new chart types are added via `panelRegistry` + `stripOrder`
 * (no reducer shape change). Optional `visibility`, `sizes`, and free-form `meta` per panel id.
 *
 * Panel ids:
 * - `venn`, `survival` — fixed chrome
 * - strip charts use stable keys (e.g. sexAtBirth, race); register with upsertPanelRegistry
 *
 * @typedef {Object} PanelRegistryEntry
 * @property {string} kind — e.g. 'venn' | 'survival' | 'histogram' | future kinds (opaque string)
 * @property {string} [chartKey] — key in app data layer when kind is histogram/survival
 * @property {string} [label]
 * @property {Record<string, *>} [meta] — extension point without schema migrations
 */

export const cohortAnalyzerLayoutInitialState = {
  schemaVersion: 2,
  prefsMeta: {
    accountId: null,
    syncedAt: null,
  },
  /** Declared panels only — grow by dispatching upsertPanelRegistry (new graph = data). */
  panelRegistry: {},
  /** Per-panel visibility overrides (ids are free-form strings). */
  visibility: {},
  /** Per-panel size blobs (structure depends on kind; opaque to reducer). */
  sizes: {},
  /** Top row slot order: 'venn' | 'survival' (symbolic columns beside each other). */
  topRowOrder: ['venn', 'survival'],
  /** Ordered strip panel ids (typically histogram chartKeys). */
  stripOrder: [],
  /** When survival is off, which strip panel id is docked beside Venn. */
  besideStripPanelId: null,
  /** Ephemeral UI mirrors and feature flags (no chart catalog here). */
  uiFlags: {
    survivalBesideFromSelection: true,
  },
  /**
   * Selected chart visualization per panel id (histogram strip keys, e.g. sexAtBirth).
   * Values are type strings from CHART_TYPE_OPTIONS (opaque to reducer).
   */
  chartVisualByPanelId: {},
  workspaceGridLayout: null,
};

/** Migrate persisted v1 payloads into v2 shape (no manual user migration). */
export function migrateLayoutPayloadToV2(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...cohortAnalyzerLayoutInitialState };
  }
  if (raw.schemaVersion >= 2) {
    return {
      ...cohortAnalyzerLayoutInitialState,
      ...raw,
      prefsMeta: { ...cohortAnalyzerLayoutInitialState.prefsMeta, ...(raw.prefsMeta || {}) },
      panelRegistry: { ...cohortAnalyzerLayoutInitialState.panelRegistry, ...(raw.panelRegistry || {}) },
      visibility: { ...cohortAnalyzerLayoutInitialState.visibility, ...(raw.visibility || {}) },
      sizes: sizesWithSurvivalClamped({
        ...cohortAnalyzerLayoutInitialState.sizes,
        ...(raw.sizes || {}),
      }),
      topRowOrder: Array.isArray(raw.topRowOrder) ? raw.topRowOrder : cohortAnalyzerLayoutInitialState.topRowOrder,
      stripOrder: Array.isArray(raw.stripOrder) ? raw.stripOrder : cohortAnalyzerLayoutInitialState.stripOrder,
      besideStripPanelId:
        raw.besideStripPanelId !== undefined ? raw.besideStripPanelId : cohortAnalyzerLayoutInitialState.besideStripPanelId,
      uiFlags: { ...cohortAnalyzerLayoutInitialState.uiFlags, ...(raw.uiFlags || {}) },
      chartVisualByPanelId: {
        ...cohortAnalyzerLayoutInitialState.chartVisualByPanelId,
        ...(raw.chartVisualByPanelId || raw.chartVisualByDataset || {}),
      },
      workspaceGridLayout:
        raw.workspaceGridLayout !== undefined
          ? raw.workspaceGridLayout
          : cohortAnalyzerLayoutInitialState.workspaceGridLayout,
    };
  }

  const sizes = { ...(raw.sizes || {}) };
  const ps = raw.panelSizes || {};
  if (ps.venn != null) sizes.venn = ps.venn;
  if (ps.survival != null) sizes.survival = ps.survival;
  if (ps.histogram && typeof ps.histogram === 'object') {
    Object.keys(ps.histogram).forEach((k) => {
      sizes[k] = ps.histogram[k];
    });
  }

  return {
    ...cohortAnalyzerLayoutInitialState,
    ...raw,
    schemaVersion: 2,
    panelRegistry: raw.panelRegistry || {},
    visibility: raw.visibility || raw.panelVisibility || {},
    sizes: sizesWithSurvivalClamped(sizes),
    topRowOrder: raw.topRowOrder || raw.topRowPanelOrder || cohortAnalyzerLayoutInitialState.topRowOrder,
    stripOrder: raw.stripOrder || raw.histogramQueueOrder || [],
    besideStripPanelId:
      raw.besideStripPanelId != null ? raw.besideStripPanelId : raw.besideVennHistogramId != null
        ? raw.besideVennHistogramId
        : null,
    uiFlags: {
      ...cohortAnalyzerLayoutInitialState.uiFlags,
      ...(raw.uiFlags || {}),
      survivalBesideFromSelection:
        raw.uiFlags && raw.uiFlags.survivalBesideFromSelection != null
          ? raw.uiFlags.survivalBesideFromSelection
          : raw.survivalBesideFromSelection != null
            ? raw.survivalBesideFromSelection
            : cohortAnalyzerLayoutInitialState.uiFlags.survivalBesideFromSelection,
    },
    workspaceGridLayout: raw.workspaceGridLayout != null ? raw.workspaceGridLayout : null,
    chartVisualByPanelId: {
      ...cohortAnalyzerLayoutInitialState.chartVisualByPanelId,
      ...(raw.chartVisualByPanelId || raw.chartVisualByDataset || {}),
    },
  };
}

function legacyPanelSizeToId(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const { panel, dataset } = payload;
  if (panel === 'venn') return 'venn';
  if (panel === 'survival') return 'survival';
  if (panel === 'histogram' && dataset) return dataset;
  return null;
}

export default function cohortAnalyzerLayoutReducer(state = cohortAnalyzerLayoutInitialState, action) {
  switch (action.type) {
    case CA_LAYOUT_SET_TOP_ROW_ORDER:
      return { ...state, topRowOrder: action.payload };

    case CA_LAYOUT_SET_STRIP_ORDER:
      return { ...state, stripOrder: action.payload };

    case CA_LAYOUT_SET_BESIDE_STRIP_PANEL:
      return { ...state, besideStripPanelId: action.payload };

    case CA_LAYOUT_PROMOTE_BESIDE_STRIP: {
      const { stripOrder: nextStrip, besideStripPanelId: nextBeside } = action.payload || {};
      if (!Array.isArray(nextStrip) || typeof nextBeside !== 'string' || !nextBeside) {
        return state;
      }
      return { ...state, stripOrder: nextStrip, besideStripPanelId: nextBeside };
    }

    case CA_LAYOUT_MOVE_TOP_ROW_INTO_STRIP: {
      const { panel, insertBeforeDataset } = action.payload || {};
      if (panel !== 'venn' && panel !== 'survival') return state;
      if (!state.topRowOrder || !state.topRowOrder.includes(panel)) return state;
      const nextStrip = insertTopRowPanelIntoStripOrder(
        state.stripOrder,
        panel,
        insertBeforeDataset,
      );
      const nextTop = filterTopRowOrderAfterMove(state.topRowOrder, panel);
      return { ...state, topRowOrder: nextTop, stripOrder: nextStrip };
    }

    case CA_LAYOUT_PATCH_VISIBILITY:
      return {
        ...state,
        visibility: { ...state.visibility, ...action.payload },
      };

    case CA_LAYOUT_SET_PANEL_SIZE_FOR_ID: {
      const { panelId, size } = action.payload || {};
      if (!panelId) return state;
      const merged =
        panelId === 'survival' && size && typeof size === 'object'
          ? clampSurvivalPanelSize(size)
          : size;
      return {
        ...state,
        sizes: { ...state.sizes, [panelId]: merged },
      };
    }

    case CA_LAYOUT_SET_PANEL_SIZE: {
      const panelId = legacyPanelSizeToId(action.payload);
      if (!panelId) return state;
      const size = action.payload && action.payload.size;
      const merged =
        panelId === 'survival' && size && typeof size === 'object'
          ? clampSurvivalPanelSize(size)
          : size;
      return {
        ...state,
        sizes: { ...state.sizes, [panelId]: merged },
      };
    }

    case CA_LAYOUT_UPSERT_PANEL_REGISTRY:
      return {
        ...state,
        panelRegistry: { ...state.panelRegistry, ...action.payload },
      };

    case CA_LAYOUT_PATCH_UI_FLAGS:
      return {
        ...state,
        uiFlags: { ...state.uiFlags, ...action.payload },
      };

    case CA_LAYOUT_PATCH_CHART_VISUALS:
      return {
        ...state,
        chartVisualByPanelId: { ...state.chartVisualByPanelId, ...action.payload },
      };

    case CA_LAYOUT_SET_WORKSPACE_GRID:
      return { ...state, workspaceGridLayout: action.payload };

    case CA_LAYOUT_HYDRATE: {
      const normalized = migrateLayoutPayloadToV2(action.payload);
      return {
        ...cohortAnalyzerLayoutInitialState,
        ...normalized,
        prefsMeta: { ...cohortAnalyzerLayoutInitialState.prefsMeta, ...(normalized.prefsMeta || {}) },
        panelRegistry: {
          ...cohortAnalyzerLayoutInitialState.panelRegistry,
          ...(normalized.panelRegistry || {}),
        },
        visibility: { ...cohortAnalyzerLayoutInitialState.visibility, ...(normalized.visibility || {}) },
        sizes: sizesWithSurvivalClamped({
          ...cohortAnalyzerLayoutInitialState.sizes,
          ...(normalized.sizes || {}),
        }),
        uiFlags: { ...cohortAnalyzerLayoutInitialState.uiFlags, ...(normalized.uiFlags || {}) },
        chartVisualByPanelId: {
          ...cohortAnalyzerLayoutInitialState.chartVisualByPanelId,
          ...(normalized.chartVisualByPanelId || {}),
        },
      };
    }

    case CA_LAYOUT_RESET:
      return { ...cohortAnalyzerLayoutInitialState };

    default:
      return state;
  }
}
