import {
  isAddChartDataTypeOnStrip,
  hasAnyAddableChartCatalogEntry,
  ADD_CHART_DATA_TYPES,
} from '../../../config/cohortAnalyzerChartCatalog';

describe('cohortAnalyzerChartCatalog', () => {
  describe('isAddChartDataTypeOnStrip', () => {
    it('returns false when entry has no datasetKey', () => {
      expect(isAddChartDataTypeOnStrip({ id: 'x' }, [], [])).toBe(false);
    });

    it('detects survival already on strip', () => {
      const entry = ADD_CHART_DATA_TYPES.find((e) => e.id === 'survivalAnalysis');
      expect(isAddChartDataTypeOnStrip(entry, [], ['survivalAnalysis'])).toBe(true);
    });

    it('detects histogram dataset on strip', () => {
      const entry = ADD_CHART_DATA_TYPES.find((e) => e.id === 'race');
      expect(isAddChartDataTypeOnStrip(entry, ['race'], [])).toBe(true);
    });
  });

  describe('hasAnyAddableChartCatalogEntry', () => {
    it('returns true when an available chart is not on layout', () => {
      expect(hasAnyAddableChartCatalogEntry([], [])).toBe(true);
    });

    it('returns false when all available charts are present', () => {
      const strip = ['sexAtBirth', 'race', 'treatmentType', 'response', 'survivalAnalysis'];
      expect(hasAnyAddableChartCatalogEntry(strip, ['survivalAnalysis'])).toBe(false);
    });
  });
});
