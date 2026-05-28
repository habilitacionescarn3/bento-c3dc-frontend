import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

/**
 * Minimal Redux store for Cohort Analyzer layout slice tests / component renders.
 */
export function createCohortAnalyzerTestStore(layoutOverrides = {}) {
  const initialState = {
    cohortAnalyzerLayout: {
      topRowOrder: ['venn', 'survival'],
      panelRegistry: {},
      sizes: {},
      stripOrder: [],
      besideStripPanelId: null,
      chartVisualByPanelId: {},
      userLayoutChanged: false,
      ...layoutOverrides,
    },
  };
  return createStore((state = initialState) => state);
}

export function renderWithCohortAnalyzerProviders(ui, { route = '/', store } = {}) {
  const testStore = store || createCohortAnalyzerTestStore();
  return render(
    <Provider store={testStore}>
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {ui}
      </MemoryRouter>
    </Provider>,
  );
}
