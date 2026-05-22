import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useHistogramData } from './hooks/useHistogramData';
import useKmplot from './survival/useKmplot';
import useRiskTable from './survival/useRiskTable';
import {
  HistogramContainer,
  ChartWrapper,
  CenterContainer,
  ChartResizeHandle,
} from './HistogramPanel.styled';
import VennDiagramContainer from '../vennDiagram/VennDiagramContainer';
import {
  encodePanelDragPayload,
  CA_PANEL_DRAG_MIME,
} from '../store/panelDnD';
import ExpandedChartModal from './popup/HistogramPopup';
import AddChartInlinePanel from '../components/AddChartInlinePanel';
import { useDispatch, useSelector } from 'react-redux';
import { patchChartVisuals } from '../store/cohortAnalyzerLayoutActions';
import {
  COHORT_ANALYZER_HISTOGRAM_TITLES as titles,
} from '../store/cohortAnalyzerDefaultPanelRegistry';
import { HISTOGRAM_CARD_CHROME_HEIGHT } from './histogramConstants';
import { hasAnyAddableChartCatalogEntry } from '../config/cohortAnalyzerChartCatalog';
import {
  defaultHistogramPlotHeightPx,
  defaultHistogramStripDropSlotWidthPx,
  defaultHistogramCardOuterMinHeightPx,
  defaultVennOuterPx,
} from '../config/cohortAnalyzerViewPercentDefaults';
import { clampSurvivalPanelSize } from '../store/cohortAnalyzerLayoutReducer';
import { useHistogramPanelMuiStyles } from './styles/histogramMuiStyles';
import {
  useFilteredKmPlotData,
  useKmCohortColors,
  useRiskTableCohortsShape,
  useFilteredHistogramGraphData,
} from './hooks/useHistogramDerivedData';
import { useHistogramResizeHandlers } from './hooks/useHistogramResizeHandlers';
import { useHistogramStripDnD } from './hooks/useHistogramStripDnD';
import { useHistogramPanelBootstrap } from './hooks/useHistogramPanelBootstrap';
import { useSurvivalBesideVennCardStyle } from './hooks/useSurvivalBesideVennCardStyle';
import { useBesideStripHistogramMetrics } from './hooks/useBesideStripHistogramMetrics';
import { HistogramStripChartRow } from './strip/HistogramStripChartRow';
import { HistogramBesideVennHistogramPortal } from './strip/HistogramBesideVennHistogramPortal';
import {
  HistogramSurvivalBesideVennPortal,
  SurvivalHistogramInlineLegacy,
} from './survival/HistogramSurvivalLayoutFragments';
import { SurvivalAnalysisCardBody } from './survival/SurvivalAnalysisCardBody';
import {
  areChartsInteractionDisabled,
  getChartPreviewContentStyle,
} from '../utils/cohortAnalyzerChartPreview';

const Histogram = ({
  chartPreviewMode = false,
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
  besidePanelDraggingRef = null,
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
  histogramExportRef,
  onAllAddableChartsAddedChange,
  /** Clears Venn/survival drag state after drop on histogram strip (from useBesidePanelDnD). */
  onTopRowStripDropComplete,
  onExpandVenn,
}) => {
  const classes = useHistogramPanelMuiStyles();
  const dispatch = useDispatch();
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
    fetchedData,
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
    chartPreviewMode,
    expandedChart: chartModalExpandedChart,
    setExpandedChart: setChartModalExpandedChart,
    activeTab: chartModalActiveTab,
    setActiveTab: setChartModalActiveTab,
  });

  useEffect(() => {
    if (!histogramExportRef) return;
    histogramExportRef.current = {
      getChartExportPayload() {
        return {
          graphData,
          fetchedData,
          viewType,
          chartTitles: displayTitles,
          selectedDatasets,
        };
      },
    };
  }, [graphData, fetchedData, viewType, displayTitles, selectedDatasets]);

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

  const {
    stripOrder,
    inlineAddStep,
    setInlineAddStep,
    inlineSelectedCatalogId,
    setInlineSelectedCatalogId,
    finalizeInlineAddChart,
    handleRemoveHistogramDataset,
    survivalSelected,
  } = useHistogramPanelBootstrap({
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
  });

  useEffect(() => {
    if (typeof onAllAddableChartsAddedChange !== 'function') return;
    const anyAddable = hasAnyAddableChartCatalogEntry(stripOrder, selectedDatasets);
    onAllAddableChartsAddedChange(!anyAddable);
  }, [stripOrder, selectedDatasets, onAllAddableChartsAddedChange]);

  const defaultPlotHeightPx = useMemo(() => defaultHistogramPlotHeightPx(), []);
  const defaultDropSlotWidthPx = useMemo(() => defaultHistogramStripDropSlotWidthPx(), []);

  const estimateHistogramCardDropSize = useCallback((datasetKey) => {
    const ph0 = defaultPlotHeightPx;
    const outerH0 = defaultHistogramCardOuterMinHeightPx(ph0);
    if (!datasetKey) return { width: defaultDropSlotWidthPx, height: outerH0 };
    const entry = histogramCardSizes[datasetKey];
    const w = entry && entry.width != null ? entry.width : defaultDropSlotWidthPx;
    const ph = entry && entry.plotHeight != null ? entry.plotHeight : ph0;
    return {
      width: w,
      height: Math.max(outerH0, ph + HISTOGRAM_CARD_CHROME_HEIGHT),
    };
  }, [histogramCardSizes, defaultPlotHeightPx, defaultDropSlotWidthPx]);

  const visibleHistogramDatasets = useMemo(
    () => selectedDatasets.filter((d) => d !== 'survivalAnalysis'),
    [selectedDatasets],
  );

  const {
    draggingDataset,
    beginStripChartDrag,
    endStripChartDrag,
    dragOverDataset,
    setDragOverDataset,
    draggingCardDimensions,
    histogramDragSizeRef,
    captureHistogramDragCardSize,
    clearHistogramDragSize,
    handleStripChartDragOver,
    handleStripChartDrop,
  } = useHistogramStripDnD({
    chartRef,
    estimateHistogramCardDropSize,
    stripOrder,
    dispatch,
    besidePanelDraggingRef,
    onTopRowDroppedOnStrip: onTopRowStripDropComplete,
  });

  const orderedVisibleHistograms = useMemo(() => {
    const order = stripOrder.filter(
      (d) =>
        d !== 'venn' &&
        d !== 'survivalAnalysis' &&
        visibleHistogramDatasets.includes(d),
    );
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

  /** Full strip layout: histogram keys plus `venn` / `survivalAnalysis` when moved from the top row. */
  const stripRenderOrder = useMemo(() => {
    return stripOrder.filter((id) => {
      if (id === 'venn') return true;
      if (id === 'survivalAnalysis') return survivalSelected;
      if (besideDatasetForColumn && id === besideDatasetForColumn) return false;
      return mainHistogramRowOrder.includes(id);
    });
  }, [stripOrder, survivalSelected, besideDatasetForColumn, mainHistogramRowOrder]);

  const reduxVennSize = layoutSizes.venn;

  /** Strip `ChartWrapper` defaults to 1/3 row width — pin to Redux / drag snapshot size for top-row panels. */
  const stripVennChartWrapperStyle = useMemo(() => {
    const box = reduxVennSize != null ? reduxVennSize : defaultVennOuterPx();
    const w = box.width;
    const h = box.height;
    return {
      width: w,
      minWidth: w,
      height: h,
      minHeight: h,
      maxWidth: 'none',
      flex: '0 0 auto',
      alignSelf: 'flex-start',
      boxSizing: 'border-box',
    };
  }, [reduxVennSize]);

  const stripSurvivalChartWrapperStyle = useMemo(() => {
    const raw = survivalCardSize || reduxSurvivalSize;
    const box = clampSurvivalPanelSize(raw && typeof raw === 'object' ? raw : {});
    return {
      width: box.width,
      minWidth: box.width,
      height: box.height,
      minHeight: box.height,
      maxWidth: 'none',
      flex: '0 0 auto',
      alignSelf: 'flex-start',
      boxSizing: 'border-box',
    };
  }, [survivalCardSize, reduxSurvivalSize]);

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

  const { besideHistogramBarSums, besideStripPlotHeight } = useBesideStripHistogramMetrics({
    besideDatasetForColumn,
    filteredData,
    histogramCardSizes,
    defaultPlotHeightPx,
  });

  /** Match beside-column histogram shell to survival overall card (width × height). */
  const besidePeerShellBox = useMemo(() => {
    if (!besideDatasetForColumn) return null;
    const raw = survivalCardSize || reduxSurvivalSize;
    return clampSurvivalPanelSize(raw && typeof raw === 'object' ? raw : {});
  }, [besideDatasetForColumn, survivalCardSize, reduxSurvivalSize]);

  const besideColumnPlotHeightPx = useMemo(() => {
    if (!besidePeerShellBox || besidePeerShellBox.height == null) {
      return besideStripPlotHeight;
    }
    const inner = besidePeerShellBox.height - HISTOGRAM_CARD_CHROME_HEIGHT;
    return Math.max(120, Math.round(inner));
  }, [besidePeerShellBox, besideStripPlotHeight]);

  const handleMouseEnter = (entry) => {
    cellHover.current = entry;
  };

  const handleMouseLeave = () => {
    cellHover.current = null;
  };

  const allInputsEmpty = [c1, c2, c3].every(arr => !Array.isArray(arr) || arr.length === 0);
  const chartsInteractionDisabled = areChartsInteractionDisabled(allInputsEmpty, chartPreviewMode);
  const chartPreviewStyle = getChartPreviewContentStyle(chartPreviewMode);

  const survivalBesideVennCardStyle = useSurvivalBesideVennCardStyle({
    survivalCardSize,
    besideCardDrag,
    allInputsEmpty: chartsInteractionDisabled,
    besidePanelDragState,
  });

  const { handleHistogramCardResizeStart, handleSurvivalCardResizeStart } = useHistogramResizeHandlers({
    allInputsEmpty: chartsInteractionDisabled,
    histogramCardSizes,
    setHistogramCardSizes,
    survivalCardSize,
    setSurvivalCardSize,
    dispatch,
    defaultPlotHeightPx,
    besideHistogramDataset: besideDatasetForColumn,
  });

  const survivalAnalysisBodyProps = {
    classes,
    chartPreviewMode,
    c1Name,
    c2Name,
    c3Name,
    allInputsEmpty: chartsInteractionDisabled,
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

  return (
    <HistogramContainer>
      <HistogramBesideVennHistogramPortal
        survivalSelected={survivalSelected}
        besideDatasetForColumn={besideDatasetForColumn}
        survivalBesideVennTarget={survivalBesideVennTarget}
        draggingDataset={draggingDataset}
        chartRef={chartRef}
        histogramCardSizes={histogramCardSizes}
        allInputsEmpty={chartsInteractionDisabled}
        chartPreviewMode={chartPreviewMode}
        beginStripChartDrag={beginStripChartDrag}
        endStripChartDrag={endStripChartDrag}
        setDragOverDataset={setDragOverDataset}
        captureHistogramDragCardSize={captureHistogramDragCardSize}
        clearHistogramDragSize={clearHistogramDragSize}
        getChartTitle={getChartTitle}
        data={data}
        filteredData={filteredData}
        viewType={viewType}
        chartVisualByPanelId={chartVisualByPanelId}
        besideHistogramBarSums={besideHistogramBarSums}
        besideStripPlotHeight={besideStripPlotHeight}
        besidePeerShellBox={besidePeerShellBox}
        besideColumnPlotHeightPx={besideColumnPlotHeightPx}
        cellHover={cellHover}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        classes={classes}
        setExpandedChart={setExpandedChart}
        setActiveTab={setActiveTab}
        downloadChart={downloadChart}
        handleRemoveHistogramDataset={handleRemoveHistogramDataset}
        handleHistogramCardResizeStart={handleHistogramCardResizeStart}
        c1Name={c1Name}
        c2Name={c2Name}
        c3Name={c3Name}
        chartTypeMenuDataset={chartTypeMenuDataset}
        setChartTypeMenuDataset={setChartTypeMenuDataset}
        chartTypeMenuRef={chartTypeMenuRef}
        setChartVisualForPanel={(panelId, type) => dispatch(patchChartVisuals({ [panelId]: type }))}
      />
      <HistogramSurvivalBesideVennPortal
        selectedDatasets={selectedDatasets}
        survivalBesideVennTarget={survivalBesideVennTarget}
        besideCardDrag={besideCardDrag}
        survivalBesideVennCardStyle={survivalBesideVennCardStyle}
        survivalAnalysisBodyProps={survivalAnalysisBodyProps}
        allInputsEmpty={chartsInteractionDisabled}
        handleSurvivalCardResizeStart={handleSurvivalCardResizeStart}
      />
      <CenterContainer
        onDragLeave={(event) => {
          const besideDrag =
            besidePanelDraggingRef && besidePanelDraggingRef.current;
          if (!draggingDataset && !besideDrag) return;
          const related = event.relatedTarget;
          if (related && event.currentTarget.contains(related)) return;
          setDragOverDataset(null);
        }}
      >
        <SurvivalHistogramInlineLegacy
          selectedDatasets={selectedDatasets}
          survivalBesideVennTarget={survivalBesideVennTarget}
          survivalCardSize={survivalCardSize}
          survivalAnalysisBodyProps={survivalAnalysisBodyProps}
          allInputsEmpty={chartsInteractionDisabled}
          handleSurvivalCardResizeStart={handleSurvivalCardResizeStart}
          stripOrder={stripOrder}
          topRowOrder={topRowOrder}
        />
        {stripRenderOrder.map((panelId) => {
          if (panelId === 'venn') {
            return (
              <ChartWrapper
                key="strip-venn"
                id="cohort-analyzer-venn-card"
                data-ca-histogram-strip-dataset="venn"
                ref={(el) => {
                  chartRef.current.venn = el;
                }}
                style={{
                  ...stripVennChartWrapperStyle,
                  ...chartPreviewStyle,
                  cursor: 'default',
                }}
                draggable={false}
                onDragOver={(e) => handleStripChartDragOver(e, 'venn')}
                onDrop={(e) => handleStripChartDrop(e, 'venn')}
              >
                <VennDiagramContainer
                  state={cohortParticipantState}
                  chartPreviewMode={chartPreviewMode}
                  containerRef={containerRef}
                  canvasRef={canvasRef}
                  classes={classes}
                  besideCardDrag={undefined}
                  besidePanelDragState={besidePanelDragState}
                  chartModalOpen={chartModalExpandedChart != null}
                  chartModalActiveTab={chartModalActiveTab}
                  onExpandVenn={onExpandVenn}
                />
              </ChartWrapper>
            );
          }
          if (panelId === 'survivalAnalysis') {
            const ds = 'survivalAnalysis';
            return (
              <ChartWrapper
                key="strip-survival"
                id="cohort-analyzer-survival-beside-card"
                data-ca-histogram-strip-dataset={ds}
                ref={(el) => {
                  chartRef.current[ds] = el;
                }}
                style={{
                  ...stripSurvivalChartWrapperStyle,
                  ...chartPreviewStyle,
                  cursor: chartsInteractionDisabled ? 'default' : 'grab',
                }}
                draggable={!chartsInteractionDisabled}
                onDragStart={(event) => {
                  setDragOverDataset(null);
                  captureHistogramDragCardSize(event, ds);
                  const payload = encodePanelDragPayload({ kind: 'histogram', dataset: ds });
                  event.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
                  event.dataTransfer.setData('text/plain', ds);
                  event.dataTransfer.effectAllowed = 'move';
                  const imgEl = event.currentTarget || chartRef.current[ds];
                  if (imgEl) {
                    event.dataTransfer.setDragImage(imgEl, 32, 20);
                  }
                  beginStripChartDrag(ds);
                }}
                onDragEnd={() => {
                  endStripChartDrag();
                }}
                onDragOver={(e) => handleStripChartDragOver(e, ds)}
                onDrop={(e) => handleStripChartDrop(e, ds)}
              >
                <SurvivalAnalysisCardBody {...survivalAnalysisBodyProps} besideVenn={false} />
                <ChartResizeHandle
                  aria-label="Resize survival analysis card"
                  title="Drag to resize card"
                  onMouseDown={handleSurvivalCardResizeStart}
                  style={{ opacity: chartsInteractionDisabled ? 0.35 : 1, pointerEvents: chartsInteractionDisabled ? 'none' : 'auto' }}
                />
              </ChartWrapper>
            );
          }
          const dataset = panelId;
          return (
          <HistogramStripChartRow
            key={dataset}
            dataset={dataset}
            classes={classes}
            data={data}
            filteredData={filteredData}
            viewType={viewType}
            setViewType={setViewType}
            chartVisualByPanelId={chartVisualByPanelId}
            histogramCardSizes={histogramCardSizes}
            defaultPlotHeightPx={defaultPlotHeightPx}
            defaultDropSlotWidthPx={defaultDropSlotWidthPx}
            defaultHistogramCardOuterMinHeightPx={defaultHistogramCardOuterMinHeightPx}
            estimateHistogramCardDropSize={estimateHistogramCardDropSize}
            draggingDataset={draggingDataset}
            beginStripChartDrag={beginStripChartDrag}
            endStripChartDrag={endStripChartDrag}
            dragOverDataset={dragOverDataset}
            setDragOverDataset={setDragOverDataset}
            draggingCardDimensions={draggingCardDimensions}
            histogramDragSizeRef={histogramDragSizeRef}
            captureHistogramDragCardSize={captureHistogramDragCardSize}
            clearHistogramDragSize={clearHistogramDragSize}
            handleStripChartDragOver={handleStripChartDragOver}
            handleStripChartDrop={handleStripChartDrop}
            handleHistogramCardResizeStart={handleHistogramCardResizeStart}
            chartRef={chartRef}
            allInputsEmpty={chartsInteractionDisabled}
            chartPreviewMode={chartPreviewMode}
            getChartTitle={getChartTitle}
            chartTypeMenuDataset={chartTypeMenuDataset}
            setChartTypeMenuDataset={setChartTypeMenuDataset}
            chartTypeMenuRef={chartTypeMenuRef}
            cellHover={cellHover}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            downloadChart={downloadChart}
            setExpandedChart={setExpandedChart}
            setActiveTab={setActiveTab}
            handleRemoveHistogramDataset={handleRemoveHistogramDataset}
            c1Name={c1Name}
            c2Name={c2Name}
            c3Name={c3Name}
            besidePanelDraggingRef={besidePanelDraggingRef}
          />
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
                onClose={onInlineAddChartClose}
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