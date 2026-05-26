import cohortAnalyzerLayoutReducer, {
  cohortAnalyzerLayoutInitialState,
  clampSurvivalPanelSize,
  isCohortAnalyzerLayoutPristine,
  migrateLayoutPayloadToV2,
} from '../../../store/cohortAnalyzerLayoutReducer';
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
} from '../../../store/cohortAnalyzerLayoutActionTypes';

describe('cohortAnalyzerLayoutReducer', () => {
  describe('clampSurvivalPanelSize', () => {
    it('clamps width and height to survival bounds', () => {
      const result = clampSurvivalPanelSize({ width: 10, height: 10 });
      expect(result.width).toBeGreaterThanOrEqual(420);
      expect(result.height).toBeGreaterThanOrEqual(444);
    });

    it('returns size unchanged when not an object', () => {
      expect(clampSurvivalPanelSize(null)).toBeNull();
    });
  });

  describe('isCohortAnalyzerLayoutPristine', () => {
    it('returns true when layout state is missing', () => {
      expect(isCohortAnalyzerLayoutPristine(null)).toBe(true);
    });

    it('returns false after user layout change', () => {
      expect(isCohortAnalyzerLayoutPristine({ userLayoutChanged: true })).toBe(false);
    });
  });

  describe('migrateLayoutPayloadToV2', () => {
    it('returns initial state for invalid payload', () => {
      const migrated = migrateLayoutPayloadToV2(null);
      expect(migrated.schemaVersion).toBe(2);
      expect(migrated.topRowOrder).toEqual(['venn', 'survival']);
    });

    it('migrates v1 panelSizes into sizes', () => {
      const migrated = migrateLayoutPayloadToV2({
        schemaVersion: 1,
        panelSizes: {
          venn: { width: 400 },
          survival: { width: 500, height: 600 },
          histogram: { race: { width: 300 } },
        },
      });
      expect(migrated.sizes.venn.width).toBe(400);
      expect(migrated.sizes.survival.width).toBe(500);
      expect(migrated.sizes.race.width).toBe(300);
    });

    it('migrates legacy field names on v1 payload', () => {
      const migrated = migrateLayoutPayloadToV2({
        schemaVersion: 1,
        topRowPanelOrder: ['survival', 'venn'],
        histogramQueueOrder: ['race'],
        besideVennHistogramId: 'sexAtBirth',
        panelVisibility: { race: true },
        survivalBesideFromSelection: false,
      });
      expect(migrated.topRowOrder).toEqual(['survival', 'venn']);
      expect(migrated.stripOrder).toEqual(['race']);
      expect(migrated.besideStripPanelId).toBe('sexAtBirth');
      expect(migrated.visibility.race).toBe(true);
      expect(migrated.uiFlags.survivalBesideFromSelection).toBe(false);
    });
  });

  describe('reducer actions', () => {
    it('CA_LAYOUT_SET_TOP_ROW_ORDER sets order and userLayoutChanged', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_TOP_ROW_ORDER,
        payload: ['survival', 'venn'],
      });
      expect(next.topRowOrder).toEqual(['survival', 'venn']);
      expect(next.userLayoutChanged).toBe(true);
    });

    it('CA_LAYOUT_SET_STRIP_ORDER respects userInitiated meta', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_STRIP_ORDER,
        payload: ['race'],
        meta: { userInitiated: true },
      });
      expect(next.stripOrder).toEqual(['race']);
      expect(next.userLayoutChanged).toBe(true);
    });

    it('CA_LAYOUT_SET_BESIDE_STRIP_PANEL updates beside id', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_BESIDE_STRIP_PANEL,
        payload: 'race',
      });
      expect(next.besideStripPanelId).toBe('race');
    });

    it('CA_LAYOUT_PROMOTE_BESIDE_STRIP updates strip and beside', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_PROMOTE_BESIDE_STRIP,
        payload: { stripOrder: ['race'], besideStripPanelId: 'race' },
      });
      expect(next.stripOrder).toEqual(['race']);
      expect(next.besideStripPanelId).toBe('race');
    });

    it('CA_LAYOUT_PROMOTE_BESIDE_STRIP ignores invalid payload', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_PROMOTE_BESIDE_STRIP,
        payload: { stripOrder: [], besideStripPanelId: '' },
      });
      expect(next).toBe(cohortAnalyzerLayoutInitialState);
    });

    it('CA_LAYOUT_MOVE_TOP_ROW_INTO_STRIP moves panel into strip', () => {
      const state = { ...cohortAnalyzerLayoutInitialState, topRowOrder: ['venn', 'survival'] };
      const next = cohortAnalyzerLayoutReducer(state, {
        type: CA_LAYOUT_MOVE_TOP_ROW_INTO_STRIP,
        payload: { panel: 'venn', insertBeforeDataset: 'race' },
      });
      expect(next.topRowOrder).not.toContain('venn');
      expect(next.stripOrder).toContain('venn');
    });

    it('CA_LAYOUT_PATCH_VISIBILITY merges visibility', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_PATCH_VISIBILITY,
        payload: { race: false },
      });
      expect(next.visibility.race).toBe(false);
    });

    it('CA_LAYOUT_SET_PANEL_SIZE_FOR_ID clamps survival size', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_PANEL_SIZE_FOR_ID,
        payload: { panelId: 'survival', size: { width: 100, height: 100 } },
      });
      expect(next.sizes.survival.width).toBeGreaterThanOrEqual(420);
    });

    it('CA_LAYOUT_SET_PANEL_SIZE uses legacy payload shape', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_PANEL_SIZE,
        payload: { panel: 'histogram', dataset: 'race', size: { width: 300 } },
      });
      expect(next.sizes.race.width).toBe(300);
    });

    it('CA_LAYOUT_SET_PANEL_SIZE ignores invalid legacy payload', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_PANEL_SIZE,
        payload: { panel: 'histogram', size: { width: 300 } },
      });
      expect(next).toBe(cohortAnalyzerLayoutInitialState);
    });

    it('CA_LAYOUT_SET_PANEL_SIZE_FOR_ID ignores missing panelId', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_PANEL_SIZE_FOR_ID,
        payload: { size: { width: 1 } },
      });
      expect(next).toBe(cohortAnalyzerLayoutInitialState);
    });

    it('CA_LAYOUT_PROMOTE_BESIDE_STRIP ignores invalid payload', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_PROMOTE_BESIDE_STRIP,
        payload: { stripOrder: 'not-array', besideStripPanelId: 'race' },
      });
      expect(next).toBe(cohortAnalyzerLayoutInitialState);
    });

    it('CA_LAYOUT_PATCH_UI_FLAGS merges ui flags', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_PATCH_UI_FLAGS,
        payload: { survivalBesideFromSelection: true },
      });
      expect(next.uiFlags.survivalBesideFromSelection).toBe(true);
    });

    it('CA_LAYOUT_UPSERT_PANEL_REGISTRY merges registry', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_UPSERT_PANEL_REGISTRY,
        payload: { race: { kind: 'histogram', chartKey: 'race' } },
      });
      expect(next.panelRegistry.race.chartKey).toBe('race');
    });

    it('CA_LAYOUT_PATCH_CHART_VISUALS merges chart visuals', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_PATCH_CHART_VISUALS,
        payload: { race: 'pie' },
      });
      expect(next.chartVisualByPanelId.race).toBe('pie');
    });

    it('CA_LAYOUT_SET_WORKSPACE_GRID stores grid layout', () => {
      const grid = [{ i: 'a' }];
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_SET_WORKSPACE_GRID,
        payload: grid,
      });
      expect(next.workspaceGridLayout).toEqual(grid);
    });

    it('CA_LAYOUT_HYDRATE normalizes payload', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, {
        type: CA_LAYOUT_HYDRATE,
        payload: { schemaVersion: 2, stripOrder: ['race'] },
      });
      expect(next.stripOrder).toEqual(['race']);
    });

    it('CA_LAYOUT_RESET returns initial state', () => {
      const dirty = { ...cohortAnalyzerLayoutInitialState, userLayoutChanged: true };
      const next = cohortAnalyzerLayoutReducer(dirty, { type: CA_LAYOUT_RESET });
      expect(next).toEqual(cohortAnalyzerLayoutInitialState);
    });

    it('returns same state for unknown action', () => {
      const next = cohortAnalyzerLayoutReducer(cohortAnalyzerLayoutInitialState, { type: 'UNKNOWN' });
      expect(next).toBe(cohortAnalyzerLayoutInitialState);
    });
  });
});
