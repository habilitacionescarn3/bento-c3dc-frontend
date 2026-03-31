import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
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
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
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
import AddChartInlinePanel from '../components/AddChartInlinePanel';
import { ADD_CHART_DATA_TYPES } from '../cohortAnalyzerChartCatalog';
import { useDispatch, useSelector } from 'react-redux';
import {
  setStripOrder,
  setBesideStripPanelId,
  setSurvivalBesideFromSelection,
  setPanelSize,
  setTopRowPanelOrder,
  upsertPanelRegistry,
  patchChartVisuals,
} from '../store/cohortAnalyzerLayoutActions';
import {
  CA_LAYOUT_SLOT,
  CA_PANEL_KIND,
  CA_SURVIVAL_CARD_MIN_WIDTH as SURVIVAL_CARD_MIN_WIDTH,
  CA_SURVIVAL_CARD_MAX_WIDTH as SURVIVAL_CARD_MAX_WIDTH,
  CA_SURVIVAL_CARD_MIN_HEIGHT as SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT as SURVIVAL_CARD_MAX_HEIGHT,
} from '../store/cohortAnalyzerLayoutConstants';
import {
  encodePanelDragPayload,
  parseDragDataTransfer,
  CA_PANEL_DRAG_MIME,
} from '../store/panelDnD';

/** Chart labels — add a key here to register a new strip chart in Redux via upsertPanelRegistry (no schema change). */
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
  survivalAnalysis: PlaceHolder2,
};

function buildPanelRegistryFromTitles() {
  const patch = {
    [CA_LAYOUT_SLOT.VENN]: {
      kind: CA_PANEL_KIND.VENN,
      chartKey: CA_LAYOUT_SLOT.VENN,
      label: 'Venn diagram',
    },
    [CA_LAYOUT_SLOT.SURVIVAL]: {
      kind: CA_PANEL_KIND.SURVIVAL,
      chartKey: 'survivalAnalysis',
      label: titles.survivalAnalysis,
    },
  };
  Object.keys(titles).forEach((key) => {
    if (key === 'survivalAnalysis') return;
    patch[key] = { kind: CA_PANEL_KIND.HISTOGRAM, chartKey: key, label: titles[key] };
  });
  return patch;
}

const BESIDE_PEER_DRAG_STYLE = {
  boxShadow: '0 14px 28px rgba(29, 61, 73, 0.28)',
  filter: 'brightness(0.96)',
  transition: 'box-shadow 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
};

const HISTOGRAM_CHART_PLOT_HEIGHT = 240;
const HISTOGRAM_CARD_MIN_WIDTH = 280;
const HISTOGRAM_CARD_MAX_WIDTH = 2000;
const HISTOGRAM_PLOT_MIN_HEIGHT = 120;
const HISTOGRAM_PLOT_MAX_HEIGHT = 800;
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

const Histogram = ({
  c1,
  c2,
  c3,
  c1Name = '',
  c2Name = '',
  c3Name = '',
  survivalBesideVennTarget,
  onSurvivalBesideColumnActive,
  besideCardDrag,
  besidePanelDragState = null,
  inlineAddChartOpen = false,
  onInlineAddChartClose,
  inlineAddChartNonce = 0,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const stripOrder = useSelector((state) => state.cohortAnalyzerLayout.stripOrder);
  const panelRegistry = useSelector((state) => state.cohortAnalyzerLayout.panelRegistry || {});
  const besideStripPanelId = useSelector((state) => state.cohortAnalyzerLayout.besideStripPanelId);
  const layoutSizes = useSelector((state) => state.cohortAnalyzerLayout.sizes || {});
  const topRowOrder = useSelector((state) => state.cohortAnalyzerLayout.topRowOrder);
  const chartVisualByPanelId = useSelector((state) => state.cohortAnalyzerLayout.chartVisualByPanelId || {});

  const getChartTitle = useCallback(
    (dataset) =>
      (panelRegistry[dataset] && panelRegistry[dataset].label) || titles[dataset] || String(dataset),
    [panelRegistry],
  );

  const displayTitles = useMemo(() => {
    const out = { ...titles };
    Object.keys(panelRegistry).forEach((id) => {
      const entry = panelRegistry[id];
      if (entry && entry.label) {
        out[id] = entry.label;
      }
    });
    return out;
  }, [panelRegistry]);

  const placeholderForDataset = useCallback(
    (dataset) => nullImages[dataset] || PlaceHolder2,
    [],
  );

  const reduxHistogramSizes = useMemo(() => {
    const out = {};
    Object.keys(titles).forEach((k) => {
      if (k === 'survivalAnalysis') return;
      if (layoutSizes[k] != null) out[k] = layoutSizes[k];
    });
    return out;
  }, [layoutSizes]);

  const reduxSurvivalSize = layoutSizes.survival != null ? layoutSizes.survival : null;

  const {
    graphData,
    viewType,
    setViewType,
    activeTab,
    setActiveTab,
    selectedDatasets,
    setSelectedDatasets,
    expandedChart,
    setExpandedChart,
    chartRef,
    handleDatasetChange,
    downloadChart,
  } = useHistogramData({ c1, c2, c3 });
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
  const [chartTypeMenuDataset, setChartTypeMenuDataset] = useState(null);
  const chartTypeMenuRef = useRef(null);
  /** Per-dataset card size after user resize: { width, plotHeight } (mirrors Redux; local updates during drag) */
  const [histogramCardSizes, setHistogramCardSizes] = useState(reduxHistogramSizes);
  const [survivalCardSize, setSurvivalCardSize] = useState(reduxSurvivalSize);
  const [draggingDataset, setDraggingDataset] = useState(null);
  const [dragOverDataset, setDragOverDataset] = useState(null);
  /** Pixel size of the card being dragged (from layout); drop slot matches this */
  const [draggingCardDimensions, setDraggingCardDimensions] = useState(null);

  const [inlineAddStep, setInlineAddStep] = useState(1);
  const [inlineSelectedCatalogId, setInlineSelectedCatalogId] = useState(null);

  useEffect(() => {
    if (!inlineAddChartOpen) return;
    setInlineAddStep(1);
    setInlineSelectedCatalogId(null);
  }, [inlineAddChartOpen, inlineAddChartNonce]);

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

  useEffect(() => {
    dispatch(upsertPanelRegistry(buildPanelRegistryFromTitles()));
  }, [dispatch]);

  const finalizeInlineAddChart = useCallback(
    (chartTypeSelected) => {
      if (chartTypeSelected == null) return;
      const selectedEntry = ADD_CHART_DATA_TYPES.find((e) => e.id === inlineSelectedCatalogId);
      if (!selectedEntry || !selectedEntry.datasetKey) return;
      const datasetKey = selectedEntry.datasetKey;
      if (stripOrder.includes(datasetKey)) {
        if (typeof onInlineAddChartClose === 'function') onInlineAddChartClose();
        return;
      }
      const label = selectedEntry.label;
      dispatch(
        upsertPanelRegistry({
          [datasetKey]: {
            kind: CA_PANEL_KIND.HISTOGRAM,
            chartKey: datasetKey,
            label: label || titles[datasetKey] || datasetKey,
          },
        }),
      );
      dispatch(patchChartVisuals({ [datasetKey]: chartTypeSelected }));
      const nextOrder = stripOrder.includes(datasetKey)
        ? stripOrder
        : [...stripOrder, datasetKey];
      dispatch(setStripOrder(nextOrder));
      setSelectedDatasets((prev) => (prev.includes(datasetKey) ? prev : [...prev, datasetKey]));
      setActiveTab(datasetKey);
      if (typeof onInlineAddChartClose === 'function') {
        onInlineAddChartClose();
      }
    },
    [
      inlineSelectedCatalogId,
      dispatch,
      stripOrder,
      onInlineAddChartClose,
      setSelectedDatasets,
      setActiveTab,
    ],
  );

  useEffect(() => {
    setHistogramCardSizes(reduxHistogramSizes);
  }, [reduxHistogramSizes]);

  useEffect(() => {
    if (reduxSurvivalSize == null) return;
    setSurvivalCardSize((prev) => ({ ...(prev || {}), ...reduxSurvivalSize }));
  }, [reduxSurvivalSize]);

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
    const visibleDatasets = selectedDatasets.filter((dataset) => dataset !== 'survivalAnalysis');
    if (stripOrder.length === 0 && visibleDatasets.length > 0) {
      dispatch(setStripOrder([...visibleDatasets]));
      return;
    }
    const prevVisible = stripOrder.filter((dataset) => visibleDatasets.includes(dataset));
    const missing = visibleDatasets.filter((dataset) => !prevVisible.includes(dataset));
    const next = [...prevVisible, ...missing];
    const unchanged =
      next.length === stripOrder.length &&
      next.every((d, i) => d === stripOrder[i]);
    if (!unchanged) {
      dispatch(setStripOrder(next));
    }
  }, [selectedDatasets, stripOrder, dispatch]);

  const survivalSelected = selectedDatasets.includes('survivalAnalysis');

  useEffect(() => {
    dispatch(setSurvivalBesideFromSelection(survivalSelected));
  }, [survivalSelected, dispatch]);

  useEffect(() => {
    if (survivalSelected) return;
    const visible = selectedDatasets.filter((d) => d !== 'survivalAnalysis');
    if (visible.length === 0) {
      if (besideStripPanelId != null) {
        dispatch(setBesideStripPanelId(null));
      }
      return;
    }
    if (besideStripPanelId != null && visible.includes(besideStripPanelId)) {
      return;
    }
    const order = stripOrder.filter((d) => visible.includes(d));
    const first = order[0] || visible[0];
    if (first) {
      dispatch(setBesideStripPanelId(first));
    }
  }, [
    survivalSelected,
    selectedDatasets,
    stripOrder,
    besideStripPanelId,
    dispatch,
  ]);

  const visibleHistogramDatasets = useMemo(
    () => selectedDatasets.filter((d) => d !== 'survivalAnalysis'),
    [selectedDatasets],
  );

  const orderedVisibleHistograms = useMemo(() => {
    const order = stripOrder.filter((d) => visibleHistogramDatasets.includes(d));
    const missing = visibleHistogramDatasets.filter((d) => !order.includes(d));
    return [...order, ...missing];
  }, [stripOrder, visibleHistogramDatasets]);

  const besideDatasetForColumn = useMemo(() => {
    if (survivalSelected) return null;
    if (orderedVisibleHistograms.length === 0) return null;
    if (besideStripPanelId && orderedVisibleHistograms.includes(besideStripPanelId)) {
      return besideStripPanelId;
    }
    return orderedVisibleHistograms[0];
  }, [survivalSelected, orderedVisibleHistograms, besideStripPanelId]);

  const mainHistogramRowOrder = useMemo(() => {
    if (!besideDatasetForColumn) return orderedVisibleHistograms;
    return orderedVisibleHistograms.filter((d) => d !== besideDatasetForColumn);
  }, [orderedVisibleHistograms, besideDatasetForColumn]);

  useEffect(() => {
    if (!onSurvivalBesideColumnActive) return;
    const active = Boolean(survivalBesideVennTarget) && selectedDatasets.includes('survivalAnalysis');
    onSurvivalBesideColumnActive(active);
  }, [survivalBesideVennTarget, selectedDatasets, onSurvivalBesideColumnActive]);

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
  }, [graphData, selectedDatasets, expandedChart]);

  const besideHistogramBarSums = useMemo(() => {
    const d = besideDatasetForColumn;
    if (!d || !Array.isArray(filteredData[d])) {
      return { valueA: 0, valueB: 0, valueC: 0 };
    }
    let valueA = 0;
    let valueB = 0;
    let valueC = 0;
    filteredData[d].forEach((entry) => {
      valueA += entry.valueA || 0;
      valueB += entry.valueB || 0;
      valueC += entry.valueC || 0;
    });
    return { valueA, valueB, valueC };
  }, [besideDatasetForColumn, filteredData]);

  // Hover effect for bars
  const handleMouseEnter = (entry) => {
    cellHover.current = entry;
  };

  const handleMouseLeave = () => {
    cellHover.current = null;
  };

  const allInputsEmpty = [c1, c2, c3].every(arr => !Array.isArray(arr) || arr.length === 0);

  const survivalBesideVennCardStyle = useMemo(() => {
    const clampW = (w) => Math.min(SURVIVAL_CARD_MAX_WIDTH, Math.max(SURVIVAL_CARD_MIN_WIDTH, w));
    const clampH = (h) => Math.min(SURVIVAL_CARD_MAX_HEIGHT, Math.max(SURVIVAL_CARD_MIN_HEIGHT, h));
    const base =
      survivalCardSize && survivalCardSize.width != null
        ? {
          width: clampW(survivalCardSize.width),
          height: clampH(survivalCardSize.height),
          minWidth: SURVIVAL_CARD_MIN_WIDTH,
          minHeight: SURVIVAL_CARD_MIN_HEIGHT,
          maxWidth: '100%',
          boxSizing: 'border-box',
          alignSelf: 'flex-start',
          cursor: besideCardDrag && besideCardDrag.draggable && !allInputsEmpty ? 'grab' : undefined,
        }
        : {
          width: SURVIVAL_CARD_MIN_WIDTH,
          height: SURVIVAL_CARD_MIN_HEIGHT,
          minWidth: SURVIVAL_CARD_MIN_WIDTH,
          minHeight: SURVIVAL_CARD_MIN_HEIGHT,
          maxWidth: '100%',
          boxSizing: 'border-box',
          ...(besideCardDrag && besideCardDrag.draggable && !allInputsEmpty ? { cursor: 'grab' } : {}),
        };
    const drag = {};
    if (besidePanelDragState && besidePanelDragState.kind === 'survival') {
      Object.assign(drag, {
        opacity: 0.42,
        outline: '2px dashed #679AAA',
        outlineOffset: 2,
        borderRadius: 10,
      });
    }
    if (besidePanelDragState && besidePanelDragState.kind === 'venn') {
      Object.assign(drag, BESIDE_PEER_DRAG_STYLE);
    }
    return { ...base, ...drag };
  }, [survivalCardSize, besideCardDrag, allInputsEmpty, besidePanelDragState]);

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

    let lastW;
    let lastPh;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const w = Math.round(Math.min(maxW, Math.max(HISTOGRAM_CARD_MIN_WIDTH, startWidth + dx)));
      const ph = Math.round(
        Math.min(HISTOGRAM_PLOT_MAX_HEIGHT, Math.max(HISTOGRAM_PLOT_MIN_HEIGHT, startPlot + dy)),
      );
      lastW = w;
      lastPh = ph;
      setHistogramCardSizes((prev) => ({
        ...prev,
        [dataset]: { width: w, plotHeight: ph },
      }));
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      if (lastW != null && lastPh != null) {
        dispatch(setPanelSize({
          panel: 'histogram',
          dataset,
          size: { width: lastW, plotHeight: lastPh },
        }));
      }
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
    const startWidth = Math.max(
      SURVIVAL_CARD_MIN_WIDTH,
      survivalCardSize && survivalCardSize.width != null ? survivalCardSize.width : rect.width,
    );
    const startHeight = Math.max(
      SURVIVAL_CARD_MIN_HEIGHT,
      survivalCardSize && survivalCardSize.height != null ? survivalCardSize.height : rect.height,
    );
    const maxW = typeof window !== 'undefined'
      ? Math.max(
        SURVIVAL_CARD_MIN_WIDTH,
        Math.min(SURVIVAL_CARD_MAX_WIDTH, window.innerWidth - 24),
      )
      : SURVIVAL_CARD_MAX_WIDTH;
    const startX = e.clientX;
    const startY = e.clientY;

    document.body.style.userSelect = 'none';

    let lastSurvivalW;
    let lastSurvivalH;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const w = Math.round(Math.min(maxW, Math.max(SURVIVAL_CARD_MIN_WIDTH, startWidth + dx)));
      const h = Math.round(
        Math.min(SURVIVAL_CARD_MAX_HEIGHT, Math.max(SURVIVAL_CARD_MIN_HEIGHT, startHeight + dy)),
      );
      lastSurvivalW = w;
      lastSurvivalH = h;
      setSurvivalCardSize({ width: w, height: h });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      if (lastSurvivalW != null && lastSurvivalH != null) {
        dispatch(
          setPanelSize({
            panel: 'survival',
            size: { width: lastSurvivalW, height: lastSurvivalH },
          }),
        );
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const renderSurvivalAnalysisBody = (besideVenn = false) => {
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
    const canBesideReorder = Boolean(
      besideVenn && besideCardDrag && besideCardDrag.draggable,
    );
    return (
    <>
      <SurvivalAnalysisHeader>
        <ChartTitle style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            role="button"
            tabIndex={0}
            aria-label={canBesideReorder ? 'Drag to swap position with Venn diagram' : 'Chart reorder handle'}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginRight: 6,
              cursor: allInputsEmpty ? 'not-allowed' : canBesideReorder ? 'grab' : 'default',
              opacity: allInputsEmpty ? 0.45 : 1,
            }}
            title={canBesideReorder ? 'Drag to swap with Venn diagram' : undefined}
          >
            <DragIndicatorIcon fontSize="small" />
          </span>
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

  const histogramBesideVennPortal =
    !survivalSelected &&
    besideDatasetForColumn &&
    survivalBesideVennTarget != null
      ? createPortal(
        <ChartWrapper
          id={`chart-beside-${besideDatasetForColumn}`}
          ref={(el) => { chartRef.current[besideDatasetForColumn] = el; }}
          style={{
            ...(histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].width != null
              ? {
                width: histogramCardSizes[besideDatasetForColumn].width,
                flexShrink: 0,
                alignSelf: 'flex-start',
                maxWidth: 'none',
              }
              : {}),
            cursor: allInputsEmpty ? 'default' : 'grab',
          }}
          draggable={!allInputsEmpty}
          onDragStart={(event) => {
            setDraggingDataset(besideDatasetForColumn);
            setDragOverDataset(null);
            const el = chartRef.current[besideDatasetForColumn];
            if (el && typeof el.getBoundingClientRect === 'function') {
              const rect = el.getBoundingClientRect();
              setDraggingCardDimensions({
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              });
            } else {
              setDraggingCardDimensions(null);
            }
            const payload = encodePanelDragPayload({ kind: 'histogram', dataset: besideDatasetForColumn });
            event.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
            event.dataTransfer.setData('text/plain', besideDatasetForColumn);
            event.dataTransfer.effectAllowed = 'move';
            if (el) {
              event.dataTransfer.setDragImage(el, 32, 20);
            }
          }}
          onDragEnd={() => {
            setDraggingDataset(null);
            setDragOverDataset(null);
            setDraggingCardDimensions(null);
          }}
        >
          {/* Header + chart body mirror strip card — see main row map for full actions */}
          <HeaderSection>
            <ChartTitle className={`${Array.isArray(data[besideDatasetForColumn]) && data[besideDatasetForColumn].length > 0 ? '' : 'empty'}`}>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Drag ${getChartTitle(besideDatasetForColumn) || 'chart'}`}
                style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6, cursor: allInputsEmpty ? 'not-allowed' : 'grab', opacity: allInputsEmpty ? 0.45 : 1 }}
              >
                <DragIndicatorIcon fontSize="small" />
              </span>
              {getChartTitle(besideDatasetForColumn)}
            </ChartTitle>
            <ChartActionButtons>
              <span style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }} onClick={() => { if (!allInputsEmpty) { setExpandedChart(besideDatasetForColumn); setActiveTab(besideDatasetForColumn); } }}>
                <img src={ExpandIcon} alt="expand" style={{ opacity: allInputsEmpty ? 0.5 : 1, width: '23px', height: '23px' }} />
              </span>
              <span style={{ cursor: allInputsEmpty ? 'default' : 'pointer' }} onClick={() => !allInputsEmpty && downloadChart(besideDatasetForColumn, false)}>
                <img src={DownloadIcon} alt="download" style={{ opacity: allInputsEmpty ? 0.5 : 1, width: '23px', height: '23px' }} />
              </span>
            </ChartActionButtons>
          </HeaderSection>
          <div
            className={classes.chartContentWrapper}
            style={{ paddingBottom: requiresCompactSpacing(besideDatasetForColumn) ? '12px' : '0px' }}
          >
            {Array.isArray(data[besideDatasetForColumn]) && data[besideDatasetForColumn].length > 0 ? (
              <div
                className={classes.chartPlotArea}
                style={{
                  minHeight: histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].plotHeight != null
                    ? histogramCardSizes[besideDatasetForColumn].plotHeight
                    : HISTOGRAM_CHART_PLOT_HEIGHT,
                  height: histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].plotHeight != null
                    ? histogramCardSizes[besideDatasetForColumn].plotHeight
                    : HISTOGRAM_CHART_PLOT_HEIGHT,
                }}
              >
                <HistogramDatasetChart
                  rows={filteredData[besideDatasetForColumn]}
                  viewType={viewType[besideDatasetForColumn]}
                  chartType={chartVisualByPanelId[besideDatasetForColumn] || DEFAULT_CHART_TYPE}
                  valueA={besideHistogramBarSums.valueA}
                  valueB={besideHistogramBarSums.valueB}
                  valueC={besideHistogramBarSums.valueC}
                  compact={requiresCompactSpacing(besideDatasetForColumn)}
                  height={histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].plotHeight != null
                    ? histogramCardSizes[besideDatasetForColumn].plotHeight
                    : HISTOGRAM_CHART_PLOT_HEIGHT}
                  width="100%"
                  estimatedChartWidth={
                    histogramCardSizes[besideDatasetForColumn] && histogramCardSizes[besideDatasetForColumn].width != null
                      ? Math.max(280, histogramCardSizes[besideDatasetForColumn].width - 48)
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
              <div style={{ width: '100%', minHeight: HISTOGRAM_CHART_PLOT_HEIGHT, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {allInputsEmpty ? (
                  <img src={placeholderForDataset(besideDatasetForColumn)} alt="No data" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                  <NoDataCard />
                )}
              </div>
            )}
          </div>
          <ChartResizeHandle
            aria-label="Resize chart beside Venn"
            title="Drag to resize chart"
            onMouseDown={(ev) => handleHistogramCardResizeStart(ev, besideDatasetForColumn)}
            style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
          />
        </ChartWrapper>,
        survivalBesideVennTarget,
      )
      : null;

  const survivalBesideVennPortal = selectedDatasets.includes('survivalAnalysis')
    && survivalBesideVennTarget != null
    ? createPortal(
      <SurvivalBesideVennCard
        id={besideCardDrag && besideCardDrag.id ? besideCardDrag.id : undefined}
        draggable={Boolean(besideCardDrag && besideCardDrag.draggable)}
        onDragStart={besideCardDrag && besideCardDrag.onDragStart ? besideCardDrag.onDragStart : undefined}
        onDragEnd={besideCardDrag && besideCardDrag.onDragEnd ? besideCardDrag.onDragEnd : undefined}
        style={survivalBesideVennCardStyle}
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
            width: Math.min(
              SURVIVAL_CARD_MAX_WIDTH,
              Math.max(SURVIVAL_CARD_MIN_WIDTH, survivalCardSize.width),
            ),
            height: Math.min(
              SURVIVAL_CARD_MAX_HEIGHT,
              Math.max(SURVIVAL_CARD_MIN_HEIGHT, survivalCardSize.height),
            ),
            minWidth: SURVIVAL_CARD_MIN_WIDTH,
            minHeight: SURVIVAL_CARD_MIN_HEIGHT,
            maxWidth: '100%',
            boxSizing: 'border-box',
            flex: '0 0 auto',
            alignSelf: 'flex-start',
          }
          : {
            width: SURVIVAL_CARD_MIN_WIDTH,
            height: SURVIVAL_CARD_MIN_HEIGHT,
            minWidth: SURVIVAL_CARD_MIN_WIDTH,
            minHeight: SURVIVAL_CARD_MIN_HEIGHT,
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
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
      {histogramBesideVennPortal}
      {survivalBesideVennPortal}
      {/* Dataset Selection */}
     

      {/* View Type Selection */}

      <CenterContainer
        onDragLeave={(event) => {
          if (!draggingDataset) return;
          const related = event.relatedTarget;
          if (related && event.currentTarget.contains(related)) return;
          setDragOverDataset(null);
        }}
      >
        {survivalInlineLegacy}
        {mainHistogramRowOrder
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
            const isDragging = Boolean(draggingDataset);
            const isDraggedCard = draggingDataset === dataset;
            const isDropTarget = dragOverDataset === dataset && draggingDataset && draggingDataset !== dataset;
            const showDropSlotBefore = isDropTarget;
            const dropSlotSize = (() => {
              if (draggingCardDimensions) {
                return {
                  width: draggingCardDimensions.width,
                  height: draggingCardDimensions.height,
                };
              }
              if (!draggingDataset) {
                return { width: 320, height: 261 };
              }
              const draggedEntry = histogramCardSizes[draggingDataset];
              const w = draggedEntry && draggedEntry.width != null ? draggedEntry.width : 320;
              const ph = draggedEntry && draggedEntry.plotHeight != null
                ? draggedEntry.plotHeight
                : HISTOGRAM_CHART_PLOT_HEIGHT;
              return {
                width: w,
                height: Math.max(261, ph + 100),
              };
            })();
            const cardDragOpacity = isDraggedCard
              ? 0.42
              : isDragging && !isDraggedCard
                ? (isDropTarget ? 0.9 : 0.62)
                : 1;
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
              <React.Fragment key={dataset}>
                {showDropSlotBefore && (
                  <div
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      width: dropSlotSize.width,
                      height: dropSlotSize.height,
                      minWidth: 0,
                      minHeight: 0,
                      maxWidth: '100%',
                      border: '2px dashed #679AAA',
                      borderRadius: 10,
                      background: 'rgba(103, 154, 170, 0.12)',
                      boxSizing: 'border-box',
                      margin: 0,
                    }}
                  />
                )}
                <ChartWrapper
                  id={`chart-${dataset}`}
                  ref={(el) => chartRef.current[dataset] = el}
                  style={{
                    ...(chartWrapperStyle || {}),
                    ...peerShadowStyle,
                    ...dropTargetStyle,
                    opacity: cardDragOpacity,
                    cursor: allInputsEmpty ? 'default' : 'grab',
                  }}
                  draggable={!allInputsEmpty}
                  onDragStart={(event) => {
                    setDraggingDataset(dataset);
                    setDragOverDataset(null);
                    const el = chartRef.current[dataset];
                    if (el && typeof el.getBoundingClientRect === 'function') {
                      const rect = el.getBoundingClientRect();
                      setDraggingCardDimensions({
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                      });
                    } else {
                      setDraggingCardDimensions(null);
                    }
                    const payload = encodePanelDragPayload({ kind: 'histogram', dataset });
                    event.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
                    event.dataTransfer.setData('text/plain', dataset);
                    event.dataTransfer.effectAllowed = 'move';
                    if (el) {
                      event.dataTransfer.setDragImage(el, 32, 20);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggingDataset(null);
                    setDragOverDataset(null);
                    setDraggingCardDimensions(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    const types = Array.from(event.dataTransfer.types || []);
                    if (
                      (!draggingDataset || draggingDataset === dataset)
                      && (types.includes(CA_PANEL_DRAG_MIME) || types.includes('text/plain'))
                    ) {
                      event.dataTransfer.dropEffect = 'move';
                      return;
                    }
                    if (!draggingDataset || draggingDataset === dataset) return;
                    event.dataTransfer.dropEffect = 'move';
                    setDragOverDataset(dataset);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const parsed = parseDragDataTransfer(event.dataTransfer);
                    if (parsed && (parsed.kind === 'venn' || parsed.kind === 'survival')) {
                      const from = parsed.kind;
                      const order = [...topRowOrder];
                      const i = order.indexOf(from);
                      const other = from === 'venn' ? 'survival' : 'venn';
                      const j = order.indexOf(other);
                      if (i >= 0 && j >= 0) {
                        const tmp = order[i];
                        order[i] = order[j];
                        order[j] = tmp;
                        dispatch(setTopRowPanelOrder(order));
                      }
                      setDraggingDataset(null);
                      setDragOverDataset(null);
                      setDraggingCardDimensions(null);
                      return;
                    }
                    if (!draggingDataset || draggingDataset === dataset) return;
                    const nextOrder = [...stripOrder];
                    const fromIndex = nextOrder.indexOf(draggingDataset);
                    const toIndex = nextOrder.indexOf(dataset);
                    if (fromIndex < 0 || toIndex < 0) return;
                    nextOrder.splice(fromIndex, 1);
                    nextOrder.splice(toIndex, 0, draggingDataset);
                    dispatch(setStripOrder(nextOrder));
                    setDraggingDataset(null);
                    setDragOverDataset(null);
                    setDraggingCardDimensions(null);
                  }}
                >
                <HeaderSection>
                  <ChartTitle className={`${Array.isArray(data[dataset]) && data[dataset].length > 0 ? '' : 'empty'}`} >
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
                      <DragIndicatorIcon fontSize="small" />
                    </span>
                    {getChartTitle(dataset)}
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
                    allInputsEmpty ? (
                      <div style={{ width: '100%', height: plotH, minHeight: plotH, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={placeholderForDataset(dataset)} alt="No data" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                      </div>) : (
                      <div style={{ width: '100%', height: plotH, minHeight: plotH, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <NoDataCard />
                      </div>
                    )
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
          })}
        {inlineAddChartOpen ? (
          <ChartWrapper
            id="chart-inline-add"
            draggable={false}
            style={{
              width: 'min(100%, 440px)',
              minWidth: 320,
              flexShrink: 0,
              alignSelf: 'flex-start',
              maxWidth: '100%',
              boxSizing: 'border-box',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'rgba(24, 103, 122, 0.55)',
            }}
          >
            <div
              className={classes.chartContentWrapper}
              style={{ padding: '12px 14px 16px' }}
            >
              <AddChartInlinePanel
                step={inlineAddStep}
                setStep={setInlineAddStep}
                selectedCatalogId={inlineSelectedCatalogId}
                setSelectedCatalogId={setInlineSelectedCatalogId}
                onCompleteWithChartType={finalizeInlineAddChart}
                existingStripKeys={stripOrder}
              />
            </div>
          </ChartWrapper>
        ) : null}

      </CenterContainer>
      {expandedChart && (
        <ExpandedChartModal
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setExpandedChart={setExpandedChart}
          viewType={viewType}
          setViewType={setViewType}
          data={filteredData}
          titles={displayTitles}
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
          chartVisualByPanelId={chartVisualByPanelId}
          onSetChartVisual={(panelId, type) => dispatch(patchChartVisuals({ [panelId]: type }))}
        />
      )}

    </HistogramContainer>
  );
};

export default Histogram;