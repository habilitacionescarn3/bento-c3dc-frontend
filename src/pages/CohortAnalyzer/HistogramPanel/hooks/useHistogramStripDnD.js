import { useCallback, useRef, useState } from 'react';
import {
  setStripOrder,
  moveTopRowPanelIntoStrip,
  setPanelSize,
} from '../../store/cohortAnalyzerLayoutActions';
import {
  parseDragDataTransferForDrop,
  CA_PANEL_DRAG_MIME,
} from '../../store/panelDnD';
import { measureDragCardElement } from '../utils/histogramLayoutUtils';

/**
 * While a Venn/survival drag is active, `dataTransfer` may parse as a histogram (plain-text
 * collision). Prefer the in-flight ref from drag start over a bogus histogram payload.
 */
function parseTopRowStripDragPayload(dataTransfer, besidePanelDraggingRef) {
  const snap = besidePanelDraggingRef && besidePanelDraggingRef.current;
  if (snap && (snap.kind === 'venn' || snap.kind === 'survival')) {
    const parsed = parseDragDataTransferForDrop(dataTransfer);
    if (parsed && (parsed.kind === 'venn' || parsed.kind === 'survival')) {
      return parsed;
    }
    return { kind: snap.kind, dataset: null };
  }
  return parseDragDataTransferForDrop(dataTransfer);
}

/**
 * Drag-and-drop for histogram strip ordering and top-row Venn/survival swap drops.
 */
export function useHistogramStripDnD({
  chartRef,
  estimateHistogramCardDropSize,
  stripOrder,
  dispatch,
  besidePanelDraggingRef = null,
  /** Invoked after Venn/survival is dropped on a histogram card (clears beside-row drag UI). */
  onTopRowDroppedOnStrip = null,
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

      // Do not require MIME in `types` — some UAs omit custom types during dragover even when drop works.
      if (topRowStripDrag) {
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
      const parsed = parseTopRowStripDragPayload(event.dataTransfer, besidePanelDraggingRef);
      if (parsed && (parsed.kind === 'venn' || parsed.kind === 'survival')) {
        if (!targetDataset) {
          setDragOverDataset(null);
          if (typeof onTopRowDroppedOnStrip === 'function') {
            onTopRowDroppedOnStrip();
          }
          return;
        }
        const snap = besidePanelDraggingRef && besidePanelDraggingRef.current;
        if (
          snap
          && (snap.kind === 'venn' || snap.kind === 'survival')
          && snap.width != null
          && snap.height != null
        ) {
          const w = Math.round(snap.width);
          const h = Math.round(snap.height);
          if (parsed.kind === 'venn') {
            dispatch(setPanelSize({ panel: 'venn', size: { width: w, height: h } }));
          } else {
            dispatch(setPanelSize({ panel: 'survival', size: { width: w, height: h } }));
          }
        }
        dispatch(
          moveTopRowPanelIntoStrip({
            panel: parsed.kind === 'venn' ? 'venn' : 'survival',
            insertBeforeDataset: targetDataset,
          }),
        );
        setDragOverDataset(null);
        if (typeof onTopRowDroppedOnStrip === 'function') {
          onTopRowDroppedOnStrip();
        }
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
    [
      stripOrder,
      draggingDataset,
      dispatch,
      endStripChartDrag,
      onTopRowDroppedOnStrip,
      besidePanelDraggingRef,
    ],
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
