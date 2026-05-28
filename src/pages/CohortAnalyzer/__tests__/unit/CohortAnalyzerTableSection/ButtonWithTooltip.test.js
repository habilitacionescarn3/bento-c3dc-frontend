import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('@bento-core/tool-tip/dist/ToolTip', () => ({
  __esModule: true,
  default: ({ title, children }) => (
    <div data-testid="tooltip" title={typeof title === 'object' ? 'rich' : title}>
      {children}
    </div>
  ),
}));

import { ButtonWithTooltip } from '../../../CohortAnalyzerTableSection/ButtonWithTooltip';

describe('ButtonWithTooltip', () => {
  it('invokes onClick when enabled', () => {
    const onClick = jest.fn();
    render(
      <ButtonWithTooltip
        className="btn"
        disabled={false}
        onClick={onClick}
        tooltip="Help text"
        icon="help.png"
      >
        Export
      </ButtonWithTooltip>,
    );
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not invoke onClick when disabled', () => {
    const onClick = jest.fn();
    render(
      <ButtonWithTooltip
        className="btn"
        disabled
        onClick={onClick}
        tooltip="Help"
        icon="help.png"
      >
        Export
      </ButtonWithTooltip>,
    );
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
