import * as actionTypes from '../../../store/cohortAnalyzerLayoutActionTypes';

describe('cohortAnalyzerLayoutActionTypes', () => {
  it('exports unique string action types', () => {
    const values = Object.values(actionTypes);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('uses cohortAnalyzerLayout namespace prefix', () => {
    Object.values(actionTypes).forEach((type) => {
      expect(type).toMatch(/^cohortAnalyzerLayout\//);
    });
  });
});
