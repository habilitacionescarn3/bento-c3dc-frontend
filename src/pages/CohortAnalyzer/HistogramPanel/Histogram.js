import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import DownloadIcon from "../../../assets/icons/Download_Histogram_icon.svg";
import ExpandIcon from "../../../assets/icons/Expand_Histogram_icon.svg";
import { useHistogramData } from './useHistogramData';
import ToolTip from "@bento-core/tool-tip/dist/ToolTip";
import questionIcon from "../../../assets/icons/Question_icon_2.svg";
import useKmplot from './useKmplot';
import useRiskTable from './useRiskTable';
import histogramChartTitleHandle from '../../../assets/icons/histogramChartTitleHandle.svg';
import histogramCloseIcon from '../../../assets/icons/closeHistogramChart.svg';
import {
  HistogramContainer, ChartWrapper, FullWidthChartWrapper, SurvivalBesideVennCard, HeaderSection, RadioGroup, RadioInput
  , RadioLabel, ChartActionButtons, ChartTitle,
  CenterContainer,
  ChartTypeDropdownRoot, ChartTypeDropdownPanel, ChartTypeOption, ChartTypeTriggerButton,
  ChartResizeHandle,
} from './HistogramPanel.styled';
import { HistogramDatasetChart, DEFAULT_CHART_TYPE } from './HistogramDatasetChart';
import { ChartTypeIcon, CHART_TYPE_OPTIONS } from './HistogramChartTypeIcons';
import ExpandedChartModal from './HistogramPopup';
import PlaceHolder2 from '../../../assets/histogram/Placeholder2.svg';
import { NoDataCard } from '../NoDataCard';
import AddChartInlinePanel from '../components/AddChartInlinePanel';
import { ADD_CHART_DATA_TYPES } from '../cohortAnalyzerChartCatalog';
import { useDispatch, useSelector } from 'react-redux';
import {
  setStripOrder,
  setBesideStripPanelId,
  setSurvivalBesideFromSelection,
  setPanelSize,
  setTopRowPanelOrder,
  upsertPanelRegistry,
  patchChartVisuals,
} from '../store/cohortAnalyzerLayoutActions';
import {
  CA_PANEL_KIND,
  CA_SURVIVAL_CARD_MIN_WIDTH as SURVIVAL_CARD_MIN_WIDTH,
  CA_SURVIVAL_CARD_MAX_WIDTH as SURVIVAL_CARD_MAX_WIDTH,
  CA_SURVIVAL_CARD_MIN_HEIGHT as SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT as SURVIVAL_CARD_MAX_HEIGHT,
} from '../store/cohortAnalyzerLayoutConstants';
import {
  encodePanelDragPayload,
  parseDragDataTransfer,
  CA_PANEL_DRAG_MIME,
} from '../store/panelDnD';
import {
  COHORT_ANALYZER_HISTOGRAM_TITLES as titles,
  buildDefaultCohortAnalyzerPanelRegistry,
} from '../store/cohortAnalyzerDefaultPanelRegistry';
import {
  nullImages,
  BESIDE_PEER_DRAG_STYLE,
  HISTOGRAM_CHART_PLOT_HEIGHT,
  HISTOGRAM_CARD_CHROME_HEIGHT,
  HISTOGRAM_CARD_MIN_WIDTH,
  HISTOGRAM_CARD_MAX_WIDTH,
  HISTOGRAM_PLOT_MIN_HEIGHT,
  HISTOGRAM_PLOT_MAX_HEIGHT,
} from './histogramConstants';
import { measureDragCardElement, requiresCompactSpacing } from './histogramLayoutUtils';
import { useHistogramPanelMuiStyles } from './histogramMuiStyles';
import {
  useFilteredKmPlotData,
  useKmCohortColors,
  useRiskTableCohortsShape,
  useFilteredHistogramGraphData,
} from './hooks/useHistogramDerivedData';
import { SurvivalAnalysisCardBody } from './SurvivalAnalysisCardBody';

const Histogram = ({
  c1,
  c2,
  c3,
  c1Name = '',
  c2Name = '',
  c3Name = '',
  survivalBesideVennTarget,
  onSurvivalBesideColumnActive,
  besideCardDrag,
  besidePanelDragState = null,
  inlineAddChartOpen = false,
  onInlineAddChartClose,
  inlineAddChartNonce = 0,
  chartModalExpandedChart,
  setChartModalExpandedChart,
  chartModalActiveTab,
  setChartModalActiveTab,
  cohortParticipantState,
  containerRef,
  canvasRef,
}) => {
  const classes = useHistogramPanelMuiStyles();
  const dispatch = useDispatch();
  const stripOrder = useSelector((state) => state.cohortAnalyzerLayout.stripOrder);
  const panelRegistry = useSelector((state) => state.cohortAnalyzerLayout.panelRegistry || {});
  const besideStripPanelId = useSelector((state) => state.cohortAnalyzerLayout.besideStripPanelId);
  const layoutSizes = useSelector((state) => state.cohortAnalyzerLayout.sizes || {});
  const topRowOrder = useSelector((state) => state.cohortAnalyzerLayout.topRowOrder);
  const chartVisualByPanelId = useSelector((state) => state.cohortAnalyzerLayout.chartVisualByPanelId || {});

  const getChartTitle = useCallback(
    (dataset) =>
      (panelRegistry[dataset] && panelRegistry[dataset].label) || titles[dataset] || String(dataset),
    [panelRegistry],
  );

  const displayTitles = useMemo(() => {
    const out = { ...titles };
    Object.keys(panelRegistry).forEach((id) => {
      const entry = panelRegistry[id];
      if (entry && entry.label) {
        out[id] = entry.label;
      }
    });
    return out;
  }, [panelRegistry]);

  const placeholderForDataset = useCallback(
    (dataset) => nullImages[dataset] || PlaceHolder2,
    [],
  );

  const reduxHistogramSizes = useMemo(() => {
    const out = {};
    Object.keys(titles).forEach((k) => {
      if (k === 'survivalAnalysis') return;
      if (layoutSizes[k] != null) out[k] = layoutSizes[k];
    });
    return out;
  }, [layoutSizes]);

  const reduxSurvivalSize = layoutSizes.survival != null ? layoutSizes.survival : null;

  const {
    graphData,
    viewType,
    setViewType,
    activeTab,
    setActiveTab,
    selectedDatasets,
    setSelectedDatasets,
    expandedChart,
    setExpandedChart,
    chartRef,
    downloadChart,
  } = useHistogramData({
    c1,
    c2,
    c3,
    expandedChart: chartModalExpandedChart,
    setExpandedChart: setChartModalExpandedChart,
    activeTab: chartModalActiveTab,
    setActiveTab: setChartModalActiveTab,
  });
  const {
    data: kmPlotData,
    loading: kmLoading,
    error: kmError
  } = useKmplot({ c1, c2, c3 });

  const {
    data: riskTableData,
  } = useRiskTable({ c1, c2, c3 });

  const cohortColors = useKmCohortColors(c1, c2, c3);
  const filteredKmPlotData = useFilteredKmPlotData(kmPlotData, c1, c2, c3);
  const kmChartRef = useRef(null);
  const kmChartRefExpanded = useRef(null);
  const survivalAnalysisContainerRef = useRef(null);
  const riskTableRef = useRef(null);
  const riskTableRefExpanded = useRef(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [chartTypeMenuDataset, setChartTypeMenuDataset] = useState(null);
  const chartTypeMenuRef = useRef(null);
  /** Per-dataset card size after user resize: { width, plotHeight } (mirrors Redux; local updates during drag) */
  const [histogramCardSizes, setHistogramCardSizes] = useState(reduxHistogramSizes);
  const [survivalCardSize, setSurvivalCardSize] = useState(reduxSurvivalSize);
  const [draggingDataset, setDraggingDataset] = useState(null);
  const [dragOverDataset, setDragOverDataset] = useState(null);
  /** Pixel size of the card being dragged; drop slot matches this */
  const [draggingCardDimensions, setDraggingCardDimensions] = useState(null);
  /** Sync size for drop slot before React commits (dragOver can fire in the same frame as dragStart). */
  const histogramDragSizeRef = useRef(null);

  const estimateHistogramCardDropSize = useCallback((datasetKey) => {
    if (!datasetKey) return { width: 320, height: 261 };
    const entry = histogramCardSizes[datasetKey];
    const w = entry && entry.width != null ? entry.width : 320;
    const ph = entry && entry.plotHeight != null ? entry.plotHeight : HISTOGRAM_CHART_PLOT_HEIGHT;
    return {
      width: w,
      height: Math.max(261, ph + HISTOGRAM_CARD_CHROME_HEIGHT),
    };
  }, [histogramCardSizes]);

  const captureHistogramDragCardSize = useCallback((event, datasetKey) => {
    const fromTarget = measureDragCardElement(event && event.currentTarget);
    const fromRef = measureDragCardElement(chartRef.current[datasetKey]);
    const measured = fromTarget || fromRef;
    const fallback = estimateHistogramCardDropSize(datasetKey);
    const dims = measured || fallback;
    histogramDragSizeRef.current = dims;
    setDraggingCardDimensions(dims);
    const el = (event && event.currentTarget) || chartRef.current[datasetKey];
    requestAnimationFrame(() => {
      const again = measureDragCardElement(el);
      if (!again) return;
      const prev = histogramDragSizeRef.current;
      if (prev && prev.width === again.width && prev.height === again.height) return;
      histogramDragSizeRef.current = again;
      setDraggingCardDimensions(again);
    });
  }, [estimateHistogramCardDropSize, chartRef]);

  const clearHistogramDragSize = useCallback(() => {
    histogramDragSizeRef.current = null;
    setDraggingCardDimensions(null);
  }, []);

  /** Strip row: insert dragged histogram before `targetDataset` (same semantics as dashed slot). */
  const handleStripChartDragOver = useCallback(
    (event, targetDataset) => {
      event.preventDefault();
      const types = Array.from(event.dataTransfer.types || []);
      if (
        (!draggingDataset || draggingDataset === targetDataset)
        && (types.includes(CA_PANEL_DRAG_MIME) || types.includes('text/plain'))
      ) {
        event.dataTransfer.dropEffect = 'move';
        return;
      }
      if (!draggingDataset || draggingDataset === targetDataset) return;
      event.dataTransfer.dropEffect = 'move';
      setDragOverDataset(targetDataset);
    },
    [draggingDataset],
  );

  const handleStripChartDrop = useCallback(
    (event, targetDataset) => {
      event.preventDefault();
      const parsed = parseDragDataTransfer(event.dataTransfer);
      if (parsed && (parsed.kind === 'venn' || parsed.kind === 'survival')) {
        const from = parsed.kind;
        const order = [...topRowOrder];
        const i = order.indexOf(from);
        const other = from === 'venn' ? 'survival' : 'venn';
        const j = order.indexOf(other);
        if (i >= 0 && j >= 0) {
          const tmp = order[i];
          order[i] = order[j];
          order[j] = tmp;
          dispatch(setTopRowPanelOrder(order));
        }
        setDraggingDataset(null);
        setDragOverDataset(null);
        clearHistogramDragSize();
        return;
      }
      if (!draggingDataset || draggingDataset === targetDataset) return;
      const nextOrder = [...stripOrder];
      const fromIndex = nextOrder.indexOf(draggingDataset);
      const toIndex = nextOrder.indexOf(targetDataset);
      if (fromIndex < 0 || toIndex < 0) return;
      const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      nextOrder.splice(fromIndex, 1);
      nextOrder.splice(insertIndex, 0, draggingDataset);
      dispatch(setStripOrder(nextOrder));
      setDraggingDataset(null);
      setDragOverDataset(null);
      clearHistogramDragSize();
    },
    [stripOrder, draggingDataset, topRowOrder, dispatch, clearHistogramDragSize],
  );

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
  }, [chartTypeMenuDataset]);

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
        setSelectedDatasets((prev) => (prev.includes(datasetKey) ? prev : [...prev, datasetKey]));
        setActiveTab(datasetKey);
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
  }, [setSelectedDatasets, setActiveTab, setExpandedChart]);

  useEffect(() => {
    setHistogramCardSizes(reduxHistogramSizes);
  }, [reduxHistogramSizes]);

  useEffect(() => {
    if (reduxSurvivalSize == null) return;
    setSurvivalCardSize((prev) => ({ ...(prev || {}), ...reduxSurvivalSize }));
  }, [reduxSurvivalSize]);

  // Close dropdown when clicking outside
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
  }, [showDownloadDropdown]);

  useEffect(() => {
    const visibleDatasets = selectedDatasets.filter((dataset) => dataset !== 'survivalAnalysis');
    if (stripOrder.length === 0 && visibleDatasets.length > 0) {
      dispatch(setStripOrder([...visibleDatasets]));
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
  }, [selectedDatasets, stripOrder, dispatch]);

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

  const visibleHistogramDatasets = useMemo(
    () => selectedDatasets.filter((d) => d !== 'survivalAnalysis'),
    [selectedDatasets],
  );

  const orderedVisibleHistograms = useMemo(() => {
    const order = stripOrder.filter((d) => visibleHistogramDatasets.includes(d));
    const missing = visibleHistogramDatasets.filter((d) => !order.includes(d));
    return [...order, ...missing];
  }, [stripOrder, visibleHistogramDatasets]);

  const besideDatasetForColumn = useMemo(() => {
    if (survivalSelected) return null;
    if (orderedVisibleHistograms.length === 0) return null;
    if (besideStripPanelId && orderedVisibleHistograms.includes(besideStripPanelId)) {
      return besideStripPanelId;
    }
    return orderedVisibleHistograms[0];
  }, [survivalSelected, orderedVisibleHistograms, besideStripPanelId]);

  const mainHistogramRowOrder = useMemo(() => {
    if (!besideDatasetForColumn) return orderedVisibleHistograms;
    return orderedVisibleHistograms.filter((d) => d !== besideDatasetForColumn);
  }, [orderedVisibleHistograms, besideDatasetForColumn]);

  useEffect(() => {
    if (!onSurvivalBesideColumnActive) return;
    const active = Boolean(survivalBesideVennTarget) && selectedDatasets.includes('survivalAnalysis');
    onSurvivalBesideColumnActive(active);
  }, [survivalBesideVennTarget, selectedDatasets, onSurvivalBesideColumnActive]);

  const { cohorts, timeIntervals } = useRiskTableCohortsShape(
    riskTableData,
    c1,
    c2,
    c3,
    c1Name,
    c2Name,
    c3Name,
  );

  let data = graphData;
  const cellHover = useRef(null);
  const filteredData = useFilteredHistogramGraphData(graphData, selectedDatasets, expandedChart);

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

  // Hover effect for bars
  const handleMouseEnter = (entry) => {
    cellHover.current = entry;
  };

  const handleMouseLeave = () => {
    cellHover.current = null;
  };

  const allInputsEmpty = [c1, c2, c3].every(arr => !Array.isArray(arr) || arr.length === 0);

  const survivalBesideVennCardStyle = useMemo(() => {
    const clampW = (w) => Math.min(SURVIVAL_CARD_MAX_WIDTH, Math.max(SURVIVAL_CARD_MIN_WIDTH, w));
    const clampH = (h) => Math.min(SURVIVAL_CARD_MAX_HEIGHT, Math.max(SURVIVAL_CARD_MIN_HEIGHT, h));
    const base =
      survivalCardSize && survivalCardSize.width != null
        ? {
          width: clampW(survivalCardSize.width),
          height: clampH(survivalCardSize.height),
          minWidth: SURVIVAL_CARD_MIN_WIDTH,
          minHeight: SURVIVAL_CARD_MIN_HEIGHT,
          maxWidth: '100%',
          boxSizing: 'border-box',
          alignSelf: 'flex-start',
          cursor: besideCardDrag && besideCardDrag.draggable && !allInputsEmpty ? 'grab' : undefined,
        }
        : {
          width: SURVIVAL_CARD_MIN_WIDTH,
          height: SURVIVAL_CARD_MIN_HEIGHT,
          minWidth: SURVIVAL_CARD_MIN_WIDTH,
          minHeight: SURVIVAL_CARD_MIN_HEIGHT,
          maxWidth: '100%',
          boxSizing: 'border-box',
          ...(besideCardDrag && besideCardDrag.draggable && !allInputsEmpty ? { cursor: 'grab' } : {}),
        };
    const drag = {};
    if (besidePanelDragState && besidePanelDragState.kind === 'survival') {
      Object.assign(drag, {
        opacity: 0.42,
        outline: '2px dashed #679AAA',
        outlineOffset: 2,
        borderRadius: 10,
      });
    }
    if (besidePanelDragState && besidePanelDragState.kind === 'venn') {
      Object.assign(drag, BESIDE_PEER_DRAG_STYLE);
    }
    return { ...base, ...drag };
  }, [survivalCardSize, besideCardDrag, allInputsEmpty, besidePanelDragState]);

  const handleHistogramCardResizeStart = (e, dataset) => {
    if (allInputsEmpty) return;
    e.preventDefault();
    e.stopPropagation();
    const card = e.currentTarget.parentElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const current = histogramCardSizes[dataset];
    const startWidth = current && current.width != null ? current.width : rect.width;
    const startPlot = current && current.plotHeight != null ? current.plotHeight : HISTOGRAM_CHART_PLOT_HEIGHT;
    const maxW = typeof window !== 'undefined'
      ? Math.min(HISTOGRAM_CARD_MAX_WIDTH, window.innerWidth - 24)
      : HISTOGRAM_CARD_MAX_WIDTH;
    const startX = e.clientX;
    const startY = e.clientY;

    document.body.style.userSelect = 'none';

    let lastW;
    let lastPh;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const w = Math.round(Math.min(maxW, Math.max(HISTOGRAM_CARD_MIN_WIDTH, startWidth + dx)));
      const ph = Math.round(
        Math.min(HISTOGRAM_PLOT_MAX_HEIGHT, Math.max(HISTOGRAM_PLOT_MIN_HEIGHT, startPlot + dy)),
      );
      lastW = w;
      lastPh = ph;
      setHistogramCardSizes((prev) => ({
        ...prev,
        [dataset]: { width: w, plotHeight: ph },
      }));
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      if (lastW != null && lastPh != null) {
        dispatch(setPanelSize({
          panel: 'histogram',
          dataset,
          size: { width: lastW, plotHeight: lastPh },
        }));
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleSurvivalCardResizeStart = (e) => {
    if (allInputsEmpty) return;
    e.preventDefault();
    e.stopPropagation();
    const card = e.currentTarget.parentElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const startWidth = Math.max(
      SURVIVAL_CARD_MIN_WIDTH,
      survivalCardSize && survivalCardSize.width != null ? survivalCardSize.width : rect.width,
    );
    const startHeight = Math.max(
      SURVIVAL_CARD_MIN_HEIGHT,
      survivalCardSize && survivalCardSize.height != null ? survivalCardSize.height : rect.height,
    );
    const maxW = typeof window !== 'undefined'
      ? Math.max(
        SURVIVAL_CARD_MIN_WIDTH,
        Math.min(SURVIVAL_CARD_MAX_WIDTH, window.innerWidth - 24),
      )
      : SURVIVAL_CARD_MAX_WIDTH;
    const startX = e.clientX;
    const startY = e.clientY;

    document.body.style.userSelect = 'none';

    let lastSurvivalW;
    let lastSurvivalH;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const w = Math.round(Math.min(maxW, Math.max(SURVIVAL_CARD_MIN_WIDTH, startWidth + dx)));
      const h = Math.round(
        Math.min(SURVIVAL_CARD_MAX_HEIGHT, Math.max(SURVIVAL_CARD_MIN_HEIGHT, startHeight + dy)),
      );
      lastSurvivalW = w;
      lastSurvivalH = h;
      setSurvivalCardSize({ width: w, height: h });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      if (lastSurvivalW != null && lastSurvivalH != null) {
        dispatch(
          setPanelSize({
            panel: 'survival',
            size: { width: lastSurvivalW, height: lastSurvivalH },
          }),
        );
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const survivalAnalysisBodyProps = {
    classes,
    allInputsEmpty,
    besideCardDrag,
    survivalCardSize,
    kmChartRef,
    survivalAnalysisContainerRef,
    riskTableRef,
    filteredKmPlotData,
    kmLoading,
    kmError,
    cohortColors,
    cohorts,
    timeIntervals,
    showDownloadDropdown,
    setShowDownloadDropdown,
    dropdownRef,
    setExpandedChart,
    setActiveTab,
    handleRemoveHistogramDataset,
  };

  const histogramBesideVennPortal =
    !survivalSelected &&
    besideDatasetForColumn &&
    survivalBesideVennTarget != null
      ? createPortal(
        <ChartWrapper
          id={`chart-beside-${besideDatasetForColumn}`}
          ref={(el) => { chartRef.current[besideDatasetForColumn] = el; }}
          style={{
            ...(histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].width != null
              ? {
                width: histogramCardSizes[besideDatasetForColumn].width,
                flexShrink: 0,
                alignSelf: 'flex-start',
                maxWidth: 'none',
              }
              : {}),
            cursor: allInputsEmpty ? 'default' : 'grab',
          }}
          draggable={!allInputsEmpty}
          onDragStart={(event) => {
            setDraggingDataset(besideDatasetForColumn);
            setDragOverDataset(null);
            captureHistogramDragCardSize(event, besideDatasetForColumn);
            const payload = encodePanelDragPayload({ kind: 'histogram', dataset: besideDatasetForColumn });
            event.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
            event.dataTransfer.setData('text/plain', besideDatasetForColumn);
            event.dataTransfer.effectAllowed = 'move';
            const imgEl = event.currentTarget || chartRef.current[besideDatasetForColumn];
            if (imgEl) {
              event.dataTransfer.setDragImage(imgEl, 32, 20);
            }
          }}
          onDragEnd={() => {
            setDraggingDataset(null);
            setDragOverDataset(null);
            clearHistogramDragSize();
          }}
        >
          {/* Header + chart body mirror strip card — see main row map for full actions */}
          <HeaderSection>
            <ChartTitle className={`${Array.isArray(data[besideDatasetForColumn]) && data[besideDatasetForColumn].length > 0 ? '' : 'empty'}`}>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Drag ${getChartTitle(besideDatasetForColumn) || 'chart'}`}
                style={{ display: 'inline-flex', alignItems: 'center', marginRight: 9, cursor: allInputsEmpty ? 'not-allowed' : 'grab', opacity: allInputsEmpty ? 0.45 : 1 }}
              >
                <img
                  src={histogramChartTitleHandle}
                  alt=""
                  width={14}
                  height={15}
                  aria-hidden
                  style={{ display: 'block', flexShrink: 0 }}
                />
              </span>
              {getChartTitle(besideDatasetForColumn)}
            </ChartTitle>
            <ChartActionButtons>
              <span style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }} onClick={() => { if (!allInputsEmpty) { setExpandedChart(besideDatasetForColumn); setActiveTab(besideDatasetForColumn); } }}>
                <img src={ExpandIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', columnGap: 4 }}>
                <span style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }} onClick={() => !allInputsEmpty && downloadChart(besideDatasetForColumn, false)}>
                  <img src={DownloadIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
                </span>
                <button
                  type="button"
                  className={classes.headerCloseButton}
                  aria-label={`Remove ${getChartTitle(besideDatasetForColumn) || 'chart'} from layout`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveHistogramDataset(besideDatasetForColumn);
                  }}
                >
                  <img src={histogramCloseIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.45 : 1, display: 'block' }} />
                </button>
              </div>
            </ChartActionButtons>
          </HeaderSection>
          <div
            className={classes.chartContentWrapper}
            style={{ paddingBottom: requiresCompactSpacing(besideDatasetForColumn) ? '12px' : '0px' }}
          >
            {Array.isArray(data[besideDatasetForColumn]) && data[besideDatasetForColumn].length > 0 ? (
              <div
                className={classes.chartPlotArea}
                style={{
                  minHeight: histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].plotHeight != null
                    ? histogramCardSizes[besideDatasetForColumn].plotHeight
                    : HISTOGRAM_CHART_PLOT_HEIGHT,
                  height: histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].plotHeight != null
                    ? histogramCardSizes[besideDatasetForColumn].plotHeight
                    : HISTOGRAM_CHART_PLOT_HEIGHT,
                }}
              >
                <HistogramDatasetChart
                  rows={filteredData[besideDatasetForColumn]}
                  viewType={viewType[besideDatasetForColumn]}
                  chartType={chartVisualByPanelId[besideDatasetForColumn] || DEFAULT_CHART_TYPE}
                  valueA={besideHistogramBarSums.valueA}
                  valueB={besideHistogramBarSums.valueB}
                  valueC={besideHistogramBarSums.valueC}
                  compact={requiresCompactSpacing(besideDatasetForColumn)}
                  height={histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].plotHeight != null
                    ? histogramCardSizes[besideDatasetForColumn].plotHeight
                    : HISTOGRAM_CHART_PLOT_HEIGHT}
                  width="100%"
                  estimatedChartWidth={
                    histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].width != null
                      ? Math.max(280, histogramCardSizes[besideDatasetForColumn].width - 48)
                      : 400
                  }
                  cellHover={cellHover}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  xAxisHeight={50}
                  c1Name={c1Name || 'Cohort A'}
                  c2Name={c2Name || 'Cohort B'}
                  c3Name={c3Name || 'Cohort C'}
                />
              </div>
            ) : (
              <div style={{ width: '100%', minHeight: HISTOGRAM_CHART_PLOT_HEIGHT, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {allInputsEmpty ? (
                  <img src={placeholderForDataset(besideDatasetForColumn)} alt="No data" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                  <NoDataCard />
                )}
              </div>
            )}
          </div>
          <ChartResizeHandle
            aria-label="Resize chart beside Venn"
            title="Drag to resize chart"
            onMouseDown={(ev) => handleHistogramCardResizeStart(ev, besideDatasetForColumn)}
            style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
          />
        </ChartWrapper>,
        survivalBesideVennTarget,
      )
      : null;

  const survivalBesideVennPortal = selectedDatasets.includes('survivalAnalysis')
    && survivalBesideVennTarget != null
    ? createPortal(
      <SurvivalBesideVennCard
        id={besideCardDrag && besideCardDrag.id ? besideCardDrag.id : undefined}
        draggable={Boolean(besideCardDrag && besideCardDrag.draggable)}
        onDragStart={besideCardDrag && besideCardDrag.onDragStart ? besideCardDrag.onDragStart : undefined}
        onDragEnd={besideCardDrag && besideCardDrag.onDragEnd ? besideCardDrag.onDragEnd : undefined}
        style={survivalBesideVennCardStyle}
      >
        <SurvivalAnalysisCardBody {...survivalAnalysisBodyProps} besideVenn />
        <ChartResizeHandle
          aria-label="Resize survival analysis card"
          title="Drag to resize card"
          onMouseDown={handleSurvivalCardResizeStart}
          style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
        />
      </SurvivalBesideVennCard>,
      survivalBesideVennTarget,
    )
    : null;

  const survivalInlineLegacy = selectedDatasets.includes('survivalAnalysis')
    && survivalBesideVennTarget === undefined
    ? (
      <FullWidthChartWrapper
        style={survivalCardSize && survivalCardSize.width != null
          ? {
            width: Math.min(
              SURVIVAL_CARD_MAX_WIDTH,
              Math.max(SURVIVAL_CARD_MIN_WIDTH, survivalCardSize.width),
            ),
            height: Math.min(
              SURVIVAL_CARD_MAX_HEIGHT,
              Math.max(SURVIVAL_CARD_MIN_HEIGHT, survivalCardSize.height),
            ),
            minWidth: SURVIVAL_CARD_MIN_WIDTH,
            minHeight: SURVIVAL_CARD_MIN_HEIGHT,
            maxWidth: '100%',
            boxSizing: 'border-box',
            flex: '0 0 auto',
            alignSelf: 'flex-start',
          }
          : {
            width: SURVIVAL_CARD_MIN_WIDTH,
            height: SURVIVAL_CARD_MIN_HEIGHT,
            minWidth: SURVIVAL_CARD_MIN_WIDTH,
            minHeight: SURVIVAL_CARD_MIN_HEIGHT,
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
      >
        <SurvivalAnalysisCardBody {...survivalAnalysisBodyProps} besideVenn={false} />
        <ChartResizeHandle
          aria-label="Resize survival analysis card"
          title="Drag to resize card"
          onMouseDown={handleSurvivalCardResizeStart}
          style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
        />
      </FullWidthChartWrapper>
    )
    : null;

  return (
    <HistogramContainer>
      {histogramBesideVennPortal}
      {survivalBesideVennPortal}
      {/* Dataset Selection */}
     

      {/* View Type Selection */}

      <CenterContainer
        onDragLeave={(event) => {
          if (!draggingDataset) return;
          const related = event.relatedTarget;
          if (related && event.currentTarget.contains(related)) return;
          setDragOverDataset(null);
        }}
      >
        {survivalInlineLegacy}
        {mainHistogramRowOrder
          .map((dataset, index) => {
            let valueA = 0;
            let valueB = 0;
            let valueC = 0;
            if (Array.isArray(filteredData[dataset])) {
              filteredData[dataset].forEach((entry) => {
                valueA += entry.valueA || 0;
                valueB += entry.valueB || 0;
                valueC += entry.valueC || 0;
              });
            }
            const cardSize = histogramCardSizes[dataset];
            const plotH = cardSize && cardSize.plotHeight != null ? cardSize.plotHeight : HISTOGRAM_CHART_PLOT_HEIGHT;
            const chartWrapperStyle = cardSize && cardSize.width != null
              ? {
                width: cardSize.width,
                flexShrink: 0,
                alignSelf: 'flex-start',
                maxWidth: 'none',
              }
              : undefined;
            const estimatedChartW = cardSize && cardSize.width != null
              ? Math.max(280, cardSize.width - 48)
              : 400;
            const isDragging = Boolean(draggingDataset);
            const isDraggedCard = draggingDataset === dataset;
            const isDropTarget = dragOverDataset === dataset && draggingDataset && draggingDataset !== dataset;
            const showDropSlotBefore = isDropTarget;
            const dropSlotSize = (() => {
              const fromDrag = draggingCardDimensions || histogramDragSizeRef.current;
              if (fromDrag) {
                return { width: fromDrag.width, height: fromDrag.height };
              }
              if (!draggingDataset) {
                return { width: 320, height: 261 };
              }
              return estimateHistogramCardDropSize(draggingDataset);
            })();
            const cardDragOpacity = isDraggedCard
              ? 0.42
              : isDragging && !isDraggedCard
                ? (isDropTarget ? 0.9 : 0.62)
                : 1;
            const peerShadowStyle =
              isDragging && !isDraggedCard
                ? {
                  boxShadow: '0 14px 28px rgba(29, 61, 73, 0.28)',
                  filter: 'brightness(0.96)',
                  transition: 'opacity 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
                }
                : {};
            const dropTargetStyle =
              isDragging && isDropTarget
                ? {
                  outline: '2px solid #679AAA',
                  outlineOffset: 2,
                  zIndex: 1,
                }
                : {};
            return (
              <React.Fragment key={dataset}>
                {showDropSlotBefore && (
                  <div
                    aria-hidden
                    onDragOver={(e) => handleStripChartDragOver(e, dataset)}
                    onDrop={(e) => handleStripChartDrop(e, dataset)}
                    style={{
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      width: dropSlotSize.width,
                      height: dropSlotSize.height,
                      minWidth: 0,
                      minHeight: 0,
                      maxWidth: '100%',
                      border: '2px dashed #679AAA',
                      borderRadius: 10,
                      background: 'rgba(103, 154, 170, 0.12)',
                      boxSizing: 'border-box',
                      margin: 0,
                    }}
                  />
                )}
                <ChartWrapper
                  id={`chart-${dataset}`}
                  ref={(el) => chartRef.current[dataset] = el}
                  style={{
                    ...(chartWrapperStyle || {}),
                    ...peerShadowStyle,
                    ...dropTargetStyle,
                    opacity: cardDragOpacity,
                    cursor: allInputsEmpty ? 'default' : 'grab',
                  }}
                  draggable={!allInputsEmpty}
                  onDragStart={(event) => {
                    setDraggingDataset(dataset);
                    setDragOverDataset(null);
                    captureHistogramDragCardSize(event, dataset);
                    const payload = encodePanelDragPayload({ kind: 'histogram', dataset });
                    event.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
                    event.dataTransfer.setData('text/plain', dataset);
                    event.dataTransfer.effectAllowed = 'move';
                    const imgEl = event.currentTarget || chartRef.current[dataset];
                    if (imgEl) {
                      event.dataTransfer.setDragImage(imgEl, 32, 20);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggingDataset(null);
                    setDragOverDataset(null);
                    clearHistogramDragSize();
                  }}
                  onDragOver={(e) => handleStripChartDragOver(e, dataset)}
                  onDrop={(e) => handleStripChartDrop(e, dataset)}
                >
                <HeaderSection>
                  <ChartTitle className={`${Array.isArray(data[dataset]) && data[dataset].length > 0 ? '' : 'empty'}`} >
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Drag to reorder ${getChartTitle(dataset) || 'chart'} card`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginRight: 6,
                        cursor: allInputsEmpty ? 'not-allowed' : 'grab',
                        opacity: allInputsEmpty ? 0.45 : 1,
                      }}
                      title="Drag to reorder cards"
                    >
                      <img
                        src={histogramChartTitleHandle}
                        alt=""
                        width={14}
                        height={15}
                        aria-hidden
                        style={{ display: 'block', flexShrink: 0 }}
                      />
                    </span>
                    {getChartTitle(dataset)}
                    {Array.isArray(filteredData[dataset]) && filteredData[dataset].length > 5 && (
                      <ToolTip
                        maxWidth="335px"
                        border={'1px solid #598ac5'}
                        arrowBorder={'1px solid #598AC5'}
                        title={<div>
                          {"You can expand to see the full item"}
                        </div>}
                        placement="top-end"
                        arrow
                        interactive
                        arrowSize="30px"
                      >
                        <img alt="Question Icon" src={questionIcon} width={10} style={{ border: "0px", top: -3, left: 3, position: 'relative' }} />
                      </ToolTip>
                    )}
                  </ChartTitle>

                  <ChartActionButtons>
                    <ChartTypeDropdownRoot
                      ref={chartTypeMenuDataset === dataset ? chartTypeMenuRef : undefined}
                    >
                      <ChartTypeTriggerButton
                        type="button"
                        disabled={allInputsEmpty}
                        aria-haspopup="listbox"
                        aria-expanded={chartTypeMenuDataset === dataset}
                        aria-label="Chart type"
                        onClick={() => {
                          if (allInputsEmpty) return;
                          setChartTypeMenuDataset((prev) => (prev === dataset ? null : dataset));
                        }}
                      >
                        <ChartTypeIcon
                          type={chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE}
                          size={22}
                        />
                      </ChartTypeTriggerButton>
                      {chartTypeMenuDataset === dataset && !allInputsEmpty && (
                        <ChartTypeDropdownPanel role="listbox" aria-label="Choose chart type">
                          {CHART_TYPE_OPTIONS.map(({ type, label }) => (
                            <ChartTypeOption
                              key={type}
                              type="button"
                              $active={(chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE) === type}
                              aria-label={label}
                              aria-selected={(chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE) === type}
                              onClick={() => {
                                dispatch(patchChartVisuals({ [dataset]: type }));
                                setChartTypeMenuDataset(null);
                              }}
                            >
                              <ChartTypeIcon type={type} size={20} />
                            </ChartTypeOption>
                          ))}
                        </ChartTypeDropdownPanel>
                      )}
                    </ChartTypeDropdownRoot>
                    <span
                      style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }}
                      onClick={() => {
                        if (!allInputsEmpty) {
                          setExpandedChart(dataset);
                          setActiveTab(dataset);
                        }
                      }} >
                      <img src={ExpandIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
                    </span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', columnGap: 4 }}>
                      <span
                        style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }}
                        onClick={() => !allInputsEmpty && downloadChart(dataset, false)}>
                        <img src={DownloadIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
                      </span>
                      <button
                        type="button"
                        className={classes.headerCloseButton}
                        aria-label={`Remove ${getChartTitle(dataset) || 'chart'} from layout`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHistogramDataset(dataset);
                        }}
                      >
                        <img src={histogramCloseIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.45 : 1, display: 'block' }} />
                      </button>
                    </div>

                  </ChartActionButtons>

                </HeaderSection>
                <div 
                  className={classes.chartContentWrapper}
                  style={{ 
                    paddingBottom: requiresCompactSpacing(dataset) ? '12px' : '0px'
                  }}
                >

                  {Array.isArray(data[dataset]) && data[dataset].length > 0 ? (
                    <>
                      <fieldset style={{ border: 'none', width: '100%', margin: 0, padding: 0 }}>
                        <legend style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
                          Data Type Options
                        </legend>
                        <RadioGroup>
                          <RadioLabel>
                            <RadioInput
                              type="radio"
                              name={`viewType-${dataset}`}
                              value="count"
                              checked={viewType[dataset] === 'count'}
                              onChange={(e) => setViewType({ ...viewType, [dataset]: e.target.value })}
                            />
                            # of Cases
                          </RadioLabel>
                          <RadioLabel>
                            <RadioInput
                              type="radio"
                              name={`viewType-${dataset}`}
                              value="percentage"
                              checked={viewType[dataset] === 'percentage'}
                              onChange={(e) => setViewType({ ...viewType, [dataset]: e.target.value })}
                            />
                            % of Cases
                          </RadioLabel>
                        </RadioGroup>
                      </fieldset>
                      <div
                        className={classes.chartPlotArea}
                        style={{ minHeight: plotH, height: plotH }}
                      >
                        <HistogramDatasetChart
                          rows={filteredData[dataset]}
                          viewType={viewType[dataset]}
                          chartType={chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE}
                          valueA={valueA}
                          valueB={valueB}
                          valueC={valueC}
                          compact={requiresCompactSpacing(dataset)}
                          height={plotH}
                          width="100%"
                          estimatedChartWidth={estimatedChartW}
                          cellHover={cellHover}
                          handleMouseEnter={handleMouseEnter}
                          handleMouseLeave={handleMouseLeave}
                          xAxisHeight={50}
                          c1Name={c1Name || 'Cohort A'}
                          c2Name={c2Name || 'Cohort B'}
                          c3Name={c3Name || 'Cohort C'}
                        />
                      </div>
                    </>
                  ) : (
                    allInputsEmpty ? (
                      <div style={{ width: '100%', height: plotH, minHeight: plotH, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={placeholderForDataset(dataset)} alt="No data" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                      </div>) : (
                      <div style={{ width: '100%', height: plotH, minHeight: plotH, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <NoDataCard />
                      </div>
                    )
                  )}

                </div>
                <ChartResizeHandle
                  aria-label={`Resize ${getChartTitle(dataset) || 'chart'} card`}
                  title="Drag to resize chart"
                  onMouseDown={(ev) => handleHistogramCardResizeStart(ev, dataset)}
                  style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
                />
              </ChartWrapper>
              </React.Fragment>
            );
          })}
        {inlineAddChartOpen ? (
          <ChartWrapper
            id="chart-inline-add"
            draggable={false}
            style={{
              flexShrink: 0,
              alignSelf: 'flex-start',
              maxWidth: '100%',
              boxSizing: 'border-box',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'rgba(24, 103, 122, 0.55)',
            }}
          >
            <div
              className={classes.chartContentWrapper}
              style={{ padding: '12px 14px 16px' }}
            >
              <AddChartInlinePanel
                step={inlineAddStep}
                setStep={setInlineAddStep}
                selectedCatalogId={inlineSelectedCatalogId}
                setSelectedCatalogId={setInlineSelectedCatalogId}
                onCompleteWithChartType={finalizeInlineAddChart}
                existingStripKeys={stripOrder}
                selectedDatasets={selectedDatasets}
              />
            </div>
          </ChartWrapper>
        ) : null}

      </CenterContainer>
      {expandedChart && (
        <ExpandedChartModal
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setExpandedChart={setExpandedChart}
          viewType={viewType}
          setViewType={setViewType}
          data={filteredData}
          titles={displayTitles}
          downloadChart={downloadChart}
          kmPlotData={kmPlotData}
          kmLoading={kmLoading}
          kmError={kmError}
          kmChartRef={kmChartRefExpanded}
          riskTableRef={riskTableRefExpanded}
          cohorts={cohorts}
          timeIntervals={timeIntervals}
          c1={c1}
          c2={c2}
          c3={c3}
          c1Name={c1Name}
          c2Name={c2Name}
          c3Name={c3Name}
          chartVisualByPanelId={chartVisualByPanelId}
          onSetChartVisual={(panelId, type) => dispatch(patchChartVisuals({ [panelId]: type }))}
          cohortParticipantState={cohortParticipantState}
          containerRef={containerRef}
          canvasRef={canvasRef}
        />
      )}

    </HistogramContainer>
  );
};

export default Histogram;