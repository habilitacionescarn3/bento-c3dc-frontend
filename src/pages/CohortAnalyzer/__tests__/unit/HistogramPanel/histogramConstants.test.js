import {
  HISTOGRAM_CHART_PLOT_HEIGHT,
  HISTOGRAM_CARD_MIN_WIDTH,
  MAX_BARS_DISPLAYED,
  CA_EXPANDED_CHART_MODAL_TAB_VENN,
} from '../../../HistogramPanel/histogramConstants';

describe('histogramConstants', () => {
  it('defines histogram layout bounds', () => {
    expect(HISTOGRAM_CARD_MIN_WIDTH).toBeLessThan(2000);
    expect(HISTOGRAM_CHART_PLOT_HEIGHT).toBeGreaterThan(0);
  });

  it('limits bar counts for collapsed vs expanded views', () => {
    expect(MAX_BARS_DISPLAYED).toBeLessThan(21);
  });

  it('defines expanded modal venn tab id', () => {
    expect(CA_EXPANDED_CHART_MODAL_TAB_VENN).toBe('venn');
  });
});
