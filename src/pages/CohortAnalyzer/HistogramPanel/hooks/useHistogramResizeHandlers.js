import { useCallback } from 'react';
import { setPanelSize } from '../../store/cohortAnalyzerLayoutActions';
import {
  CA_SURVIVAL_CARD_MIN_WIDTH as SURVIVAL_CARD_MIN_WIDTH,
  CA_SURVIVAL_CARD_MAX_WIDTH as SURVIVAL_CARD_MAX_WIDTH,
  CA_SURVIVAL_CARD_MIN_HEIGHT as SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT as SURVIVAL_CARD_MAX_HEIGHT,
} from '../../store/cohortAnalyzerLayoutConstants';
import {
  HISTOGRAM_CARD_MIN_WIDTH,
  HISTOGRAM_CARD_MAX_WIDTH,
  HISTOGRAM_PLOT_MIN_HEIGHT,
  HISTOGRAM_PLOT_MAX_HEIGHT,
} from '../histogramConstants';

/**
 * Drag-to-resize handlers for histogram strip cards and survival card.
 */
export function useHistogramResizeHandlers({
  allInputsEmpty,
  histogramCardSizes,
  setHistogramCardSizes,
  survivalCardSize,
  setSurvivalCardSize,
  dispatch,
  defaultPlotHeightPx,
}) {
  const handleHistogramCardResizeStart = useCallback((e, dataset) => {
    if (allInputsEmpty) return;
    e.preventDefault();
    e.stopPropagation();
    const card = e.currentTarget.parentElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const current = histogramCardSizes[dataset];
    const startWidth = current && current.width != null ? current.width : rect.width;
    const startPlot = current && current.plotHeight != null ? current.plotHeight : defaultPlotHeightPx;
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
  }, [
    allInputsEmpty,
    histogramCardSizes,
    setHistogramCardSizes,
    dispatch,
    defaultPlotHeightPx,
  ]);

  const handleSurvivalCardResizeStart = useCallback((e, options = {}) => {
    const { fillColumnWidth = false } = options;
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
      const h = Math.round(
        Math.min(SURVIVAL_CARD_MAX_HEIGHT, Math.max(SURVIVAL_CARD_MIN_HEIGHT, startHeight + dy)),
      );
      lastSurvivalH = h;
      if (fillColumnWidth) {
        setSurvivalCardSize((prev) => ({ ...(prev || {}), height: h }));
        return;
      }
      const w = Math.round(Math.min(maxW, Math.max(SURVIVAL_CARD_MIN_WIDTH, startWidth + dx)));
      lastSurvivalW = w;
      setSurvivalCardSize({ width: w, height: h });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      if (fillColumnWidth) {
        const hToSave = lastSurvivalH != null ? lastSurvivalH : startHeight;
        const wPx = Math.round(card.getBoundingClientRect().width);
        dispatch(
          setPanelSize({
            panel: 'survival',
            size: { width: wPx, height: hToSave },
          }),
        );
        return;
      }
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
  }, [allInputsEmpty, survivalCardSize, setSurvivalCardSize, dispatch]);

  return { handleHistogramCardResizeStart, handleSurvivalCardResizeStart };
}
