import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CohortAnalyzerSummaryView } from '../../../components/CohortAnalyzerSummaryView';

const classes = {
  summaryViewShell: 'shell',
  summaryTabsBar: 'bar',
  summaryTabs: 'tabs',
  summaryTab: 'tab',
  summaryTabActive: 'active',
  summaryTabsBarEnd: 'end',
  summaryTabPanel: 'panel',
};

describe('CohortAnalyzerSummaryView', () => {
  it('shows chart panel by default', () => {
    render(
      <CohortAnalyzerSummaryView
        classes={classes}
        activeView="chart"
        setActiveView={jest.fn()}
        chartPanel={<div data-testid="chart-panel">Chart</div>}
        tablePanel={<div data-testid="table-panel">Table</div>}
      />,
    );
    expect(screen.getByTestId('chart-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('table-panel')).not.toBeInTheDocument();
  });

  it('switches to table view on tab click', () => {
    const setActiveView = jest.fn();
    render(
      <CohortAnalyzerSummaryView
        classes={classes}
        activeView="chart"
        setActiveView={setActiveView}
        chartPanel={<div>Chart</div>}
        tablePanel={<div>Table</div>}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /table view/i }));
    expect(setActiveView).toHaveBeenCalledWith('table');
  });

  it('renders trailing actions when provided', () => {
    render(
      <CohortAnalyzerSummaryView
        classes={classes}
        activeView="chart"
        setActiveView={jest.fn()}
        summaryTrailingActions={<button type="button">README</button>}
        chartPanel={<div>Chart</div>}
        tablePanel={<div>Table</div>}
      />,
    );
    expect(screen.getByRole('button', { name: /readme/i })).toBeInTheDocument();
  });
});
