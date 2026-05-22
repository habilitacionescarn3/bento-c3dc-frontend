// Default threshold for font size adjustment in the chart. 
// The value 999 was chosen as a high threshold to ensure font size adjustments are only applied in extreme cases.
// This threshold was determined based on observed data visualization needs, such as overlapping numbers when numbers are above 999.
export const DEFAULT_FONT_SIZE_THRESHOLD = 999;

/**
 * Extra space around the Venn plot (Chart.js layout padding).
 *
 * Horizontal padding is intentionally tight: cohort labels wrap (see
 * {@link vennCohortLabelFitPlugin}) so they don't need wide side gutters, and
 * trimming left/right gives the venn circles more diameter inside the canvas.
 *
 * Vertical padding reserves a band above/below the circles for the wrapped
 * cohort labels plus {@link VENN_COHORT_LABEL_GAP_PX}. Labels that still
 * wouldn't fit at the configured font are shrunk by the plugin so the gap
 * from the venn is always preserved.
 */
export const VENN_CHART_LAYOUT_PADDING = {
  left: 32,
  right: 32,
  top: 50,
  bottom: 50,
};

/**
 * Scale applied to canvas width/height relative to the measured slot (~14% vs slot).
 * {@link vennCohortLabelFitPlugin} keeps labels outside the plot via radial shift.
 */
export const VENN_CANVAS_SIZE_SCALE = 1.14;
/** Inline card with three cohorts. */
export const VENN_CANVAS_SIZE_SCALE_NORMAL = VENN_CANVAS_SIZE_SCALE;
/** Inline card when exactly two cohorts are selected (two-set Venn). */
export const VENN_CANVAS_SIZE_SCALE_NORMAL_TWO_COHORTS = VENN_CANVAS_SIZE_SCALE;
/** Expanded modal. */
export const VENN_CANVAS_SIZE_SCALE_EXPANDED = VENN_CANVAS_SIZE_SCALE;
/** Viewport width (px) at or above which inline Venn uses {@link VENN_CANVAS_SIZE_SCALE_BIG_SCREEN}. */
export const VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH = 1800;
/** Inline Venn on very wide viewports. */
export const VENN_CANVAS_SIZE_SCALE_BIG_SCREEN = VENN_CANVAS_SIZE_SCALE;

/**
 * Minimum gap (px) between the venn circle edge and the closest corner of the
 * cohort label block. {@link vennCohortLabelFitPlugin} pushes each label
 * radially outward — along the vector from the circle center through the
 * library's natural anchor — by this amount. The library's hard-coded anchors
 * (sets$N in chartjs-chart-venn) sit only ~0.3 normalized-units past the circle
 * edge, which scales to just a few pixels at typical chart sizes; without this
 * radial shift, labels using `align: "end"` (so the closing `)` of `(count)`
 * lands at the anchor) visually touch the circle. The shift applies to the
 * whole wrapped block, so multi-line cohort names also keep this clearance.
 */
export const VENN_COHORT_LABEL_GAP_PX = 8;
/**
 * Safety margin (px) reserved between a label block and the canvas edge when
 * computing per-label wrap width. Prevents text from being flush against the
 * canvas boundary after the radial shift above.
 */
const VENN_COHORT_LABEL_CANVAS_MARGIN_PX = 4;

/**
 * Prefer full names; visual line-wrapping is done by {@link vennCohortLabelFitPlugin}.
 */
export const VENN_COHORT_NAME_MAX_CHARS = 200;

/**
 * Cohort-label font bounds. The plugin starts at MAX and shrinks (integer px)
 * down to MIN if needed so the wrapped block stays clear of the venn circles.
 */
export const VENN_COHORT_LABEL_FONT_MIN = 9;
export const VENN_COHORT_LABEL_FONT_MAX = 16;
export const VENN_COHORT_LABEL_MAX_LINES = 4;
/** Slightly more wrapped lines allowed when only two sets (two-circle layout). */
const VENN_COHORT_LABEL_MAX_LINES_TWO_SETS = 5;
/** 3-set Venn: wider allowed line width → less aggressive line breaks. */
const VENN_COHORT_LABEL_MAX_W_FRAC_THREE_SETS = 0.62;
/** 2-set Venn: narrower lines so wrapping is more aggressive. */
const VENN_COHORT_LABEL_MAX_W_FRAC_TWO_SETS = 0.40;
/** Extra horizontal px for 3-set (generous so names stay on fewer lines when possible). */
const VENN_COHORT_LABEL_MAX_W_PX_BONUS_THREE_SETS = 56;
/** Smaller bonus for 2-set so max line width stays tighter. */
const VENN_COHORT_LABEL_MAX_W_PX_BONUS_TWO_SETS = 14;
/** Floor for 3-set max line width (px). */
const VENN_COHORT_LABEL_MAX_W_MIN_PX_THREE_SETS = 110;
const VENN_COHORT_LABEL_MAX_W_MIN_PX_TWO_SETS = 64;

/**
 * Venn set label: full cohort name and count (used for selection state and display).
 * No ellipsis here — {@link vennCohortLabelFitPlugin} line-wraps on the canvas and
 * shrinks the font (within MIN/MAX) so long names still clear the venn circles.
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
  for (let wi = 0; wi < words.length; wi += 1) {
    const w = words[wi];
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      takeLine();
      if (lines.length >= maxLines) {
        return lines.slice(0, maxLines);
      }
      if (ctx.measureText(w).width <= maxWidth) {
        line = w;
        continue;
      }
      for (let i = 0; i < w.length; i += 1) {
        const ch = w.charAt(i);
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
 * Build the canvas `font` shorthand string used by {@link vennCohortLabelFitPlugin}.
 * Requires `scales.y.ticks.display: false` so the library's built-in one-line
 * `fillText` is skipped — the plugin draws wrapped, gap-aware labels instead.
 */
function vennCohortLabelFontString(weight, sizePx, family) {
  const w = weight != null ? String(weight) : '400';
  const f = (family && String(family)) || 'Nunito, sans-serif';
  return `${w} ${sizePx}px ${f}`;
}

/**
 * Compute per-label geometry used to position cohort names: shifts the natural
 * anchor radially outward by {@link VENN_COHORT_LABEL_GAP_PX} (along the vector
 * from circle center through the anchor), and derives the max line width and
 * max block height available at that shifted position. The library's natural
 * anchor is the closest corner of the label to the circle, so a radial shift
 * directly increases that minimum distance — for `align: "end"` labels this is
 * what moves the trailing `(count)` parens off the circle.
 *
 * @param {object} set     - layout entry with `cx`, `cy`, `r`, `text:{x,y}`, `align`, `verticalAlign`.
 * @param {number} chartW  - canvas width in px.
 * @param {number} chartH  - canvas height in px.
 * @param {number} fallbackMaxW - upper bound for line width (chart-area heuristic).
 */
function computeVennLabelLayout(set, chartW, chartH, fallbackMaxW) {
  const cx = Number.isFinite(set && set.cx) ? set.cx : 0;
  const cy = Number.isFinite(set && set.cy) ? set.cy : 0;
  const tx = set && set.text && Number.isFinite(set.text.x) ? set.text.x : 0;
  const ty = set && set.text && Number.isFinite(set.text.y) ? set.text.y : 0;
  const dx = tx - cx;
  const dy = ty - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  let ux = 0;
  let uy = -1;
  if (dist > 0.5) {
    ux = dx / dist;
    uy = dy / dist;
  }
  const sx = tx + VENN_COHORT_LABEL_GAP_PX * ux;
  const sy = ty + VENN_COHORT_LABEL_GAP_PX * uy;

  const rawVA = set && set.verticalAlign;
  // chartjs-chart-venn's 3-set layout omits `verticalAlign` on sets 0/1, falling
  // back to Canvas's default 'alphabetic' baseline (visually ≈ 'bottom').
  const vAlign = (rawVA === 'top' || rawVA === 'bottom' || rawVA === 'middle') ? rawVA : 'bottom';
  const hAlign = set && set.align;

  // Per-label max line width based on the shifted anchor's horizontal room
  // toward the canvas edge in the text-growth direction (opposite of hAlign).
  const margin = VENN_COHORT_LABEL_CANVAS_MARGIN_PX;
  let labelMaxW;
  if (hAlign === 'end') {
    labelMaxW = Math.max(40, sx - margin);
  } else if (hAlign === 'start') {
    labelMaxW = Math.max(40, chartW - sx - margin);
  } else {
    labelMaxW = Math.max(40, Math.min(sx, chartW - sx) * 2 - margin);
  }
  labelMaxW = Math.min(labelMaxW, fallbackMaxW);

  // Per-label max block height based on shifted anchor + vAlign growth direction.
  let labelMaxH;
  if (vAlign === 'bottom') {
    labelMaxH = Math.max(0, sy - margin);
  } else if (vAlign === 'top') {
    labelMaxH = Math.max(0, chartH - sy - margin);
  } else {
    labelMaxH = Math.max(0, Math.min(sy, chartH - sy) * 2 - margin);
  }

  return { sx, sy, vAlign, hAlign, labelMaxW, labelMaxH };
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
    const fallbackMaxW = Math.max(
      minLinePx,
      (area.width * frac) / Math.min(3, Math.max(1, nSets)) + bonus,
    );
    const labels = chart.data.labels;
    const { ctx } = chart;
    const maxLines = isTwoSet ? VENN_COHORT_LABEL_MAX_LINES_TWO_SETS : VENN_COHORT_LABEL_MAX_LINES;
    const requestedSize = (typeof baseFont === 'object' && baseFont.size != null)
      ? baseFont.size
      : VENN_COHORT_LABEL_FONT_MAX;
    const startFs = Math.max(
      VENN_COHORT_LABEL_FONT_MIN,
      Math.min(
        VENN_COHORT_LABEL_FONT_MAX,
        Math.round(Number(requestedSize)) || VENN_COHORT_LABEL_FONT_MAX,
      ),
    );
    const chartW = chart.width;
    const chartH = chart.height;

    const layouts = l.sets.map((set) => computeVennLabelLayout(set, chartW, chartH, fallbackMaxW));

    ctx.save();
    ctx.fillStyle = typeof yColor === 'string' ? yColor : '#000';

    /**
     * Pick the largest integer font size (within MIN..MAX) at which every cohort
     * label's wrapped block fits inside its per-label maxH (room from shifted
     * anchor to canvas edge in the vAlign direction). The gap from the venn is
     * already baked into the shifted anchor, so any font that "fits" here also
     * preserves the gap.
     */
    let chosenFs = VENN_COHORT_LABEL_FONT_MIN;
    let chosenLines = null;
    for (let fs = startFs; fs >= VENN_COHORT_LABEL_FONT_MIN; fs -= 1) {
      ctx.font = vennCohortLabelFontString(baseWeight, fs, fam);
      const wrappedAll = [];
      let allFit = true;
      for (let i = 0; i < l.sets.length; i += 1) {
        const text = String(labels[i] != null ? labels[i] : '');
        const lay = layouts[i];
        const wrapped = text ? wrapVennTextToWidth(ctx, text, lay.labelMaxW, maxLines) : [];
        wrappedAll.push(wrapped);
        const blockH = wrapped.length * fs * 1.2;
        if (blockH > lay.labelMaxH) {
          allFit = false;
        }
      }
      chosenFs = fs;
      chosenLines = wrappedAll;
      if (allFit) {
        break;
      }
    }

    ctx.font = vennCohortLabelFontString(baseWeight, chosenFs, fam);
    for (let i = 0; i < l.sets.length; i += 1) {
      const lines = (chosenLines && chosenLines[i]) || [];
      if (!lines.length) {
        continue;
      }
      const lay = layouts[i];
      const lineH = chosenFs * 1.2;
      const blockH = lines.length * lineH;

      if (lay.hAlign === 'end') {
        ctx.textAlign = 'right';
      } else if (lay.hAlign === 'start') {
        ctx.textAlign = 'left';
      } else {
        ctx.textAlign = 'center';
      }
      ctx.textBaseline = 'top';

      // Anchor (sx, sy) is already pushed outward by VENN_COHORT_LABEL_GAP_PX,
      // so positioning the block using normal vAlign semantics keeps the gap.
      let y0;
      if (lay.vAlign === 'top') {
        y0 = lay.sy;
      } else if (lay.vAlign === 'bottom') {
        y0 = lay.sy - blockH;
      } else {
        y0 = lay.sy - blockH / 2;
      }
      // Safety clamp: at MIN font size some labels may still be too tall — keep
      // them on-canvas. The font-shrinking loop above is what normally prevents
      // this from collapsing the gap onto the venn.
      y0 = Math.max(0, y0);
      if (Number.isFinite(chartH) && blockH > 0) {
        y0 = Math.min(y0, Math.max(0, chartH - blockH - 1));
      }
      for (let li = 0; li < lines.length; li += 1) {
        ctx.fillText(lines[li], lay.sx, y0 + li * lineH);
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