import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  triggerNotification,
  filterAllParticipantWithDiagnosisName,
  filterAllParticipantWithTreatmentType,
  getIdsFromCohort,
  getAllIds,
  addCohortColumn,
  resetSelection,
  sortBy,
  sortByReturn,
  handleDelete,
  SearchBox,
  generateQueryVariable,
  handlePopup,
} from '../../../CohortAnalyzerUtil/CohortAnalyzerUtil';

describe('CohortAnalyzerUtil', () => {
  describe('triggerNotification', () => {
    it('shows plural message for multiple participants', () => {
      const Notification = { show: jest.fn() };
      triggerNotification(2, Notification);
      expect(Notification.show).toHaveBeenCalledWith(expect.stringContaining('Participants'), 5000);
    });

    it('shows singular message for one participant', () => {
      const Notification = { show: jest.fn() };
      triggerNotification(1, Notification);
      expect(Notification.show).toHaveBeenCalledWith(expect.stringContaining('Participant added'), 5000);
    });
  });

  describe('filterAllParticipantWithDiagnosisName', () => {
    it('filters participants by diagnosis in generalInfo', () => {
      const generalInfo = { section1: ['D1'] };
      const participants = [
        { diagnosis: 'D1', id: 1 },
        { diagnosis: 'D2', id: 2 },
      ];
      const result = filterAllParticipantWithDiagnosisName(generalInfo, participants);
      expect(result).toHaveLength(1);
      expect(result[0].diagnosis).toBe('D1');
    });
  });

  describe('filterAllParticipantWithTreatmentType', () => {
    it('filters participants by treatment type', () => {
      const generalInfo = { section1: ['Chemo'] };
      const participants = [
        { treatment_type: 'Chemo' },
        { treatment_type: 'Radio' },
      ];
      expect(filterAllParticipantWithTreatmentType(generalInfo, participants)).toHaveLength(1);
    });
  });

  describe('getIdsFromCohort', () => {
    it('collects participant pks for selected cohorts', () => {
      const data = {
        a: { participants: [{ participant_pk: 'pk1' }, { participant_pk: 'pk2' }] },
        b: { participants: [{ participant_pk: 'pk3' }] },
      };
      expect(getIdsFromCohort(data, ['a'])).toEqual(['pk1', 'pk2']);
    });

    it('skips cohorts without participants array', () => {
      const data = { a: {}, b: { participants: [{ participant_pk: 'pk1' }] } };
      expect(getIdsFromCohort(data, ['a', 'b'])).toEqual(['pk1']);
    });
  });

  describe('getAllIds', () => {
    it('flattens generalInfo sections', () => {
      expect(getAllIds({ a: [1, 2], b: [3] })).toEqual([1, 2, 3]);
    });
  });

  describe('addCohortColumn', () => {
    const state = {
      'cohort a': {
        cohortName: 'Cohort A',
        participants: [{ participant_pk: 'pk1' }],
      },
    };

    it('adds cohort column using participant_pk', () => {
      const rows = [{ participant_pk: 'pk1', value: 1 }];
      const result = addCohortColumn(rows, state, ['cohort a'], 'other');
      expect(result[0].cohort).toBeDefined();
    });

    it('adds cohort column using id for treatment type', () => {
      const rows = [{ id: 'pk1', value: 1 }];
      const result = addCohortColumn(rows, state, ['cohort a'], 'treatment');
      expect(result[0].cohort).toBeDefined();
    });
  });

  describe('resetSelection', () => {
    it('clears cohorts, row data, and resets node index', () => {
      const setSelectedCohorts = jest.fn();
      const setNodeIndex = jest.fn();
      const setRowData = jest.fn();
      resetSelection(setSelectedCohorts, setNodeIndex, setRowData);
      expect(setSelectedCohorts).toHaveBeenCalledWith([]);
      expect(setRowData).toHaveBeenCalledWith([]);
      expect(setNodeIndex).toHaveBeenCalledWith(0);
    });
  });

  describe('sortBy', () => {
    it('sorts alphabetically', () => {
      const setCohortList = jest.fn();
      const result = sortBy('alphabet', ['b', 'a'], setCohortList, {});
      expect(result).toEqual(['a', 'b']);
    });

    it('sorts by participant count', () => {
      const state = { a: { participants: [1, 2] }, b: { participants: [1] } };
      const result = sortBy('count', ['a', 'b'], jest.fn(), state);
      expect(result[0]).toBe('b');
    });
  });

  describe('sortByReturn', () => {
    it('puts selected cohorts first when sorted alphabetically', () => {
      const state = { a: { participants: [] }, b: { participants: [] }, c: { participants: [] } };
      const result = sortByReturn('alphabet', ['c', 'b', 'a'], state, ['b']);
      expect(result[0]).toBe('b');
    });

    it('sorts by participant count when type is not alphabet', () => {
      const state = {
        a: { participants: [1, 2] },
        b: { participants: [1] },
        c: { participants: [] },
      };
      const result = sortByReturn('count', ['a', 'b', 'c'], state, []);
      expect(result[0]).toBe('c');
    });
  });

  describe('handleDelete', () => {
    it('deletes single cohort', () => {
      const dispatch = jest.fn();
      const setCohortList = jest.fn((fn) => fn(['a', 'b']));
      const setSelectedCohorts = jest.fn((fn) => fn(['a']));
      handleDelete('a', setCohortList, setSelectedCohorts, dispatch, jest.fn(), jest.fn(), jest.fn(), jest.fn());
      expect(dispatch).toHaveBeenCalled();
    });

    it('deletes all cohorts when cohortId is falsy', () => {
      const setCohortList = jest.fn();
      const setSelectedCohorts = jest.fn();
      const setGeneralInfo = jest.fn();
      const setRowData = jest.fn();
      handleDelete(null, setCohortList, setSelectedCohorts, jest.fn(), jest.fn(), jest.fn(), setGeneralInfo, setRowData);
      expect(setCohortList).toHaveBeenCalledWith([]);
      expect(setGeneralInfo).toHaveBeenCalledWith({});
    });
  });

  describe('generateQueryVariable', () => {
    it('builds participant_pk query from state', () => {
      const state = { a: { participants: [{ participant_pk: 'pk1' }] } };
      const query = generateQueryVariable(['a'], state);
      expect(query.participant_pk).toEqual(['pk1']);
      expect(query.first).toBe(10000);
    });
  });

  describe('handlePopup', () => {
    it('toggles delete confirmation when state has cohorts', () => {
      const setDeleteInfo = jest.fn();
      handlePopup('id1', { a: {} }, setDeleteInfo, { showDeleteConfirmation: false });
      expect(setDeleteInfo).toHaveBeenCalledWith({
        showDeleteConfirmation: true,
        deleteType: 'delete this cohort?',
        cohortId: 'id1',
      });
    });

    it('does nothing when state is empty', () => {
      const setDeleteInfo = jest.fn();
      handlePopup('id1', {}, setDeleteInfo, {});
      expect(setDeleteInfo).not.toHaveBeenCalled();
    });
  });

  describe('SearchBox', () => {
    it('renders search input', () => {
      const classes = { inputStyleContainer: 'c', inputStyle: 'i' };
      const ref = { current: null };
      render(SearchBox(classes, jest.fn(), '', ref));
      expect(screen.getByPlaceholderText('Search Participant ID')).toBeInTheDocument();
    });
  });
});
