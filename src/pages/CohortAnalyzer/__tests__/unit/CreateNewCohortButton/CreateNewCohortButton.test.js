import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('@material-ui/core', () => ({
  makeStyles: () => () => ({
    createCohort: 'enabled',
    createCohortOpacity: 'disabled',
  }),
}));

jest.mock('@bento-core/tool-tip/dist/ToolTip', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="tooltip">{children}</div>,
}));

import { CreateNewCohortButton } from '../../../CreateNewCohortButton/CreateNewCohortButton';

describe('CreateNewCohortButton', () => {
  it('calls handleClick when enabled', () => {
    const handleClick = jest.fn();
    render(
      <CreateNewCohortButton
        selectedCohortSection={['seg']}
        rowData={[{ id: 1 }]}
        questionIcon="icon.png"
        handleClick={handleClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /create new cohort/i }));
    expect(handleClick).toHaveBeenCalled();
  });

  it('still renders when section and row data are empty', () => {
    render(
      <CreateNewCohortButton
        selectedCohortSection={[]}
        rowData={[]}
        questionIcon="icon.png"
        handleClick={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /create new cohort/i })).toBeTruthy();
  });
});
