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
          Venn Diagrams
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
                  size={36}
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
                      <ChartTypeIcon type={type} size={28} />
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
      
      <CloseButton onClick={() => setExpandedChart(null)}>
      <svg width="16" height="16" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_12597_43488)">
<path d="M10.8996 1.29841L9.69961 0.0998535L5.69961 4.09503L4.19961 5.59322L0.0996094 9.68827L1.29961 10.8868L5.49961 6.69189L9.69961 10.8868L10.8996 9.68827L6.69961 5.49334L10.8996 1.29841Z" fill="#5C5C5C"/>
<path d="M0.0996094 9.68803L1.29961 10.8866L5.29961 6.89141L6.79961 5.39322L10.8996 1.29816L9.69961 0.0996094L5.49961 4.29454L1.29961 0.0996094L0.0996094 1.29816L4.29961 5.4931L0.0996094 9.68803Z" fill="#5C5C5C"/>
</g>
<defs>
<clipPath id="clip0_12597_43488">
<rect width="11" height="10.9867" fill="white"/>
</clipPath>
</defs>
</svg>


      </CloseButton>
      </ModalActionButtons>
    </ModalHeaderContainer>
  );
}
