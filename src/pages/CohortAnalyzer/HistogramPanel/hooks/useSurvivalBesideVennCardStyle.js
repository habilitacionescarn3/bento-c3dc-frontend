import { useMemo } from 'react';
import {
  CA_SURVIVAL_CARD_MIN_HEIGHT as SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT as SURVIVAL_CARD_MAX_HEIGHT,
} from '../../store/cohortAnalyzerLayoutConstants';
import { BESIDE_PEER_DRAG_STYLE } from '../histogramConstants';
import { BESIDE_TOP_ROW_DRAG_SOURCE_COLLAPSED_STYLE } from '../utils/histogramLayoutUtils';

export function useSurvivalBesideVennCardStyle({
  survivalCardSize,
  besideCardDrag,
  allInputsEmpty,
  besidePanelDragState,
}) {
  return useMemo(() => {
    const clampH = (h) => Math.min(SURVIVAL_CARD_MAX_HEIGHT, Math.max(SURVIVAL_CARD_MIN_HEIGHT, h));
    const base = {
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      alignSelf: 'stretch',
      height:
        survivalCardSize && survivalCardSize.height != null
          ? clampH(survivalCardSize.height)
          : SURVIVAL_CARD_MIN_HEIGHT,
      minHeight: SURVIVAL_CARD_MIN_HEIGHT,
      cursor: besideCardDrag && besideCardDrag.draggable && !allInputsEmpty ? 'grab' : undefined,
    };
    const drag = {};
    if (besidePanelDragState && besidePanelDragState.kind === 'survival') {
      const { width: dw, height: dh } = besidePanelDragState;
      Object.assign(drag, BESIDE_TOP_ROW_DRAG_SOURCE_COLLAPSED_STYLE, {
        width: dw,
        height: dh,
        minHeight: dh,
        maxHeight: dh,
        flex: '0 0 auto',
      });
    }
    if (besidePanelDragState && besidePanelDragState.kind === 'venn') {
      // Let pointer events reach the survival column wrapper so Venn → survival drop works.
      Object.assign(drag, BESIDE_PEER_DRAG_STYLE, { pointerEvents: 'none' });
    }
    return { ...base, ...drag };
  }, [survivalCardSize, besideCardDrag, allInputsEmpty, besidePanelDragState]);
}
