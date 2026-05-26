import {
  computeHasParticipantData,
  getCohortAnalyzerTableMessage,
  extractCohortNameFromVennSection,
  filterVennSectionsForSelectedCohorts,
  shouldClearRowDataOnEmptySelection,
  countNonExampleCohorts,
  canAddExampleCohorts,
  buildExploreUploadPayload,
  shouldSkipNavigateAwayModal,
} from '../../cohortAnalyzerPageLogic';

describe('cohortAnalyzerPageLogic', () => {
  describe('computeHasParticipantData', () => {
    it('returns false when state is null', () => {
      expect(computeHasParticipantData(null, ['a'])).toBe(false);
    });

    it('returns false when selectedCohorts is not an array', () => {
      expect(computeHasParticipantData({}, null)).toBe(false);
    });

    it('returns true when a selected cohort has participants', () => {
      const state = { a: { participants: [{ id: 1 }] } };
      expect(computeHasParticipantData(state, ['a'])).toBe(true);
    });

    it('returns false when selected cohort has empty participants', () => {
      const state = { a: { participants: [] } };
      expect(computeHasParticipantData(state, ['a'])).toBe(false);
    });
  });

  describe('getCohortAnalyzerTableMessage', () => {
    const tableConfig = { tableMsg: { noMatch: 'default' } };

    it('returns explore message when cohort list is empty', () => {
      expect(getCohortAnalyzerTableMessage([], [], tableConfig).noMatch)
        .toContain('Explore Page');
    });

    it('returns tableConfig message when no section selected', () => {
      expect(getCohortAnalyzerTableMessage(['c1'], [], tableConfig)).toEqual(tableConfig.tableMsg);
    });

    it('returns segment message when sections exist', () => {
      const msg = getCohortAnalyzerTableMessage(['c1'], ['sec'], tableConfig);
      expect(msg.noMatch).toContain('No data available');
    });
  });

  describe('extractCohortNameFromVennSection', () => {
    it('parses cohort name before count suffix', () => {
      expect(extractCohortNameFromVennSection('Cohort A (12)')).toBe('Cohort A');
    });

    it('returns null when pattern does not match', () => {
      expect(extractCohortNameFromVennSection('invalid')).toBeNull();
    });
  });

  describe('filterVennSectionsForSelectedCohorts', () => {
    it('returns empty when nodeIndex is not 0, 1, or 2', () => {
      expect(filterVennSectionsForSelectedCohorts(['x'], ['Cohort A'], 3)).toEqual([]);
    });

    it('keeps single sections for selected cohorts', () => {
      const result = filterVennSectionsForSelectedCohorts(
        ['Cohort A (5)'],
        ['Cohort A'],
        0,
      );
      expect(result).toEqual(['Cohort A (5)']);
    });

    it('filters intersection sections to selected cohorts only', () => {
      const result = filterVennSectionsForSelectedCohorts(
        ['Cohort A (1) ∩ Cohort B (2)'],
        ['Cohort A'],
        1,
      );
      expect(result).toEqual(['Cohort A (1)']);
    });

    it('drops intersection when no cohort in selection matches', () => {
      const result = filterVennSectionsForSelectedCohorts(
        ['Cohort A (1) ∩ Cohort B (2)'],
        ['Cohort C'],
        0,
      );
      expect(result).toEqual([]);
    });
  });

  describe('shouldClearRowDataOnEmptySelection', () => {
    it('returns false when cohorts are selected', () => {
      expect(shouldClearRowDataOnEmptySelection(['a'], {})).toBe(false);
    });

    it('returns true when empty and no navigation cohort', () => {
      expect(shouldClearRowDataOnEmptySelection([], {})).toBe(true);
    });

    it('returns false when navigation state includes cohort', () => {
      const location = { state: { cohort: { cohortId: 'x' } } };
      expect(shouldClearRowDataOnEmptySelection([], location)).toBe(false);
    });
  });

  describe('countNonExampleCohorts / canAddExampleCohorts', () => {
    it('counts only non-example keys', () => {
      const state = { a: {}, 'example cohort 1': {} };
      expect(countNonExampleCohorts(state, ['example cohort 1'])).toEqual(['a']);
    });

    it('allows add when at limit', () => {
      const state = { a: {}, b: {} };
      expect(canAddExampleCohorts(state, [], 17)).toBe(true);
    });

    it('blocks add when over limit', () => {
      const keys = Array.from({ length: 18 }, (_, i) => `c${i}`);
      const state = keys.reduce((acc, k) => ({ ...acc, [k]: {} }), {});
      expect(canAddExampleCohorts(state, [], 17)).toBe(false);
    });
  });

  describe('buildExploreUploadPayload', () => {
    it('maps row data to upload shape', () => {
      const rowData = [
        { participant_id: 'P1', dbgap_accession: 'phs1' },
        { participant_id: 'P2', dbgap_accession: 'phs2' },
      ];
      const { upload, uploadMetadata } = buildExploreUploadPayload(rowData);
      expect(upload).toHaveLength(2);
      expect(uploadMetadata.fileContent).toBe('P1,P2');
      expect(uploadMetadata.matched).toEqual(upload);
    });
  });

  describe('shouldSkipNavigateAwayModal', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns true when hideNavigateModal is set', () => {
      localStorage.setItem('hideNavigateModal', 'true');
      expect(shouldSkipNavigateAwayModal()).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(shouldSkipNavigateAwayModal()).toBe(false);
    });
  });
});
