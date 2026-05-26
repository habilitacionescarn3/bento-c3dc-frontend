import {
  setTopRowOrder,
  setStripOrder,
  setBesideStripPanelId,
  promoteBesideStripLayout,
  moveTopRowPanelIntoStrip,
  upsertPanelRegistry,
  patchPanelVisibility,
  patchUiFlags,
  patchChartVisuals,
  setPanelSizeForId,
  setPanelSize,
  setWorkspaceGridLayout,
  hydrateCohortAnalyzerLayout,
  resetCohortAnalyzerLayout,
  setSurvivalBesideFromSelection,
} from '../../../store/cohortAnalyzerLayoutActions';
import {
  CA_LAYOUT_SET_TOP_ROW_ORDER,
  CA_LAYOUT_SET_STRIP_ORDER,
  CA_LAYOUT_RESET,
} from '../../../store/cohortAnalyzerLayoutActionTypes';

describe('cohortAnalyzerLayoutActions', () => {
  it('setTopRowOrder returns action', () => {
    expect(setTopRowOrder(['venn'])).toEqual({
      type: CA_LAYOUT_SET_TOP_ROW_ORDER,
      payload: ['venn'],
    });
  });

  it('setStripOrder attaches meta when userInitiated', () => {
    expect(setStripOrder(['race'], { userInitiated: true })).toEqual({
      type: CA_LAYOUT_SET_STRIP_ORDER,
      payload: ['race'],
      meta: { userInitiated: true },
    });
  });

  it('setStripOrder omits meta when not user initiated', () => {
    expect(setStripOrder(['race'])).toEqual({
      type: CA_LAYOUT_SET_STRIP_ORDER,
      payload: ['race'],
    });
  });

  it('setBesideStripPanelId returns action', () => {
    expect(setBesideStripPanelId('race').type).toBeDefined();
  });

  it('promoteBesideStripLayout returns action', () => {
    const payload = { stripOrder: ['race'], besideStripPanelId: 'race' };
    expect(promoteBesideStripLayout(payload).payload).toEqual(payload);
  });

  it('moveTopRowPanelIntoStrip returns action', () => {
    expect(moveTopRowPanelIntoStrip({ panel: 'venn', insertBeforeDataset: 'race' }).payload.panel)
      .toBe('venn');
  });

  it('upsertPanelRegistry returns action', () => {
    expect(upsertPanelRegistry({ race: { kind: 'histogram' } }).payload.race).toBeDefined();
  });

  it('patchPanelVisibility returns action', () => {
    expect(patchPanelVisibility({ race: true }).payload).toEqual({ race: true });
  });

  it('patchUiFlags and setSurvivalBesideFromSelection', () => {
    expect(patchUiFlags({ flag: 1 }).type).toBeDefined();
    expect(setSurvivalBesideFromSelection(true).payload.survivalBesideFromSelection).toBe(true);
  });

  it('patchChartVisuals returns action', () => {
    expect(patchChartVisuals({ race: 'pie' }).payload).toEqual({ race: 'pie' });
  });

  it('setPanelSizeForId and setPanelSize return actions', () => {
    expect(setPanelSizeForId('venn', { width: 1 }).payload.panelId).toBe('venn');
    expect(setPanelSize({ panel: 'histogram', dataset: 'race', size: {} }).payload.dataset).toBe('race');
  });

  it('setWorkspaceGridLayout hydrate and reset', () => {
    expect(setWorkspaceGridLayout([]).payload).toEqual([]);
    expect(hydrateCohortAnalyzerLayout({}).type).toBeDefined();
    expect(resetCohortAnalyzerLayout()).toEqual({ type: CA_LAYOUT_RESET });
  });
});
