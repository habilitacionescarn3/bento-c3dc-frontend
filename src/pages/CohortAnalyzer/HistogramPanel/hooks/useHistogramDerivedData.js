import { useMemo } from 'react';
import { kmplotColors, barColors } from '../HistogramPanel.styled';
import {
  MAX_BARS_DISPLAYED,
  MAX_BARS_DISPLAYED_EXPANDED,
} from '../histogramConstants';

/**
 * KM series filtered to cohorts that have participants selected.
 */
export function useFilteredKmPlotData(kmPlotData, c1, c2, c3) {
  return useMemo(() => {
    if (!kmPlotData || !Array.isArray(kmPlotData)) return [];

    const selectedGroups = [];
    if (c1 && c1.length > 0) selectedGroups.push('c1');
    if (c2 && c2.length > 0) selectedGroups.push('c2');
    if (c3 && c3.length > 0) selectedGroups.push('c3');

    return kmPlotData.filter((item) => {
      const group = item.group || item.group_id || '';
      return selectedGroups.some((selectedGroup) => {
        const groupStr = String(group).toLowerCase();
        const selectedStr = selectedGroup.toLowerCase();
        return groupStr.includes(selectedStr)
          || groupStr.includes(selectedStr.replace('c', ''))
          || (selectedGroup === 'c1' && (groupStr === '1' || groupStr === 'cohort 1' || groupStr === 'cohort1'))
          || (selectedGroup === 'c2' && (groupStr === '2' || groupStr === 'cohort 2' || groupStr === 'cohort2'))
          || (selectedGroup === 'c3' && (groupStr === '3' || groupStr === 'cohort 3' || groupStr === 'cohort3'));
      });
    });
  }, [kmPlotData, c1, c2, c3]);
}

export function useKmCohortColors(c1, c2, c3) {
  return useMemo(() => {
    const colors = [];
    if (c1 && c1.length > 0) colors.push(kmplotColors.colorA);
    if (c2 && c2.length > 0) colors.push(kmplotColors.colorB);
    if (c3 && c3.length > 0) colors.push(kmplotColors.colorC);
    return colors;
  }, [c1, c2, c3]);
}

/**
 * Shape risk-table API payload for @bento-core/risk-table.
 */
export function useRiskTableCohortsShape(riskTableData, c1, c2, c3, c1Name, c2Name, c3Name) {
  return useMemo(() => {
    if (!riskTableData || !riskTableData.cohorts) {
      return { cohorts: [], timeIntervals: [] };
    }

    const cohortColors = {
      c1: barColors.colorA,
      c2: barColors.colorB,
      c3: barColors.colorC,
    };

    const transformedCohorts = riskTableData.cohorts
      .filter((cohort) => {
        const cohortKey = cohort.cohort.toLowerCase();
        return (
          (cohortKey === 'c1' && c1 && c1.length > 0)
          || (cohortKey === 'c2' && c2 && c2.length > 0)
          || (cohortKey === 'c3' && c3 && c3.length > 0)
        );
      })
      .map((cohort) => {
        const data = {};
        cohort.survivalData.forEach((item) => {
          data[item.group] = Math.round(item.subjects || 0);
        });

        const cohortKey = cohort.cohort.toLowerCase();
        let cohortName;
        if (cohortKey === 'c1') cohortName = c1Name || 'Cohort A';
        else if (cohortKey === 'c2') cohortName = c2Name || 'Cohort B';
        else if (cohortKey === 'c3') cohortName = c3Name || 'Cohort C';

        return {
          id: cohortKey,
          name: cohortName,
          color: cohortColors[cohort.cohort.toLowerCase()] || '#ADD8E6',
          data,
        };
      });

    return {
      cohorts: transformedCohorts,
      timeIntervals: riskTableData.timeIntervals || [],
    };
  }, [riskTableData, c1, c2, c3, c1Name, c2Name, c3Name]);
}

/**
 * Histogram bar data capped for main vs expanded modal.
 */
export function useFilteredHistogramGraphData(graphData, selectedDatasets, expandedChart) {
  return useMemo(() => {
    if (Object.keys(graphData).length > 0 && selectedDatasets.length > 0) {
      const otherKey = expandedChart ? 'OtherMany' : 'OtherFew';
      const maxDisplayed = expandedChart ? MAX_BARS_DISPLAYED_EXPANDED : MAX_BARS_DISPLAYED;
      const graphDataCopy = JSON.parse(JSON.stringify(graphData));

      selectedDatasets.forEach((dataset) => {
        if (dataset === 'survivalAnalysis' || !graphDataCopy[dataset]) {
          return;
        }
        const manyOthers = graphDataCopy[dataset].find((item) => item.name === otherKey);

        const filteredRegularItems = graphDataCopy[dataset]
          .filter((item) => item.name !== 'OtherFew' && item.name !== 'OtherMany');
        const regularItems = filteredRegularItems.slice(0, manyOthers ? maxDisplayed - 1 : maxDisplayed);
        graphDataCopy[dataset] = [...regularItems];
        if (manyOthers) {
          graphDataCopy[dataset].push(manyOthers);
        }
      });
      return graphDataCopy;
    }
    return graphData;
  }, [graphData, selectedDatasets, expandedChart]);
}
