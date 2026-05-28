import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  useHistogramPopupFilteredKmData,
  useHistogramPopupKmCohortColors,
} from '../../../HistogramPanel/utils/histogramPopupKmDerived';

function FilteredKmHarness({ kmPlotData, c1, c2, c3 }) {
  const data = useHistogramPopupFilteredKmData(kmPlotData, c1, c2, c3);
  return <div data-testid="count">{data.length}</div>;
}

function ColorsHarness({ c1, c2, c3 }) {
  const colors = useHistogramPopupKmCohortColors(c1, c2, c3);
  return <div data-testid="colors">{colors.length}</div>;
}

describe('histogramPopupKmDerived', () => {
  const kmPlotData = [
    { group: 'c1', value: 1 },
    { group: 'cohort 2', value: 2 },
    { group: 'other', value: 3 },
  ];

  it('filters KM data to selected cohort arms', () => {
    render(<FilteredKmHarness kmPlotData={kmPlotData} c1={['a']} c2={[]} c3={[]} />);
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('returns empty array when kmPlotData is missing', () => {
    render(<FilteredKmHarness kmPlotData={null} c1={['a']} c2={[]} c3={[]} />);
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('builds cohort colors for non-empty selections', () => {
    render(<ColorsHarness c1={['a']} c2={['b']} c3={[]} />);
    expect(screen.getByTestId('colors').textContent).toBe('2');
  });
});
