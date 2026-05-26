jest.mock('../../../../../utils/graphqlClient', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

jest.mock('../../../../../bento/cohortAnalyzerPageData', () => ({
  analyzer_query: [{ query: 'PARTICIPANTS' }, { query: 'DIAGNOSIS' }, { query: 'TREATMENT' }],
  responseKeys: ['participants', 'diagnosis', 'treatment'],
}));

import client from '../../../../../utils/graphqlClient';
import { getJoinedCohortData } from '../../../CohortAnalyzerUtil/CohortDataTransform';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('CohortDataTransform', () => {
  const state = {
    'cohort-a': {
      cohortName: 'Cohort A',
      participants: [{ participant_pk: 'pk1', participant: { id: 'pk1', participant_id: 'P1' } }],
    },
  };

  beforeEach(() => {
    client.query.mockReset();
    client.query.mockResolvedValue({
      data: {
        participants: [
          { id: 'pk1', participant_id: 'P1', participant: { id: 'pk1', participant_id: 'P1' } },
        ],
      },
    });
  });

  it('fetches participant rows for nodeIndex 0', async () => {
    const setRowData = jest.fn();
    const setQueryVariable = jest.fn();
    const setCohortData = jest.fn();

    await getJoinedCohortData({
      nodeIndex: 0,
      selectedCohorts: ['cohort-a'],
      state,
      generalInfo: {},
      searchValue: '',
      setQueryVariable,
      setRowData,
      location: {},
      setCohortData,
    });
    await flushPromises();

    expect(client.query).toHaveBeenCalled();
    expect(setQueryVariable).toHaveBeenCalled();
    expect(setRowData).toHaveBeenCalled();
  });

  it('filters row data by search value', async () => {
    const setRowData = jest.fn();

    await getJoinedCohortData({
      nodeIndex: 0,
      selectedCohorts: ['cohort-a'],
      state,
      generalInfo: {},
      searchValue: 'NO_MATCH',
      setQueryVariable: jest.fn(),
      setRowData,
      location: {},
      setCohortData: jest.fn(),
    });
    await flushPromises();

    expect(setRowData).toHaveBeenCalledWith([]);
  });

  it('clears row data when no participant pks and no navigation cohort', async () => {
    const setRowData = jest.fn();
    client.query.mockResolvedValueOnce({ data: { participants: [] } });

    await getJoinedCohortData({
      nodeIndex: 0,
      selectedCohorts: [],
      state: {},
      generalInfo: {},
      searchValue: '',
      setQueryVariable: jest.fn(),
      setRowData,
      location: {},
      setCohortData: jest.fn(),
    });
    await flushPromises();

    expect(setRowData).toHaveBeenCalledWith([]);
  });
});
