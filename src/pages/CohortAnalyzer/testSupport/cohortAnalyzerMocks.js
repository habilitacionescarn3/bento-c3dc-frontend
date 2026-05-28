/**
 * Shared mocks for Cohort Analyzer tests. Import and call resetCohortAnalyzerMocks() in beforeEach.
 */

export const mockNavigate = jest.fn();
export const mockDispatch = jest.fn();
export const mockNotificationShow = jest.fn();
export const mockGetJoinedCohortData = jest.fn(() => Promise.resolve());
export const mockOpenUserGuide = jest.fn();

export const defaultCohortAnalyzerContext = {
  resetVennWorkspaceUi: jest.fn(),
  selectedCohorts: [],
  setSelectedCohorts: jest.fn(),
  cohortList: [],
  setCohortList: jest.fn(),
  nodeIndex: 0,
  cohortData: null,
  setCohortData: jest.fn(),
  generalInfo: {},
  setGeneralInfo: jest.fn(),
  rowData: [],
  setRowData: jest.fn(),
  setRefreshTableContent: jest.fn(),
  searchValue: '',
  setSearchValue: jest.fn(),
  setQueryVariable: jest.fn(),
  selectedChart: [],
  selectedCohortSection: [],
  setSelectedCohortSections: jest.fn(),
  setDeleteInfo: jest.fn(),
  deleteInfo: { showDeleteConfirmation: false, deleteType: '', cohortId: '' },
  handleCheckbox: jest.fn(),
  showNavigateAwayModal: false,
  setShowNavigateAwayModal: jest.fn(),
  setAlert: jest.fn(),
  alert: { type: '', message: '' },
};

export const defaultCohortState = {
  'cohort-a': {
    cohortId: 'cohort-a',
    cohortName: 'Cohort A',
    participants: [{ id: 'p1', participant: { id: 'p1' }, participant_pk: 'pk1' }],
  },
};

export function resetCohortAnalyzerMocks() {
  mockNavigate.mockClear();
  mockDispatch.mockClear();
  mockNotificationShow.mockClear();
  mockGetJoinedCohortData.mockClear();
  mockOpenUserGuide.mockClear();
  Object.values(defaultCohortAnalyzerContext).forEach((fn) => {
    if (typeof fn === 'function' && fn.mockClear) fn.mockClear();
  });
}
