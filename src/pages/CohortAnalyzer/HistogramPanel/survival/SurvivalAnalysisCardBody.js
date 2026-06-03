import React from 'react';
import ToolTip from '@bento-core/tool-tip/dist/ToolTip';
import { KaplanMeierChart } from '@bento-core/kmplot';
import RiskTable from '@bento-core/risk-table';
import ExpandIcon from '../../../../assets/icons/Expand_Histogram_icon.svg';
import DownloadIcon from '../../../../assets/icons/Download_Histogram_icon.svg';
import DownloadIconBorderless from '../../../../assets/icons/download-icon-borderless.svg';
import questionIcon from '../../../../assets/icons/Question_icon_2.svg';
import histogramChartTitleHandle from '../../../../assets/icons/histogramChartTitleHandle.svg';
import histogramCloseIcon from '../../../../assets/icons/closeHistogramChart.svg';
import {
  SurvivalAnalysisHeader,
  SurvivalAnalysisContainer,
  KmChartWrapper,
  KmChartWrapperBesideVenn,
  RiskTableWrapper,
  RiskTableWrapperBesideVenn,
  ChartTitle,
  ChartActionButtons,
  DownloadDropdown,
  DownloadDropdownMenu,
  DownloadDropdownItem,
} from '../HistogramPanel.styled';
import {
  CA_SURVIVAL_CARD_MIN_HEIGHT as SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT as SURVIVAL_CARD_MAX_HEIGHT,
} from '../../store/cohortAnalyzerLayoutConstants';
import {
  downloadKaplanMeierChart,
  downloadRiskTable,
  downloadSurvivalCombined,
} from '../utils/histogramSurvivalDownloads';
import { HistogramChartEmptyState } from '../chart/HistogramChartEmptyState';
import {
  buildPlaceholderSurvivalRiskCohorts,
  CHART_PREVIEW_KM_COLORS,
  CHART_PREVIEW_RISK_TIME_INTERVALS,
} from '../../utils/cohortAnalyzerChartPreview';

/**
 * Survival analysis card: header actions, KM plot, and risk table (inline or beside Venn).
 */
export function SurvivalAnalysisCardBody({
  besideVenn,
  classes,
  chartPreviewMode = false,
  c1Name = '',
  c2Name = '',
  c3Name = '',
  allInputsEmpty,
  besideCardDrag,
  survivalCardSize,
  kmChartRef,
  survivalAnalysisContainerRef,
  riskTableRef,
  filteredKmPlotData,
  kmLoading,
  kmError,
  cohortColors,
  cohorts,
  timeIntervals,
  showDownloadDropdown,
  setShowDownloadDropdown,
  dropdownRef,
  setExpandedChart,
  setActiveTab,
  handleRemoveHistogramDataset,
}) {
  const KmWrap = besideVenn ? KmChartWrapperBesideVenn : KmChartWrapper;
  const RiskWrap = besideVenn ? RiskTableWrapperBesideVenn : RiskTableWrapper;
  const survivalHeaderChromePx = 140;
  const kmPlotMaxPx = 480;
  const effectiveSurvivalH =
    survivalCardSize && survivalCardSize.height != null
      ? Math.min(
        SURVIVAL_CARD_MAX_HEIGHT,
        Math.max(SURVIVAL_CARD_MIN_HEIGHT, survivalCardSize.height),
      )
      : SURVIVAL_CARD_MIN_HEIGHT;
  const kmHeight = Math.max(
    160,
    Math.min(
      kmPlotMaxPx,
      Math.round((effectiveSurvivalH - survivalHeaderChromePx) * 0.65),
    ),
  );
  const survivalHasNoDisplayData =
    !chartPreviewMode
    && !kmLoading
    && !kmError
    && (!Array.isArray(filteredKmPlotData) || filteredKmPlotData.length === 0);

  const previewRiskCohorts = chartPreviewMode
    ? buildPlaceholderSurvivalRiskCohorts().map((row, index) => {
      const names = [c1Name || 'Cohort A', c2Name || 'Cohort B', c3Name || 'Cohort C'];
      return { ...row, name: names[index] || row.name };
    })
    : null;
  const survivalBodyMinHeight = Math.max(
    kmHeight + 120,
    Math.round(effectiveSurvivalH - survivalHeaderChromePx),
  );
  const canBesideReorder = Boolean(
    besideVenn && besideCardDrag && besideCardDrag.draggable,
  );

  return (
    <>
      <SurvivalAnalysisHeader>
        <ChartTitle className={!chartPreviewMode && survivalHasNoDisplayData ? 'empty' : ''}>
          <span
            role="button"
            tabIndex={0}
            aria-label={
              canBesideReorder
                ? 'Drag to swap with Venn diagram or drop on a histogram card below to show it beside this row'
                : 'Chart reorder handle'
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginRight: 6,
              cursor: (!chartPreviewMode && survivalHasNoDisplayData) ? 'not-allowed' : canBesideReorder ? 'grab' : 'default',
              opacity: (!chartPreviewMode && survivalHasNoDisplayData) ? 0.45 : 1,
            }}
            title={
              canBesideReorder
                ? 'Drag to swap with Venn or drop on a histogram card to link it beside this row'
                : undefined
            }
          >
            <img
              src={histogramChartTitleHandle}
              alt=""
              width={11}
              height={12}
              aria-hidden
              style={{ display: 'block', flexShrink: 0 }}
            />
          </span>
          {'Overall Survival by Diagnosis'}
          <span style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
            <ToolTip
              maxWidth="235px"
              border="1px solid #598ac5"
              arrowBorder="1px solid #598AC5"
              title={(
                <div>
                  Participants with unreported age values or whose last diagnosis age is later than their last survival follow-up were excluded to ensure valid survival timelines.
                  <br />
                  <br />
                  Displays survival data based on the earliest diagnosis when multiple diagnoses exist.
                </div>
              )}
              placement="top-end"
              arrow
              interactive
              arrowSize="30px"
            >
              <img
                alt=""
                src={questionIcon}
                width={10}
                style={{ border: '0px', display: 'block', flexShrink: 0 }}
              />
            </ToolTip>
          </span>
        </ChartTitle>

        <ChartActionButtons>
          <button
            type="button"
            aria-label="Expand survival chart"
            disabled={allInputsEmpty || survivalHasNoDisplayData}
            onClick={() => {
              if (!allInputsEmpty && !survivalHasNoDisplayData) {
                setExpandedChart('survivalAnalysis');
                setActiveTab('survivalAnalysis');
              }
            }}
            style={{ padding: 0, background: 'none', border: 'none', cursor: (allInputsEmpty || survivalHasNoDisplayData) ? 'not-allowed' : 'pointer' }}
          >
            <img src={ExpandIcon} alt="" width={19} height={19} style={{ opacity: (allInputsEmpty || survivalHasNoDisplayData) ? 0.5 : 1, display: 'block' }} />
          </button>
          <DownloadDropdown ref={dropdownRef}>
            <button
              type="button"
              aria-label="Survival chart download options"
              aria-expanded={showDownloadDropdown}
              aria-haspopup="menu"
              disabled={allInputsEmpty || survivalHasNoDisplayData}
              onClick={() => !allInputsEmpty && !survivalHasNoDisplayData && setShowDownloadDropdown(!showDownloadDropdown)}
              style={{ padding: 0, background: 'none', border: 'none', cursor: (allInputsEmpty || survivalHasNoDisplayData) ? 'not-allowed' : 'pointer' }}
            >
              <img src={DownloadIcon} alt="" width={19} height={19} style={{ opacity: (allInputsEmpty || survivalHasNoDisplayData) ? 0.5 : 1, display: 'block' }} />
            </button>
            {showDownloadDropdown && !allInputsEmpty && !survivalHasNoDisplayData && (
              <DownloadDropdownMenu role="menu">
                <DownloadDropdownItem
                  role="menuitem"
                  onClick={() => {
                    setShowDownloadDropdown(false);
                    downloadKaplanMeierChart(kmChartRef);
                  }}
                >
                  <img src={DownloadIconBorderless} alt="" style={{ width: '10px', height: '12px' }} />
                  Kaplan Meier Plot
                </DownloadDropdownItem>
                <DownloadDropdownItem
                  role="menuitem"
                  onClick={() => {
                    setShowDownloadDropdown(false);
                    downloadRiskTable(riskTableRef);
                  }}
                >
                  <img src={DownloadIconBorderless} alt="" style={{ width: '10px', height: '12px' }} />
                  Risk Table
                </DownloadDropdownItem>
                <DownloadDropdownItem
                  role="menuitem"
                  onClick={() => downloadSurvivalCombined(
                    survivalAnalysisContainerRef,
                    () => setShowDownloadDropdown(false),
                    riskTableRef,
                  )}
                >
                  <img src={DownloadIconBorderless} alt="" style={{ width: '10px', height: '12px' }} />
                  Download Both
                </DownloadDropdownItem>
              </DownloadDropdownMenu>
            )}
          </DownloadDropdown>
          <button
            type="button"
            className={classes.headerCloseButton}
            aria-label="Remove survival chart from layout"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveHistogramDataset('survivalAnalysis');
            }}
          >
            <img src={histogramCloseIcon} alt="" width={19} height={19} style={{ opacity: allInputsEmpty ? 0.45 : 1, display: 'block' }} />
          </button>
        </ChartActionButtons>
      </SurvivalAnalysisHeader>

      <SurvivalAnalysisContainer ref={survivalAnalysisContainerRef}>
        {chartPreviewMode ? (
          <>
            <KmWrap ref={kmChartRef}>
              <KaplanMeierChart
                data={[]}
                title=""
                width="100%"
                height={kmHeight}
                loading={false}
                error={null}
                colors={CHART_PREVIEW_KM_COLORS}
                showLabels={false}
                showLegend={false}
              />
            </KmWrap>
            <RiskWrap ref={riskTableRef}>
              <RiskTable
                classes={{ cohortName: classes.cohortNameEllipsis }}
                cohortNameCharLimit={7}
                cohorts={previewRiskCohorts}
                timeIntervals={CHART_PREVIEW_RISK_TIME_INTERVALS}
              />
            </RiskWrap>
          </>
        ) : survivalHasNoDisplayData ? (
          <div
            style={{
              width: '100%',
              flex: 1,
              minHeight: survivalBodyMinHeight,
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
            <KmWrap ref={kmChartRef}>
              <KaplanMeierChart
                data={filteredKmPlotData}
                title=""
                width="100%"
                height={kmHeight}
                loading={kmLoading}
                error={kmError}
                colors={cohortColors}
                showLabels={false}
                showLegend={false}
              />
            </KmWrap>
            <RiskWrap ref={riskTableRef}>
              <RiskTable
                classes={{ cohortName: classes.cohortNameEllipsis }}
                cohortNameCharLimit={7}
                cohorts={cohorts}
                timeIntervals={timeIntervals}
              />
            </RiskWrap>
          </>
        )}
      </SurvivalAnalysisContainer>
    </>
  );
}
