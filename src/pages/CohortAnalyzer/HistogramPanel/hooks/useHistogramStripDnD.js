import { useCallback, useRef, useState } from 'react';
import { setStripOrder, setTopRowPanelOrder } from '../../store/cohortAnalyzerLayoutActions';
import {
  parseDragDataTransfer,
  CA_PANEL_DRAG_MIME,
} from '../../store/panelDnD';
import { measureDragCardElement } from '../histogramLayoutUtils';

/**
 * Drag-and-drop for histogram strip ordering and top-row Venn/survival swap drops.
 */
export function useHistogramStripDnD({
  chartRef,
  estimateHistogramCardDropSize,
  stripOrder,
  topRowOrder,
  dispatch,
}) {

  const [draggingDataset, setDraggingDataset] = useState(null);
  const [dragOverDataset, setDragOverDataset] = useState(null);
  const [draggingCardDimensions, setDraggingCardDimensions] = useState(null);
  const histogramDragSizeRef = useRef(null);

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

  return {
    draggingDataset,
    setDraggingDataset,
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
