import React, {
  useMemo, useState, useRef, useEffect, useCallback, useLayoutEffect,
} from 'react';
import { useSelector } from 'react-redux';
import CohortAnalyzerHeader from '../components/CohortAnalyzerHeader';
import ChartVenn from './ChartVenn';
import { useCohortAnalyzer } from '../context/CohortAnalyzerContext';
import { CA_EXPANDED_CHART_MODAL_TAB_VENN, BESIDE_PEER_DRAG_STYLE } from '../HistogramPanel/histogramConstants';
import { HistogramChartEmptyState } from '../HistogramPanel/chart/HistogramChartEmptyState';
import { BESIDE_TOP_ROW_DRAG_SOURCE_COLLAPSED_STYLE } from '../HistogramPanel/utils/histogramLayoutUtils';
import {
  defaultVennOuterPx,
  vennChartSlotDimensionsFromOuterPx,
} from '../config/cohortAnalyzerViewPercentDefaults';
import { buildPlaceholderVennCohortData } from '../utils/cohortAnalyzerChartPreview';

const VennDiagramContainer = ({
  classes,
  state,
  chartPreviewMode = false,
  containerRef,
  canvasRef,
  besideCardDrag,
  besidePanelDragState,
  chartModalOpen = false,
  chartModalActiveTab,
  onExpandVenn,
}) => {
  const vennSizeFromStore = useSelector((s) => s.cohortAnalyzerLayout.sizes.venn);

  const {
    refreshTableContent,
    selectedCohorts,
    nodeIndex,
    cohortData,
    setSelectedChart,
    setRefreshSelectedChart,
    setSelectedCohortSections,
    selectedCohortSection,
    setGeneralInfo,
    setNodeIndex,
    setRowData,
    setAlert,
  } = useCohortAnalyzer();

  const mappedCohortData = useMemo(() => {
    if (chartPreviewMode) {
      return buildPlaceholderVennCohortData();
    }
    if (selectedCohorts.length > 0 && state) {
      const mappingFunction = (cohortId) => (cohortData || state)[cohortId];
      return selectedCohorts.map(mappingFunction);
    }
    return [];
  }, [chartPreviewMode, cohortData, selectedCohorts, state]);

  const vennHasRenderableCohorts = useMemo(
    () => mappedCohortData.some(
      (c) => c && c.cohortName && Array.isArray(c.participants),
    ),
    [mappedCohortData],
  );

  const chartModalVennActive = chartModalOpen && chartModalActiveTab === CA_EXPANDED_CHART_MODAL_TAB_VENN;

  const showChartVenn = chartPreviewMode
    ? refreshTableContent && !chartModalVennActive
    : (
      refreshTableContent
      && selectedCohorts.length > 0
      && vennHasRenderableCohorts
      && !chartModalVennActive
    );

  const showVennEmptyState = !chartPreviewMode && (
    selectedCohorts.length === 0
    || (
      refreshTableContent
      && !chartModalVennActive
      && selectedCohorts.length > 0
      && cohortData != null
      && !vennHasRenderableCohorts
    )
  );

  const [vennContainerSize, setVennContainerSize] = useState(() =>
    (vennSizeFromStore != null ? vennSizeFromStore : defaultVennOuterPx()),
  );

  const vennCardMeasureRef = useRef(null);
  const [measuredCardWidth, setMeasuredCardWidth] = useState(null);

  useLayoutEffect(() => {
    const el = vennCardMeasureRef.current;
    if (!el) return () => {};

    const measureWidth = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) {
        setMeasuredCardWidth(w);
      }
    };

    // First paint uses Redux/default width; column is often wider — measure synchronously.
    measureWidth();

    if (typeof ResizeObserver === 'undefined') return () => {};
    const ro = new ResizeObserver(() => {
      measureWidth();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setVennContainerSize(vennSizeFromStore != null ? vennSizeFromStore : defaultVennOuterPx());
  }, [vennSizeFromStore]);

  const slotOuterWidth = measuredCardWidth != null
    ? measuredCardWidth
    : vennContainerSize.width;

  const chartSlot = useMemo(
    () => vennChartSlotDimensionsFromOuterPx(slotOuterWidth, vennContainerSize.height),
    [slotOuterWidth, vennContainerSize.height],
  );

  const handleDownload = () => {
    if (containerRef.current && canvasRef.current) {
      const canvas = canvasRef.current;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      tempCtx.drawImage(canvas, 0, 0);

      const link = document.createElement('a');
      link.download = 'venn-diagram.png';
      link.href = tempCanvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setAlert({ type: 'success', message: 'Confirmed download of Venn Diagram from the Cohort Analyzer by Participant ID' });
    }
  };

  const handleSetSelectedChart = useCallback((data) => {
    setSelectedChart(data);
    setRefreshSelectedChart((v) => !v);
  }, [setSelectedChart, setRefreshSelectedChart]);

  const chartVennProps = useMemo(
    () => ({
      intersection: nodeIndex,
      cohortData: mappedCohortData,
      setSelectedChart: handleSetSelectedChart,
      setSelectedCohortSections: (data) => {
        setSelectedCohortSections(data);
      },
      selectedCohortSection,
      selectedCohort: chartPreviewMode ? [] : selectedCohorts,
      setGeneralInfo,
    }),
    [
      nodeIndex,
      mappedCohortData,
      handleSetSelectedChart,
      selectedCohortSection,
      chartPreviewMode,
      selectedCohorts,
      setGeneralInfo,
      setSelectedCohortSections,
    ],
  );

  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    height: vennContainerSize.height,
    flex: '0 0 auto',
    maxHeight: 'none',
    alignSelf: 'stretch',
    ...(besidePanelDragState && besidePanelDragState.kind === 'venn'
      ? {
        ...BESIDE_TOP_ROW_DRAG_SOURCE_COLLAPSED_STYLE,
        width: besidePanelDragState.width,
        height: besidePanelDragState.height,
        minHeight: besidePanelDragState.height,
        maxHeight: besidePanelDragState.height,
        flex: '0 0 auto',
      }
      : {}),
    ...(besidePanelDragState && besidePanelDragState.kind === 'survival'
      ? BESIDE_PEER_DRAG_STYLE
      : {}),
  };

  const dragId = besideCardDrag && besideCardDrag.id != null ? besideCardDrag.id : undefined;
  const dragEnabled = Boolean(besideCardDrag && besideCardDrag.draggable);

  return (
    <div
      ref={vennCardMeasureRef}
      id={dragId}
      className={`${classes.chartContainer} ${classes.vennDiagramCard}`}
      style={containerStyle}
      draggable={dragEnabled}
      onDragStart={dragEnabled && besideCardDrag.onDragStart ? besideCardDrag.onDragStart : undefined}
      onDragEnd={dragEnabled && besideCardDrag.onDragEnd ? besideCardDrag.onDragEnd : undefined}
    >
      <CohortAnalyzerHeader
        selectedCohorts={selectedCohorts}
        nodeIndex={nodeIndex}
        setNodeIndex={setNodeIndex}
        setRowData={setRowData}
        handleDownload={handleDownload}
        onExpandVenn={onExpandVenn}
        classes={classes}
      />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
        {showChartVenn && (
          <ChartVenn
            {...chartVennProps}
            chartPreviewMode={chartPreviewMode}
            containerRef={containerRef}
            canvasRef={canvasRef}
            slotWidth={chartSlot.slotWidth}
            slotHeight={chartSlot.slotHeight}
          />
        )}

        {showVennEmptyState && (
          <div
            style={{
              width: '100%',
              flex: 1,
              minHeight: chartSlot.slotHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <HistogramChartEmptyState />
          </div>
        )}
      </div>
  
    
    </div>
  );
};

export default VennDiagramContainer;
