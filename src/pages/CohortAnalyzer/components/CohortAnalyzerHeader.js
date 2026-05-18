import React from 'react';
import questionIcon3 from '../../../assets/icons/Question_icon_2.svg';
import vennToolbarActions from '../../../assets/icons/VennToolbarActions.svg';
import ToolTip from "@bento-core/tool-tip/dist/ToolTip";


/** Hit targets aligned to viewBox 0 0 73 19 (expand ~x 27–46, download ~x 54–73). */
const VENN_TOOLBAR_ACTION_W = 73;
const VENN_TOOLBAR_ACTION_H = 19;

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

const toolbarActionBtn = (enabled) => ({
  position: 'absolute',
  top: 0,
  height: '100%',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: enabled ? 'pointer' : 'not-allowed',
  boxSizing: 'border-box',
});

const CohortAnalyzerHeader = ({
  selectedCohorts,
  nodeIndex,
  setNodeIndex,
  setRowData,
  handleDownload,
  onExpandVenn,
  classes,
}) => {
  const cohortsReady = selectedCohorts.length > 0;
  const rowOpacity = cohortsReady ? 1 : 0.55;

  return (
    <>
      <div className={classes.vennToolbarRow}>
        <div className={classes.vennToolbarLeading}>
          
          <h2 className={classes.vennToolbarTitle}>Venn Diagram</h2>
        </div>
        <div className={classes.vennToolbarSpacer} aria-hidden />
        <div
          className={classes.vennToolbarTrailing}
          style={{
            position: 'relative',
            width: VENN_TOOLBAR_ACTION_W,
            height: VENN_TOOLBAR_ACTION_H,
            flexShrink: 0,
          }}
        >
          <img
            src={vennToolbarActions}
            alt=""
            width={VENN_TOOLBAR_ACTION_W}
            height={VENN_TOOLBAR_ACTION_H}
            style={{ display: 'block', pointerEvents: 'none' }}
            aria-hidden
          />
          <button
            type="button"
            aria-label="Expand Venn diagram"
            title="Expand chart"
            onClick={() => onExpandVenn && onExpandVenn()}
            style={{
              ...toolbarActionBtn(Boolean(onExpandVenn)),
              left: `${(27 / VENN_TOOLBAR_ACTION_W) * 100}%`,
              width: `${(19 / VENN_TOOLBAR_ACTION_W) * 100}%`,
            }}
          />
          <button
            type="button"
            aria-label="Download Venn diagram"
            title="Download"
            onClick={() => {
              if (cohortsReady) handleDownload();
            }}
            disabled={!cohortsReady}
            style={{
              ...toolbarActionBtn(cohortsReady),
              left: `${(54 / VENN_TOOLBAR_ACTION_W) * 100}%`,
              width: `${(19 / VENN_TOOLBAR_ACTION_W) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className={classes.vennHeaderDivider} aria-hidden />
      <div className={classes.vennSubHeader}>
        <div className={classes.vennSubHeaderPromptRow}>
          <p className={classes.vennSubHeaderPrompt}>
            Select a data category for cohort matching:
          </p>
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
        <fieldset className={classes.vennChartRadioContainer} style={{ border: 'none' }}>
          <legend style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
            Data category options
          </legend>
          <ToolTip backgroundColor="white" zIndex={3000} title="All Venn diagram selected areas will be cleared when changing buttons" arrow placement="top">
            <label style={{ display: 'inline-flex', alignItems: 'center', margin: 0, opacity: rowOpacity, cursor: cohortsReady ? 'pointer' : 'not-allowed' }}>
              <input
                style={vennRadioStyle(nodeIndex === 0)}
                disabled={!cohortsReady}
                type="radio"
                value="1"
                checked={nodeIndex === 0}
                onChange={() => {
                  setRowData([]);
                  setNodeIndex(0);
                }}
                name="node_type"
                aria-label="Participant ID"
              />
              Participant ID
            </label>
          </ToolTip>
          <ToolTip backgroundColor="white" zIndex={3000} title="All Venn diagram selected areas will be cleared when changing buttons" arrow placement="top">
            <label style={{ display: 'inline-flex', alignItems: 'center', margin: 0, opacity: rowOpacity, cursor: cohortsReady ? 'pointer' : 'not-allowed' }}>
              <input
                style={vennRadioStyle(nodeIndex === 1)}
                disabled={!cohortsReady}
                type="radio"
                value="2"
                checked={nodeIndex === 1}
                onChange={() => {
                  setRowData([]);
                  setNodeIndex(1);
                }}
                name="node_type"
                aria-label="Diagnosis"
              />
              Diagnosis
            </label>
          </ToolTip>
          <ToolTip backgroundColor="white" zIndex={3000} title="All Venn diagram selected areas will be cleared when changing buttons" arrow placement="top">
            <label style={{ display: 'inline-flex', alignItems: 'center', margin: 0, opacity: rowOpacity, cursor: cohortsReady ? 'pointer' : 'not-allowed' }}>
              <input
                style={vennRadioStyle(nodeIndex === 2)}
                disabled={!cohortsReady}
                type="radio"
                value="3"
                checked={nodeIndex === 2}
                onChange={() => {
                  setRowData([]);
                  setNodeIndex(2);
                }}
                name="node_type"
                aria-label="Treatment"
              />
              Treatment
            </label>
          </ToolTip>
        </fieldset>
      </div>
    </>
  );
};

export default CohortAnalyzerHeader;