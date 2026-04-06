import { useMemo } from 'react';
import { kmplotColors } from './histogramPanelCore.styled';

/** KM series filtered to selected cohort arms (expanded chart modal). */
export function useHistogramPopupFilteredKmData(kmPlotData, c1, c2, c3) {
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

export function useHistogramPopupKmCohortColors(c1, c2, c3) {
  return useMemo(() => {
    const colors = [];
    if (c1 && c1.length > 0) colors.push(kmplotColors.colorA);
    if (c2 && c2.length > 0) colors.push(kmplotColors.colorB);
    if (c3 && c3.length > 0) colors.push(kmplotColors.colorC);
    return colors;
  }, [c1, c2, c3]);
}
