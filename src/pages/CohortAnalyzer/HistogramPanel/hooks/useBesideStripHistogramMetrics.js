import { useMemo } from 'react';

export function useBesideStripHistogramMetrics({
  besideDatasetForColumn,
  filteredData,
  histogramCardSizes,
  defaultPlotHeightPx,
}) {
  const besideHistogramBarSums = useMemo(() => {
    const d = besideDatasetForColumn;
    if (!d || !Array.isArray(filteredData[d])) {
      return { valueA: 0, valueB: 0, valueC: 0 };
    }
    let valueA = 0;
    let valueB = 0;
    let valueC = 0;
    filteredData[d].forEach((entry) => {
      valueA += entry.valueA || 0;
      valueB += entry.valueB || 0;
      valueC += entry.valueC || 0;
    });
    return { valueA, valueB, valueC };
  }, [besideDatasetForColumn, filteredData]);

  const besideStripPlotHeight = useMemo(() => {
    if (!besideDatasetForColumn) return defaultPlotHeightPx;
    const s = histogramCardSizes[besideDatasetForColumn];
    return s && s.plotHeight != null ? s.plotHeight : defaultPlotHeightPx;
  }, [besideDatasetForColumn, histogramCardSizes, defaultPlotHeightPx]);

  return { besideHistogramBarSums, besideStripPlotHeight };
}
