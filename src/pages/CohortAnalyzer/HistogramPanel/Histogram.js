import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DownloadIcon from "../../../assets/icons/Download_Histogram_icon.svg";
import DownloadIconBorderless from "../../../assets/icons/download-icon-borderless.svg";
import ExpandIcon from "../../../assets/icons/Expand_Histogram_icon.svg";
import { useHistogramData } from './useHistogramData';
import ToolTip from "@bento-core/tool-tip/dist/ToolTip";
import questionIcon from "../../../assets/icons/Question_icon_2.svg";
import CustomChartTooltip from './CustomChartTooltip';
import CustomXAxisTick from './CustomXAxisTick';
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
} from './HistogramPanel.styled';
import ExpandedChartModal from './HistogramPopup';
import PlaceHolder2 from '../../../assets/histogram/Placeholder2.svg';
import TreatmentTypePlaceHolder from '../../../assets/histogram/TreatmentTypePlaceHolder.svg';
import RiskTable from '@bento-core/risk-table';

import * as htmlToImage from 'html-to-image';
import { NoDataCard } from '../NoDataCard';

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
    minHeight: 220,
    flex: 1,
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

  const renderSurvivalAnalysisBody = (besideVenn = false) => {
    const KmWrap = besideVenn ? KmChartWrapperBesideVenn : KmChartWrapper;
    const RiskWrap = besideVenn ? RiskTableWrapperBesideVenn : RiskTableWrapper;
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
            height={230}
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
      <SurvivalBesideVennCard>{renderSurvivalAnalysisBody(true)}</SurvivalBesideVennCard>,
      survivalBesideVennTarget,
    )
    : null;

  const survivalInlineLegacy = selectedDatasets.includes('survivalAnalysis')
    && survivalBesideVennTarget === undefined
    ? (
      <FullWidthChartWrapper>
        {renderSurvivalAnalysisBody(false)}
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
            return (
              <ChartWrapper id={`chart-${dataset}`} ref={(el) => chartRef.current[dataset] = el}>
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
                  <span>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_11685_48000)">
<rect x="15.5" y="4.5" width="6" height="14" rx="1" fill="white"/>
<rect x="10.5" y="8.5" width="6" height="10" rx="1" fill="white"/>
<rect x="4.5" y="11.5" width="6" height="7" rx="1" fill="white"/>
<path d="M5.96364 19H20.0364C21.1196 19 22 18.1228 22 17.0435V5.95652C22 4.87717 21.1196 4 20.0364 4H17.0909C16.0076 4 15.1273 4.87717 15.1273 5.95652V7.26087H11.5273C10.444 7.26087 9.56364 8.13804 9.56364 9.21739V11.1739H5.96364C4.88036 11.1739 4 12.0511 4 13.1304V17.0435C4 18.1228 4.88036 19 5.96364 19ZM16.4364 5.95652C16.4364 5.59783 16.7309 5.30435 17.0909 5.30435H20.0364C20.3964 5.30435 20.6909 5.59783 20.6909 5.95652V17.0435C20.6909 17.4022 20.3964 17.6957 20.0364 17.6957H16.4364V5.95652ZM10.8727 9.21739C10.8727 8.8587 11.1673 8.56522 11.5273 8.56522H15.1273V17.6957H10.8727V9.21739ZM5.30909 13.1304C5.30909 12.7717 5.60364 12.4783 5.96364 12.4783H9.56364V17.6957H5.96364C5.60364 17.6957 5.30909 17.4022 5.30909 17.0435V13.1304Z" fill="#5C5C5C"/>
<path d="M3.65574 22H22.3443C22.7049 22 23 21.775 23 21.5C23 21.225 22.7049 21 22.3443 21H13H3.65574C3.29508 21 3 21.225 3 21.5C3 21.775 3.29508 22 3.65574 22Z" fill="#5C5C5C"/>
</g>
<defs>
<clipPath id="clip0_11685_48000">
<rect width="20" height="20" fill="white" transform="translate(3 3)"/>
</clipPath>
</defs>
</svg>

                  </span>
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
                      <div className={classes.chartPlotArea}>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                          data={filteredData[dataset]}
                          margin={{ 
                            top: 20, 
                            right: 30, 
                            left: 10, 
                            bottom: requiresCompactSpacing(dataset) ? 12 : 0 
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={true} vertical={false} />
                          <XAxis
                            dataKey="name"
                            interval={0}
                            angle={0}
                            textAnchor="middle"
                            height={50}
                            tick={(props) => {
                           
                              const dataLength = (filteredData[dataset] && filteredData[dataset].length) || 1;
                              const estimatedChartWidth = 400; // Approximate width of chart area
                              const availableWidth = (estimatedChartWidth / dataLength) * 0.9; // 90% to leave padding
                              
                            
                              let xFontSize = 10;
                              let xLineHeight = 11;
                              let xLetterSpacing = 0;
                              
                              if (requiresCompactSpacing(dataset)) {
                                xFontSize = 10;
                                xLineHeight = 10;
                              }
                              
                              return <CustomXAxisTick {...props} width={availableWidth} fontSize={xFontSize} lineHeight={xLineHeight} letterSpacing={xLetterSpacing} />;
                            }}
                          />
                          <YAxis
                            domain={[0, 'dataMax']}
                            tickFormatter={(value) => {
                              const num = Number(value);
                              const formatted = num % 1 === 0 ? num : num.toFixed(1);
                              return viewType[dataset] === 'percentage' ? `${formatted}%` : formatted;
                            }} 
                            tick={{ 
                              fontSize: 11, 
                              fill: '#666666', 
                              fontFamily: 'Nunito', 
                              fontWeight: 500,
                              lineHeight: 11,
                              letterSpacing: 0
                            }}
                          />
                          <Tooltip content={<CustomChartTooltip viewType={viewType[dataset]} cellHoverRef={cellHover} />} />
                          {valueA > 0 && (
                            <Bar dataKey="valueA" maxBarSize={60} stroke="#000" strokeWidth={0.6}>
                              {filteredData[dataset].map((entry, entryIndex) => (
                                <Cell key={`cell-${dataset}-${entryIndex}`} fill={entry.colorA} onMouseEnter={() => handleMouseEnter("valueA")} onMouseLeave={handleMouseLeave} />
                              ))}
                            </Bar>
                          )}
                          {valueB > 0 && (
                            <Bar dataKey="valueB" maxBarSize={60} stroke="#000" strokeWidth={0.6} >
                              {filteredData[dataset].map((entry, entryIndex) => (
                                <Cell key={`cell-${dataset}-${entryIndex}`} fill={entry.colorB} onMouseEnter={() => handleMouseEnter("valueB")} onMouseLeave={handleMouseLeave} />
                              ))}
                            </Bar>
                          )}
                          {valueC > 0 && (
                            <Bar dataKey="valueC" maxBarSize={60} stroke="#000" strokeWidth={0.6}>
                              {filteredData[dataset].map((entry, entryIndex) => (
                                <Cell key={`cell-${dataset}-${entryIndex}`} fill={entry.colorC} onMouseEnter={() => handleMouseEnter("valueC")} onMouseLeave={handleMouseLeave} />
                              ))}
                            </Bar>)}
                        </BarChart>
                      </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    allInputsEmpty ? (
                      <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={nullImages[dataset]} alt="No data" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                      </div>) : (
                      <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <NoDataCard />
                      </div>
                    )
                  )}

                </div>
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
        />
      )}

    </HistogramContainer>
  );
};

export default Histogram;