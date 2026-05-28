import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NoDataCard } from '../../../components/NoDataCard';

describe('NoDataCard', () => {
  it('renders empty-state message', () => {
    render(<NoDataCard />);
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
  });

  it('renders placeholder chart svg', () => {
    const { container } = render(<NoDataCard />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
