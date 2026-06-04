import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';
import CustomXAxisTick from './CustomXAxisTick';
import CustomCategoryAxisTick from './CustomCategoryAxisTick';
import {
  BESIDE_HORIZONTAL_BAR_BAR_GAP,
  BESIDE_HORIZONTAL_BAR_CATEGORY_GAP,
  HISTOGRAM_CHART_STROKE_COLOR,
  HISTOGRAM_EXPANDED_AXIS_TICK_PROPS,
  HORIZONTAL_BAR_MAX_CATEGORY_LABEL_LINES,
} from '../histogramConstants';
import { barColors } from '../HistogramPanel.styled';

export const CHART_TYPE_KEYS = {
  PIE: 'pie',
  VERTICAL_BAR: 'verticalBar',
  HORIZONTAL_BAR: 'horizontalBar',
  LINE: 'line',
};

export const DEFAULT_CHART_TYPE = CHART_TYPE_KEYS.VERTICAL_BAR;

const chartAxisLine = { stroke: HISTOGRAM_CHART_STROKE_COLOR };
const chartTickLine = { stroke: HISTOGRAM_CHART_STROKE_COLOR };

const tooltipBox = {
  backgroundColor: 'white',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxShadow: 'none',
};

const formatCategoryLabel = (raw) => {
  const labelMap = { OtherFew: 'Other Few', OtherMany: 'Other Many' };
  return labelMap[raw] || raw;
};

const MultiseriesTooltip = ({ active, payload, label, viewType }) => {
  if (!active || !payload || !payload.length) return null;
  const isPercentage = viewType === 'percentage';
  return (
    <div style={tooltipBox}>
      <p style={{ margin: 0, fontFamily: 'Poppins', fontSize: '13px', color: '#000' }}>
        {formatCategoryLabel(label)}
      </p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} style={{ margin: 0, fontFamily: 'Poppins', fontSize: '13px', color: '#000' }}>
          {p.name}: {Number(p.value).toFixed(1)}{isPercentage ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

const PieChartTooltip = ({ active, payload, viewType }) => {
  if (!active || !payload || !payload.length) return null;
  const isPercentage = viewType === 'percentage';
  const p = payload[0];
  return (
    <div style={tooltipBox}>
      <p style={{ margin: 0, fontFamily: 'Poppins', fontSize: '13px', color: '#000' }}>{formatCategoryLabel(p.name)}</p>
      <p style={{ margin: 0, fontFamily: 'Poppins', fontSize: '13px', color: '#000' }}>
        {Number(p.value).toFixed(1)}{isPercentage ? '%' : ''}
      </p>
    </div>
  );
};

const DEFAULT_Y_AXIS_TICK_STYLE = {
  fontSize: 11,
  fill: '#666666',
  fontFamily: 'Nunito',
  fontWeight: 500,
  lineHeight: 11,
  letterSpacing: 0,
};

const buildYAxisTickStyle = (expandedView) => (
  expandedView
    ? { ...HISTOGRAM_EXPANDED_AXIS_TICK_PROPS }
    : DEFAULT_Y_AXIS_TICK_STYLE
);

const buildXTickProps = (expandedView, compact) => (
  expandedView
    ? { ...HISTOGRAM_EXPANDED_AXIS_TICK_PROPS }
    : {
      fontSize: compact ? 10 : 10,
      lineHeight: compact ? 10 : 11,
      letterSpacing: 0,
    }
);

function buildPieData(rows) {
  return rows
    .map((entry) => {
      const va = Number(entry.valueA) || 0;
      const vb = Number(entry.valueB) || 0;
      const vc = Number(entry.valueC) || 0;
      const total = va + vb + vc;
      const fill =
        va >= vb && va >= vc ? entry.colorA : vb >= vc ? entry.colorB : entry.colorC;
      return { name: entry.name, value: total, fill };
    })
    .filter((d) => d.value > 0);
}

/**
 * Recharts views for a single histogram dataset. Uses a fixed height so layout stays stable when switching chart types.
 */
export function HistogramDatasetChart({
  rows,
  viewType,
  chartType,
  valueA,
  valueB,
  valueC,
  compact,
  height,
  width = '100%',
  estimatedChartWidth = 400,
  cellHover,
  handleMouseEnter,
  handleMouseLeave,
  xAxisHeight = 50,
  c1Name = 'Cohort A',
  c2Name = 'Cohort B',
  c3Name = 'Cohort C',
  previewShell = false,
  expandedView = false,
  /** Wider gaps between horizontal-bar categories (beside-Venn column). */
  relaxedHorizontalBarSpacing = false,
}) {
  const yAxisTickStyle = buildYAxisTickStyle(expandedView);
  const xTickProps = buildXTickProps(expandedView, compact);
  const categoryAxisTickStyle = expandedView
    ? { ...HISTOGRAM_EXPANDED_AXIS_TICK_PROPS }
    : {
      fontSize: 10,
      fill: '#666666',
      fontFamily: 'Nunito',
      fontWeight: 500,
      lineHeight: 10,
      letterSpacing: 0,
    };
  const bottomMargin = compact ? 12 : 0;
  const yAxisTickFormatter = (value) => {
    const num = Number(value);
    const formatted = num % 1 === 0 ? num : num.toFixed(1);
    return viewType === 'percentage' ? `${formatted}%` : formatted;
  };

  const dataLength = (rows && rows.length) || 1;
  const availableWidth = (estimatedChartWidth / dataLength) * 0.9;

  const verticalBarMargin = {
    top: 20,
    right: 30,
    left: 10,
    bottom: bottomMargin,
  };

  const lineMargin = { ...verticalBarMargin };

  const categoryAxisWidth = relaxedHorizontalBarSpacing
    ? (compact ? 96 : 116)
    : expandedView
      ? 140
      : (compact ? 92 : 112);

  const horizontalBarCategoryGap = relaxedHorizontalBarSpacing
    ? BESIDE_HORIZONTAL_BAR_CATEGORY_GAP
    : dataLength >= 6
      ? '32%'
      : dataLength >= 4
        ? '26%'
        : '20%';

  const horizontalBarMargin = relaxedHorizontalBarSpacing
    ? {
      top: 16,
      right: 24,
      left: 8,
      bottom: 16,
    }
    : {
      top: 12,
      right: 24,
      left: expandedView ? 12 : 8,
      bottom: 12,
    };

  const pieMargin = { top: 8, right: 8, left: 8, bottom: 8 };

  if (previewShell) {
    const shellMargin = {
      top: 20,
      right: 30,
      left: 10,
      bottom: bottomMargin,
    };
    return (
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={[{ name: ' ' }]} margin={shellMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke={HISTOGRAM_CHART_STROKE_COLOR} horizontal vertical={false} />
          <XAxis
            dataKey="name"
            interval={0}
            tick={false}
            axisLine={chartAxisLine}
            tickLine={chartTickLine}
            height={xAxisHeight}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={yAxisTickFormatter}
            tick={yAxisTickStyle}
            axisLine={chartAxisLine}
            tickLine={chartTickLine}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === CHART_TYPE_KEYS.PIE) {
    const pieData = buildPieData(rows);
    if (pieData.length === 0) {
      return (
        <div
          style={{
            width: '100%',
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Poppins',
            fontSize: 13,
            color: '#666',
          }}
        >
          No data to display
        </div>
      );
    }
    return (
      <ResponsiveContainer width={width} height={height}>
        <PieChart margin={pieMargin}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={Math.min(height, estimatedChartWidth) * 0.36}
            stroke={HISTOGRAM_CHART_STROKE_COLOR}
            strokeWidth={0.5}
          >
            {pieData.map((entry, i) => (
              <Cell key={`pie-${entry.name}-${i}`} fill={i === 0 ? barColors.colorA : i === 1 ? barColors.colorB : barColors.colorC} />
            ))}
          </Pie>
          <Tooltip content={<PieChartTooltip viewType={viewType} />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === CHART_TYPE_KEYS.LINE) {
    return (
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={rows} margin={lineMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke={HISTOGRAM_CHART_STROKE_COLOR} horizontal vertical={false} />
          <XAxis
            dataKey="name"
            interval={0}
            angle={0}
            textAnchor="middle"
            height={xAxisHeight}
            axisLine={chartAxisLine}
            tickLine={chartTickLine}
            tick={(props) => (
              <CustomXAxisTick {...props} width={availableWidth} {...xTickProps} />
            )}
          />
          <YAxis
            domain={[0, 'dataMax']}
            tickFormatter={yAxisTickFormatter}
            tick={yAxisTickStyle}
            axisLine={chartAxisLine}
            tickLine={chartTickLine}
          />
          <Tooltip content={<MultiseriesTooltip viewType={viewType} />} />
          {valueA > 0 && (
            <Line
              type="monotone"
              dataKey="valueA"
              name={c1Name}
              stroke={barColors.colorA}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, stroke: HISTOGRAM_CHART_STROKE_COLOR, fill: barColors.colorA }}
              activeDot={{ r: 4 }}
            />
          )}
          {valueB > 0 && (
            <Line
              type="monotone"
              dataKey="valueB"
              name={c2Name}
              stroke={barColors.colorB}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, stroke: HISTOGRAM_CHART_STROKE_COLOR, fill: barColors.colorB }}
              activeDot={{ r: 4 }}
            />
          )}
          {valueC > 0 && (
            <Line
              type="monotone"
              dataKey="valueC"
              name={c3Name}
              stroke={barColors.colorC}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, stroke: HISTOGRAM_CHART_STROKE_COLOR, fill: barColors.colorC }}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === CHART_TYPE_KEYS.HORIZONTAL_BAR) {
    return (
      <ResponsiveContainer width={width} height={height}>
        <BarChart
          layout="vertical"
          data={rows}
          margin={horizontalBarMargin}
          barCategoryGap={horizontalBarCategoryGap}
          barGap={relaxedHorizontalBarSpacing ? BESIDE_HORIZONTAL_BAR_BAR_GAP : 4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={HISTOGRAM_CHART_STROKE_COLOR} horizontal vertical={false} />
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={yAxisTickFormatter}
            tick={yAxisTickStyle}
            axisLine={chartAxisLine}
            tickLine={chartTickLine}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={categoryAxisWidth}
            interval={0}
            minTickGap={0}
            axisLine={chartAxisLine}
            tickLine={chartTickLine}
            tick={(props) => (
              <CustomCategoryAxisTick
                {...props}
                width={categoryAxisWidth - 8}
                maxLines={HORIZONTAL_BAR_MAX_CATEGORY_LABEL_LINES}
                {...categoryAxisTickStyle}
              />
            )}
          />
          <Tooltip content={<MultiseriesTooltip viewType={viewType} />} />
          {valueA > 0 && (
            <Bar
              dataKey="valueA"
              name="Cohort A"
              maxBarSize={relaxedHorizontalBarSpacing ? 22 : 28}
              stroke={HISTOGRAM_CHART_STROKE_COLOR}
              strokeWidth={0.6}
            >
              {rows.map((entry, entryIndex) => (
                <Cell
                  key={`hbar-a-${entryIndex}`}
                  fill={entry.colorA}
                  onMouseEnter={() => handleMouseEnter('valueA')}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </Bar>
          )}
          {valueB > 0 && (
            <Bar
              dataKey="valueB"
              name="Cohort B"
              maxBarSize={relaxedHorizontalBarSpacing ? 22 : 28}
              stroke={HISTOGRAM_CHART_STROKE_COLOR}
              strokeWidth={0.6}
            >
              {rows.map((entry, entryIndex) => (
                <Cell
                  key={`hbar-b-${entryIndex}`}
                  fill={entry.colorB}
                  onMouseEnter={() => handleMouseEnter('valueB')}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </Bar>
          )}
          {valueC > 0 && (
            <Bar
              dataKey="valueC"
              name="Cohort C"
              maxBarSize={relaxedHorizontalBarSpacing ? 22 : 28}
              stroke={HISTOGRAM_CHART_STROKE_COLOR}
              strokeWidth={0.6}
            >
              {rows.map((entry, entryIndex) => (
                <Cell
                  key={`hbar-c-${entryIndex}`}
                  fill={entry.colorC}
                  onMouseEnter={() => handleMouseEnter('valueC')}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // verticalBar (default)
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={rows} margin={verticalBarMargin}>
        <CartesianGrid strokeDasharray="3 3" stroke={HISTOGRAM_CHART_STROKE_COLOR} horizontal vertical={false} />
        <XAxis
          dataKey="name"
          interval={0}
          angle={0}
          textAnchor="middle"
          height={xAxisHeight}
          axisLine={chartAxisLine}
          tickLine={chartTickLine}
          tick={(props) => (
            <CustomXAxisTick {...props} width={availableWidth} {...xTickProps} />
          )}
        />
        <YAxis
          domain={[0, 'dataMax']}
          tickFormatter={yAxisTickFormatter}
          tick={yAxisTickStyle}
          axisLine={chartAxisLine}
          tickLine={chartTickLine}
        />
        <Tooltip content={<CustomChartTooltip viewType={viewType} cellHoverRef={cellHover} />} />
        {valueA > 0 && (
          <Bar dataKey="valueA" maxBarSize={60} stroke={HISTOGRAM_CHART_STROKE_COLOR} strokeWidth={0.6}>
            {rows.map((entry, entryIndex) => (
              <Cell
                key={`vbar-a-${entryIndex}`}
                fill={entry.colorA}
                onMouseEnter={() => handleMouseEnter('valueA')}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </Bar>
        )}
        {valueB > 0 && (
          <Bar dataKey="valueB" maxBarSize={60} stroke={HISTOGRAM_CHART_STROKE_COLOR} strokeWidth={0.6}>
            {rows.map((entry, entryIndex) => (
              <Cell
                key={`vbar-b-${entryIndex}`}
                fill={entry.colorB}
                onMouseEnter={() => handleMouseEnter('valueB')}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </Bar>
        )}
        {valueC > 0 && (
          <Bar dataKey="valueC" maxBarSize={60} stroke={HISTOGRAM_CHART_STROKE_COLOR} strokeWidth={0.6}>
            {rows.map((entry, entryIndex) => (
              <Cell
                key={`vbar-c-${entryIndex}`}
                fill={entry.colorC}
                onMouseEnter={() => handleMouseEnter('valueC')}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
