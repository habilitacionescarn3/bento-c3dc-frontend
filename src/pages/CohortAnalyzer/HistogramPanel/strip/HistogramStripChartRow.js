import React from 'react';
import { useDispatch } from 'react-redux';
import DownloadIcon from '../../../../assets/icons/Download_Histogram_icon.svg';
import ExpandIcon from '../../../../assets/icons/Expand_Histogram_icon.svg';
import ToolTip from '@bento-core/tool-tip/dist/ToolTip';
import questionIcon from '../../../../assets/icons/Question_icon_2.svg';
import histogramChartTitleHandle from '../../../../assets/icons/histogramChartTitleHandle.svg';
import histogramCloseIcon from '../../../../assets/icons/closeHistogramChart.svg';
import {
  ChartWrapper,
  HeaderSection,
  ChartTitle,
  ChartActionButtons,
  ChartTypeDropdownRoot,
  ChartTypeDropdownPanel,
  ChartTypeOption,
  ChartTypeTriggerButton,
  ChartResizeHandle,
  RadioGroup,
  RadioInput,
  RadioLabel,
} from '../HistogramPanel.styled';
import { HistogramDatasetChart, DEFAULT_CHART_TYPE } from '../chart/HistogramDatasetChart';
import { ChartTypeIcon, CHART_TYPE_OPTIONS } from '../chart/HistogramChartTypeIcons';
import { patchChartVisuals } from '../../store/cohortAnalyzerLayoutActions';
import {
  encodePanelDragPayload,
  CA_PANEL_DRAG_MIME,
} from '../../store/panelDnD';
import { requiresCompactSpacing, HISTOGRAM_DRAG_SOURCE_COLLAPSED_STYLE } from '../utils/histogramLayoutUtils';
import { HistogramChartEmptyState } from '../chart/HistogramChartEmptyState';
import { HISTOGRAM_STRIP_DROP_SLOT_WIDTH_EXTRA_PX } from '../histogramConstants';

export function HistogramStripChartRow({
  dataset,
  classes,
  data,
  filteredData,
  viewType,
  setViewType,
  chartVisualByPanelId,
  histogramCardSizes,
  defaultPlotHeightPx,
  defaultDropSlotWidthPx,
  defaultHistogramCardOuterMinHeightPx,
  estimateHistogramCardDropSize,
  draggingDataset,
  beginStripChartDrag,
  endStripChartDrag,
  dragOverDataset,
  setDragOverDataset,
  draggingCardDimensions,
  histogramDragSizeRef,
  captureHistogramDragCardSize,
  clearHistogramDragSize,
  handleStripChartDragOver,
  handleStripChartDrop,
  handleHistogramCardResizeStart,
  chartRef,
  allInputsEmpty,
  getChartTitle,
  chartTypeMenuDataset,
  setChartTypeMenuDataset,
  chartTypeMenuRef,
  cellHover,
  handleMouseEnter,
  handleMouseLeave,
  downloadChart,
  setExpandedChart,
  setActiveTab,
  handleRemoveHistogramDataset,
  c1Name,
  c2Name,
  c3Name,
  besidePanelDraggingRef,
}) {
  const dispatch = useDispatch();

  let valueA = 0;
  let valueB = 0;
  let valueC = 0;
  if (Array.isArray(filteredData[dataset])) {
    filteredData[dataset].forEach((entry) => {
      valueA += entry.valueA || 0;
      valueB += entry.valueB || 0;
      valueC += entry.valueC || 0;
    });
  }
  const cardSize = histogramCardSizes[dataset];
  const plotH = cardSize && cardSize.plotHeight != null ? cardSize.plotHeight : defaultPlotHeightPx;
  const chartWrapperStyle = cardSize && cardSize.width != null
    ? {
      width: cardSize.width,
      flexShrink: 0,
      alignSelf: 'flex-start',
      maxWidth: 'none',
    }
    : undefined;
  const estimatedChartW = cardSize && cardSize.width != null
    ? Math.max(280, cardSize.width - 48)
    : 400;
  const topRowSnap = besidePanelDraggingRef && besidePanelDraggingRef.current;
  const topRowStripDrag =
    topRowSnap &&
    (topRowSnap.kind === 'venn' || topRowSnap.kind === 'survival');
  const isDragging = Boolean(draggingDataset) || Boolean(topRowStripDrag);
  const isDraggedCard = draggingDataset === dataset;
  const isHistogramDropTarget =
    Boolean(draggingDataset) &&
    draggingDataset !== dataset &&
    dragOverDataset === dataset;
  const isTopRowDropTarget =
    Boolean(topRowStripDrag) && dragOverDataset === dataset;
  const isDropTarget = isHistogramDropTarget || isTopRowDropTarget;
  const showDropSlotBefore = isDropTarget;
  const dropSlotSize = (() => {
    if (topRowStripDrag && topRowSnap && topRowSnap.width && topRowSnap.height) {
      return {
        width: topRowSnap.width + HISTOGRAM_STRIP_DROP_SLOT_WIDTH_EXTRA_PX,
        height: topRowSnap.height,
      };
    }
    if (draggingDataset) {
      const base = estimateHistogramCardDropSize(draggingDataset);
      return {
        width: base.width + HISTOGRAM_STRIP_DROP_SLOT_WIDTH_EXTRA_PX,
        height: base.height,
      };
    }
    const fromDrag = draggingCardDimensions || histogramDragSizeRef.current;
    if (fromDrag) {
      return { width: fromDrag.width, height: fromDrag.height };
    }
    return {
      width: defaultDropSlotWidthPx,
      height: defaultHistogramCardOuterMinHeightPx(defaultPlotHeightPx),
    };
  })();
  const cardDragOpacity =
    isDragging && !isDraggedCard ? (isDropTarget ? 0.9 : 0.62) : 1;
  const peerShadowStyle =
    isDragging && !isDraggedCard
      ? {
        boxShadow: '0 14px 28px rgba(29, 61, 73, 0.28)',
        filter: 'brightness(0.96)',
        transition: 'opacity 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
      }
      : {};
  const dropTargetStyle =
    isDragging && isDropTarget
      ? {
        outline: '2px solid #679AAA',
        outlineOffset: 2,
        zIndex: 1,
      }
      : {};

  return (
    <React.Fragment>
      {showDropSlotBefore && (
        <div
          aria-hidden
          onDragOver={(e) => handleStripChartDragOver(e, dataset)}
          onDrop={(e) => handleStripChartDrop(e, dataset)}
          style={{
            flexShrink: 0,
            alignSelf: 'flex-start',
            width: dropSlotSize.width,
            height: dropSlotSize.height,
            minWidth: 0,
            minHeight: 0,
            maxWidth: '100%',
            boxSizing: 'border-box',
            margin: 0,
            border: 'none',
            borderRadius: 10,
            background: 'rgba(103, 154, 170, 0.12)',
            outline: '2px dashed #679AAA',
            outlineOffset: 0,
          }}
        />
      )}
      <ChartWrapper
        id={`chart-${dataset}`}
        ref={(el) => { chartRef.current[dataset] = el; }}
        style={{
          ...(isDraggedCard
            ? HISTOGRAM_DRAG_SOURCE_COLLAPSED_STYLE
            : {
              ...(chartWrapperStyle || {}),
              ...peerShadowStyle,
              ...dropTargetStyle,
              opacity: cardDragOpacity,
            }),
          cursor: allInputsEmpty ? 'default' : 'grab',
        }}
        draggable={!allInputsEmpty}
        onDragStart={(event) => {
          setDragOverDataset(null);
          captureHistogramDragCardSize(event, dataset);
          const payload = encodePanelDragPayload({ kind: 'histogram', dataset });
          event.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
          event.dataTransfer.setData('text/plain', dataset);
          event.dataTransfer.effectAllowed = 'move';
          const imgEl = event.currentTarget || chartRef.current[dataset];
          if (imgEl) {
            event.dataTransfer.setDragImage(imgEl, 32, 20);
          }
          beginStripChartDrag(dataset);
        }}
        onDragEnd={() => {
          endStripChartDrag();
        }}
        onDragOver={(e) => handleStripChartDragOver(e, dataset)}
        onDrop={(e) => handleStripChartDrop(e, dataset)}
      >
        <HeaderSection>
          <ChartTitle className={`${Array.isArray(data[dataset]) && data[dataset].length > 0 ? '' : 'empty'}`}>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Drag to reorder ${getChartTitle(dataset) || 'chart'} card`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: 6,
                cursor: allInputsEmpty ? 'not-allowed' : 'grab',
                opacity: allInputsEmpty ? 0.45 : 1,
              }}
              title="Drag to reorder cards"
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
            {getChartTitle(dataset)}
            {Array.isArray(filteredData[dataset]) && filteredData[dataset].length > 5 && (
              <ToolTip
                maxWidth="335px"
                border="1px solid #598ac5"
                arrowBorder="1px solid #598AC5"
                title={(
                  <div>
                    You can expand to see the full item
                  </div>
                )}
                placement="top-end"
                arrow
                interactive
                arrowSize="30px"
              >
                <img alt="Question Icon" src={questionIcon} width={10} style={{ border: '0px', top: -3, left: 3, position: 'relative' }} />
              </ToolTip>
            )}
          </ChartTitle>

          <ChartActionButtons>
            <ChartTypeDropdownRoot
              ref={chartTypeMenuDataset === dataset ? chartTypeMenuRef : undefined}
            >
              <ChartTypeTriggerButton
                type="button"
                disabled={allInputsEmpty}
                aria-haspopup="listbox"
                aria-expanded={chartTypeMenuDataset === dataset}
                aria-label="Chart type"
                onClick={() => {
                  if (allInputsEmpty) return;
                  setChartTypeMenuDataset((prev) => (prev === dataset ? null : dataset));
                }}
              >
                <ChartTypeIcon
                  type={chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE}
                  size={22}
                />
              </ChartTypeTriggerButton>
              {chartTypeMenuDataset === dataset && !allInputsEmpty && (
                <ChartTypeDropdownPanel role="listbox" aria-label="Choose chart type">
                  {CHART_TYPE_OPTIONS.map(({ type, label }) => (
                    <ChartTypeOption
                      key={type}
                      type="button"
                      $active={(chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE) === type}
                      aria-label={label}
                      aria-selected={(chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE) === type}
                      onClick={() => {
                        dispatch(patchChartVisuals({ [dataset]: type }));
                        setChartTypeMenuDataset(null);
                      }}
                    >
                      <ChartTypeIcon type={type} size={20} />
                    </ChartTypeOption>
                  ))}
                </ChartTypeDropdownPanel>
              )}
            </ChartTypeDropdownRoot>
            <span
              style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }}
              onClick={() => {
                if (!allInputsEmpty) {
                  setExpandedChart(dataset);
                  setActiveTab(dataset);
                }
              }}
            >
              <img src={ExpandIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', columnGap: 4 }}>
              <span
                style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }}
                onClick={() => !allInputsEmpty && downloadChart(dataset, false)}
              >
                <img src={DownloadIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.5 : 1, display: 'block' }} />
              </span>
              <button
                type="button"
                className={classes.headerCloseButton}
                aria-label={`Remove ${getChartTitle(dataset) || 'chart'} from layout`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveHistogramDataset(dataset);
                }}
              >
                <img src={histogramCloseIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.45 : 1, display: 'block' }} />
              </button>
            </div>

          </ChartActionButtons>

        </HeaderSection>
        <div
          className={classes.chartContentWrapper}
          style={{
            paddingBottom: requiresCompactSpacing(dataset) ? '12px' : '0px',
          }}
        >

          {Array.isArray(data[dataset]) && data[dataset].length > 0 ? (
            <>
              <fieldset style={{ border: 'none', width: '100%', margin: 0, padding: 0 }}>
                <legend style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
                  Data Type Options
                </legend>
                <RadioGroup>
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name={`viewType-${dataset}`}
                      value="count"
                      checked={viewType[dataset] === 'count'}
                      onChange={(e) => setViewType({ ...viewType, [dataset]: e.target.value })}
                    />
                    # of Cases
                  </RadioLabel>
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name={`viewType-${dataset}`}
                      value="percentage"
                      checked={viewType[dataset] === 'percentage'}
                      onChange={(e) => setViewType({ ...viewType, [dataset]: e.target.value })}
                    />
                    % of Cases
                  </RadioLabel>
                </RadioGroup>
              </fieldset>
              <div
                className={classes.chartPlotArea}
                style={{ minHeight: plotH, height: plotH }}
              >
                <HistogramDatasetChart
                  rows={filteredData[dataset]}
                  viewType={viewType[dataset]}
                  chartType={chartVisualByPanelId[dataset] || DEFAULT_CHART_TYPE}
                  valueA={valueA}
                  valueB={valueB}
                  valueC={valueC}
                  compact={requiresCompactSpacing(dataset)}
                  height={plotH}
                  width="100%"
                  estimatedChartWidth={estimatedChartW}
                  cellHover={cellHover}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  xAxisHeight={50}
                  c1Name={c1Name || 'Cohort A'}
                  c2Name={c2Name || 'Cohort B'}
                  c3Name={c3Name || 'Cohort C'}
                />
              </div>
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: plotH,
                minHeight: plotH,
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
          aria-label={`Resize ${getChartTitle(dataset) || 'chart'} card`}
          title="Drag to resize chart"
          onMouseDown={(ev) => handleHistogramCardResizeStart(ev, dataset)}
          style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
        />
      </ChartWrapper>
    </React.Fragment>
  );
}
