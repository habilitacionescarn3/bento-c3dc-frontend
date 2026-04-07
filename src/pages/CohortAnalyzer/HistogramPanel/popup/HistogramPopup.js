import React, { useRef, useEffect, useMemo, useLayoutEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
  ModalChartWrapper,
  ModalContent,
  ModalOverlay,
} from '../HistogramPanel.styled';
import { createHistogramModalSurvivalDownloads } from '../utils/histogramModalSurvivalDownloads';
import {
  useHistogramPopupFilteredKmData,
  useHistogramPopupKmCohortColors,
} from '../utils/histogramPopupKmDerived';
import { CA_EXPANDED_CHART_MODAL_TAB_VENN } from '../histogramConstants';
import { useCohortAnalyzer } from '../../context/CohortAnalyzerContext';
import { HistogramPopupModalHeader } from './HistogramPopupModalHeader';
import { HistogramPopupModalSurvivalTab } from './HistogramPopupModalSurvivalTab';
import { HistogramPopupModalVennTab } from './HistogramPopupModalVennTab';
import { HistogramPopupModalHistogramTab } from './HistogramPopupModalHistogramTab';
import {
  defaultVennModalSlotPx,
  defaultModalKmChartHeightPx,
  defaultModalHistogramDatasetChartHeightPx,
} from '../../config/cohortAnalyzerViewPercentDefaults';

const ExpandedChartModal = ({
  activeTab,
  setActiveTab,
  setExpandedChart,
  viewType,
  setViewType,
  data,
  titles,
  downloadChart,
  kmPlotData,
  kmLoading,
  kmError,
  kmChartRef,
  riskTableRef,
  cohorts,
  timeIntervals,
  c1,
  c2,
  c3,
  c1Name = '',
  c2Name = '',
  c3Name = '',
  chartVisualByPanelId = {},
  onSetChartVisual = () => {},
  cohortParticipantState,
  containerRef,
  canvasRef,
}) => {
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const [chartHeight, setChartHeight] = useState(() => defaultModalKmChartHeightPx());
  const dropdownRef = useRef(null);
  const chartTypeMenuRef = useRef(null);
  const survivalAnalysisContainerRef = useRef(null);
  const vennModalChartAreaRef = useRef(null);
  const [vennModalSlot, setVennModalSlot] = useState(() => defaultVennModalSlotPx());

  const modalHistogramDatasetChartHeight = useMemo(
    () => defaultModalHistogramDatasetChartHeightPx(),
    [],
  );

  const {
    refreshTableContent,
    selectedCohorts,
    nodeIndex,
    cohortData,
    setSelectedChart,
    setRefreshSelectedChart,
    setSelectedCohortSections,
    selectedCohortSection,
    setGeneralInfo,
    setAlert,
  } = useCohortAnalyzer();

  const mappedCohortData = useMemo(() => {
    if (cohortData && selectedCohorts.length > 0 && cohortParticipantState) {
      const mappingFunction = (cohortId) => (cohortData || cohortParticipantState)[cohortId];
      return selectedCohorts.map(mappingFunction);
    }
    return [];
  }, [cohortData, selectedCohorts, cohortParticipantState]);

  const vennModalHasRenderableCohorts = useMemo(
    () => mappedCohortData.some(
      (c) => c && c.cohortName && Array.isArray(c.participants),
    ),
    [mappedCohortData],
  );

  const vennModalShowsChart = refreshTableContent
    && selectedCohorts.length > 0
    && vennModalHasRenderableCohorts;

  const vennModalShowsEmptyState = selectedCohorts.length === 0
    || (
      refreshTableContent
      && selectedCohorts.length > 0
      && cohortData != null
      && !vennModalHasRenderableCohorts
    );

  const vennModalCanDownload = selectedCohorts.length > 0 && vennModalHasRenderableCohorts;

  const handleSetSelectedChartVenn = useCallback((data) => {
    setSelectedChart(data);
    setRefreshSelectedChart((v) => !v);
  }, [setSelectedChart, setRefreshSelectedChart]);

  const chartVennModalProps = useMemo(
    () => ({
      intersection: nodeIndex,
      cohortData: mappedCohortData,
      setSelectedChart: handleSetSelectedChartVenn,
      setSelectedCohortSections: (d) => setSelectedCohortSections(d),
      selectedCohortSection,
      selectedCohort: selectedCohorts,
      setGeneralInfo,
    }),
    [
      nodeIndex,
      mappedCohortData,
      handleSetSelectedChartVenn,
      selectedCohortSection,
      selectedCohorts,
      setGeneralInfo,
      setSelectedCohortSections,
    ],
  );

  useLayoutEffect(() => {
    if (activeTab !== CA_EXPANDED_CHART_MODAL_TAB_VENN) return undefined;
    const el = vennModalChartAreaRef.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setVennModalSlot({
        slotWidth: Math.max(260, Math.floor(r.width)),
        slotHeight: Math.max(140, Math.floor(r.height)),
      });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [activeTab]);

  const handleVennDownload = useCallback(() => {
    if (!containerRef || !containerRef.current || !canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.download = 'venn-diagram.png';
    link.href = tempCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setAlert({
      type: 'success',
      message: 'Confirmed download of Venn Diagram from the Cohort Analyzer by Participant ID',
    });
  }, [containerRef, canvasRef, setAlert]);

  const filteredKmPlotData = useHistogramPopupFilteredKmData(kmPlotData, c1, c2, c3);

  const survivalModalHasNoDisplayData =
    !kmLoading
    && !kmError
    && (!Array.isArray(filteredKmPlotData) || filteredKmPlotData.length === 0);

  const cohortColors = useHistogramPopupKmCohortColors(c1, c2, c3);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartTypeMenuRef.current && !chartTypeMenuRef.current.contains(event.target)) {
        setShowChartTypeMenu(false);
      }
    };
    if (showChartTypeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChartTypeMenu]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadDropdown(false);
      }
    };

    if (showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadDropdown]);

  useEffect(() => {
    setShowChartTypeMenu(false);
  }, [activeTab]);

  useEffect(() => {
    if (survivalModalHasNoDisplayData) setShowDownloadDropdown(false);
  }, [survivalModalHasNoDisplayData]);

  const { downloadKaplanMeierChart, downloadRiskTable, downloadBoth } = useMemo(
    () => createHistogramModalSurvivalDownloads({
      setShowDownloadDropdown,
      survivalAnalysisContainerRef,
    }),
    [survivalAnalysisContainerRef],
  );

  let valueA = 0;
  let valueB = 0;
  let valueC = 0;
  if (
    activeTab !== CA_EXPANDED_CHART_MODAL_TAB_VENN
    && activeTab !== 'survivalAnalysis'
    && Array.isArray(data[activeTab])
  ) {
    data[activeTab].forEach((entry) => {
      valueA += entry.valueA || 0;
      valueB += entry.valueB || 0;
      valueC += entry.valueC || 0;
    });
  }

 const cellHover = useRef(null);

 // Hover effect for bars
  const handleMouseEnter = (entry) => {
    cellHover.current = entry;
  };

  const handleMouseLeave = () => {
    cellHover.current = null;
  };

  //Disable scroll
  useEffect(() => {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    
  }, []);

  // Calculate height for KM chart - use reasonable size that doesn't fill full height
  useEffect(() => {
    const updateHeight = () => {
      if (survivalAnalysisContainerRef.current && activeTab === 'survivalAnalysis') {
        const containerHeight = survivalAnalysisContainerRef.current.clientHeight;
        // Use 40% of container height to leave room for centering and gap
        const calculatedHeight = Math.floor(containerHeight * 0.4);
        setChartHeight(Math.max(300, Math.min(calculatedHeight, 500))); // between 300px and 500px
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [activeTab]);


  return (
    createPortal(
      <ModalOverlay onClick={() => setExpandedChart(null)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <HistogramPopupModalHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setExpandedChart={setExpandedChart}
            data={data}
            titles={titles}
            downloadChart={downloadChart}
            survivalModalHasNoDisplayData={survivalModalHasNoDisplayData}
            showDownloadDropdown={showDownloadDropdown}
            setShowDownloadDropdown={setShowDownloadDropdown}
            dropdownRef={dropdownRef}
            downloadKaplanMeierChart={downloadKaplanMeierChart}
            downloadRiskTable={downloadRiskTable}
            downloadBoth={downloadBoth}
            kmChartRef={kmChartRef}
            riskTableRef={riskTableRef}
            vennModalCanDownload={vennModalCanDownload}
            handleVennDownload={handleVennDownload}
            showChartTypeMenu={showChartTypeMenu}
            setShowChartTypeMenu={setShowChartTypeMenu}
            chartTypeMenuRef={chartTypeMenuRef}
            chartVisualByPanelId={chartVisualByPanelId}
            onSetChartVisual={onSetChartVisual}
          />
          <ModalChartWrapper>
            {activeTab === 'survivalAnalysis' ? (
              <HistogramPopupModalSurvivalTab
                survivalModalHasNoDisplayData={survivalModalHasNoDisplayData}
                chartHeight={chartHeight}
                survivalAnalysisContainerRef={survivalAnalysisContainerRef}
                kmChartRef={kmChartRef}
                riskTableRef={riskTableRef}
                filteredKmPlotData={filteredKmPlotData}
                kmLoading={kmLoading}
                kmError={kmError}
                cohortColors={cohortColors}
                cohorts={cohorts}
                timeIntervals={timeIntervals}
              />
            ) : activeTab === CA_EXPANDED_CHART_MODAL_TAB_VENN ? (
              <HistogramPopupModalVennTab
                vennModalChartAreaRef={vennModalChartAreaRef}
                vennModalShowsChart={vennModalShowsChart}
                chartVennModalProps={chartVennModalProps}
                containerRef={containerRef}
                canvasRef={canvasRef}
                vennModalSlot={vennModalSlot}
                vennModalShowsEmptyState={vennModalShowsEmptyState}
              />
            ) : (
              <HistogramPopupModalHistogramTab
                activeTab={activeTab}
                data={data}
                viewType={viewType}
                setViewType={setViewType}
                chartVisualByPanelId={chartVisualByPanelId}
                valueA={valueA}
                valueB={valueB}
                valueC={valueC}
                modalHistogramDatasetChartHeight={modalHistogramDatasetChartHeight}
                cellHover={cellHover}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
                c1Name={c1Name}
                c2Name={c2Name}
                c3Name={c3Name}
              />
            )}
          </ModalChartWrapper>
        </ModalContent>
      </ModalOverlay>,
      document.body,
    )
  );
};

export default ExpandedChartModal;