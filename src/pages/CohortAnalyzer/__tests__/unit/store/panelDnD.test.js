import {
  CA_PANEL_DRAG_MIME,
  encodePanelDragPayload,
  decodePanelDragPayload,
  parseDragDataTransfer,
  parseDragDataTransferForDrop,
} from '../../../store/panelDnD';

describe('panelDnD', () => {
  describe('encodePanelDragPayload / decodePanelDragPayload', () => {
    it('round-trips venn payload', () => {
      const raw = encodePanelDragPayload({ kind: 'venn' });
      expect(decodePanelDragPayload(raw)).toEqual({ kind: 'venn', dataset: null });
    });

    it('round-trips histogram payload', () => {
      const raw = encodePanelDragPayload({ kind: 'histogram', dataset: 'race' });
      expect(decodePanelDragPayload(raw)).toEqual({ kind: 'histogram', dataset: 'race' });
    });

    it('returns null for invalid json', () => {
      expect(decodePanelDragPayload('not-json')).toBeNull();
    });

    it('returns null for empty input', () => {
      expect(decodePanelDragPayload('')).toBeNull();
      expect(decodePanelDragPayload(null)).toBeNull();
    });

    it('returns null for unknown kind', () => {
      expect(decodePanelDragPayload(JSON.stringify({ kind: 'other' }))).toBeNull();
    });

    it('returns empty string when JSON.stringify fails', () => {
      const circular = {};
      circular.self = circular;
      expect(encodePanelDragPayload(circular)).toBe('');
    });
  });

  describe('parseDragDataTransfer', () => {
    it('reads mime payload', () => {
      const dt = {
        getData: (type) => (type === CA_PANEL_DRAG_MIME
          ? encodePanelDragPayload({ kind: 'survival' })
          : ''),
      };
      expect(parseDragDataTransfer(dt)).toEqual({ kind: 'survival', dataset: null });
    });

    it('reads plain venn/survival text', () => {
      const dt = { getData: () => 'venn' };
      expect(parseDragDataTransfer(dt)).toEqual({ kind: 'venn', dataset: null });
    });

    it('reads plain histogram dataset id', () => {
      const dt = { getData: () => 'sexAtBirth' };
      expect(parseDragDataTransfer(dt)).toEqual({ kind: 'histogram', dataset: 'sexAtBirth' });
    });

    it('returns null when no data', () => {
      expect(parseDragDataTransfer(null)).toBeNull();
      expect(parseDragDataTransfer({ getData: () => '' })).toBeNull();
    });
  });

  describe('parseDragDataTransferForDrop', () => {
    it('falls back to scanning types', () => {
      const payload = encodePanelDragPayload({ kind: 'histogram', dataset: 'race' });
      const dt = {
        getData: (type) => (type === 'application/json' ? payload : ''),
        types: ['application/json'],
      };
      expect(parseDragDataTransferForDrop(dt)).toEqual({ kind: 'histogram', dataset: 'race' });
    });

    it('skips types when getData throws', () => {
      const payload = encodePanelDragPayload({ kind: 'venn' });
      const dt = {
        types: ['broken', CA_PANEL_DRAG_MIME],
        getData: (type) => {
          if (type === 'broken') throw new Error('blocked');
          return type === CA_PANEL_DRAG_MIME ? payload : '';
        },
      };
      expect(parseDragDataTransferForDrop(dt)).toEqual({ kind: 'venn', dataset: null });
    });

    it('returns survival from trimmed type value', () => {
      const dt = {
        getData: () => '  survival  ',
        types: ['text/plain'],
      };
      expect(parseDragDataTransferForDrop(dt)).toEqual({ kind: 'survival', dataset: null });
    });
  });
});
