/**
 * Unified HTML5 drag payload for Cohort Analyzer panels (Venn, survival, histogram datasets).
 * MIME type keeps collisions with plain text unlikely.
 */
export const CA_PANEL_DRAG_MIME = 'application/x-c3dc-cohort-analyzer-panel';

/** @typedef {{ kind: 'venn'|'survival'|'histogram', dataset?: string|null }} PanelDragPayload */

/** @param {PanelDragPayload} payload */
export function encodePanelDragPayload(payload) {
  try {
    return JSON.stringify(payload);
  } catch (e) {
    return '';
  }
}

/** @param {string} raw */
export function decodePanelDragPayload(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    if (o.kind === 'venn' || o.kind === 'survival') return { kind: o.kind, dataset: null };
    if (o.kind === 'histogram' && typeof o.dataset === 'string') return { kind: 'histogram', dataset: o.dataset };
    return null;
  } catch (e) {
    return null;
  }
}

/** Legacy: plain dataset id from older histogram drags */
export function parseDragDataTransfer(dataTransfer) {
  if (!dataTransfer) return null;
  const json = dataTransfer.getData(CA_PANEL_DRAG_MIME);
  const fromMime = decodePanelDragPayload(json);
  if (fromMime) return fromMime;
  const plain = dataTransfer.getData('text/plain');
  const trimmed = plain && typeof plain === 'string' ? plain.trim() : '';
  if (trimmed && ['venn', 'survival'].includes(trimmed)) {
    return { kind: trimmed, dataset: null };
  }
  if (plain && plain.length > 0 && !plain.includes('{')) {
    return { kind: 'histogram', dataset: plain };
  }
  return null;
}

/**
 * Prefer on `drop`: some browsers only expose payload reliably after drop; try every listed type.
 */
export function parseDragDataTransferForDrop(dataTransfer) {
  if (!dataTransfer) return null;
  const direct = parseDragDataTransfer(dataTransfer);
  if (direct) return direct;
  const types = dataTransfer.types ? Array.from(dataTransfer.types) : [];
  for (let i = 0; i < types.length; i += 1) {
    const t = types[i];
    if (!t || t === 'Files') continue;
    let raw;
    try {
      raw = dataTransfer.getData(t);
    } catch (e) {
      continue;
    }
    if (!raw || typeof raw !== 'string') continue;
    const fromMime = decodePanelDragPayload(raw);
    if (fromMime) return fromMime;
    const tr = raw.trim();
    if (tr && ['venn', 'survival'].includes(tr)) {
      return { kind: tr, dataset: null };
    }
  }
  return null;
}
