import React, { useMemo, useState, useRef } from 'react';
import CohortAnalyzerHeader from '../components/CohortAnalyzerHeader';
import ChartVenn from './ChartVenn';
import placeHolder from '../../../assets/vennDigram/placeHolder.png';
import { useCohortAnalyzer } from '../CohortAnalyzerContext';
import { ChartResizeHandle } from '../HistogramPanel/HistogramPanel.styled';

const VENN_OUTER_MIN_W = 400;
const VENN_OUTER_MIN_H = 280;
const VENN_OUTER_MAX_W = 2000;
const VENN_OUTER_MAX_H = 900;
/** Space for header + divider inside the white card (approx.) */
const VENN_CARD_HEADER_RESERVE = 80;

const VennDiagramContainer = ({
    classes,
    state,
    containerRef,
    canvasRef,
}) => {

    const {
        refreshTableContent,
        selectedCohorts,
        nodeIndex,
        cohortData,
        setSelectedChart,
        refreshSelectedChart,
        setRefreshSelectedChart,
        setSelectedCohortSections,
        selectedCohortSection,
        setGeneralInfo,
        setNodeIndex,
        setRowData,
        setAlert
    } = useCohortAnalyzer();

    const mappedCohortData = useMemo(() => {
        if(cohortData && selectedCohorts.length > 0 && state) {
            const mappingFunction = (cohortId) => (cohortData || state)[cohortId];
            return selectedCohorts.map(mappingFunction);
        }
        return [];
    }, [cohortData, selectedCohorts, state]);

    const [vennContainerSize, setVennContainerSize] = useState(null);
    const vennContainerSizeRef = useRef(null);
    vennContainerSizeRef.current = vennContainerSize;

    const chartSlot = useMemo(() => {
        if (!vennContainerSize) {
            return { slotWidth: undefined, slotHeight: undefined };
        }
        return {
            slotWidth: Math.max(240, vennContainerSize.width - 24),
            slotHeight: Math.max(140, vennContainerSize.height - VENN_CARD_HEADER_RESERVE),
        };
    }, [vennContainerSize]);

    const handleVennContainerResizeStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = e.currentTarget.parentElement;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const prev = vennContainerSizeRef.current;
        const startW = prev && prev.width != null ? prev.width : rect.width;
        const startH = prev && prev.height != null ? prev.height : rect.height;
        const startX = e.clientX;
        const startY = e.clientY;
        const maxW = typeof window !== 'undefined'
            ? Math.min(VENN_OUTER_MAX_W, window.innerWidth - 24)
            : VENN_OUTER_MAX_W;

        document.body.style.userSelect = 'none';

        const onMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            const w = Math.round(Math.min(maxW, Math.max(VENN_OUTER_MIN_W, startW + dx)));
            const h = Math.round(Math.min(VENN_OUTER_MAX_H, Math.max(VENN_OUTER_MIN_H, startH + dy)));
            setVennContainerSize({ width: w, height: h });
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const handleDownload = () => {
        if (containerRef.current && canvasRef.current) {
            const canvas = canvasRef.current;

            // Create a temporary canvas with white background
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            // Fill with white background
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw the original canvas content on top
            tempCtx.drawImage(canvas, 0, 0);

            // Create download link
            const link = document.createElement('a');
            link.download = 'venn-diagram.png';
            link.href = tempCanvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setAlert({ type: 'success', message: 'Confirmed download of Venn Diagram from the Cohort Analyzer by Participant ID' });
        }
    };

    const handleSetSelectedChart = (data) => {
        setSelectedChart(data);
        setRefreshSelectedChart(!refreshSelectedChart);
    }


    const containerStyle = {
        position: 'relative',
        ...(vennContainerSize && {
            width: vennContainerSize.width,
            height: vennContainerSize.height,
            flexShrink: 0,
            maxHeight: 'none',
            alignSelf: 'flex-start',
        }),
    };

    return (
        <div className={classes.chartContainer} style={containerStyle}>
            <CohortAnalyzerHeader
                selectedCohorts={selectedCohorts}
                nodeIndex={nodeIndex}
                setNodeIndex={setNodeIndex}
                setRowData={setRowData}
                handleDownload={handleDownload}
                classes={classes}
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 0, width: '100%' }}>
            {refreshTableContent && selectedCohorts.length > 0 &&
                <ChartVenn
                    intersection={nodeIndex}
                    cohortData={mappedCohortData}
                    setSelectedChart={handleSetSelectedChart}
                    setSelectedCohortSections={(data) => {
                        setSelectedCohortSections(data);
                    }}
                    selectedCohortSection={selectedCohortSection}
                    selectedCohort={selectedCohorts}
                    setGeneralInfo={setGeneralInfo}
                    containerRef={containerRef}
                    canvasRef={canvasRef}
                    slotWidth={chartSlot.slotWidth}
                    slotHeight={chartSlot.slotHeight}
                />}
                
            {selectedCohorts.length === 0 &&
                <img src={placeHolder} alt='placeholder' width={"100%"} style={{ marginTop: 10, alignSelf: 'center', flex: 1 }} />
            }
            </div>
            <ChartResizeHandle
                aria-label="Resize Venn diagram container"
                title="Drag to resize container"
                onMouseDown={handleVennContainerResizeStart}
            />
        </div>
    )
}

export default VennDiagramContainer;