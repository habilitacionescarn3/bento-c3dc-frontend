import React from 'react';

/**
 * Chart / table tab shell for the main cohort analyzer content column.
 */
export function CohortAnalyzerSummaryView({
  classes,
  activeView,
  setActiveView,
  chartPanel,
  tablePanel,
}) {
  return (
    <div className={classes.summaryViewShell}>
      <div className={classes.summaryTabs}>
        <button
          type="button"
          className={`${classes.summaryTab} ${activeView === 'chart' ? classes.summaryTabActive : ''}`}
          onClick={() => setActiveView('chart')}
        >
          Chart Summary View
        </button>
        <button
          type="button"
          className={`${classes.summaryTab} ${activeView === 'table' ? classes.summaryTabActive : ''}`}
          onClick={() => setActiveView('table')}
        >
          Table View
        </button>
      </div>
      <div className={classes.summaryTabPanel}>
        {activeView === 'chart' && chartPanel}
        {activeView === 'table' && tablePanel}
      </div>
    </div>
  );
}
