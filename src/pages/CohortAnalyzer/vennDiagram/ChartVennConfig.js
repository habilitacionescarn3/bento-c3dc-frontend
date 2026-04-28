// Default threshold for font size adjustment in the chart. 
// The value 999 was chosen as a high threshold to ensure font size adjustments are only applied in extreme cases.
// This threshold was determined based on observed data visualization needs, such as overlapping numbers when numbers are above 999.
export const DEFAULT_FONT_SIZE_THRESHOLD = 999;

/**
 * Extra space around the Venn plot (Chart.js layout padding).
 * Cohort label overflow is handled in {@link vennCohortLabelFitPlugin} (y clamp), not by inflating padding.
 */
export const VENN_CHART_LAYOUT_PADDING = {
  left: 60,
  right: 60,
  top: 50,
  bottom: 50,
};

/**
 * Scale applied to canvas width/height so circles + external labels fit inside the slot.
 * Inline card: three cohorts vs two use different scales (two-circle layout needs its own tuning).
 * Expanded modal uses VENN_CANVAS_SIZE_SCALE_EXPANDED regardless of cohort count.
 * At {@link VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH}+, inline uses {@link VENN_CANVAS_SIZE_SCALE_BIG_SCREEN}.
 */
/** Inline card with three cohorts — fraction of slot used for the canvas (rest = labels / margin). */
export const VENN_CANVAS_SIZE_SCALE_NORMAL = 0.98;
/** Inline card when exactly two cohorts are selected (two-set Venn). */
export const VENN_CANVAS_SIZE_SCALE_NORMAL_TWO_COHORTS = 0.98;
/** Expanded modal — match slot similarly to inline. */
export const VENN_CANVAS_SIZE_SCALE_EXPANDED = 0.99;
/** Viewport width (px) at or above which inline Venn uses {@link VENN_CANVAS_SIZE_SCALE_BIG_SCREEN}. */
export const VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH = 1800;
/** Inline Venn on very wide viewports — use a bit more of the slot; labels have more room. */
export const VENN_CANVAS_SIZE_SCALE_BIG_SCREEN = 0.99;

/**
 * Prefer full names; visual line-wrapping is done by {@link vennCohortLabelFitPlugin}.
 */
export const VENN_COHORT_NAME_MAX_CHARS = 200;

/** Reserved; cohort labels use a fixed size from chart options (no dynamic shrink). */
export const VENN_COHORT_LABEL_FONT_MIN = 8;
export const VENN_COHORT_LABEL_FONT_MAX = 16;
export const VENN_COHORT_LABEL_MAX_LINES = 4;
/** Slightly more wrapped lines allowed when only two sets (two-circle layout). */
const VENN_COHORT_LABEL_MAX_LINES_TWO_SETS = 5;
/** 3-set Venn: wider allowed line width → less aggressive line breaks. */
const VENN_COHORT_LABEL_MAX_W_FRAC_THREE_SETS = 0.52;
/** 2-set Venn: narrower lines so wrapping is more aggressive. */
const VENN_COHORT_LABEL_MAX_W_FRAC_TWO_SETS = 0.30;
/** Extra horizontal px for 3-set (generous so names stay on fewer lines when possible). */
const VENN_COHORT_LABEL_MAX_W_PX_BONUS_THREE_SETS = 56;
/** Smaller bonus for 2-set so max line width stays tighter. */
const VENN_COHORT_LABEL_MAX_W_PX_BONUS_TWO_SETS = 10;
/** Floor for 3-set max line width (px). */
const VENN_COHORT_LABEL_MAX_W_MIN_PX_THREE_SETS = 96;
const VENN_COHORT_LABEL_MAX_W_MIN_PX_TWO_SETS = 52;

/**
 * Venn set label: full cohort name and count (used for selection state and display).
 * No ellipsis here — {@link vennCohortLabelFitPlugin} line-wraps on the canvas (fixed font size).
 */
export function buildVennCohortSetLabel(
  cohortName,
  participantCount,
  maxNameChars = VENN_COHORT_NAME_MAX_CHARS,
) {
  const name = String(cohortName || '').trim();
  const cap = Number.isFinite(maxNameChars) && maxNameChars < name.length
    ? maxNameChars
    : name.length;
  const shortName = name.length > cap ? `${name.slice(0, cap)}…` : name;
  return `${shortName} (${participantCount})`;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @param {number} maxLines
 * @returns {string[]}
 */
function wrapVennTextToWidth(ctx, text, maxWidth, maxLines) {
  const t = String(text);
  if (!t) {
    return [''];
  }
  const words = t.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  const takeLine = () => {
    if (line) {
      lines.push(line);
      line = '';
    }
  };
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      takeLine();
      if (lines.length >= maxLines) {
        return lines.slice(0, maxLines);
      }
      if (ctx.measureText(word).width <= maxWidth) {
        line = word;
        continue;
      }
      for (const ch of word) {
        const t2 = line + ch;
        if (ctx.measureText(t2).width > maxWidth && line) {
          lines.push(line);
          line = ch;
          if (lines.length >= maxLines) {
            return lines.slice(0, maxLines);
          }
        } else {
          line = t2;
        }
      }
    }
  }
  takeLine();
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }
  if (lines.length === 0) {
    return [t];
  }
  return lines;
}

/**
 * Renders cohort labels on Venn set circles: line-wraps only (fixed font from chart options).
 * Requires `scales.y.ticks.display: false` so the built-in one-line `fillText` is skipped.
 */
function vennCohortLabelFontString(weight, sizePx, family) {
  const w = weight != null ? String(weight) : '400';
  const f = (family && String(family)) || 'Nunito, sans-serif';
  return `${w} ${sizePx}px ${f}`;
}

export const vennCohortLabelFitPlugin = {
  id: 'vennCohortLabelFit',
  afterDatasetsDraw(chart) {
    const type = (chart && chart.config && chart.config.type) || '';
    if (String(type) !== 'venn' || !chart.data || !chart.data.labels || chart.data.labels.length === 0) {
      return;
    }
    const meta = chart.getDatasetMeta(0);
    const ctrl = meta && meta.controller;
    if (!ctrl || !ctrl._cachedMeta || !ctrl._cachedMeta._layout) {
      return;
    }
    const l = ctrl._cachedMeta._layout;
    if (!l.sets || l.sets.length === 0) {
      return;
    }
    const yOpts = chart.options && chart.options.scales && chart.options.scales.y;
    const yTicks = yOpts && yOpts.ticks;
    const baseFont = (yTicks && yTicks.font) || {};
    const fam = (typeof baseFont === 'object' && baseFont.family) || 'Nunito, sans-serif';
    const baseWeight = (typeof baseFont === 'object' && baseFont.weight) || 570;
    const yColor = (yTicks && yTicks.color) || (typeof baseFont === 'object' && baseFont.color) || 'black';
    const area = chart.chartArea;
    if (!area) {
      return;
    }
    const nSets = l.sets.length;
    const isTwoSet = nSets === 2;
    const frac = isTwoSet
      ? VENN_COHORT_LABEL_MAX_W_FRAC_TWO_SETS
      : VENN_COHORT_LABEL_MAX_W_FRAC_THREE_SETS;
    const bonus = isTwoSet
      ? VENN_COHORT_LABEL_MAX_W_PX_BONUS_TWO_SETS
      : VENN_COHORT_LABEL_MAX_W_PX_BONUS_THREE_SETS;
    const minLinePx = isTwoSet
      ? VENN_COHORT_LABEL_MAX_W_MIN_PX_TWO_SETS
      : VENN_COHORT_LABEL_MAX_W_MIN_PX_THREE_SETS;
    const maxW = Math.max(
      minLinePx,
      (area.width * frac) / Math.min(3, Math.max(1, nSets)) + bonus,
    );
    const labels = chart.data.labels;
    const { ctx } = chart;
    const maxLines = isTwoSet ? VENN_COHORT_LABEL_MAX_LINES_TWO_SETS : VENN_COHORT_LABEL_MAX_LINES;
    const fontSize = (typeof baseFont === 'object' && baseFont.size != null)
      ? baseFont.size
      : VENN_COHORT_LABEL_FONT_MAX;
    const fs = Math.max(1, Math.round(Number(fontSize)) || VENN_COHORT_LABEL_FONT_MAX);
    ctx.save();
    ctx.fillStyle = typeof yColor === 'string' ? yColor : '#000';
    ctx.font = vennCohortLabelFontString(baseWeight, fs, fam);
    for (let i = 0; i < l.sets.length; i += 1) {
      const set = l.sets[i];
      const text = String(labels[i] != null ? labels[i] : '');
      if (!text) {
        continue;
      }
      const bestLines = wrapVennTextToWidth(ctx, text, maxW, maxLines);
      const lineH = fs * 1.2;
      const blockH = bestLines.length * lineH;
      const { x: vx, y: vy } = set.text;
      const vAlign = set.verticalAlign;
      const hAlign = set.align;
      if (hAlign === 'end') {
        ctx.textAlign = 'right';
      } else if (hAlign === 'start') {
        ctx.textAlign = 'left';
      } else {
        ctx.textAlign = hAlign === 'middle' ? 'center' : 'center';
      }
      ctx.textBaseline = 'top';
      let y0;
      if (vAlign === 'top') {
        y0 = vy;
      } else if (vAlign === 'bottom') {
        y0 = vy - blockH;
      } else {
        y0 = vy - blockH / 2;
      }
      const chartH = chart.height;
      // Keep the full label block on-canvas: tall multiline text would otherwise have y0 < 0
      y0 = Math.max(0, y0);
      if (Number.isFinite(chartH) && blockH > 0) {
        y0 = Math.min(y0, Math.max(0, chartH - blockH - 1));
      }
      for (let li = 0; li < bestLines.length; li += 1) {
        ctx.fillText(bestLines[li], vx, y0 + li * lineH);
      }
    }
    ctx.restore();
  },
};

export const nodes = ["participant_pk","diagnosis","treatment_type"];


// Utility Functions
export const hexToRgba = (hex, alpha = 1) => {
  const rgb = hex.replace("#", "").match(/.{2}/g).map(x => parseInt(x, 16));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
};

// Constants for color opacity adjustments
const REDUCED_OPACITY = 0.85; // Opacity for the third color to make it visually distinct
const THIRD_COLOR_INDEX = 2; // Index of the third color in the array
/** Primary set fills — aligned with cohort analyzer Venn reference (SVG). */
export const baseColorArray = ['#FAF3CF', '#D2F1E0', '#C9E8FC'].map((color, index) =>
  hexToRgba(color, index === THIRD_COLOR_INDEX ? REDUCED_OPACITY : 1),
);