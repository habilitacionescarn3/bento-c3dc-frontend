import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  mockNavigate,
  mockDispatch,
  mockNotificationShow,
  mockGetJoinedCohortData,
  mockOpenUserGuide,
  defaultCohortAnalyzerContext,
  defaultCohortState,
  resetCohortAnalyzerMocks,
} from '../../testSupport/cohortAnalyzerMocks';
import { renderWithCohortAnalyzerProviders } from '../../testSupport/cohortAnalyzerTestUtils';

const mockUseCohortAnalyzer = jest.fn(() => defaultCohortAnalyzerContext);
let mockLocation = { state: null };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => selector({
    cohortAnalyzerLayout: { topRowOrder: ['venn', 'survival'] },
  }),
}));

jest.mock('../../context/CohortAnalyzerContext', () => ({
  useCohortAnalyzer: () => mockUseCohortAnalyzer(),
}));

jest.mock('../../../../components/CohortSelectorState/CohortStateContext', () => {
  const ReactMock = require('react');
  return {
    CohortStateContext: ReactMock.createContext({
      state: {},
      dispatch: jest.fn(),
    }),
  };
});

jest.mock('../../../../components/CohortModal/CohortModalContext', () => {
  const ReactMock = require('react');
  return {
    CohortModalContext: ReactMock.createContext({
      setShowCohortModal: jest.fn(),
      showCohortModal: false,
      setCurrentCohortChanges: jest.fn(),
      setWarningMessage: jest.fn(),
      warningMessage: '',
    }),
  };
});

jest.mock('../../../../components/Global/GlobalProvider', () => ({
  useGlobal: () => ({ Notification: { show: mockNotificationShow } }),
}));

jest.mock('../../CohortAnalyzerUtil/CohortDataTransform', () => ({
  getJoinedCohortData: (...args) => mockGetJoinedCohortData(...args),
}));

jest.mock('../../../../components/Stats/GlobalStatsController', () => () => <div data-testid="stats" />);
jest.mock('../../components/navigateAwayModal', () => () => null);
jest.mock('../../../../components/CohortModal/components/shared/ConfirmationModal', () => ({
  __esModule: true,
  default: ({ open, setOpen, handleConfirm, message }) => (
    open ? (
      <div data-testid="confirmation-modal">
        {message ? <span>{message}</span> : null}
        <button type="button" onClick={setOpen}>Close confirmation</button>
        <button type="button" onClick={handleConfirm}>Confirm action</button>
      </div>
    ) : null
  ),
}));
jest.mock('../../../../components/CohortModal/CohortModal', () => ({
  __esModule: true,
  default: ({ open, onCloseModal }) => (
    open ? (
      <button type="button" onClick={onCloseModal}>Close cohort modal</button>
    ) : null
  ),
}));
jest.mock('../../CohortSelector/CohortSelector', () => ({
  CohortSelector: ({ handleDemoClick }) => (
    <button type="button" onClick={handleDemoClick}>Demo</button>
  ),
}));
jest.mock('../../components/CohortAnalyzerSummaryView', () => ({
  CohortAnalyzerSummaryView: ({ chartPanel, tablePanel, summaryTrailingActions }) => (
    <div>
      {summaryTrailingActions}
      {chartPanel}
      {tablePanel}
    </div>
  ),
}));
jest.mock('../../components/CohortAnalyzerChartArea', () => ({
  CohortAnalyzerChartArea: () => <div data-testid="chart-area" />,
}));
jest.mock('../../CohortAnalyzerTableSection/CohortAnalyzerTableSection', () => ({
  CohortAnalyzerTableSection: ({ handleBuildInExplore, handleClick, initTblState }) => {
    const tblState = initTblState({});
    const SearchBoxComponent = tblState.SearchBox;
    return (
      <div data-testid="table-section">
        <SearchBoxComponent />
        <button type="button" onClick={handleBuildInExplore}>Build in Explore</button>
        <button type="button" onClick={handleClick}>Create cohort</button>
      </div>
    );
  },
}));
jest.mock('../../hooks/useBesidePanelDnD', () => ({
  useBesidePanelDnD: () => ({
    survivalBesideTopRowUsesOrder: false,
    besideDropTarget: null,
    besideColumnDropTargetStyle: {},
    handleBesideRowDragLeave: jest.fn(),
    handleBesideColumnDragOver: () => jest.fn(),
    handleBesidePanelDrop: () => jest.fn(),
    survivalBesideDrag: {},
    besidePanelDragging: null,
    besidePanelDraggingRef: { current: null },
    endBesidePanelDrag: jest.fn(),
  }),
}));

jest.mock('../../styling/cohortAnalyzerStyling', () => ({
  useStyle: () => ({
    container: 'container',
    rightSideAnalyzer: 'right',
    alert: 'alert',
    rightSideAnalyzerHeader: 'header',
    readmeButton: 'readme',
  }),
}));

jest.mock('../../../inventory/sideBar/UserGuideContext', () => ({
  useUserGuide: () => ({ openUserGuide: mockOpenUserGuide }),
}));

const mockStoreDispatch = jest.fn();
jest.mock('../../../../store', () => ({
  __esModule: true,
  default: { dispatch: (...args) => mockStoreDispatch(...args) },
}));

jest.mock('../../../../bento/exampleCohortData', () => ({
  exampleCohorts: [{ cohortId: 'Ex 1', cohortDescription: 'd', participants: [] }],
  getExampleCohortKeys: () => ['ex 1'],
}));

jest.mock('../../../../components/CohortSelectorState/store/action', () => ({
  onCreateNewCohort: jest.fn((id, desc, parts, onSuccess) => {
    if (onSuccess) onSuccess(1);
    return { type: 'MOCK_CREATE' };
  }),
  onDeleteSingleCohort: jest.fn(() => ({ type: 'MOCK_DELETE' })),
  onDeleteAllCohort: jest.fn(() => ({ type: 'MOCK_DELETE_ALL' })),
}));

import { CohortStateContext } from '../../../../components/CohortSelectorState/CohortStateContext';
import { CohortModalContext } from '../../../../components/CohortModal/CohortModalContext';
import { CohortAnalyzer } from '../../CohortAnalyzer';

describe('CohortAnalyzer page entry point', () => {
  const modalContext = {
    setShowCohortModal: jest.fn(),
    showCohortModal: false,
    setCurrentCohortChanges: jest.fn(),
    setWarningMessage: jest.fn(),
    warningMessage: '',
  };

  const renderPage = (contextOverrides = {}, state = defaultCohortState, modalOverrides = {}) => {
    mockUseCohortAnalyzer.mockReturnValue({ ...defaultCohortAnalyzerContext, ...contextOverrides });
    return renderWithCohortAnalyzerProviders(
      <CohortStateContext.Provider value={{ state, dispatch: mockDispatch }}>
        <CohortModalContext.Provider value={{ ...modalContext, ...modalOverrides }}>
          <CohortAnalyzer />
        </CohortModalContext.Provider>
      </CohortStateContext.Provider>,
    );
  };

  beforeEach(() => {
    resetCohortAnalyzerMocks();
    mockStoreDispatch.mockClear();
    mockLocation = { state: null };
    jest.useFakeTimers();
    localStorage.clear();
    const { onCreateNewCohort } = require('../../../../components/CohortSelectorState/store/action');
    onCreateNewCohort.mockImplementation((id, desc, parts, onSuccess) => {
      if (onSuccess) onSuccess(1);
      return { type: 'MOCK_CREATE' };
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders page title and main sections', () => {
    renderPage();
    expect(screen.getByText('Cohort Analyzer')).toBeInTheDocument();
    expect(screen.getByTestId('chart-area')).toBeInTheDocument();
    expect(screen.getByTestId('table-section')).toBeInTheDocument();
  });

  it('opens user guide from README button', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /readme/i }));
    expect(mockOpenUserGuide).toHaveBeenCalled();
  });

  it('shows alert and clears it after timeout', () => {
    renderPage({ alert: { type: 'success', message: 'Saved' } });
    expect(screen.getByText('Saved')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(2600);
    });
    expect(defaultCohortAnalyzerContext.setAlert).toHaveBeenCalledWith({ type: '', message: '' });
  });

  it('calls getJoinedCohortData when selected cohorts change', () => {
    renderPage({ selectedCohorts: ['cohort-a'], selectedChart: [] });
    expect(mockGetJoinedCohortData).toHaveBeenCalled();
  });

  it('handleDemoClick blocks when cohort limit exceeded', () => {
    const manyCohorts = {};
    for (let i = 0; i < 18; i += 1) {
      manyCohorts[`c${i}`] = { participants: [] };
    }
    renderPage({}, manyCohorts);
    fireEvent.click(screen.getByText('Demo'));
    expect(mockNotificationShow).toHaveBeenCalledWith(
      expect.stringContaining('maximum limit'),
      5000,
    );
  });

  it('handleDemoClick creates example cohorts when under limit', () => {
    renderPage({}, {});
    fireEvent.click(screen.getByText('Demo'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('computes hasParticipantData when cohort has participants', () => {
    renderPage({ selectedCohorts: ['cohort-a'] }, defaultCohortState);
    expect(mockUseCohortAnalyzer).toHaveBeenCalled();
  });

  it('selects cohort from location state on mount', () => {
    const handleCheckbox = jest.fn();
    mockLocation = { state: { cohort: { cohortId: 'nav-cohort' } } };
    renderPage({ handleCheckbox });
    expect(handleCheckbox).toHaveBeenCalledWith('nav-cohort', null);
  });

  it('filters venn sections when nodeIndex is valid', () => {
    renderPage({
      nodeIndex: 0,
      selectedCohortSection: ['Cohort A (1)'],
      selectedCohorts: ['Cohort A'],
    });
    expect(defaultCohortAnalyzerContext.setSelectedCohortSections).toHaveBeenCalledWith(['Cohort A (1)']);
  });

  it('clears row data when selection empty without navigation cohort', () => {
    renderPage({ selectedCohorts: [], selectedChart: [] });
    expect(defaultCohortAnalyzerContext.setRowData).toHaveBeenCalledWith([]);
  });

  it('handleBuildInExplore skips modal when localStorage flag is set', () => {
    localStorage.setItem('hideNavigateModal', 'true');
    renderPage({
      rowData: [{ participant_id: 'P1', dbgap_accession: 'phs1' }],
    });
    fireEvent.click(screen.getByRole('button', { name: /build in explore/i }));
    expect(mockStoreDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/explore');
    expect(defaultCohortAnalyzerContext.setShowNavigateAwayModal).not.toHaveBeenCalled();
  });

  it('handleBuildInExplore opens navigate-away modal by default', () => {
    renderPage({ rowData: [{ participant_id: 'P1', dbgap_accession: 'phs1' }] });
    fireEvent.click(screen.getByRole('button', { name: /build in explore/i }));
    expect(defaultCohortAnalyzerContext.setShowNavigateAwayModal).toHaveBeenCalledWith(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handleClick creates cohort when section and row data exist', () => {
    renderPage({
      selectedCohortSection: ['Cohort A (1)'],
      rowData: [{ participant_id: 'P1' }],
    });
    fireEvent.click(screen.getByRole('button', { name: /create cohort/i }));
    expect(mockDispatch).toHaveBeenCalled();
    expect(modalContext.setShowCohortModal).toHaveBeenCalledWith(true);
  });

  it('handleClick does nothing without section or row data', () => {
    renderPage({ selectedCohortSection: [], rowData: [] });
    fireEvent.click(screen.getByRole('button', { name: /create cohort/i }));
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('clears search when selectedChart changes', () => {
    const { rerender } = renderPage({ selectedChart: ['race'] });
    mockUseCohortAnalyzer.mockReturnValue({
      ...defaultCohortAnalyzerContext,
      selectedChart: ['sexAtBirth'],
    });
    rerender(
      <CohortStateContext.Provider value={{ state: defaultCohortState, dispatch: mockDispatch }}>
        <CohortModalContext.Provider value={modalContext}>
          <CohortAnalyzer />
        </CohortModalContext.Provider>
      </CohortStateContext.Provider>,
    );
    expect(defaultCohortAnalyzerContext.setSearchValue).toHaveBeenCalledWith('');
  });

  it('handleSearchValue updates search and focuses input when cleared', () => {
    renderPage({ searchValue: 'abc' });
    const input = screen.getByPlaceholderText('Search Participant ID');
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultCohortAnalyzerContext.setSearchValue).toHaveBeenCalledWith('');
    act(() => {
      jest.advanceTimersByTime(200);
    });
  });

  it('dismisses alert via onClose', () => {
    renderPage({ alert: { type: 'info', message: 'Note' } });
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(defaultCohortAnalyzerContext.setAlert).toHaveBeenCalledWith({ type: '', message: '' });
  });

  it('resets venn sections when nodeIndex changes', () => {
    const { rerender } = renderPage({ nodeIndex: 0 });
    mockUseCohortAnalyzer.mockReturnValue({
      ...defaultCohortAnalyzerContext,
      nodeIndex: 1,
    });
    rerender(
      <CohortStateContext.Provider value={{ state: defaultCohortState, dispatch: mockDispatch }}>
        <CohortModalContext.Provider value={modalContext}>
          <CohortAnalyzer />
        </CohortModalContext.Provider>
      </CohortStateContext.Provider>,
    );
    expect(defaultCohortAnalyzerContext.setSelectedCohortSections).toHaveBeenCalledWith([]);
    expect(defaultCohortAnalyzerContext.setGeneralInfo).toHaveBeenCalledWith({});
  });

  it('handleClick surfaces create-cohort errors', () => {
    const { onCreateNewCohort } = require('../../../../components/CohortSelectorState/store/action');
    onCreateNewCohort.mockImplementationOnce((id, desc, parts, onSuccess, onError) => {
      onError(new Error('duplicate'));
    });
    renderPage({
      selectedCohortSection: ['Cohort A (1)'],
      rowData: [{ participant_id: 'P1' }],
    });
    fireEvent.click(screen.getByRole('button', { name: /create cohort/i }));
    expect(modalContext.setWarningMessage).toHaveBeenCalledWith(' duplicate');
  });

  it('handleDemoClick shows error when example cohort creation fails', () => {
    const { onCreateNewCohort } = require('../../../../components/CohortSelectorState/store/action');
    onCreateNewCohort.mockImplementationOnce((id, desc, parts, onSuccess, onError) => {
      if (onError) onError(new Error('create failed'));
      return { type: 'MOCK_CREATE_FAIL' };
    });
    renderPage({}, {});
    fireEvent.click(screen.getByText('Demo'));
    expect(mockNotificationShow).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create example cohorts'),
      5000,
    );
  });

  it('does not clear row data when empty selection but navigation cohort present', () => {
    mockLocation = { state: { cohort: { cohortId: 'nav-cohort' } } };
    defaultCohortAnalyzerContext.setRowData.mockClear();
    renderPage({ selectedCohorts: [], selectedChart: [] });
    expect(defaultCohortAnalyzerContext.setRowData).not.toHaveBeenCalledWith([]);
  });

  it('confirms cohort deletion from confirmation modal', () => {
    renderPage({
      deleteInfo: {
        showDeleteConfirmation: true,
        deleteType: 'delete this cohort?',
        cohortId: 'cohort-a',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm action/i }));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dismisses warning confirmation modal', () => {
    renderPage({}, defaultCohortState, { warningMessage: 'Something went wrong' });
    fireEvent.click(screen.getByRole('button', { name: /close confirmation/i }));
    expect(modalContext.setWarningMessage).toHaveBeenCalledWith('');
  });

  it('confirms warning modal clears message', () => {
    renderPage({}, defaultCohortState, { warningMessage: 'Something went wrong' });
    fireEvent.click(screen.getByRole('button', { name: /confirm action/i }));
    expect(modalContext.setWarningMessage).toHaveBeenCalledWith('');
  });

  it('closes cohort modal', () => {
    renderPage({}, defaultCohortState, { showCohortModal: true });
    fireEvent.click(screen.getByRole('button', { name: /close cohort modal/i }));
    expect(modalContext.setShowCohortModal).toHaveBeenCalledWith(false);
  });

  it('handleDemoClick auto-selects example cohorts when all are created', () => {
    renderPage({}, {});
    fireEvent.click(screen.getByText('Demo'));
    expect(defaultCohortAnalyzerContext.setSelectedCohorts).toHaveBeenCalled();
    expect(mockNotificationShow).toHaveBeenCalledWith(
      expect.stringContaining('Successfully created'),
      7000,
    );
  });

  it('toggles delete confirmation closed via setOpen', () => {
    const setDeleteInfo = jest.fn();
    renderPage({
      deleteInfo: {
        showDeleteConfirmation: true,
        deleteType: 'delete this cohort?',
        cohortId: 'cohort-a',
      },
      setDeleteInfo,
    });
    fireEvent.click(screen.getByRole('button', { name: /close confirmation/i }));
    expect(setDeleteInfo).toHaveBeenCalled();
  });

  it('refreshes table content when cohort list changes', () => {
    const { rerender } = renderPage({ cohortList: ['a'] });
    mockUseCohortAnalyzer.mockReturnValue({
      ...defaultCohortAnalyzerContext,
      cohortList: ['a', 'b'],
    });
    rerender(
      <CohortStateContext.Provider value={{ state: defaultCohortState, dispatch: mockDispatch }}>
        <CohortModalContext.Provider value={modalContext}>
          <CohortAnalyzer />
        </CohortModalContext.Provider>
      </CohortStateContext.Provider>,
    );
    expect(defaultCohortAnalyzerContext.setRefreshTableContent).toHaveBeenCalledWith(false);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(defaultCohortAnalyzerContext.setRefreshTableContent).toHaveBeenCalledWith(true);
  });
});
