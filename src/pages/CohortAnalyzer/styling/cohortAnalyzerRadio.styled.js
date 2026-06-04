import styled from 'styled-components';

/** Shared radio appearance for Venn category controls and histogram expanded modal. */
export const CohortAnalyzerRadioInput = styled.input.attrs({ type: 'radio' })`
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  margin: 0;
  margin-right: 6px;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid #5C5C5C;
  background-color: #FFFFFF;
  flex-shrink: 0;
  box-sizing: border-box;

  &:checked {
    background-image: radial-gradient(circle, #3A7587 0 4px, transparent 4.5px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const CohortAnalyzerRadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  margin: 0;
  font-family: Poppins, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #1C2B33;
  cursor: pointer;
`;

export const CohortAnalyzerRadioFieldset = styled.fieldset`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 16px;
  padding: 0;
  margin: 10px 0 0;
  color: #1C2B33;
  font-size: 16px;
  font-family: Poppins, sans-serif;
  border: none;
`;
