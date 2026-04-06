import React from 'react';
import { KaplanMeierChart } from '@bento-core/kmplot';
import RiskTable from '@bento-core/risk-table';
import {
  SurvivalAnalysisModalContainer,
  SurvivalAnalysisModalContent,
  KmChartModalWrapper,
  RiskTableModalWrapper,
} from './HistogramPanel.styled';
import { HistogramChartEmptyState } from './HistogramChartEmptyState';

export function HistogramPopupModalSurvivalTab({
  survivalModalHasNoDisplayData,
  chartHeight,
  survivalAnalysisContainerRef,
  kmChartRef,
  riskTableRef,
  filteredKmPlotData,
  kmLoading,
  kmError,
  cohortColors,
  cohorts,
  timeIntervals,
}) {
  return (
    <SurvivalAnalysisModalContainer>
      <SurvivalAnalysisModalContent ref={survivalAnalysisContainerRef}>
        {survivalModalHasNoDisplayData ? (
          <div
            style={{
              width: '100%',
              flex: 1,
              minHeight: chartHeight + 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <HistogramChartEmptyState />
          </div>
        ) : (
          <>
            <KmChartModalWrapper ref={kmChartRef}>
              <KaplanMeierChart
                data={filteredKmPlotData}
                title=""
                width="100%"
                height={chartHeight}
                loading={kmLoading}
                error={kmError}
                colors={cohortColors}
                showLabels={false}
                showLegend={false}
              />
            </KmChartModalWrapper>
            <RiskTableModalWrapper ref={riskTableRef}>
              <RiskTable
                cohorts={cohorts}
                timeIntervals={timeIntervals}
              />
            </RiskTableModalWrapper>
          </>
        )}
      </SurvivalAnalysisModalContent>
    </SurvivalAnalysisModalContainer>
  );
}
