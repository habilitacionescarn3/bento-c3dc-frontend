import {
  hexToRgba,
  baseColorArray,
  nodes,
  VENN_CHART_LAYOUT_PADDING,
  VENN_CANVAS_SIZE_SCALE,
  VENN_COHORT_LABEL_GAP_PX,
} from '../../../vennDiagram/ChartVennConfig';

describe('ChartVennConfig color utilities', () => {
  describe('hexToRgba', () => {
    it('converts hex to rgba', () => {
      expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('defaults alpha to 1', () => {
      expect(hexToRgba('#00FF00')).toBe('rgba(0, 255, 0, 1)');
    });
  });

  describe('baseColorArray', () => {
    it('provides three cohort fill colors', () => {
      expect(baseColorArray).toHaveLength(3);
      baseColorArray.forEach((color) => {
        expect(color).toMatch(/^rgba\(/);
      });
    });
  });

  describe('nodes', () => {
    it('lists analyzer node keys', () => {
      expect(nodes).toEqual(['participant_pk', 'diagnosis', 'treatment_type']);
    });
  });

  describe('layout constants', () => {
    it('defines chart padding and scale', () => {
      expect(VENN_CHART_LAYOUT_PADDING.top).toBeDefined();
      expect(VENN_CANVAS_SIZE_SCALE).toBeGreaterThan(1);
      expect(VENN_COHORT_LABEL_GAP_PX).toBeGreaterThan(0);
    });
  });
});
