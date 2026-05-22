import React from 'react';
import vennToolbarActions from '../../../assets/icons/VennToolbarActions.svg';
import VennCategoryRadios from './VennCategoryRadios';


/** Hit targets aligned to viewBox 0 0 73 19 (expand ~x 27–46, download ~x 54–73). */
const VENN_TOOLBAR_ACTION_W = 73;
const VENN_TOOLBAR_ACTION_H = 19;

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
      <VennCategoryRadios
        selectedCohorts={selectedCohorts}
        nodeIndex={nodeIndex}
        setNodeIndex={setNodeIndex}
        setRowData={setRowData}
      />
    </>
  );
};

export default CohortAnalyzerHeader;