import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPanelSize } from '../store/cohortAnalyzerLayoutActions';
import {
  CA_VENN_OUTER_MIN_W,
  CA_VENN_OUTER_MAX_W,
  CA_VENN_OUTER_MIN_H,
  CA_VENN_OUTER_MAX_H,
} from '../store/cohortAnalyzerLayoutConstants';
import CohortAnalyzerHeader from '../components/CohortAnalyzerHeader';
import ChartVenn from './ChartVenn';
import placeHolder from '../../../assets/vennDigram/placeHolder.png';
import { useCohortAnalyzer } from '../CohortAnalyzerContext';
import { ChartResizeHandle } from '../HistogramPanel/HistogramPanel.styled';

/** Space for header + divider inside the white card (approx.) */
const VENN_CARD_HEADER_RESERVE = 80;

const BESIDE_PEER_DRAG_STYLE = {
  boxShadow: '0 14px 28px rgba(29, 61, 73, 0.28)',
  filter: 'brightness(0.96)',
  transition: 'box-shadow 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
};

const VennDiagramContainer = ({
  classes,
  state,
  containerRef,
  canvasRef,
  headerPrefix,
  besideCardDrag,
  besidePanelDragState,
}) => {
  const dispatch = useDispatch();
  const vennSizeFromStore = useSelector((s) => s.cohortAnalyzerLayout.sizes.venn);

  const {
    refreshTableContent,
    selectedCohorts,
    nodeIndex,
    cohortData,
    setSelectedChart,
    refreshSelectedChart,
    setRefreshSelectedChart,
    setSelectedCohortSections,
    selectedCohortSection,
    setGeneralInfo,
    setNodeIndex,
    setRowData,
    setAlert,
  } = useCohortAnalyzer();

  const mappedCohortData = useMemo(() => {
    if (cohortData && selectedCohorts.length > 0 && state) {
      const mappingFunction = (cohortId) => (cohortData || state)[cohortId];
      return selectedCohorts.map(mappingFunction);
    }
    return [];
  }, [cohortData, selectedCohorts, state]);

  const [vennContainerSize, setVennContainerSize] = useState(vennSizeFromStore);
  const vennContainerSizeRef = useRef(null);
  vennContainerSizeRef.current = vennContainerSize;

  useEffect(() => {
    if (vennSizeFromStore != null) {
      setVennContainerSize(vennSizeFromStore);
    }
  }, [vennSizeFromStore]);

  const chartSlot = useMemo(() => {
    if (!vennContainerSize) {
      return { slotWidth: undefined, slotHeight: undefined };
    }
    return {
      slotWidth: Math.max(240, vennContainerSize.width - 24),
      slotHeight: Math.max(140, vennContainerSize.height - VENN_CARD_HEADER_RESERVE),
    };
  }, [vennContainerSize]);

  const handleVennContainerResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const card = e.currentTarget.parentElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const prev = vennContainerSizeRef.current;
    const startW = prev && prev.width != null ? prev.width : rect.width;
    const startH = prev && prev.height != null ? prev.height : rect.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const maxW = typeof window !== 'undefined'
      ? Math.min(CA_VENN_OUTER_MAX_W, window.innerWidth - 24)
      : CA_VENN_OUTER_MAX_W;

    document.body.style.userSelect = 'none';

    let lastW;
    let lastH;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const w = Math.round(Math.min(maxW, Math.max(CA_VENN_OUTER_MIN_W, startW + dx)));
      const h = Math.round(
        Math.min(CA_VENN_OUTER_MAX_H, Math.max(CA_VENN_OUTER_MIN_H, startH + dy)),
      );
      lastW = w;
      lastH = h;
      setVennContainerSize({ width: w, height: h });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      if (lastW != null && lastH != null) {
        dispatch(setPanelSize({ panel: 'venn', size: { width: lastW, height: lastH } }));
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

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

  const handleSetSelectedChart = (data) => {
    setSelectedChart(data);
    setRefreshSelectedChart(!refreshSelectedChart);
  };

  const containerStyle = {
    position: 'relative',
    ...(vennContainerSize && {
      width: vennContainerSize.width,
      height: vennContainerSize.height,
      flexShrink: 0,
      maxHeight: 'none',
      alignSelf: 'flex-start',
    }),
    ...(besidePanelDragState && besidePanelDragState.kind === 'venn'
      ? {
        opacity: 0.42,
        outline: '2px dashed #679AAA',
        outlineOffset: 2,
        borderRadius: 10,
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
      id={dragId}
      className={classes.chartContainer}
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
        classes={classes}
        headerPrefix={headerPrefix}
      />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 0, width: '100%' }}>
        {refreshTableContent && selectedCohorts.length > 0 && (
          <ChartVenn
            intersection={nodeIndex}
            cohortData={mappedCohortData}
            setSelectedChart={handleSetSelectedChart}
            setSelectedCohortSections={(data) => {
              setSelectedCohortSections(data);
            }}
            selectedCohortSection={selectedCohortSection}
            selectedCohort={selectedCohorts}
            setGeneralInfo={setGeneralInfo}
            containerRef={containerRef}
            canvasRef={canvasRef}
            slotWidth={chartSlot.slotWidth}
            slotHeight={chartSlot.slotHeight}
          />
        )}

        {selectedCohorts.length === 0 && (
          <img src={placeHolder} alt="placeholder" width="100%" style={{ marginTop: 10, alignSelf: 'center', flex: 1 }} />
        )}
      </div>
      <ChartResizeHandle
        aria-label="Resize Venn diagram container"
        title="Drag to resize container"
        onMouseDown={handleVennContainerResizeStart}
      />
    </div>
  );
};

export default VennDiagramContainer;
