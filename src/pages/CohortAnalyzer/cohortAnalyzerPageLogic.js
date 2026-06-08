/**
 * Pure page-level logic for Cohort Analyzer (unit-testable, no React hooks).
 */

const VENN_SECTION_NAME_REGEX = /(.*?)(?= \(\d+\))/;

export function computeHasParticipantData(state, selectedCohorts) {
  if (!state || !Array.isArray(selectedCohorts)) return false;
  return selectedCohorts.some(
    (id) => state[id]
      && Array.isArray(state[id].participants)
      && state[id].participants.length > 0,
  );
}

export function getCohortAnalyzerTableMessage(cohortList, selectedCohortSection, tableConfig) {
  if (cohortList.length === 0) {
    return { noMatch: 'To proceed, please create your cohort by visiting the Explore Page.' };
  }
  if (selectedCohortSection.length === 0) {
    return tableConfig.tableMsg;
  }
  return { noMatch: 'No data available for the selected segment/segments. Please try a different segment/segments.' };
}

export function extractCohortNameFromVennSection(section) {
  const match = section.match(VENN_SECTION_NAME_REGEX);
  return match ? match[1] : null;
}

export function filterVennSectionsForSelectedCohorts(
  selectedCohortSection,
  selectedCohorts,
  nodeIndex,
) {
  if (nodeIndex !== 0 && nodeIndex !== 1 && nodeIndex !== 2) {
    return [];
  }
  const finalVennSelection = [];
  selectedCohortSection.forEach((section) => {
    if (section.split(' ∩ ').length > 1) {
      const validCohorts = [];
      section.split(' ∩ ').forEach((sec) => {
        const cohortName = extractCohortNameFromVennSection(sec);
        if (cohortName && selectedCohorts.includes(cohortName)) {
          validCohorts.push(sec);
        }
      });
      if (validCohorts.length > 0) {
        finalVennSelection.push(validCohorts.join(' ∩ '));
      }
    } else {
      const cohortName = extractCohortNameFromVennSection(section);
      if (cohortName && selectedCohorts.includes(cohortName)) {
        finalVennSelection.push(section);
      }
    }
  });
  return finalVennSelection;
}

export function shouldClearRowDataOnEmptySelection(selectedCohorts, location) {
  if (selectedCohorts.length !== 0) return false;
  const hasNavigatedCohort = location
    && location.state
    && location.state.cohort
    && location.state.cohort.cohortId;
  return !hasNavigatedCohort;
}

export function countNonExampleCohorts(state, exampleCohortKeys) {
  return Object.keys(state || {}).filter((key) => !exampleCohortKeys.includes(key)).length;
}

export function canAddExampleCohorts(state, exampleCohortKeys, maxNonExample = 17) {
  return countNonExampleCohorts(state, exampleCohortKeys) <= maxNonExample;
}

export function buildExploreUploadPayload(rowData) {
  const upload = rowData.map((r) => ({
    participant_id: r.participant_id,
    study_id: r.dbgap_accession,
  }));
  return {
    upload,
    uploadMetadata: {
      filename: '',
      fileContent: upload.map((p) => p.participant_id).join(','),
      matched: upload,
      unmatched: [],
    },
  };
}

export function shouldSkipNavigateAwayModal() {
  return localStorage.getItem('hideNavigateModal') === 'true';
}

/** Wraps a setter so only the latest in-flight table fetch may commit results. */
export function guardSetterForRequest(setter, requestId, latestRequestIdRef) {
  return (value) => {
    if (requestId === latestRequestIdRef.current) {
      setter(value);
    }
  };
}
