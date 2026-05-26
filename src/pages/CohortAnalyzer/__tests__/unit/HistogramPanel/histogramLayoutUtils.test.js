import {
  measureDragCardElement,
  requiresCompactSpacing,
} from '../../../HistogramPanel/utils/histogramLayoutUtils';

describe('histogramLayoutUtils', () => {
  describe('measureDragCardElement', () => {
    it('returns null for missing element', () => {
      expect(measureDragCardElement(null)).toBeNull();
    });

    it('returns null when rect is too small', () => {
      const el = { getBoundingClientRect: () => ({ width: 4, height: 4 }) };
      expect(measureDragCardElement(el)).toBeNull();
    });

    it('returns rounded dimensions', () => {
      const el = { getBoundingClientRect: () => ({ width: 100.6, height: 200.4 }) };
      expect(measureDragCardElement(el)).toEqual({ width: 101, height: 200 });
    });
  });

  describe('requiresCompactSpacing', () => {
    it('returns true for race, treatmentType, response', () => {
      expect(requiresCompactSpacing('race')).toBe(true);
      expect(requiresCompactSpacing('treatmentType')).toBe(true);
      expect(requiresCompactSpacing('response')).toBe(true);
    });

    it('returns false for other datasets', () => {
      expect(requiresCompactSpacing('sexAtBirth')).toBe(false);
    });
  });
});
