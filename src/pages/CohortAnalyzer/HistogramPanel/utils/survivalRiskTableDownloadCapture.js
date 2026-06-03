/** Applied to risk-table wrapper during html-to-image capture (strip + modal). */
export const SURVIVAL_RISK_TABLE_DOWNLOAD_ATTR = 'data-survival-risk-table-download';

export const SURVIVAL_RISK_TABLE_DOWNLOAD_TEXT_COLOR = '#000000';

/**
 * Forces cohort names and body cell values to render black in downloaded PNGs.
 * Scoped to tbody only so thead month labels keep #3A7587 (see @bento-core/risk-table).
 * @returns {() => void} call in finally to restore
 */
export function beginSurvivalRiskTableDownloadCapture(root) {
  if (!root) return () => {};

  root.setAttribute(SURVIVAL_RISK_TABLE_DOWNLOAD_ATTR, 'true');

  const tbody = root.querySelector('tbody');
  if (!tbody) {
    return () => {
      root.removeAttribute(SURVIVAL_RISK_TABLE_DOWNLOAD_ATTR);
    };
  }

  const styledNodes = [];
  const seen = new Set();
  tbody.querySelectorAll('td, td *').forEach((node) => {
    if (!(node instanceof HTMLElement) || seen.has(node)) return;
    seen.add(node);
    styledNodes.push({
      node,
      color: node.style.color,
      priority: node.style.getPropertyPriority('color'),
    });
    node.style.setProperty('color', SURVIVAL_RISK_TABLE_DOWNLOAD_TEXT_COLOR, 'important');
  });

  return () => {
    root.removeAttribute(SURVIVAL_RISK_TABLE_DOWNLOAD_ATTR);
    styledNodes.forEach(({ node, color, priority }) => {
      if (color) {
        node.style.setProperty('color', color, priority);
      } else {
        node.style.removeProperty('color');
      }
    });
  };
}
