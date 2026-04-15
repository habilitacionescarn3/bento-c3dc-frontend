import React from 'react';
import {
  Tab,
  TabContainer,
  ModalHeaderContainer,
  ModalActionButtons,
  DownloadButtonWrapper,
  DownloadButton,
  DownloadIconImage,
  DownloadIconSmall,
  DownloadDropdown,
  DownloadDropdownMenu,
  DownloadDropdownItem,
  CloseButton,
  ChartTypeDropdownRoot,
  ChartTypeDropdownPanel,
  ChartTypeOption,
  ChartTypeTriggerButton,
} from '../HistogramPanel.styled';
import DownloadIcon from '../../../../assets/icons/Download_Histogram_icon.svg';
import DownloadIconBorderless from '../../../../assets/icons/download-icon-borderless.svg';
import { ChartTypeIcon, CHART_TYPE_OPTIONS } from '../chart/HistogramChartTypeIcons';
import { DEFAULT_CHART_TYPE } from '../chart/HistogramDatasetChart';
import { CA_EXPANDED_CHART_MODAL_TAB_VENN } from '../histogramConstants';

export function HistogramPopupModalHeader({
  activeTab,
  setActiveTab,
  setExpandedChart,
  data,
  titles,
  downloadChart,
  survivalModalHasNoDisplayData,
  showDownloadDropdown,
  setShowDownloadDropdown,
  dropdownRef,
  downloadKaplanMeierChart,
  downloadRiskTable,
  downloadBoth,
  kmChartRef,
  riskTableRef,
  vennModalCanDownload,
  handleVennDownload,
  showChartTypeMenu,
  setShowChartTypeMenu,
  chartTypeMenuRef,
  chartVisualByPanelId,
  onSetChartVisual,
}) {
  return (
    <ModalHeaderContainer>
      <TabContainer>
        <Tab
          active={activeTab === CA_EXPANDED_CHART_MODAL_TAB_VENN}
          onClick={() => setActiveTab(CA_EXPANDED_CHART_MODAL_TAB_VENN)}
        >
          Venn Diagram
        </Tab>
        {Object.keys(data || {})
          .filter((dataset) => dataset !== 'survivalAnalysis')
          .map((dataset) => (
          <Tab
            key={dataset}
            active={activeTab === dataset}
            onClick={() => setActiveTab(dataset)}
          >
            {titles[dataset]}
          </Tab>
        ))}
        {titles.survivalAnalysis && (
          <Tab
            active={activeTab === 'survivalAnalysis'}
            onClick={() => setActiveTab('survivalAnalysis')}
          >
            {titles.survivalAnalysis}
          </Tab>
        )}
      </TabContainer>

      <ModalActionButtons>
        {activeTab === 'survivalAnalysis' ? (
          <DownloadButtonWrapper>
            <DownloadDropdown ref={dropdownRef}>
              {showDownloadDropdown && !survivalModalHasNoDisplayData && (
                <DownloadDropdownMenu>
                  <DownloadDropdownItem onClick={() => downloadKaplanMeierChart(kmChartRef)}>
                    <DownloadIconSmall src={DownloadIconBorderless} alt="download" />
                    Kaplan-Meier
                  </DownloadDropdownItem>
                  <DownloadDropdownItem onClick={() => downloadRiskTable(riskTableRef)}>
                    <DownloadIconSmall src={DownloadIconBorderless} alt="download" />
                    Risk Table
                  </DownloadDropdownItem>
                  <DownloadDropdownItem onClick={() => downloadBoth()}>
                    <DownloadIconSmall src={DownloadIconBorderless} alt="download" />
                    Download Both
                  </DownloadDropdownItem>
                </DownloadDropdownMenu>
              )}
            </DownloadDropdown>
            <DownloadButton
              onClick={() => !survivalModalHasNoDisplayData && setShowDownloadDropdown(!showDownloadDropdown)}
              style={{
                opacity: survivalModalHasNoDisplayData ? 0.45 : 1,
                cursor: survivalModalHasNoDisplayData ? 'not-allowed' : 'pointer',
                pointerEvents: survivalModalHasNoDisplayData ? 'none' : 'auto',
              }}
            >
              <DownloadIconImage src={DownloadIcon} alt="download" />
            </DownloadButton>
          </DownloadButtonWrapper>
        ) : activeTab === CA_EXPANDED_CHART_MODAL_TAB_VENN ? (
          <DownloadButton
            onClick={() => vennModalCanDownload && handleVennDownload()}
            style={{
              opacity: vennModalCanDownload ? 1 : 0.45,
              cursor: vennModalCanDownload ? 'pointer' : 'not-allowed',
              pointerEvents: vennModalCanDownload ? 'auto' : 'none',
            }}
          >
            <DownloadIconImage src={DownloadIcon} alt="" />
          </DownloadButton>
        ) : (
          <>
            <ChartTypeDropdownRoot ref={chartTypeMenuRef} $compactTrailingGap={false}>
              <ChartTypeTriggerButton
                type="button"
                aria-haspopup="listbox"
                aria-expanded={showChartTypeMenu}
                aria-label="Chart type"
                onClick={() => setShowChartTypeMenu((o) => !o)}
              >
                <ChartTypeIcon
                  type={chartVisualByPanelId[activeTab] || DEFAULT_CHART_TYPE}
                  size={22}
                />
              </ChartTypeTriggerButton>
              {showChartTypeMenu && (
                <ChartTypeDropdownPanel role="listbox" aria-label="Choose chart type">
                  {CHART_TYPE_OPTIONS.map(({ type, label }) => (
                    <ChartTypeOption
                      key={type}
                      type="button"
                      $active={(chartVisualByPanelId[activeTab] || DEFAULT_CHART_TYPE) === type}
                      aria-label={label}
                      aria-selected={(chartVisualByPanelId[activeTab] || DEFAULT_CHART_TYPE) === type}
                      onClick={() => {
                        onSetChartVisual(activeTab, type);
                        setShowChartTypeMenu(false);
                      }}
                    >
                      <ChartTypeIcon type={type} size={20} />
                    </ChartTypeOption>
                  ))}
                </ChartTypeDropdownPanel>
              )}
            </ChartTypeDropdownRoot>
            <DownloadButton onClick={() => downloadChart(activeTab, true)}>
              <DownloadIconImage src={DownloadIcon} alt="download" />
            </DownloadButton>
          </>
        )}
        <CloseButton onClick={() => setExpandedChart(null)}>×</CloseButton>
      </ModalActionButtons>
    </ModalHeaderContainer>
  );
}
