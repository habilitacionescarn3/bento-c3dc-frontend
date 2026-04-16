import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_CHART_DATA_TYPES } from '../../config/cohortAnalyzerChartCatalog';
import {
  setStripOrder,
  setTopRowOrder,
  setBesideStripPanelId,
  setSurvivalBesideFromSelection,
  upsertPanelRegistry,
  patchChartVisuals,
} from '../../store/cohortAnalyzerLayoutActions';
import { CA_PANEL_KIND } from '../../store/cohortAnalyzerLayoutConstants';
import {
  COHORT_ANALYZER_HISTOGRAM_TITLES as titles,
  buildDefaultCohortAnalyzerPanelRegistry,
} from '../../store/cohortAnalyzerDefaultPanelRegistry';

/**
 * Inline add-chart flow, strip/beside sync with selection, chart-type menu and download dropdown UX.
 */
export function useHistogramPanelBootstrap({
  selectedDatasets,
  setSelectedDatasets,
  setActiveTab,
  setExpandedChart,
  inlineAddChartOpen,
  inlineAddChartNonce,
  onInlineAddChartClose,
  reduxHistogramSizes,
  reduxSurvivalSize,
  chartTypeMenuDataset,
  setChartTypeMenuDataset,
  chartTypeMenuRef,
  showDownloadDropdown,
  setShowDownloadDropdown,
  dropdownRef,
  histogramCardSizes,
  setHistogramCardSizes,
  setSurvivalCardSize,
}) {
  const dispatch = useDispatch();
  const stripOrder = useSelector((state) => state.cohortAnalyzerLayout.stripOrder);
  const topRowOrder = useSelector((state) => state.cohortAnalyzerLayout.topRowOrder);
  const besideStripPanelId = useSelector((state) => state.cohortAnalyzerLayout.besideStripPanelId);

  const [inlineAddStep, setInlineAddStep] = useState(1);
  const [inlineSelectedCatalogId, setInlineSelectedCatalogId] = useState(null);

  useEffect(() => {
    if (!inlineAddChartOpen) return;
    setInlineAddStep(1);
    setInlineSelectedCatalogId(null);
  }, [inlineAddChartOpen, inlineAddChartNonce]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chartTypeMenuDataset
        && chartTypeMenuRef.current
        && !chartTypeMenuRef.current.contains(event.target)
      ) {
        setChartTypeMenuDataset(null);
      }
    };
    if (chartTypeMenuDataset) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chartTypeMenuDataset, chartTypeMenuRef, setChartTypeMenuDataset]);

  useEffect(() => {
    dispatch(upsertPanelRegistry(buildDefaultCohortAnalyzerPanelRegistry()));
  }, [dispatch]);

  const finalizeInlineAddChart = useCallback(
    (chartTypeSelected, catalogEntryId) => {
      const catalogId = catalogEntryId != null ? catalogEntryId : inlineSelectedCatalogId;
      const selectedEntry = ADD_CHART_DATA_TYPES.find((e) => e.id === catalogId);
      if (!selectedEntry || !selectedEntry.datasetKey) return;
      const skipChartType = Boolean(selectedEntry.skipChartTypeStep);
      if (!skipChartType && chartTypeSelected == null) return;

      const datasetKey = selectedEntry.datasetKey;
      const label = selectedEntry.label;

      if (datasetKey === 'survivalAnalysis') {
        if (selectedDatasets.includes('survivalAnalysis')) {
          if (typeof onInlineAddChartClose === 'function') onInlineAddChartClose();
          return;
        }
        dispatch(
          upsertPanelRegistry({
            [datasetKey]: {
              kind: CA_PANEL_KIND.SURVIVAL,
              chartKey: datasetKey,
              label: label || titles[datasetKey] || datasetKey,
            },
          }),
        );
        // Show survival only in the lower histogram strip (last), not beside Venn in the upper row.
        const stripWithoutSurvival = stripOrder.filter((id) => id !== 'survivalAnalysis');
        dispatch(setStripOrder([...stripWithoutSurvival, 'survivalAnalysis']));
        let nextTopRow = (topRowOrder || []).filter((p) => p !== 'survival');
        if (nextTopRow.length === 0) {
          nextTopRow = ['venn'];
        }
        dispatch(setTopRowOrder(nextTopRow));
        setSelectedDatasets((prev) => (prev.includes(datasetKey) ? prev : [...prev, datasetKey]));
        // Keep focus on a histogram tab — do not jump to survival (it stays last in expanded modal tabs).
        setActiveTab((tab) => {
          if (tab && tab !== 'survivalAnalysis') return tab;
          const histo = selectedDatasets.filter((d) => d !== 'survivalAnalysis');
          return histo.length > 0 ? histo[histo.length - 1] : 'sexAtBirth';
        });
        if (typeof onInlineAddChartClose === 'function') {
          onInlineAddChartClose();
        }
        return;
      }

      if (stripOrder.includes(datasetKey)) {
        if (typeof onInlineAddChartClose === 'function') onInlineAddChartClose();
        return;
      }
      dispatch(
        upsertPanelRegistry({
          [datasetKey]: {
            kind: CA_PANEL_KIND.HISTOGRAM,
            chartKey: datasetKey,
            label: label || titles[datasetKey] || datasetKey,
          },
        }),
      );
      dispatch(patchChartVisuals({ [datasetKey]: chartTypeSelected }));
      const nextOrder = stripOrder.includes(datasetKey)
        ? stripOrder
        : [...stripOrder, datasetKey];
      dispatch(setStripOrder(nextOrder));
      setSelectedDatasets((prev) => (prev.includes(datasetKey) ? prev : [...prev, datasetKey]));
      setActiveTab(datasetKey);
      if (typeof onInlineAddChartClose === 'function') {
        onInlineAddChartClose();
      }
    },
    [
      inlineSelectedCatalogId,
      selectedDatasets,
      dispatch,
      stripOrder,
      topRowOrder,
      onInlineAddChartClose,
      setSelectedDatasets,
      setActiveTab,
    ],
  );

  const handleRemoveHistogramDataset = useCallback((dataset) => {
    if (!dataset) return;
    setShowDownloadDropdown(false);
    setChartTypeMenuDataset((prev) => (prev === dataset ? null : prev));
    setExpandedChart((prev) => (prev === dataset ? null : prev));
    setSelectedDatasets((prev) => {
      const next = prev.filter((d) => d !== dataset);
      setActiveTab((tab) => {
        if (tab !== dataset) return tab;
        const remainingHisto = next.filter((d) => d !== 'survivalAnalysis');
        if (remainingHisto.length > 0) return remainingHisto[0];
        if (next.length > 0) return next[0];
        return 'sexAtBirth';
      });
      return next;
    });
  }, [setSelectedDatasets, setActiveTab, setExpandedChart, setShowDownloadDropdown, setChartTypeMenuDataset]);

  useEffect(() => {
    setHistogramCardSizes(reduxHistogramSizes);
  }, [reduxHistogramSizes, setHistogramCardSizes]);

  useEffect(() => {
    if (reduxSurvivalSize == null) return;
    setSurvivalCardSize((prev) => ({ ...(prev || {}), ...reduxSurvivalSize }));
  }, [reduxSurvivalSize, setSurvivalCardSize]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadDropdown(false);
      }
    };

    if (showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadDropdown, dropdownRef, setShowDownloadDropdown]);

  useEffect(() => {
    const visibleDatasets = selectedDatasets.filter((dataset) => dataset !== 'survivalAnalysis');
    const hasTopRowTokensInStrip = stripOrder.some(
      (id) => id === 'venn' || id === 'survivalAnalysis',
    );

    if (stripOrder.length === 0 && visibleDatasets.length > 0) {
      let initial = [...visibleDatasets];
      if (besideStripPanelId != null && visibleDatasets.includes(besideStripPanelId)) {
        initial = [
          besideStripPanelId,
          ...visibleDatasets.filter((d) => d !== besideStripPanelId),
        ];
      }
      dispatch(setStripOrder(initial));
      return;
    }

    if (hasTopRowTokensInStrip) {
      const missing = visibleDatasets.filter((dataset) => !stripOrder.includes(dataset));
      if (missing.length > 0) {
        const survivalInStrip =
          stripOrder.includes('survivalAnalysis')
          && selectedDatasets.includes('survivalAnalysis');
        if (survivalInStrip) {
          const core = stripOrder.filter((id) => id !== 'survivalAnalysis');
          dispatch(setStripOrder([...core, ...missing, 'survivalAnalysis']));
        } else {
          dispatch(setStripOrder([...stripOrder, ...missing]));
        }
      }
      return;
    }

    const prevVisible = stripOrder.filter((dataset) => visibleDatasets.includes(dataset));
    const missing = visibleDatasets.filter((dataset) => !prevVisible.includes(dataset));
    const next = [...prevVisible, ...missing];
    const unchanged =
      next.length === stripOrder.length &&
      next.every((d, i) => d === stripOrder[i]);
    if (!unchanged) {
      dispatch(setStripOrder(next));
    }
  }, [selectedDatasets, stripOrder, besideStripPanelId, dispatch]);

  const survivalSelected = selectedDatasets.includes('survivalAnalysis');

  useEffect(() => {
    dispatch(setSurvivalBesideFromSelection(survivalSelected));
  }, [survivalSelected, dispatch]);

  useEffect(() => {
    if (survivalSelected) return;
    const visible = selectedDatasets.filter((d) => d !== 'survivalAnalysis');
    if (visible.length === 0) {
      if (besideStripPanelId != null) {
        dispatch(setBesideStripPanelId(null));
      }
      return;
    }
    if (besideStripPanelId != null && visible.includes(besideStripPanelId)) {
      return;
    }
    const order = stripOrder.filter((d) => visible.includes(d));
    const first = order[0] || visible[0];
    if (first) {
      dispatch(setBesideStripPanelId(first));
    }
  }, [
    survivalSelected,
    selectedDatasets,
    stripOrder,
    besideStripPanelId,
    dispatch,
  ]);

  return {
    stripOrder,
    inlineAddStep,
    setInlineAddStep,
    inlineSelectedCatalogId,
    setInlineSelectedCatalogId,
    finalizeInlineAddChart,
    handleRemoveHistogramDataset,
    survivalSelected,
  };
}
