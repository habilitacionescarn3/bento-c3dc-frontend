import React from 'react';
import {
  RadioInput,
  RadioLabel,
  ModalChartContainer,
  ModalRadioFieldset,
  ModalRadioGroup,
  ModalNoDataContainer,
} from './HistogramPanel.styled';
import { HistogramDatasetChart, DEFAULT_CHART_TYPE } from './HistogramDatasetChart';
import { HistogramChartEmptyState } from './HistogramChartEmptyState';

const requiresCompactSpacingModal = (dataset) =>
  dataset === 'race' || dataset === 'treatmentType' || dataset === 'response';

export function HistogramPopupModalHistogramTab({
  activeTab,
  data,
  viewType,
  setViewType,
  chartVisualByPanelId,
  valueA,
  valueB,
  valueC,
  modalHistogramDatasetChartHeight,
  cellHover,
  handleMouseEnter,
  handleMouseLeave,
  c1Name,
  c2Name,
  c3Name,
}) {
  return (
    <ModalChartContainer>
      <ModalRadioFieldset>
        <ModalRadioGroup>
          <RadioLabel>
            <RadioInput
              type="radio"
              name={`modalViewType-${activeTab}`}
              value="count"
              checked={viewType[activeTab] === 'count'}
              onChange={(e) => setViewType((prev) => ({ ...prev, [activeTab]: e.target.value }))}
            />
            <legend>
              # of Cases
            </legend>
          </RadioLabel>
          <RadioLabel>
            <RadioInput
              type="radio"
              name={`modalViewType-${activeTab}`}
              value="percentage"
              checked={viewType[activeTab] === 'percentage'}
              onChange={(e) => setViewType((prev) => ({ ...prev, [activeTab]: e.target.value }))}
            />
            <legend>
              % of Cases
            </legend>
          </RadioLabel>
        </ModalRadioGroup>
      </ModalRadioFieldset>
      {Array.isArray(data[activeTab]) && data[activeTab].length > 0 ? (
        <div
          id={`expanded-chart-${activeTab}`}
          style={{
            width: '100%',
            height: modalHistogramDatasetChartHeight,
            minHeight: modalHistogramDatasetChartHeight,
          }}
        >
          <HistogramDatasetChart
            rows={data[activeTab]}
            viewType={viewType[activeTab]}
            chartType={chartVisualByPanelId[activeTab] || DEFAULT_CHART_TYPE}
            valueA={valueA}
            valueB={valueB}
            valueC={valueC}
            compact={requiresCompactSpacingModal(activeTab)}
            height={modalHistogramDatasetChartHeight}
            width="100%"
            estimatedChartWidth={800}
            cellHover={cellHover}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            xAxisHeight={80}
            c1Name={c1Name || 'Cohort A'}
            c2Name={c2Name || 'Cohort B'}
            c3Name={c3Name || 'Cohort C'}
          />
        </div>
      ) : (
        <ModalNoDataContainer>
          <HistogramChartEmptyState />
        </ModalNoDataContainer>
      )}
    </ModalChartContainer>
  );
}
