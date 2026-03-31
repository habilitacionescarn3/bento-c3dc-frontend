/**
 * Add-chart wizard: data attributes users can plot.
 * `datasetKey` matches Histogram / useHistogramData keys when data is wired; null = not available yet.
 */


/** Strip already shows this dataset — duplicate add is blocked (gray out in the picker). */
export function isAddChartDataTypeOnStrip(entry, stripDatasetKeys) {
  if (!entry || !entry.datasetKey || !Array.isArray(stripDatasetKeys)) return false;
  return stripDatasetKeys.includes(entry.datasetKey);
}
export const ADD_CHART_DATA_TYPES = [
  { id: 'dbGapAccession', label: 'DbGap Accession', datasetKey: null, available: false },
  { id: 'studyName', label: 'Study Name', datasetKey: null, available: false },
  { id: 'consentCodes', label: 'Consent Codes', datasetKey: null, available: false },
  { id: 'demographics', label: 'Demographics', datasetKey: null, available: false },
  { id: 'sexAtBirth', label: 'Sex at Birth', datasetKey: 'sexAtBirth', available: true },
  { id: 'race', label: 'Race', datasetKey: 'race', available: true },
  { id: 'ageRange', label: 'Age Range', datasetKey: null, available: true },
  { id: 'ageAtDiagnosis', label: 'Age at Diagnosis', datasetKey: null, available: true },
  { id: 'anatomicSite', label: 'Anatomic Site', datasetKey: null, available: false },
  /** Below: supported today via cohort charts API (not in original mock list). */
  { id: 'treatmentType', label: 'Treatment Type', datasetKey: 'treatmentType', available: true },
  { id: 'response', label: 'Treatment Outcome', datasetKey: 'response', available: true },
];