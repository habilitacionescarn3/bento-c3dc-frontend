import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DownloadIcon from "../../../assets/icons/Download_Histogram_icon.svg";
import DownloadIconBorderless from "../../../assets/icons/download-icon-borderless.svg";
import ExpandIcon from "../../../assets/icons/Expand_Histogram_icon.svg";
import { useHistogramData } from './useHistogramData';
import ToolTip from "@bento-core/tool-tip/dist/ToolTip";
import questionIcon from "../../../assets/icons/Question_icon_2.svg";
import { KaplanMeierChart } from '@bento-core/kmplot';
import useKmplot from './useKmplot';
import useRiskTable from './useRiskTable';
import { makeStyles } from '@material-ui/core';
import { kmplotColors } from './HistogramPanel.styled';

import {
  HistogramContainer, ChartWrapper, FullWidthChartWrapper, SurvivalBesideVennCard, HeaderSection, RadioGroup, RadioInput
  , RadioLabel, ChartActionButtons, ChartTitle,
  CenterContainer, DatasetSelectionTitle, DownloadDropdown, DownloadDropdownMenu, DownloadDropdownItem
  , SurvivalAnalysisHeader, SurvivalAnalysisContainer, KmChartWrapper, KmChartWrapperBesideVenn,
  barColors, RiskTableWrapper, RiskTableWrapperBesideVenn, CheckBoxSection,
  ChartTypeDropdownRoot, ChartTypeDropdownPanel, ChartTypeOption, ChartTypeTriggerButton,
  ChartResizeHandle,
} from './HistogramPanel.styled';
import { HistogramDatasetChart, DEFAULT_CHART_TYPE } from './HistogramDatasetChart';
import { ChartTypeIcon, CHART_TYPE_OPTIONS } from './HistogramChartTypeIcons';
import ExpandedChartModal from './HistogramPopup';
import PlaceHolder2 from '../../../assets/histogram/Placeholder2.svg';
import TreatmentTypePlaceHolder from '../../../assets/histogram/TreatmentTypePlaceHolder.svg';
import RiskTable from '@bento-core/risk-table';

import * as htmlToImage from 'html-to-image';
import { NoDataCard } from '../NoDataCard';

const HISTOGRAM_CHART_PLOT_HEIGHT = 240;
const HISTOGRAM_CARD_MIN_WIDTH = 280;
const HISTOGRAM_CARD_MAX_WIDTH = 2000;
const HISTOGRAM_PLOT_MIN_HEIGHT = 120;
const HISTOGRAM_PLOT_MAX_HEIGHT = 800;
const SURVIVAL_CARD_MIN_WIDTH = 320;
const SURVIVAL_CARD_MAX_WIDTH = 2000;
const SURVIVAL_CARD_MIN_HEIGHT = 300;
const SURVIVAL_CARD_MAX_HEIGHT = 980;

const useStyles = makeStyles({
  cohortNameEllipsis: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
  chartContentWrapper: {
    margin: 0,
    width: '100%',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  chartPlotArea: {
    width: '100%',
    minHeight: HISTOGRAM_CHART_PLOT_HEIGHT,
    flex: 1,
    height: HISTOGRAM_CHART_PLOT_HEIGHT,
  },
});

const Histogram = ({ c1, c2, c3, c1Name = '', c2Name = '', c3Name = '', survivalBesideVennTarget }) => {
  const classes = useStyles();
  const { graphData, viewType, setViewType, activeTab, setActiveTab, selectedDatasets, expandedChart, setExpandedChart, chartRef, handleDatasetChange, downloadChart } = useHistogramData({ c1, c2, c3 });
  const {
    data: kmPlotData,
    loading: kmLoading,
    error: kmError
  } = useKmplot({ c1, c2, c3 });

  const {
    data: riskTableData,
  } = useRiskTable({ c1, c2, c3 });

  // Map cohort colors based on which cohorts are selected - memoized to update when cohorts change
  const cohortColors = useMemo(() => {
    const colors = [];
    if (c1 && c1.length > 0) colors.push(kmplotColors.colorA);
    if (c2 && c2.length > 0) colors.push(kmplotColors.colorB);
    if (c3 && c3.length > 0) colors.push(kmplotColors.colorC);
    return colors;
  }, [c1, c2, c3]);

  // Filter KM plot data to only include selected cohorts
  const filteredKmPlotData = useMemo(() => {
    if (!kmPlotData || !Array.isArray(kmPlotData)) return [];

    const selectedGroups = [];
    if (c1 && c1.length > 0) selectedGroups.push('c1');
    if (c2 && c2.length > 0) selectedGroups.push('c2');
    if (c3 && c3.length > 0) selectedGroups.push('c3');

    // Filter data to only include groups that match selected cohorts
    return kmPlotData.filter(item => {
      // Check if the item's group matches any selected cohort
      // The group field might be 'c1', 'c2', 'c3' or '1', '2', '3' or similar
      const group = item.group || item.group_id || '';
      return selectedGroups.some(selectedGroup => {
        // Handle different group formats: 'c1', '1', 'Cohort 1', etc.
        const groupStr = String(group).toLowerCase();
        const selectedStr = selectedGroup.toLowerCase();
        return groupStr.includes(selectedStr) ||
          groupStr.includes(selectedStr.replace('c', '')) ||
          (selectedGroup === 'c1' && (groupStr === '1' || groupStr === 'cohort 1' || groupStr === 'cohort1')) ||
          (selectedGroup === 'c2' && (groupStr === '2' || groupStr === 'cohort 2' || groupStr === 'cohort2')) ||
          (selectedGroup === 'c3' && (groupStr === '3' || groupStr === 'cohort 3' || groupStr === 'cohort3'));
      });
    });
  }, [kmPlotData, c1, c2, c3]);
  const kmChartRef = useRef(null);
  const kmChartRefExpanded = useRef(null);
  const survivalAnalysisContainerRef = useRef(null);
  const riskTableRef = useRef(null);
  const riskTableRefExpanded = useRef(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [chartVisualByDataset, setChartVisualByDataset] = useState({});
  const [chartTypeMenuDataset, setChartTypeMenuDataset] = useState(null);
  const chartTypeMenuRef = useRef(null);
  /** Per-dataset card size after user resize: { width, plotHeight } */
  const [histogramCardSizes, setHistogramCardSizes] = useState({});
  const [survivalCardSize, setSurvivalCardSize] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chartTypeMenuDataset
        && chartTypeMenuRef.current
        && !chartTypeMenuRef.current.contains(event.target)
      ) {
        setChartTypeMenuDataset(null);
      }
    };
    if (chartTypeMenuDataset) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chartTypeMenuDataset]);

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

  // Download function for Kaplan-Meier chart
  const downloadKaplanMeierChart = (kmChartRef) => {
    try {
      if (!kmChartRef.current) return;

      const svgElement = kmChartRef.current.querySelector("svg");
      if (!svgElement) return;

      const scaleFactor = 2;

      // Get SVG dimensions from viewBox or width/height attributes, fallback to bounding rect
      let width, height;
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [, , vw, vh] = viewBox.split(/\s+/).map(parseFloat);
        width = vw || svgElement.width.baseVal.value || svgElement.getBoundingClientRect().width;
        height = vh || svgElement.height.baseVal.value || svgElement.getBoundingClientRect().height;
      } else {
        width = svgElement.width.baseVal.value || svgElement.getBoundingClientRect().width;
        height = svgElement.height.baseVal.value || svgElement.getBoundingClientRect().height;
      }

      // Clone SVG and set explicit dimensions to ensure proper rendering
      const clonedSvg = svgElement.cloneNode(true);
      clonedSvg.setAttribute('width', width);
      clonedSvg.setAttribute('height', height);
      clonedSvg.removeAttribute('style'); // Remove any inline styles that might affect size

      const canvas = document.createElement("canvas");
      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;
      const ctx = canvas.getContext("2d");
      const TRANSPARENT_COLOR = "#00000000";

      ctx.fillStyle = TRANSPARENT_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scaleFactor, scaleFactor);

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `kaplan_meier_chart.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }, "image/png");
      };

      img.src = url;
      setShowDownloadDropdown(false);
    } catch (error) {
      console.error("Error downloading Kaplan-Meier chart:", error);
    }
  };


  // Download function for Risk table
  const downloadRiskTable = (riskTableRef) => {
    try {
      if (!riskTableRef || !riskTableRef.current) {
        console.error("Risk table ref not available");
        return;
      }

      // Use the ref directly to capture the Risk Table element
      const tableElement = riskTableRef.current;

      // Store original margin and temporarily remove it
      const originalMargin = tableElement.style.marginLeft;
      tableElement.style.marginLeft = '0';
      tableElement.style.backgroundColor = 'transparent';

      // Generate image from the ref element using html-to-image
      htmlToImage.toPng(tableElement, {
        backgroundColor: 'transparent',
        pixelRatio: 4,
        quality: 1.0
      }).then((dataUrl) => {
        // Restore original margin
        tableElement.style.marginLeft = originalMargin;

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `risk_table.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
      }).catch(error => {
        // Restore original margin even on error
        tableElement.style.marginLeft = originalMargin;
        console.error("Error using html-to-image:", error);
        alert("Error downloading Risk table. Please check the console for details.");
      });

      setShowDownloadDropdown(false);
    } catch (error) {
      console.error("Error downloading Risk table:", error);
      alert("Error downloading Risk table. Please check the console for details.");
    }
  };

  // Download both charts as a single combined image
  const downloadBoth = () => {
    try {
      setShowDownloadDropdown(false);

      if (!survivalAnalysisContainerRef.current) {
        console.error("Survival analysis container ref not available");
        alert("Container not available for download.");
        return;
      }

      const containerElement = survivalAnalysisContainerRef.current;

      htmlToImage.toPng(containerElement, {
        backgroundColor: 'transparent',
        pixelRatio: 2,
        quality: 1.0,
        useCORS: true,
        allowTaint: true
      }).then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `survival_analysis_combined.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
      }).catch((error) => {
        console.error("Error downloading combined chart:", error);
        alert("Error downloading combined chart. Please check the console for details.");
      });
    } catch (error) {
      console.error("Error downloading combined chart:", error);
      alert("Error downloading combined chart. Please check the console for details.");
    }
  };

  const titles = {
    survivalAnalysis: 'Survival Analysis',
    sexAtBirth: 'Sex at Birth',
    race: 'Race',
    treatmentType: 'Treatment Type',
    response: 'Treatment Outcome',
  };
  const nullImages = {
    treatmentType: TreatmentTypePlaceHolder,
    response: TreatmentTypePlaceHolder,
    sexAtBirth: PlaceHolder2,
    race: PlaceHolder2,
    survivalAnalysis: PlaceHolder2
  };

  // Transform risk table data to match RiskTable component format
  const { cohorts, timeIntervals } = useMemo(() => {
    if (!riskTableData || !riskTableData.cohorts) {
      return { cohorts: [], timeIntervals: [] };
    }

    const cohortColors = {
      'c1': barColors.colorA,
      'c2': barColors.colorB,
      'c3': barColors.colorC,
    };

    const transformedCohorts = riskTableData.cohorts
      .filter(cohort => {
        // Only include cohorts that have data and match selected cohorts
        const cohortKey = cohort.cohort.toLowerCase();
        return (
          (cohortKey === 'c1' && c1 && c1.length > 0) ||
          (cohortKey === 'c2' && c2 && c2.length > 0) ||
          (cohortKey === 'c3' && c3 && c3.length > 0)
        );
      })
      .map((cohort) => {
        // Convert survivalData array to data object format
        const data = {};
        cohort.survivalData.forEach(item => {
          // Convert float subjects to integer (e.g., 2.0 -> 2)
          data[item.group] = Math.round(item.subjects || 0);
        });

        // Determine the cohort name based on which cohort it is
        const cohortKey = cohort.cohort.toLowerCase();
        let cohortName;
        if (cohortKey === 'c1') cohortName = c1Name || 'Cohort A';
        else if (cohortKey === 'c2') cohortName = c2Name || 'Cohort B';
        else if (cohortKey === 'c3') cohortName = c3Name || 'Cohort C';

        return {
          id: cohortKey,
          name: cohortName,
          color: cohortColors[cohort.cohort.toLowerCase()] || '#ADD8E6',
          data: data,
        };
      });

    return {
      cohorts: transformedCohorts,
      timeIntervals: riskTableData.timeIntervals || [],
    };
  }, [riskTableData, c1, c2, c3, c1Name, c2Name, c3Name]);

  let data = graphData;
  const MAX_BARS_DISPLAYED = 6;
  const MAX_BARS_DISPLAYED_EXPANDED = 21;
  const cellHover = useRef(null);
  const filteredData = useMemo(() => {
    if (Object.keys(graphData).length > 0 && selectedDatasets.length > 0) {
      const otherKey = expandedChart ? 'OtherMany' : 'OtherFew';
      const maxDisplayed = expandedChart ? MAX_BARS_DISPLAYED_EXPANDED : MAX_BARS_DISPLAYED;
      const graphDataCopy = JSON.parse(JSON.stringify(graphData));

      selectedDatasets.forEach((dataset) => {
        // Skip survivalAnalysis as it doesn't have data in graphData
        if (dataset === 'survivalAnalysis' || !graphDataCopy[dataset]) {
          return;
        }
        const manyOthers = graphDataCopy[dataset].find(item => item.name === otherKey);

        const filteredRegularItems = graphDataCopy[dataset]
          .filter(item => item.name !== 'OtherFew' && item.name !== 'OtherMany');
        const regularItems = filteredRegularItems.slice(0, manyOthers ? maxDisplayed - 1 : maxDisplayed);
        graphDataCopy[dataset] = [...regularItems];
        if (manyOthers) {
          graphDataCopy[dataset].push(manyOthers);
        }
      })
      return graphDataCopy;
    }
    return graphData;
  }, [graphData, selectedDatasets, expandedChart])

  // Hover effect for bars
  const handleMouseEnter = (entry) => {
    cellHover.current = entry;
  };

  const handleMouseLeave = () => {
    cellHover.current = null;
  };

  const allInputsEmpty = [c1, c2, c3].every(arr => !Array.isArray(arr) || arr.length === 0);

  // Helper function to check if dataset requires compact spacing
  const requiresCompactSpacing = (dataset) => {
    return dataset === 'race' || dataset === 'treatmentType' || dataset === 'response';
  };

  const handleHistogramCardResizeStart = (e, dataset) => {
    if (allInputsEmpty) return;
    e.preventDefault();
    e.stopPropagation();
    const card = e.currentTarget.parentElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const current = histogramCardSizes[dataset];
    const startWidth = current && current.width != null ? current.width : rect.width;
    const startPlot = current && current.plotHeight != null ? current.plotHeight : HISTOGRAM_CHART_PLOT_HEIGHT;
    const maxW = typeof window !== 'undefined'
      ? Math.min(HISTOGRAM_CARD_MAX_WIDTH, window.innerWidth - 24)
      : HISTOGRAM_CARD_MAX_WIDTH;
    const startX = e.clientX;
    const startY = e.clientY;

    document.body.style.userSelect = 'none';

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const w = Math.round(Math.min(maxW, Math.max(HISTOGRAM_CARD_MIN_WIDTH, startWidth + dx)));
      const ph = Math.round(
        Math.min(HISTOGRAM_PLOT_MAX_HEIGHT, Math.max(HISTOGRAM_PLOT_MIN_HEIGHT, startPlot + dy)),
      );
      setHistogramCardSizes((prev) => ({
        ...prev,
        [dataset]: { width: w, plotHeight: ph },
      }));
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleSurvivalCardResizeStart = (e) => {
    if (allInputsEmpty) return;
    e.preventDefault();
    e.stopPropagation();
    const card = e.currentTarget.parentElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const startWidth = survivalCardSize && survivalCardSize.width != null ? survivalCardSize.width : rect.width;
    const startHeight = survivalCardSize && survivalCardSize.height != null ? survivalCardSize.height : rect.height;
    const maxW = typeof window !== 'undefined'
      ? Math.min(SURVIVAL_CARD_MAX_WIDTH, window.innerWidth - 24)
      : SURVIVAL_CARD_MAX_WIDTH;
    const startX = e.clientX;
    const startY = e.clientY;

    document.body.style.userSelect = 'none';

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const w = Math.round(Math.min(maxW, Math.max(SURVIVAL_CARD_MIN_WIDTH, startWidth + dx)));
      const h = Math.round(Math.min(SURVIVAL_CARD_MAX_HEIGHT, Math.max(SURVIVAL_CARD_MIN_HEIGHT, startHeight + dy)));
      setSurvivalCardSize({ width: w, height: h });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const renderSurvivalAnalysisBody = (besideVenn = false) => {
    const KmWrap = besideVenn ? KmChartWrapperBesideVenn : KmChartWrapper;
    const RiskWrap = besideVenn ? RiskTableWrapperBesideVenn : RiskTableWrapper;
    const kmHeight = survivalCardSize && survivalCardSize.height != null
      ? Math.max(160, Math.min(480, Math.round((survivalCardSize.height - 140) * 0.65)))
      : 230;
    return (
    <>
      <SurvivalAnalysisHeader>
        <ChartTitle>
          {'Overall Survival by Diagnosis'}
          <ToolTip
            maxWidth="235px"
            border={'1px solid #598ac5'}
            arrowBorder={'1px solid #598AC5'}
            title={<div>
              Participants with unreported age values or whose last diagnosis age is later than their last survival follow-up were excluded to ensure valid survival timelines.
              <br />
              <br />
              Displays survival data based on the earliest diagnosis when multiple diagnoses exist.
            </div>}
            placement="top-end"
            arrow
            interactive
            arrowSize="30px"
          >

            <img alt="Question Icon" src={questionIcon} width={10} style={{ border: "0px", top: -3, position: 'relative', marginLeft: 3 }} />

          </ToolTip>
        </ChartTitle>

        <ChartActionButtons>
          <span onClick={() => {
            if (!allInputsEmpty) {
              setExpandedChart('survivalAnalysis');
              setActiveTab('survivalAnalysis');
            }
          }} style={{ cursor: allInputsEmpty ? 'not-allowed' : 'pointer' }}>
            <img src={ExpandIcon} alt={"expand"} style={{ opacity: allInputsEmpty ? 0.5 : 1, width: '23px', height: '23px' }} />
          </span>
          <DownloadDropdown ref={dropdownRef}>
            <span
              onClick={() => !allInputsEmpty && setShowDownloadDropdown(!showDownloadDropdown)}
              style={{ cursor: allInputsEmpty ? 'not-allowed' : 'pointer' }}
            >
              <img src={DownloadIcon} alt={"download"} style={{ opacity: allInputsEmpty ? 0.5 : 1, width: '23px', height: '23px' }} />
            </span>
            {showDownloadDropdown && !allInputsEmpty && (
              <DownloadDropdownMenu>
                <DownloadDropdownItem onClick={() => downloadKaplanMeierChart(kmChartRef)}>
                  <img src={DownloadIconBorderless} alt="download Kaplan Meier Plot" style={{ width: '10px', height: '12px' }} />
                  Kaplan Meier Plot
                </DownloadDropdownItem>
                <DownloadDropdownItem onClick={() => downloadRiskTable(riskTableRef)}>
                  <img src={DownloadIconBorderless} alt="download Risk Table" style={{ width: '10px', height: '12px' }} />
                  Risk Table
                </DownloadDropdownItem>
                <DownloadDropdownItem onClick={() => downloadBoth()}>
                  <img src={DownloadIconBorderless} alt="download Both Kaplan Meier Plot and Risk Table" style={{ width: '10px', height: '12px' }} />
                  Download Both
                </DownloadDropdownItem>
              </DownloadDropdownMenu>
            )}
          </DownloadDropdown>
        </ChartActionButtons>
      </SurvivalAnalysisHeader>

      <SurvivalAnalysisContainer ref={survivalAnalysisContainerRef}>
        <KmWrap ref={kmChartRef}>
          <KaplanMeierChart
            data={filteredKmPlotData}
            title=""
            width={"100%"}
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
            cohortNameCharLimit={10}
            cohorts={cohorts}
            timeIntervals={timeIntervals}
          />

        </RiskWrap>
      </SurvivalAnalysisContainer>
    </>
    );
  };

  const survivalBesideVennPortal = selectedDatasets.includes('survivalAnalysis')
    && survivalBesideVennTarget != null
    ? createPortal(
      <SurvivalBesideVennCard
        style={survivalCardSize && survivalCardSize.width != null
          ? {
            width: survivalCardSize.width,
            height: survivalCardSize.height,
            maxWidth: 'none',
            alignSelf: 'flex-start',
          }
          : undefined}
      >
        {renderSurvivalAnalysisBody(true)}
        <ChartResizeHandle
          aria-label="Resize survival analysis card"
          title="Drag to resize card"
          onMouseDown={handleSurvivalCardResizeStart}
          style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
        />
      </SurvivalBesideVennCard>,
      survivalBesideVennTarget,
    )
    : null;

  const survivalInlineLegacy = selectedDatasets.includes('survivalAnalysis')
    && survivalBesideVennTarget === undefined
    ? (
      <FullWidthChartWrapper
        style={survivalCardSize && survivalCardSize.width != null
          ? {
            width: survivalCardSize.width,
            height: survivalCardSize.height,
            flex: '0 0 auto',
            maxWidth: 'none',
            alignSelf: 'flex-start',
          }
          : undefined}
      >
        {renderSurvivalAnalysisBody(false)}
        <ChartResizeHandle
          aria-label="Resize survival analysis card"
          title="Drag to resize card"
          onMouseDown={handleSurvivalCardResizeStart}
          style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
        />
      </FullWidthChartWrapper>
    )
    : null;

  return (
    <HistogramContainer>
      {survivalBesideVennPortal}
      {/* Dataset Selection */}
      <DatasetSelectionTitle disabled={allInputsEmpty}>
        View Venn Diagram in set operations:
      </DatasetSelectionTitle>
        <CheckBoxSection> 
        {Object.keys(titles).map((key, index) => (
          <label key={key} style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#000000', display: 'flex', alignItems: 'center',flexWrap: 'nowrap',flexDirection: 'row' }}>
            <input
              type="checkbox"
              value={key}
              checked={selectedDatasets.includes(key)}
              onChange={() => handleDatasetChange(key)}
              disabled={allInputsEmpty}
              style={{ marginRight: '8px', accentColor: '#6D5F5B', cursor: allInputsEmpty ? 'not-allowed' : 'pointer' }}
            />
            {titles[key]}
          </label>
        ))}
      </CheckBoxSection>

      {/* View Type Selection */}

      <CenterContainer>
        {survivalInlineLegacy}
        {selectedDatasets
          .filter(dataset => dataset !== 'survivalAnalysis') // Filter out survivalAnalysis as it's rendered separately
          .map((dataset, index) => {
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
            const plotH = cardSize && cardSize.plotHeight != null ? cardSize.plotHeight : HISTOGRAM_CHART_PLOT_HEIGHT;
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
            return (
              <ChartWrapper id={`chart-${dataset}`} ref={(el) => chartRef.current[dataset] = el} style={chartWrapperStyle}>
                <HeaderSection>
                  <ChartTitle className={`${Array.isArray(data[dataset]) && data[dataset].length > 0 ? '' : 'empty'}`} >
                    {titles[dataset]}
                    {Array.isArray(filteredData[dataset]) && filteredData[dataset].length > 5 && (
                      <ToolTip
                        maxWidth="335px"
                        border={'1px solid #598ac5'}
                        arrowBorder={'1px solid #598AC5'}
                        title={<div>
                          {"You can expand to see the full item"}
                        </div>}
                        placement="top-end"
                        arrow
                        interactive
                        arrowSize="30px"
                      >
                        <img alt="Question Icon" src={questionIcon} width={10} style={{ border: "0px", top: -3, left: 3, position: 'relative' }} />
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
                          type={chartVisualByDataset[dataset] || DEFAULT_CHART_TYPE}
                          size={22}
                        />
                      </ChartTypeTriggerButton>
                      {chartTypeMenuDataset === dataset && !allInputsEmpty && (
                        <ChartTypeDropdownPanel role="listbox" aria-label="Choose chart type">
                          {CHART_TYPE_OPTIONS.map(({ type, label }) => (
                            <ChartTypeOption
                              key={type}
                              type="button"
                              $active={(chartVisualByDataset[dataset] || DEFAULT_CHART_TYPE) === type}
                              aria-label={label}
                              aria-selected={(chartVisualByDataset[dataset] || DEFAULT_CHART_TYPE) === type}
                              onClick={() => {
                                setChartVisualByDataset((prev) => ({ ...prev, [dataset]: type }));
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
                      }} >
                      <img src={ExpandIcon} alt={"expand"} style={{ opacity: allInputsEmpty ? 0.5 : 1, width: '23px', height: '23px' }} />
                    </span>
                    <span
                      style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }}
                      onClick={() => !allInputsEmpty && downloadChart(dataset, false)}>
                      <img src={DownloadIcon} alt={"download"} style={{ opacity: allInputsEmpty ? 0.5 : 1, width: '23px', height: '23px' }} />
                    </span>

                  </ChartActionButtons>

                </HeaderSection>
                <div 
                  className={classes.chartContentWrapper}
                  style={{ 
                    paddingBottom: requiresCompactSpacing(dataset) ? '12px' : '0px'
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
                          chartType={chartVisualByDataset[dataset] || DEFAULT_CHART_TYPE}
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
                    allInputsEmpty ? (
                      <div style={{ width: '100%', height: plotH, minHeight: plotH, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={nullImages[dataset]} alt="No data" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                      </div>) : (
                      <div style={{ width: '100%', height: plotH, minHeight: plotH, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <NoDataCard />
                      </div>
                    )
                  )}

                </div>
                <ChartResizeHandle
                  aria-label={`Resize ${titles[dataset] || 'chart'} card`}
                  title="Drag to resize chart"
                  onMouseDown={(ev) => handleHistogramCardResizeStart(ev, dataset)}
                  style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
                />
              </ChartWrapper>

            );
          })}

      </CenterContainer>
      {expandedChart && (
        <ExpandedChartModal
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setExpandedChart={setExpandedChart}
          viewType={viewType}
          setViewType={setViewType}
          data={filteredData}
          titles={titles}
          downloadChart={downloadChart}
          kmPlotData={kmPlotData}
          kmLoading={kmLoading}
          kmError={kmError}
          kmChartRef={kmChartRefExpanded}
          riskTableRef={riskTableRefExpanded}
          cohorts={cohorts}
          timeIntervals={timeIntervals}
          c1={c1}
          c2={c2}
          c3={c3}
          c1Name={c1Name}
          c2Name={c2Name}
          c3Name={c3Name}
          chartVisualByDataset={chartVisualByDataset}
          setChartVisualByDataset={setChartVisualByDataset}
        />
      )}

    </HistogramContainer>
  );
};

export default Histogram;