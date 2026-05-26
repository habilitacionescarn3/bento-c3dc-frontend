import {
  isStripOrderHistogramOnlyId,
  insertTopRowPanelIntoStripOrder,
  filterTopRowOrderAfterMove,
} from '../../../store/topRowStripOrder';

describe('topRowStripOrder', () => {
  describe('isStripOrderHistogramOnlyId', () => {
    it('returns false for venn and survival tokens', () => {
      expect(isStripOrderHistogramOnlyId('venn')).toBe(false);
      expect(isStripOrderHistogramOnlyId('survivalAnalysis')).toBe(false);
    });

    it('returns true for histogram dataset ids', () => {
      expect(isStripOrderHistogramOnlyId('race')).toBe(true);
    });
  });

  describe('insertTopRowPanelIntoStripOrder', () => {
    it('inserts venn before target dataset', () => {
      const next = insertTopRowPanelIntoStripOrder(['race', 'sexAtBirth'], 'venn', 'sexAtBirth');
      expect(next).toEqual(['race', 'venn', 'sexAtBirth']);
    });

    it('appends survival to end of strip', () => {
      const next = insertTopRowPanelIntoStripOrder(['race'], 'survival', 'race');
      expect(next).toEqual(['race', 'survivalAnalysis']);
    });

    it('removes duplicate token before insert', () => {
      const next = insertTopRowPanelIntoStripOrder(['venn', 'race'], 'venn', 'race');
      expect(next.filter((id) => id === 'venn')).toHaveLength(1);
    });
  });

  describe('filterTopRowOrderAfterMove', () => {
    it('removes panel from top row order', () => {
      expect(filterTopRowOrderAfterMove(['venn', 'survival'], 'venn')).toEqual(['survival']);
    });
  });
});
