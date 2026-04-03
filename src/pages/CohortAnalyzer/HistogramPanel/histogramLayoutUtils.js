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
