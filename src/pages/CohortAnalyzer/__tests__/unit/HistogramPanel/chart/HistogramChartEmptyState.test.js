import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistogramChartEmptyState } from '../../../../HistogramPanel/chart/HistogramChartEmptyState';

describe('HistogramChartEmptyState', () => {
  it('renders accessible empty-state copy', () => {
    render(<HistogramChartEmptyState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('No data available.')).toBeInTheDocument();
    expect(screen.getByText(/adjusting your filters/i)).toBeInTheDocument();
  });
});
