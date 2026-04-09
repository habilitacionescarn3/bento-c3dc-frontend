/**
 * Measure a dragged card for strip drop-slot sizing.
 */
export function measureDragCardElement(el) {
  if (!el || typeof el.getBoundingClientRect !== 'function') return null;
  const r = el.getBoundingClientRect();
  const width = Math.round(r.width);
  const height = Math.round(r.height);
  if (width < 8 || height < 8) return null;
  return { width, height };
}

export function requiresCompactSpacing(dataset) {
  return dataset === 'race' || dataset === 'treatmentType' || dataset === 'response';
}

/**
 * Collapse the strip item being dragged so its slot is freed. Avoid display:none so native
 * drag + setDragImage stay reliable; drag image is captured in dragstart before this applies.
 */
export const HISTOGRAM_DRAG_SOURCE_COLLAPSED_STYLE = {
  width: 0,
  minWidth: 0,
  maxWidth: 0,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 0,
  opacity: 0,
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  border: 'none',
  pointerEvents: 'none',
  boxShadow: 'none',
  transition: 'none',
};

/**
 * Hide the native drag source while keeping its footprint so `vennSurvivalRow` does not
 * reflow (`flex-wrap: wrap`) into a stacked layout. Merge with explicit `width` / `height`
 * from the drag session (`besidePanelDragState`).
 */
export const BESIDE_TOP_ROW_DRAG_SOURCE_COLLAPSED_STYLE = {
  opacity: 0,
  visibility: 'hidden',
  overflow: 'hidden',
  pointerEvents: 'none',
  margin: 0,
  padding: 0,
  border: 'none',
  boxShadow: 'none',
  transition: 'none',
  flexShrink: 0,
};
