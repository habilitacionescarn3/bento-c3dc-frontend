import {
  defaultVennOuterHeightPx,
  defaultVennOuterPx,
  defaultHistogramPlotHeightPx,
  defaultHistogramStripDropSlotWidthPx,
  defaultHistogramCardOuterMinHeightPx,
  defaultVennModalSlotPx,
  defaultModalKmChartHeightPx,
  defaultModalHistogramDatasetChartHeightPx,
  vennChartSlotDimensionsFromOuterPx,
  chartVennFallbackCanvasDimensionsPx,
} from '../../../config/cohortAnalyzerViewPercentDefaults';

describe('cohortAnalyzerViewPercentDefaults', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true });
  });

  describe('defaultVennOuterHeightPx', () => {
    it('uses big screen height at wide viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1900, writable: true });
      expect(defaultVennOuterHeightPx()).toBe(580);
    });

    it('uses compact height at narrow viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
      expect(defaultVennOuterHeightPx()).toBe(400);
    });
  });

  describe('defaultVennOuterPx', () => {
    it('returns width and height within bounds', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1600, writable: true });
      const { width, height } = defaultVennOuterPx();
      expect(width).toBeGreaterThanOrEqual(400);
      expect(height).toBeGreaterThanOrEqual(280);
    });
  });

  describe('histogram defaults', () => {
    it('returns plot height within min/max', () => {
      Object.defineProperty(window, 'innerHeight', { value: 900, writable: true });
      const h = defaultHistogramPlotHeightPx();
      expect(h).toBeGreaterThanOrEqual(120);
      expect(h).toBeLessThanOrEqual(800);
    });

    it('returns drop slot width from viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1400, writable: true });
      expect(defaultHistogramStripDropSlotWidthPx()).toBeGreaterThan(0);
    });

    it('computes card outer min height from plot height', () => {
      expect(defaultHistogramCardOuterMinHeightPx(200)).toBeGreaterThan(200);
    });
  });

  describe('modal defaults', () => {
    it('returns venn modal slot dimensions', () => {
      const slot = defaultVennModalSlotPx();
      expect(slot.slotWidth).toBeGreaterThan(0);
      expect(slot.slotHeight).toBeGreaterThan(0);
    });

    it('returns km and histogram modal heights', () => {
      Object.defineProperty(window, 'innerHeight', { value: 900, writable: true });
      expect(defaultModalKmChartHeightPx()).toBeGreaterThanOrEqual(260);
      expect(defaultModalHistogramDatasetChartHeightPx()).toBeGreaterThanOrEqual(460);
    });
  });

  describe('vennChartSlotDimensionsFromOuterPx', () => {
    it('derives slot from outer dimensions', () => {
      const slot = vennChartSlotDimensionsFromOuterPx(500, 400);
      expect(slot.slotWidth).toBeGreaterThanOrEqual(200);
      expect(slot.slotHeight).toBeGreaterThanOrEqual(140);
    });
  });

  describe('chartVennFallbackCanvasDimensionsPx', () => {
    it('returns smaller canvas for two cohorts', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1600, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 900, writable: true });
      const two = chartVennFallbackCanvasDimensionsPx(2);
      const three = chartVennFallbackCanvasDimensionsPx(3);
      expect(two.width).toBeLessThan(three.width);
    });
  });
});
