import React from 'react';
import { render } from '@testing-library/react';
import { exploreCCDIHubTooltip, exploreDashboardTooltip } from '../../../config/CohortAnalyzerConfig';

describe('CohortAnalyzerConfig', () => {
  it('renders explore CCDI Hub tooltip', () => {
    const { container } = render(exploreCCDIHubTooltip);
    expect(container.querySelector('p')).toBeTruthy();
  });

  it('renders explore dashboard tooltip text', () => {
    const { container } = render(exploreDashboardTooltip);
    expect(container.textContent).toContain('Explore Dashboard');
  });
});
