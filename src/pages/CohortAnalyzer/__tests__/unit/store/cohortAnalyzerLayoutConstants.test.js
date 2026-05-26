import {
  CA_LAYOUT_SLOT,
  CA_PANEL_KIND,
  CA_TOP_ROW_GAP_PX,
  CA_VENN_OUTER_MIN_W,
  CA_SURVIVAL_CARD_MIN_WIDTH,
} from '../../../store/cohortAnalyzerLayoutConstants';

describe('cohortAnalyzerLayoutConstants', () => {
  it('defines layout slot ids', () => {
    expect(CA_LAYOUT_SLOT.VENN).toBe('venn');
    expect(CA_LAYOUT_SLOT.SURVIVAL).toBe('survival');
  });

  it('defines panel kind strings', () => {
    expect(CA_PANEL_KIND.HISTOGRAM).toBe('histogram');
    expect(CA_PANEL_KIND.VENN).toBe('venn');
  });

  it('exposes sizing constants', () => {
    expect(CA_TOP_ROW_GAP_PX).toBeGreaterThan(0);
    expect(CA_VENN_OUTER_MIN_W).toBeLessThan(CA_SURVIVAL_CARD_MIN_WIDTH);
  });
});
