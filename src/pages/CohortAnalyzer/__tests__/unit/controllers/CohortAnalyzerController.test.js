import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../../../components/CohortSelectorState/CohortStateContext', () => {
  const ReactMock = require('react');
  return {
    CohortStateProvider: ({ children }) => <div data-testid="cohort-state">{children}</div>,
    CohortStateContext: ReactMock.createContext({ state: {}, dispatch: jest.fn() }),
  };
});

jest.mock('../../../../../components/CohortModal/CohortModalContext', () => {
  const ReactMock = require('react');
  return {
    CohortModalProvider: ({ children }) => <div data-testid="cohort-modal">{children}</div>,
    CohortModalContext: ReactMock.createContext({}),
  };
});

jest.mock('../../../context/CohortAnalyzerContext', () => ({
  CohortAnalyzerProvider: ({ children }) => <div data-testid="analyzer-context">{children}</div>,
}));

jest.mock('../../../CohortAnalyzer', () => ({
  CohortAnalyzer: () => <div data-testid="cohort-analyzer-page">Analyzer</div>,
}));

import CohortAnalyzerController from '../../../controllers/CohortAnalyzerController';

describe('CohortAnalyzerController', () => {
  it('wraps CohortAnalyzer with required providers', () => {
    render(<CohortAnalyzerController />);
    expect(screen.getByTestId('cohort-state')).toBeInTheDocument();
    expect(screen.getByTestId('cohort-modal')).toBeInTheDocument();
    expect(screen.getByTestId('analyzer-context')).toBeInTheDocument();
    expect(screen.getByTestId('cohort-analyzer-page')).toBeInTheDocument();
  });
});
