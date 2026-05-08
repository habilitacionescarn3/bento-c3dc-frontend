/**
 * Add-chart wizard: data attributes users can plot.
 * `datasetKey` matches Histogram / useHistogramData keys when data is wired; null = not available yet.
 */


/**
 * Strip already shows this histogram dataset, or survival is already enabled — duplicate add is blocked.
 * (`stripDatasetKeys` may be empty; survival is detected via `selectedDatasets` only.)
 */
export function isAddChartDataTypeOnStrip(entry, stripDatasetKeys, selectedDatasets = []) {
  if (!entry || !entry.datasetKey) return false;
  if (
    entry.datasetKey === 'survivalAnalysis'
    && Array.isArray(selectedDatasets)
    && selectedDatasets.includes('survivalAnalysis')
  ) {
    return true;
  }
  if (Array.isArray(stripDatasetKeys) && stripDatasetKeys.includes(entry.datasetKey)) {
    return true;
  }
  return false;
}

export const ADD_CHART_DATA_TYPES = [
 /* { id: 'dbGapAccession', label: 'DbGap Accession', datasetKey: null, available: false },
  { id: 'studyName', label: 'Study Name', datasetKey: null, available: false },
  { id: 'consentCodes', label: 'Consent Codes', datasetKey: null, available: false },
  { id: 'demographics', label: 'Demographics', datasetKey: null, available: false }, */
  { id: 'sexAtBirth', label: 'Sex at Birth', datasetKey: 'sexAtBirth', available: true },
  { id: 'race', label: 'Race', datasetKey: 'race', available: true },
  { id: 'ageRange', label: 'Age Range', datasetKey: null, available: true },
  { id: 'ageAtDiagnosis', label: 'Age at Diagnosis', datasetKey: null, available: true },
  { id: 'anatomicSite', label: 'Anatomic Site', datasetKey: null, available: false },
  /** Below: supported today via cohort charts API (not in original mock list). */
  { id: 'treatmentType', label: 'Treatment Type', datasetKey: 'treatmentType', available: true },
  { id: 'response', label: 'Treatment Outcome', datasetKey: 'response', available: true },
  /**
   * Kaplan–Meier / survival — single fixed visualization (no chart-type step in add flow).
   * @property {boolean} [skipChartTypeStep]
   */
  {
    id: 'survivalAnalysis',
    label: 'Survival Analysis',
    datasetKey: 'survivalAnalysis',
    available: true,
    skipChartTypeStep: true,
  },
];

/**
 * True if at least one catalog entry can still be added (available + datasetKey + not already on layout).
 */
export function hasAnyAddableChartCatalogEntry(stripDatasetKeys, selectedDatasets) {
  const strip = stripDatasetKeys || [];
  const sel = Array.isArray(selectedDatasets) ? selectedDatasets : [];
  return ADD_CHART_DATA_TYPES.some((entry) => {
    if (!entry.available || !entry.datasetKey) return false;
    return !isAddChartDataTypeOnStrip(entry, strip, sel);
  });
}