/**
 * Build a full strip order with `promotedDataset` first, including every visible histogram id.
 * Used when linking a histogram beside the Venn/survival row (Redux `besideStripPanelId` + `stripOrder`).
 *
 * @param {string[]} stripOrder — current Redux strip order
 * @param {string[]} visibleHistogramDatasetIds — all histogram datasets currently in the layout (e.g. from selection)
 * @param {string} promotedDataset — chart to move to the front / link
 * @returns {string[]|null} new order, or null if invalid
 */
export function buildStripOrderPromotingBeside(
  stripOrder,
  visibleHistogramDatasetIds,
  promotedDataset,
) {
  if (!promotedDataset || promotedDataset === 'survivalAnalysis') return null;
  let visible = (visibleHistogramDatasetIds || []).filter((d) => d !== 'survivalAnalysis');
  if (!visible.includes(promotedDataset)) {
    visible = [...visible, promotedDataset];
  }

  const visSet = new Set(visible);
  const normalizedStrip = (stripOrder || []).filter((d) => visSet.has(d));
  const missing = visible.filter((d) => !normalizedStrip.includes(d));
  const base = [...normalizedStrip, ...missing];
  const rest = base.filter((d) => d !== promotedDataset);
  return [promotedDataset, ...rest];
}
