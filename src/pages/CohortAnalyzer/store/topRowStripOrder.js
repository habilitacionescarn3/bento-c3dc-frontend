import { CA_LAYOUT_SLOT } from './cohortAnalyzerLayoutConstants';

/** Strip order may include top-row tokens beside histogram dataset ids. */
export function isStripOrderHistogramOnlyId(id) {
  return id !== 'venn' && id !== 'survivalAnalysis';
}

/**
 * Remove `panel` from top row and insert its strip token before `insertBeforeDataset`
 * (histogram id or strip token already in the list).
 */
export function insertTopRowPanelIntoStripOrder(stripOrder, panel, insertBeforeDataset) {
  const token =
    panel === CA_LAYOUT_SLOT.VENN || panel === 'venn'
      ? 'venn'
      : 'survivalAnalysis';
  let next = [...(stripOrder || [])].filter((id) => id !== token);
  // Survival always docks at the end of the histogram strip (not before the first card).
  if (token === 'survivalAnalysis') {
    next.push(token);
    return next;
  }
  let idx = next.length;
  if (insertBeforeDataset && next.includes(insertBeforeDataset)) {
    idx = next.indexOf(insertBeforeDataset);
  }
  next.splice(idx, 0, token);
  return next;
}

export function filterTopRowOrderAfterMove(topRowOrder, panel) {
  return (topRowOrder || []).filter((p) => p !== panel);
}
