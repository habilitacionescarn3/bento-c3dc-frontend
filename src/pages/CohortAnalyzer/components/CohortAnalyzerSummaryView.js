import React from 'react';

/**
 * Chart / table tab shell for the main cohort analyzer content column.
 */
export function CohortAnalyzerSummaryView({
  classes,
  activeView,
  setActiveView,
  summaryTrailingActions,
  chartPanel,
  tablePanel,
}) {
  return (
    <div className={classes.summaryViewShell}>
      <div className={classes.summaryTabsBar}>
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
        {summaryTrailingActions ? (
          <div className={classes.summaryTabsBarEnd}>{summaryTrailingActions}</div>
        ) : null}
      </div>
      <div className={classes.summaryTabPanel}>
        {activeView === 'chart' && chartPanel}
        {activeView === 'table' && tablePanel}
      </div>
    </div>
  );
}
