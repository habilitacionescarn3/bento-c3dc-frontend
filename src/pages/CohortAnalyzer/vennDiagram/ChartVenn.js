import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { VennDiagramChart, extractSets } from "chartjs-chart-venn";
import {
  baseColorArray,
  nodes,
  DEFAULT_FONT_SIZE_THRESHOLD,
  hexToRgba,
  VENN_CHART_LAYOUT_PADDING,
  VENN_CANVAS_SIZE_SCALE_NORMAL,
  VENN_CANVAS_SIZE_SCALE_NORMAL_TWO_COHORTS,
  VENN_CANVAS_SIZE_SCALE_EXPANDED,
  VENN_CANVAS_SIZE_SCALE_BIG_SCREEN,
  VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH,
  buildVennCohortSetLabel,
  vennCohortLabelFitPlugin,
} from "./ChartVennConfig";
import { chartVennFallbackCanvasDimensionsPx } from '../config/cohortAnalyzerViewPercentDefaults';

const intersectionColors = [
  "#000","#000","#cbdfcc",
  "#cbdfcc",
  "#e4e3c4",
  "#bcd8d1",
  "#65DEA8"
].map(color => hexToRgba(color));

function reduceOpacity(rgbaColor, reductionPercentage) {
  const matches = rgbaColor.match(/rgba?\((\d+), (\d+), (\d+),? ([\d.]+)?\)/);
  if (!matches) throw new Error("Invalid RGBA color format");

  const [, r, g, b, a = 1] = matches.map(Number); 
  const newAlpha = a * (1 - reductionPercentage / 100);
  return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
}

const ChartVenn = ({
  intersection,
  cohortData,
  setSelectedChart,
  setSelectedCohortSections,
  selectedCohortSection,
  selectedCohort,
  setGeneralInfo,
  containerRef,
  canvasRef,
  slotWidth,
  slotHeight,
  /**
   * When true (expanded chart modal), canvas uses VENN_CANVAS_SIZE_SCALE_EXPANDED.
   * When false, scale follows cohort count; at viewport ≥ VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH,
   * inline uses VENN_CANVAS_SIZE_SCALE_BIG_SCREEN instead.
   */
  expandedView = false,
}) => {
  const chartRef = useRef(null);
  /** Observed chart plot box — keeps canvas in sync when the parent card is resized. */
  const chartAreaRef = useRef(null);
  const [observedPlotSize, setObservedPlotSize] = useState({ width: 0, height: 0 });
  const [viewportWidth, setViewportWidth] = useState(() =>
    (typeof window !== 'undefined' ? window.innerWidth : 0),
  );

  const [baseSets, setBaseSets] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    const el = chartAreaRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const w = Math.round(width);
      const h = Math.round(height);
      setObservedPlotSize((prev) => {
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  
  const handleChartClick = (event) => {
    const elementsAtEvent = chartRef.current.getElementsAtEventForMode(
      event,
      "nearest",
      { intersect: true },
      true
    );

    if (elementsAtEvent.length) {
      const firstElement = elementsAtEvent[0];
      const datasetIndex = firstElement.datasetIndex;
      const index = firstElement.index;
      const label = data.datasets[datasetIndex].data[index].label;
      const content = data.datasets[datasetIndex].data[index].values;

      setSelectedChart(prev => {
        const updatedChart = new Set(prev);
        content.forEach(item => updatedChart.has(item) ? updatedChart.delete(item) : updatedChart.add(item));
        return Array.from(updatedChart);
      });
      let prevData = [...selectedCohortSection];
      if(prevData.includes(label)){
        prevData = prevData.filter(labels => labels !== label);
      }else{
        prevData =[...prevData,label];

      }
     
      setSelectedCohortSections(prevData);
    }
  };

  const getBorderColor = (item, index ) => {
    return selectedCohortSection.includes(item.label) ? "rgba(0, 0, 0, 0.1)" : "#929292";
  }

  const getBorderWidth = (item, index) =>{
    return selectedCohortSection.includes(item.label) ? 4 : 0.5;
  }

  const getBackgroundColor = (item, index) => {
    if (item.sets.length > 1) {
      const hardcodedColor = intersectionColors[index] || "rgba(223, 29, 29, 0)";
 
  return selectedCohortSection.includes(item.label) ? hardcodedColor :  reduceOpacity(hardcodedColor, 35);;
    } else {
      return selectedCohortSection.includes(item.label)
        ? baseColorArray[index]
        : reduceOpacity(baseColorArray[index], 55);
    }
  };

const fontSizeX = React.useMemo(() => {
  if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data) return 15;

  const largeDataCount = data.datasets[0].data
    .filter(item => item.sets.length > 1)
    .reduce((sum, item) => sum + (Array.isArray(item.values) ? item.values.length : 0), 0);

  return largeDataCount > DEFAULT_FONT_SIZE_THRESHOLD ? 10 : 15;
}, [data]);


let config = {};
if(data){
   config = {
    type: "venn",
    data: {
      ...data,
      datasets: [
        {
          ...data.datasets[0],
          backgroundColor: data.datasets[0].data.map(getBackgroundColor),
          borderColor: data.datasets[0].data.map(getBorderColor),
          borderWidth: data.datasets[0].data.map(getBorderWidth) ,
        },
      ],
    },
    /**
     * Custom cohort labels (multiline + shrink) — chartjs-chart-venn only draws a single
     * fillText; we hide y tick labels and render in {@link vennCohortLabelFitPlugin}.
     */
    plugins: [vennCohortLabelFitPlugin],
    options: {
      onClick: handleChartClick,
      layout: {
        padding: VENN_CHART_LAYOUT_PADDING,
      },
      scales: {
        x: {
            ticks: {
                font: {
                    family: 'Nunito',
                    size: fontSizeX,
                    weight: 0,
                },
                color: '#494949',
            },
        },
        y: {
            ticks: {
                /* Font options still feed vennCohortLabelFitPlugin; display false skips built-in one-line labels. */
                display: false,
                font: {
                    family: 'Nunito',
                    size: 16,
                    weight: 570,
                },
                color: '#494949',
            },
        },
    },
    hover: {
      mode: null,
      animationDuration: 0 
    },
    },
  };

}

 
// useEffect hooks
  useEffect(() => {
    const updatedBaseSets = cohortData.filter(cohort => cohort && cohort.cohortName).map((cohort) => {
      const seenValues = new Set();
      return {
        label: buildVennCohortSetLabel(cohort.cohortName, cohort.participants.length),
        values: cohort.participants
          .map(p => p[nodes[intersection]])
          .filter(value => {
            if (value !== null && value !== undefined && !seenValues.has(value)) {
              seenValues.add(value);
              return true;
            }
            return false;
          }),
        size: cohort.participants.length,
      };
    });

    setBaseSets(updatedBaseSets);
  }, [cohortData, intersection]);

  useEffect(() => {
    if (baseSets.length > 0) {
      const updatedData = extractSets(
        baseSets.map(set => ({ label: set.label, values: set.values, value: set.size }))
      );
      setData(updatedData);
    }
  }, [baseSets]);

useEffect(() => {
  if (chartRef.current && canvasRef.current) {
    chartRef.current.destroy();
    chartRef.current = null;
  }
  
  if (canvasRef.current && containerRef.current && data && config && config.type) {
    const fallback = chartVennFallbackCanvasDimensionsPx(cohortData.length);
    const slotW =
      observedPlotSize.width > 0 ? observedPlotSize.width : slotWidth;
    const slotH =
      observedPlotSize.height > 0 ? observedPlotSize.height : slotHeight;

    let maxWidth = fallback.width;
    let maxHeight = fallback.height;
    if (slotW != null && slotH != null) {
      // Use nearly the full slot — only a few px reserved as safety so we never
      // overflow when the slot resizes mid-render. The CSS margin below is 0,
      // so this is the only buffer between canvas edge and slot edge.
      maxWidth = Math.max(100, Math.round(slotW) );
      maxHeight = Math.max(10, Math.round(slotH) );
    }

    const vennCohortCount = cohortData.filter((c) => c && c.cohortName).length;
    const isBigScreen = viewportWidth >= VENN_BIG_SCREEN_VIEWPORT_MIN_WIDTH;
    let canvasScale;
    if (expandedView) {
      canvasScale = VENN_CANVAS_SIZE_SCALE_EXPANDED;
    } else if (isBigScreen) {
      canvasScale = VENN_CANVAS_SIZE_SCALE_BIG_SCREEN;
    } else if (vennCohortCount === 2) {
      canvasScale = VENN_CANVAS_SIZE_SCALE_NORMAL_TWO_COHORTS;
    } else {
      canvasScale = VENN_CANVAS_SIZE_SCALE_NORMAL;
    }
    maxWidth = Math.round(maxWidth * canvasScale);
    maxHeight = Math.round(maxHeight * canvasScale);

    canvasRef.current.width = maxWidth;
    canvasRef.current.height = maxHeight;
    canvasRef.current.style.width = `${maxWidth}px`;
    canvasRef.current.style.height = `${maxHeight}px`;
    // No outer margin — slot-fit constants above already reserve safety pixels,
    // and removing the 10px CSS margin lets the venn fill its slot.
    canvasRef.current.style.margin = "0";
    chartRef.current = new VennDiagramChart(canvasRef.current, config);
  }

  return () => {
    if (chartRef.current) chartRef.current.destroy();
  };
}, [selectedCohortSection, data, selectedCohort, cohortData, slotWidth, slotHeight, expandedView, observedPlotSize, viewportWidth]);

  useEffect(() => {
    let updatedStat = {};
    if(data){
     
      data.datasets[0].data.forEach(item => {
        if (selectedCohortSection.includes(item.label)) {
          updatedStat[item.label] = item.values;
        }
      });

      setGeneralInfo(updatedStat)
    }
   
  },[selectedCohortSection,intersection])

  if(!data){
    return (
      <div>
        <p>Loading....</p>
      </div>
    )
  }
  return (
    <div
      ref={containerRef}
      className="App"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
      }}
    >
      <div
        ref={chartAreaRef}
        className="chart-container"
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          minHeight: '100%',
          justifyContent: 'center',
          padding: 0,
          overflow: 'visible',
        }}
      >
        <canvas ref={canvasRef} id="canvas" />
      </div>
    </div>
  );
};

export default ChartVenn;