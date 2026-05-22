/** Visual treatment for chart summary when no cohorts are selected. */
export const CHART_PREVIEW_CONTENT_STYLE = {
  opacity: 0.72,
  filter: 'grayscale(0.35)',
  pointerEvents: 'none',
  userSelect: 'none',
};

export const CHART_PREVIEW_COHORT_LABELS = ['Cohort A', 'Cohort B', 'Cohort C'];

/** Default month columns for empty preview risk table (matches @bento-core/risk-table defaults). */
export const CHART_PREVIEW_RISK_TIME_INTERVALS = [
  '0 Months',
  '6 Months',
  '12 Months',
  '18 Months',
  '24 Months',
  '30 Months',
  '36 Months',
];

const PREVIEW_RISK_COHORT_COLORS = ['#E74C3C', '#3498DB', '#2ECC71'];

export function getChartPreviewContentStyle(chartPreviewMode) {
  return chartPreviewMode ? CHART_PREVIEW_CONTENT_STYLE : undefined;
}

export function areChartsInteractionDisabled(allInputsEmpty, chartPreviewMode) {
  return allInputsEmpty || Boolean(chartPreviewMode);
}

export function chartPreviewCohortName(index) {
  return CHART_PREVIEW_COHORT_LABELS[index] || '';
}

/** Empty Venn cohort slots (labels only — no participants). */
export function buildPlaceholderVennCohortData() {
  return CHART_PREVIEW_COHORT_LABELS.map((cohortName) => ({
    cohortName,
    participants: [],
  }));
}

/** Empty risk-table rows for preview survival card. */
export function buildPlaceholderSurvivalRiskCohorts() {
  return CHART_PREVIEW_COHORT_LABELS.map((name, index) => ({
    id: `c${index + 1}`,
    name,
    color: PREVIEW_RISK_COHORT_COLORS[index],
    data: {},
  }));
}

export const CHART_PREVIEW_KM_COLORS = PREVIEW_RISK_COHORT_COLORS;
