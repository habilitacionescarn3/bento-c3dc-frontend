import React from 'react';
import { createPortal } from 'react-dom';
import DownloadIcon from '../../../../assets/icons/Download_Histogram_icon.svg';
import ExpandIcon from '../../../../assets/icons/Expand_Histogram_icon.svg';
import histogramChartTitleHandle from '../../../../assets/icons/histogramChartTitleHandle.svg';
import histogramCloseIcon from '../../../../assets/icons/closeHistogramChart.svg';
import {
  ChartWrapper,
  HeaderSection,
  ChartTitle,
  ChartActionButtons,
  ChartResizeHandle,
} from '../HistogramPanel.styled';
import { HistogramDatasetChart, DEFAULT_CHART_TYPE } from '../chart/HistogramDatasetChart';
import {
  encodePanelDragPayload,
  CA_PANEL_DRAG_MIME,
} from '../../store/panelDnD';
import { requiresCompactSpacing, HISTOGRAM_DRAG_SOURCE_COLLAPSED_STYLE } from '../utils/histogramLayoutUtils';
import { HistogramChartEmptyState } from '../chart/HistogramChartEmptyState';

export function HistogramBesideVennHistogramPortal({
  survivalSelected,
  besideDatasetForColumn,
  survivalBesideVennTarget,
  chartRef,
  histogramCardSizes,
  allInputsEmpty,
  beginStripChartDrag,
  endStripChartDrag,
  setDragOverDataset,
  captureHistogramDragCardSize,
  clearHistogramDragSize,
  getChartTitle,
  data,
  filteredData,
  viewType,
  chartVisualByPanelId,
  besideHistogramBarSums,
  besideStripPlotHeight,
  /** Same outer size as survival strip / top-row survival card when shown beside Venn. */
  besidePeerShellBox = null,
  besideColumnPlotHeightPx,
  cellHover,
  handleMouseEnter,
  handleMouseLeave,
  classes,
  setExpandedChart,
  setActiveTab,
  downloadChart,
  handleRemoveHistogramDataset,
  handleHistogramCardResizeStart,
  c1Name,
  c2Name,
  c3Name,
  draggingDataset,
}) {
  if (survivalSelected || !besideDatasetForColumn || survivalBesideVennTarget == null) {
    return null;
  }

  const d = besideDatasetForColumn;
  const isDragSourceHere = draggingDataset === d;
  const plotHeightPx =
    besidePeerShellBox && besideColumnPlotHeightPx != null
      ? besideColumnPlotHeightPx
      : besideStripPlotHeight;

  return createPortal(
    <ChartWrapper
      id={`chart-beside-${d}`}
      ref={(el) => { chartRef.current[d] = el; }}
      style={{
        ...(isDragSourceHere
          ? HISTOGRAM_DRAG_SOURCE_COLLAPSED_STYLE
          : besidePeerShellBox && besidePeerShellBox.width != null && besidePeerShellBox.height != null
            ? {
              width: besidePeerShellBox.width,
              minWidth: besidePeerShellBox.width,
              height: besidePeerShellBox.height,
              minHeight: besidePeerShellBox.height,
              flexShrink: 0,
              alignSelf: 'flex-start',
              maxWidth: 'none',
              boxSizing: 'border-box',
            }
            : histogramCardSizes[d] && histogramCardSizes[d].width != null
              ? {
                width: histogramCardSizes[d].width,
                flexShrink: 0,
                alignSelf: 'flex-start',
                maxWidth: 'none',
              }
              : {}),
        cursor: allInputsEmpty ? 'default' : 'grab',
      }}
      draggable={!allInputsEmpty}
      onDragStart={(event) => {
        setDragOverDataset(null);
        captureHistogramDragCardSize(event, d);
        const payload = encodePanelDragPayload({ kind: 'histogram', dataset: d });
        event.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
        event.dataTransfer.setData('text/plain', d);
        event.dataTransfer.effectAllowed = 'move';
        const imgEl = event.currentTarget || chartRef.current[d];
        if (imgEl) {
          event.dataTransfer.setDragImage(imgEl, 32, 20);
        }
        beginStripChartDrag(d);
      }}
      onDragEnd={() => {
        endStripChartDrag();
      }}
    >
      <HeaderSection>
        <ChartTitle className={`${Array.isArray(data[d]) && data[d].length > 0 ? '' : 'empty'}`}>
          <span
            role="button"
            tabIndex={0}
            aria-label={`Drag ${getChartTitle(d) || 'chart'}`}
            style={{ display: 'inline-flex', alignItems: 'center', marginRight: 9, cursor: allInputsEmpty ? 'not-allowed' : 'grab', opacity: allInputsEmpty ? 0.45 : 1 }}
          >
            <img
              src={histogramChartTitleHandle}
              alt=""
              width={14}
              height={15}
              aria-hidden
              style={{ display: 'block', flexShrink: 0 }}
            />
          </span>
          {getChartTitle(d)}
        </ChartTitle>
        <ChartActionButtons>
          <span style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }} onClick={() => { if (!allInputsEmpty) { setExpandedChart(d); setActiveTab(d); } }}>
            <img src={ExpandIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', columnGap: 4 }}>
            <span style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }} onClick={() => !allInputsEmpty && downloadChart(d, false)}>
              <img src={DownloadIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
            </span>
            <button
              type="button"
              className={classes.headerCloseButton}
              aria-label={`Remove ${getChartTitle(d) || 'chart'} from layout`}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveHistogramDataset(d);
              }}
            >
              <img src={histogramCloseIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.45 : 1, display: 'block' }} />
            </button>
          </div>
        </ChartActionButtons>
      </HeaderSection>
      <div
        className={classes.chartContentWrapper}
        style={{ paddingBottom: requiresCompactSpacing(d) ? '12px' : '0px' }}
      >
        {Array.isArray(data[d]) && data[d].length > 0 ? (
          <div
            className={classes.chartPlotArea}
            style={{
              minHeight: plotHeightPx,
              height: plotHeightPx,
            }}
          >
            <HistogramDatasetChart
              rows={filteredData[d]}
              viewType={viewType[d]}
              chartType={chartVisualByPanelId[d] || DEFAULT_CHART_TYPE}
              valueA={besideHistogramBarSums.valueA}
              valueB={besideHistogramBarSums.valueB}
              valueC={besideHistogramBarSums.valueC}
              compact={requiresCompactSpacing(d)}
              height={plotHeightPx}
              width="100%"
              estimatedChartWidth={
                besidePeerShellBox && besidePeerShellBox.width != null
                  ? Math.max(280, besidePeerShellBox.width - 48)
                  : histogramCardSizes[d] && histogramCardSizes[d].width != null
                    ? Math.max(280, histogramCardSizes[d].width - 48)
                    : 400
              }
              cellHover={cellHover}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              xAxisHeight={50}
              c1Name={c1Name || 'Cohort A'}
              c2Name={c2Name || 'Cohort B'}
              c3Name={c3Name || 'Cohort C'}
            />
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              minHeight: plotHeightPx,
              height: plotHeightPx,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <HistogramChartEmptyState />
          </div>
        )}
      </div>
      <ChartResizeHandle
        aria-label="Resize chart beside Venn"
        title="Drag to resize chart"
        onMouseDown={(ev) => handleHistogramCardResizeStart(ev, d)}
        style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
      />
    </ChartWrapper>,
    survivalBesideVennTarget,
  );
}
