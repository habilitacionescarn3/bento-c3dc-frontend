import React from 'react';
import ToolTip from '@bento-core/tool-tip/dist/ToolTip';
import questionIcon3 from '../../../assets/icons/Question_icon_2.svg';

const vennRadioStyle = (selected) => ({
  appearance: 'none',
  WebkitAppearance: 'none',
  width: 16,
  height: 16,
  margin: 0,
  marginRight: 6,
  cursor: 'pointer',
  borderRadius: '50%',
  border: '2px solid #5C5C5C',
  backgroundColor: '#FFFFFF',
  backgroundImage: selected
    ? 'radial-gradient(circle, #3A7587 0 4px, transparent 4.5px)'
    : 'none',
  flexShrink: 0,
  boxSizing: 'border-box',
});

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

const radioContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  marginTop: 10,
  gap: 16,
  padding: 0,
  margin: '10px 0 0',
  color: '#1C2B33',
  fontSize: 16,
  fontFamily: 'Poppins, sans-serif',
  border: 'none',
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
}) => {
  const cohortsReady = Array.isArray(selectedCohorts) && selectedCohorts.length > 0;
  const rowOpacity = cohortsReady ? 1 : 0.55;

  return (
    <div style={containerStyle}>
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
      <fieldset style={radioContainerStyle}>
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
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                margin: 0,
                opacity: rowOpacity,
                cursor: cohortsReady ? 'pointer' : 'not-allowed',
              }}
            >
              <input
                style={vennRadioStyle(nodeIndex === value)}
                disabled={!cohortsReady}
                type="radio"
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
            </label>
          </ToolTip>
        ))}
      </fieldset>
    </div>
  );
};

export default VennCategoryRadios;
