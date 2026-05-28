import { buildDefaultCohortAnalyzerPanelRegistry, COHORT_ANALYZER_HISTOGRAM_TITLES } from '../../../store/cohortAnalyzerDefaultPanelRegistry';

describe('cohortAnalyzerDefaultPanelRegistry', () => {
  describe('buildDefaultCohortAnalyzerPanelRegistry', () => {
    it('includes venn and survival panels', () => {
      const registry = buildDefaultCohortAnalyzerPanelRegistry();
      expect(registry.venn.kind).toBe('venn');
      expect(registry.survival.chartKey).toBe('survivalAnalysis');
    });

    it('includes histogram dataset panels except survival duplicate', () => {
      const registry = buildDefaultCohortAnalyzerPanelRegistry();
      expect(registry.sexAtBirth.label).toBe(COHORT_ANALYZER_HISTOGRAM_TITLES.sexAtBirth);
      expect(registry.race.kind).toBe('histogram');
    });
  });
});
