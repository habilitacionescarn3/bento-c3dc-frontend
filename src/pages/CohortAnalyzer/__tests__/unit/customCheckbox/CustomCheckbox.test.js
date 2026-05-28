import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomCheckbox from '../../../customCheckbox/CustomCheckbox';

describe('CustomCheckbox', () => {
  it('calls handleCheckbox when clicked and not disabled', () => {
    const handleCheckbox = jest.fn();
    render(
      <CustomCheckbox
        selectedCohorts={['a']}
        cohort="b"
        handleCheckbox={handleCheckbox}
      />,
    );
    fireEvent.click(screen.getByAltText('checkbox b'));
    expect(handleCheckbox).toHaveBeenCalledWith('b', expect.any(Object));
  });

  it('does not call handleCheckbox when three cohorts already selected', () => {
    const handleCheckbox = jest.fn();
    render(
      <CustomCheckbox
        selectedCohorts={['a', 'b', 'c']}
        cohort="d"
        handleCheckbox={handleCheckbox}
      />,
    );
    fireEvent.click(screen.getByAltText('checkbox d'));
    expect(handleCheckbox).not.toHaveBeenCalled();
  });
});
