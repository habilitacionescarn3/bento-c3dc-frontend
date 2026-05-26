import {
  CHART_PREVIEW_CONTENT_STYLE,
  CHART_PREVIEW_COHORT_LABELS,
  CHART_PREVIEW_RISK_TIME_INTERVALS,
  CHART_PREVIEW_KM_COLORS,
  getChartPreviewContentStyle,
  areChartsInteractionDisabled,
  chartPreviewCohortName,
  buildPlaceholderVennCohortData,
  buildPlaceholderSurvivalRiskCohorts,
} from '../../../utils/cohortAnalyzerChartPreview';

describe('cohortAnalyzerChartPreview', () => {
  describe('getChartPreviewContentStyle', () => {
    it('returns style object in preview mode', () => {
      expect(getChartPreviewContentStyle(true)).toEqual(CHART_PREVIEW_CONTENT_STYLE);
    });

    it('returns undefined when not in preview', () => {
      expect(getChartPreviewContentStyle(false)).toBeUndefined();
    });
  });

  describe('areChartsInteractionDisabled', () => {
    it('is true when all inputs empty', () => {
      expect(areChartsInteractionDisabled(true, false)).toBe(true);
    });

    it('is true in preview mode even with data', () => {
      expect(areChartsInteractionDisabled(false, true)).toBe(true);
    });

    it('is false when cohorts selected and not preview', () => {
      expect(areChartsInteractionDisabled(false, false)).toBe(false);
    });
  });

  describe('chartPreviewCohortName', () => {
    it('returns labels by index', () => {
      expect(chartPreviewCohortName(0)).toBe('Cohort A');
      expect(chartPreviewCohortName(2)).toBe('Cohort C');
    });

    it('returns empty string for out of range index', () => {
      expect(chartPreviewCohortName(9)).toBe('');
    });
  });

  describe('buildPlaceholderVennCohortData', () => {
    it('returns three empty cohorts with labels', () => {
      const data = buildPlaceholderVennCohortData();
      expect(data).toHaveLength(3);
      expect(data[0].cohortName).toBe(CHART_PREVIEW_COHORT_LABELS[0]);
      expect(data[0].participants).toEqual([]);
    });
  });

  describe('buildPlaceholderSurvivalRiskCohorts', () => {
    it('returns cohort rows with ids and colors', () => {
      const rows = buildPlaceholderSurvivalRiskCohorts();
      expect(rows).toHaveLength(3);
      expect(rows[0].id).toBe('c1');
      expect(rows[0].data).toEqual({});
      expect(CHART_PREVIEW_KM_COLORS).toHaveLength(3);
    });
  });

  it('exports risk time intervals matching risk-table defaults', () => {
    expect(CHART_PREVIEW_RISK_TIME_INTERVALS[0]).toBe('0 Months');
    expect(CHART_PREVIEW_RISK_TIME_INTERVALS).toContain('36 Months');
  });
});
