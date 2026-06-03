import React, { useMemo, useCallback } from 'react';
import { TableView } from '@bento-core/paginated-table';
import { CreateNewCohortButton } from '../CreateNewCohortButton/CreateNewCohortButton';
import DownloadSelectedCohort from '../downloadCohort/DownloadSelectedCohorts';
import { exploreDashboardTooltip } from '../config/CohortAnalyzerConfig';
import { useCohortAnalyzer } from '../context/CohortAnalyzerContext';
import { ButtonWithTooltip } from './ButtonWithTooltip';

const row = { display: 'flex', alignItems: 'center' };
const bar = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '26px', flexWrap: 'wrap' };


const CohortAnalyzerTableSection = ({ classes, questionIcon, handleClick, handleBuildInExplore, themeConfig, initTblState }) => {
  const { selectedCohortSection, queryVariable, selectedCohorts, rowData, refreshTableContent } = useCohortAnalyzer();


  const hasSel = useMemo(() => selectedCohorts.length > 0, [selectedCohorts]);
  const hasRows = useMemo(() => rowData.length > 0, [rowData]);
  const canBuild = hasSel;


  const onBuild = useCallback(() => canBuild && handleBuildInExplore(), [canBuild, handleBuildInExplore]);


  return (
    <>
      <div className={classes.cohortCountSection}>
        <div style={bar}>
          <div style={row}>
            <CreateNewCohortButton
              selectedCohortSection={selectedCohortSection}
              classes={classes}
              questionIcon={questionIcon}
              handleClick={handleClick}
            />
          </div>


          <div style={row}>
            <DownloadSelectedCohort queryVariable={queryVariable} isSelected={hasSel && hasRows} />
          </div>


          <ButtonWithTooltip
            className={canBuild ? classes.exploreButton : classes.exploreButtonFaded}
            disabled={!canBuild}
            onClick={onBuild}
            tooltip={exploreDashboardTooltip}
            icon={questionIcon}
          >
            <div className={classes.leftAlignedText}>
              BUILD IN
              <br />
                EXPLORE
             
              DASHBOARD
            </div>
          </ButtonWithTooltip>


          
        </div>
      </div>

      <div className={classes.tableSectionOuterContainer}>
        <div className={classes.rightSideTableContainer}>
          {refreshTableContent && (
            <TableView
              initState={initTblState}
              themeConfig={themeConfig}
              tblRows={rowData}
              queryVariables={queryVariable}
              server={false}
              totalRowCount={rowData.length || 0}
              activeTab="Participant"
            />
          )}
        </div>
      </div>
    </>
  );
}

export { CohortAnalyzerTableSection };