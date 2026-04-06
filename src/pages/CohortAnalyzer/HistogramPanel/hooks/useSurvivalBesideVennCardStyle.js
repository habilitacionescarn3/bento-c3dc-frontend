import { useMemo } from 'react';
import {
  CA_SURVIVAL_CARD_MIN_HEIGHT as SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT as SURVIVAL_CARD_MAX_HEIGHT,
} from '../../store/cohortAnalyzerLayoutConstants';
import { BESIDE_PEER_DRAG_STYLE } from '../histogramConstants';

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
}
