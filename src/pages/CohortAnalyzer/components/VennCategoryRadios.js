import React from 'react';
import ToolTip from '@bento-core/tool-tip/dist/ToolTip';
import questionIcon3 from '../../../assets/icons/Question_icon_2.svg';
import {
  CohortAnalyzerRadioFieldset,
  CohortAnalyzerRadioInput,
  CohortAnalyzerRadioLabel,
} from '../styling/cohortAnalyzerRadio.styled';

const containerStyle = {
  padding: '12px 16px 16px',
  flexShrink: 0,
  width: '100%',
  boxSizing: 'border-box',
};

const promptRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 2,
  flexWrap: 'wrap',
};

const promptStyle = {
  margin: 0,
  fontSize: 16,
  fontFamily: 'Poppins',
  color: '#5C5C5C',
  lineHeight: 1.35,
};

const legendOffscreenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const RADIO_OPTIONS = [
  { value: 0, label: 'Participant ID' },
  { value: 1, label: 'Diagnosis' },
  { value: 2, label: 'Treatment' },
];

/**
 * Renders the "Select a data category for cohort matching:" prompt + the three radio buttons
 * (Participant ID, Diagnosis, Treatment) used to drive the Venn diagram's intersection mode.
 *
 * Shared between the inline Venn header (CohortAnalyzerHeader) and the expanded Venn modal tab
 * so users can change the matching category in both views.
 */
const VennCategoryRadios = ({
  selectedCohorts,
  nodeIndex,
  setNodeIndex,
  setRowData,
  alignWithModalHeader = false,
}) => {
  const cohortsReady = Array.isArray(selectedCohorts) && selectedCohorts.length > 0;
  const rowOpacity = cohortsReady ? 1 : 0.55;
  const resolvedContainerStyle = alignWithModalHeader
    ? { ...containerStyle, padding: '12px 0 16px' }
    : containerStyle;

  return (
    <div style={resolvedContainerStyle}>
      <div style={promptRowStyle}>
        <p style={promptStyle}>Select a data category for cohort matching:</p>
        <ToolTip
          maxWidth="380px"
          zIndex={3000}
          title="The venn diagram is a stylized representation of the selected cohorts and their shared Participant IDs, and are not proportionally accurate,"
          arrow
          placement="top"
        >
          <img alt="Help" src={questionIcon3} style={{ display: 'block' }} height={12} />
        </ToolTip>
      </div>
      <CohortAnalyzerRadioFieldset>
        <legend style={legendOffscreenStyle}>Data category options</legend>
        {RADIO_OPTIONS.map(({ value, label }) => (
          <ToolTip
            key={value}
            backgroundColor="white"
            zIndex={3000}
            title="All Venn diagram selected areas will be cleared when changing buttons"
            arrow
            placement="top"
          >
            <CohortAnalyzerRadioLabel
              style={{
                opacity: rowOpacity,
                cursor: cohortsReady ? 'pointer' : 'not-allowed',
              }}
            >
              <CohortAnalyzerRadioInput
                disabled={!cohortsReady}
                value={String(value + 1)}
                checked={nodeIndex === value}
                onChange={() => {
                  setRowData([]);
                  setNodeIndex(value);
                }}
                name="node_type"
                aria-label={label}
              />
              {label}
            </CohortAnalyzerRadioLabel>
          </ToolTip>
        ))}
      </CohortAnalyzerRadioFieldset>
    </div>
  );
};

export default VennCategoryRadios;
