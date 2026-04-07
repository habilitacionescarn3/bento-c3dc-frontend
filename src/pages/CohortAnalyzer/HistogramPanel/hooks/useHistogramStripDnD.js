import { useCallback, useRef, useState } from 'react';
import { setStripOrder, setTopRowPanelOrder } from '../../store/cohortAnalyzerLayoutActions';
import {
  parseDragDataTransfer,
  CA_PANEL_DRAG_MIME,
} from '../../store/panelDnD';
import { measureDragCardElement } from '../utils/histogramLayoutUtils';

/**
 * Drag-and-drop for histogram strip ordering and top-row Venn/survival swap drops.
 */
export function useHistogramStripDnD({
  chartRef,
  estimateHistogramCardDropSize,
  stripOrder,
  topRowOrder,
  dispatch,
  besidePanelDraggingRef = null,
}) {

  const [draggingDataset, setDraggingDataset] = useState(null);
  const [dragOverDataset, setDragOverDataset] = useState(null);
  const [draggingCardDimensions, setDraggingCardDimensions] = useState(null);
  const histogramDragSizeRef = useRef(null);
  /** Bumps when a drag ends so a pending rAF must not set draggingDataset (avoids killing native DnD). */
  const stripDragSessionRef = useRef(0);

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

  const beginStripChartDrag = useCallback((datasetKey) => {
    stripDragSessionRef.current += 1;
    const session = stripDragSessionRef.current;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (stripDragSessionRef.current !== session) return;
        setDraggingDataset(datasetKey);
      });
    });
  }, []);

  const endStripChartDrag = useCallback(() => {
    stripDragSessionRef.current += 1;
    setDraggingDataset(null);
    setDragOverDataset(null);
    clearHistogramDragSize();
  }, [clearHistogramDragSize]);

  const handleStripChartDragOver = useCallback(
    (event, targetDataset) => {
      event.preventDefault();
      const types = Array.from(event.dataTransfer.types || []);
      const hasPanelMime =
        types.includes(CA_PANEL_DRAG_MIME) || types.includes('text/plain');
      const refSnap = besidePanelDraggingRef && besidePanelDraggingRef.current;
      const topRowStripDrag =
        refSnap &&
        (refSnap.kind === 'venn' || refSnap.kind === 'survival');

      if (topRowStripDrag && hasPanelMime) {
        event.dataTransfer.dropEffect = 'move';
        setDragOverDataset(targetDataset);
        return;
      }

      if (
        (!draggingDataset || draggingDataset === targetDataset)
        && hasPanelMime
      ) {
        event.dataTransfer.dropEffect = 'move';
        return;
      }
      if (!draggingDataset || draggingDataset === targetDataset) return;
      event.dataTransfer.dropEffect = 'move';
      setDragOverDataset(targetDataset);
    },
    [draggingDataset, besidePanelDraggingRef],
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
        setDragOverDataset(null);
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
      endStripChartDrag();
    },
    [stripOrder, draggingDataset, topRowOrder, dispatch, endStripChartDrag],
  );

  return {
    draggingDataset,
    setDraggingDataset,
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
  };
}
