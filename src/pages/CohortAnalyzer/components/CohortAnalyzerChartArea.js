import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ToolTip from '@bento-core/tool-tip/dist/ToolTip';
import VennDiagramContainer from '../vennDiagram/VennDiagramContainer';
import Histogram from '../HistogramPanel';
import { CA_EXPANDED_CHART_MODAL_TAB_VENN } from '../HistogramPanel/histogramConstants';
import {
    resetCohortAnalyzerLayout,
    upsertPanelRegistry,
} from '../store/cohortAnalyzerLayoutActions';
import { buildDefaultCohortAnalyzerPanelRegistry } from '../store/cohortAnalyzerDefaultPanelRegistry';
import { CohortAnalyzerDownloadAllDropdown } from './CohortAnalyzerDownloadAllDropdown';
import { BESIDE_PEER_DRAG_STYLE } from '../HistogramPanel/histogramConstants';

const ALL_CHARTS_ADDED_TOOLTIP = 'All charts are already added';

function AddChartToolbarButton({
    classes,
    hasParticipantData,
    allAddableChartsAdded,
    openAddChartInline,
    ariaLabel,
}) {
    const disabled = !hasParticipantData || allAddableChartsAdded;
    const showAllAddedTip = hasParticipantData && allAddableChartsAdded;
    const button = (
        <button
            type="button"
            className={classes.addChartButton}
            disabled={disabled}
            onClick={openAddChartInline}
            aria-label={ariaLabel}
            title={showAllAddedTip ? ALL_CHARTS_ADDED_TOOLTIP : undefined}
        >
            ADD CHART <span aria-hidden>+</span>
        </button>
    );
    if (!showAllAddedTip) {
        return button;
    }
    return (
        <ToolTip
            maxWidth="280px"
            border="1px solid #598ac5"
            arrowBorder="1px solid #598AC5"
            title={<div>{ALL_CHARTS_ADDED_TOOLTIP}</div>}
            placement="top"
            arrow
            interactive
            arrowSize="24px"
        >
            <span style={{ display: 'inline-flex' }}>{button}</span>
        </ToolTip>
    );
}

/**
 * Chart summary: toolbar, Venn + survival top row, and histogram strip.
 */
export function CohortAnalyzerChartArea({
    classes,
    state,
    containerRef,
    canvasRef,
    selectedCohorts,
    hasParticipantData,
    survivalBesideTopRowUsesOrder,
    topRowOrder,
    besideDropTarget,
    besideColumnDropTargetStyle,
    handleBesideRowDragLeave,
    handleBesideColumnDragOver,
    handleBesidePanelDrop,
    survivalBesideDrag,
    besidePanelDragging,
    besidePanelDraggingRef,
    endBesidePanelDrag,
    survivalBesideVennEl,
    setSurvivalBesideVennEl,
    setSurvivalBesideColumnActive,
    inlineAddChartOpen,
    setInlineAddChartOpen,
    inlineAddChartNonce,
    setInlineAddChartNonce,
    resetVennWorkspaceUi,
}) {
    const dispatch = useDispatch();

    const chartSummaryExportRef = useRef(null);
    const histogramExportRef = useRef(null);
    const addChartScrollAnchorRef = useRef(null);

    const [expandedChart, setExpandedChart] = useState(null);
    const [chartModalActiveTab, setChartModalActiveTab] = useState('sexAtBirth');
    const [allAddableChartsAdded, setAllAddableChartsAdded] = useState(false);

    const handleExpandVennInChartModal = useCallback(() => {
        setExpandedChart(CA_EXPANDED_CHART_MODAL_TAB_VENN);
        setChartModalActiveTab(CA_EXPANDED_CHART_MODAL_TAB_VENN);
    }, []);

    const openAddChartInline = useCallback(() => {
        setInlineAddChartOpen(true);
        setInlineAddChartNonce((n) => n + 1);
    }, [setInlineAddChartOpen, setInlineAddChartNonce]);

    /** After opening the inline add panel, scroll so the histogram strip / footer is in view. */
    useEffect(() => {
        if (!inlineAddChartOpen || inlineAddChartNonce === 0) return undefined;
        let cancelled = false;
        const scrollToAddChart = () => {
            if (cancelled) return;
            const el = addChartScrollAnchorRef.current;
            if (el) {
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest',
                });
            }
        };
        const id1 = window.requestAnimationFrame(() => {
            window.requestAnimationFrame(scrollToAddChart);
        });
        return () => {
            cancelled = true;
            window.cancelAnimationFrame(id1);
        };
    }, [inlineAddChartOpen, inlineAddChartNonce]);

    const handleAllAddableChartsAddedChange = useCallback((allAdded) => {
        setAllAddableChartsAdded(Boolean(allAdded));
    }, []);

    const participantIds = (index) => {
        const id = selectedCohorts[index];
        if (!id || !state || !state[id]) return [];
        return state[id].participants.map((item) => (item.id ? item.id : item.participant.id));
    };

    const cohortName = (index) => {
        const id = selectedCohorts[index];
        return id && state && state[id] ? state[id].cohortName : '';
    };

    const vennColumnDragStyle = {
        ...(besidePanelDragging && besidePanelDragging.kind === 'survival'
            ? BESIDE_PEER_DRAG_STYLE
            : {}),
    };
    const survivalColumnDragStyle = {
        ...(besidePanelDragging && besidePanelDragging.kind === 'venn'
            ? BESIDE_PEER_DRAG_STYLE
            : {}),
    };

    const renderBesideColumnDropPreview = (columnId) => {
        if (
            besideDropTarget !== columnId
            || !besidePanelDragging
            || besidePanelDragging.kind === columnId
        ) {
            return null;
        }
        const h = besidePanelDragging.height;
        return (
            <div
                aria-hidden
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    minHeight: h,
                    height: h,
                    maxHeight: h,
                    flexShrink: 0,
                    alignSelf: 'stretch',
                    borderRadius: 10,
                    background: 'rgba(103, 154, 170, 0.12)',
                    outline: '2px dashed #679AAA',
                    outlineOffset: 0,
                    marginBottom: 10,
                    pointerEvents: 'none',
                }}
            />
        );
    };

    const getExportPayload = useCallback(() => {
        const histRef = histogramExportRef.current;
        const histogram =
            histRef && typeof histRef.getChartExportPayload === 'function'
                ? histRef.getChartExportPayload()
                : {};
        const cohortSummaries = selectedCohorts.map((id) => {
            const entry = state && state[id];
            return {
                cohortId: id,
                cohortName: entry && entry.cohortName ? entry.cohortName : id,
                participantIds:
                    entry && Array.isArray(entry.participants)
                        ? entry.participants.map((item) => (item.id ? item.id : item.participant.id))
                        : [],
            };
        });
        const nameAt = (index) => {
            const id = selectedCohorts[index];
            return id && state && state[id] ? state[id].cohortName : '';
        };
        return {
            exportedAt: new Date().toISOString(),
            cohortLabels: {
                c1: nameAt(0),
                c2: nameAt(1),
                c3: nameAt(2),
            },
            histogram,
            cohorts: cohortSummaries,
        };
    }, [state, selectedCohorts]);

    return (
        <>
            <div className={classes.chartTopControlRow}>
                <div className={classes.categoryPills}>
                    {['Reset View'].map((label) => (
                        <button
                            key={label}
                            type="button"
                            className={classes.categoryPillButton}
                            onClick={() => {
                                dispatch(resetCohortAnalyzerLayout());
                                dispatch(upsertPanelRegistry(buildDefaultCohortAnalyzerPanelRegistry()));
                                setInlineAddChartOpen(false);
                                resetVennWorkspaceUi();
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className={classes.chartActionButtons}>
                    <AddChartToolbarButton
                        classes={classes}
                        hasParticipantData={hasParticipantData}
                        allAddableChartsAdded={allAddableChartsAdded}
                        openAddChartInline={openAddChartInline}
                        ariaLabel="Add chart"
                    />
                    <CohortAnalyzerDownloadAllDropdown
                        classes={classes}
                        disabled={!hasParticipantData}
                        chartAreaRef={chartSummaryExportRef}
                        getExportPayload={getExportPayload}
                    />
                </div>
            </div>
            <div className={classes.chartSummaryMain} ref={chartSummaryExportRef}>
                {topRowOrder.length > 0 && (
                    <div
                        className={classes.vennSurvivalRow}
                        onDragLeave={handleBesideRowDragLeave}
                        style={
                            besidePanelDragging
                                ? { flexWrap: 'nowrap', alignContent: 'flex-start' }
                                : undefined
                        }
                    >
                        {topRowOrder.map((panel) => (
                            panel === 'venn' ? (
                                <div
                                    key="venn"
                                    className={classes.vennColumn}
                                    style={{
                                        ...vennColumnDragStyle,
                                        ...(besideDropTarget === 'venn' ? besideColumnDropTargetStyle || {} : {}),
                                    }}
                                    onDragOver={handleBesideColumnDragOver('venn')}
                                    onDrop={handleBesidePanelDrop('venn')}
                                >
                                    {renderBesideColumnDropPreview('venn')}
                                    <div className={classes.rightSideAnalyzerInnerContainer}>
                                        <div className={classes.rightSideAnalyzerHeader2} />
                                        <VennDiagramContainer
                                            state={state}
                                            containerRef={containerRef}
                                            canvasRef={canvasRef}
                                            classes={classes}
                                            besideCardDrag={undefined}
                                            besidePanelDragState={besidePanelDragging}
                                            chartModalOpen={expandedChart != null}
                                            chartModalActiveTab={chartModalActiveTab}
                                            onExpandVenn={handleExpandVennInChartModal}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key="survival"
                                    className={classes.survivalBesideVennColumn}
                                    style={{
                                        ...survivalColumnDragStyle,
                                        ...(besideDropTarget === 'survival' ? besideColumnDropTargetStyle || {} : {}),
                                    }}
                                    ref={setSurvivalBesideVennEl}
                                    onDragOver={handleBesideColumnDragOver('survival')}
                                    onDrop={handleBesidePanelDrop('survival')}
                                >
                                    {renderBesideColumnDropPreview('survival')}
                                </div>
                            )
                        ))}
                    </div>
                )}
                <Histogram
                    survivalBesideVennTarget={survivalBesideVennEl}
                    onSurvivalBesideColumnActive={setSurvivalBesideColumnActive}
                    besideCardDrag={survivalBesideDrag}
                    besidePanelDragState={besidePanelDragging}
                    besidePanelDraggingRef={besidePanelDraggingRef}
                    inlineAddChartOpen={inlineAddChartOpen}
                    onInlineAddChartClose={() => setInlineAddChartOpen(false)}
                    inlineAddChartNonce={inlineAddChartNonce}
                    c1={participantIds(0)}
                    c2={participantIds(1)}
                    c3={participantIds(2)}
                    c1Name={cohortName(0)}
                    c2Name={cohortName(1)}
                    c3Name={cohortName(2)}
                    chartModalExpandedChart={expandedChart}
                    setChartModalExpandedChart={setExpandedChart}
                    chartModalActiveTab={chartModalActiveTab}
                    setChartModalActiveTab={setChartModalActiveTab}
                    cohortParticipantState={state}
                    containerRef={containerRef}
                    canvasRef={canvasRef}
                                histogramExportRef={histogramExportRef}
                                onAllAddableChartsAddedChange={handleAllAddableChartsAddedChange}
                                onTopRowStripDropComplete={endBesidePanelDrag}
                                onExpandVenn={handleExpandVennInChartModal}
                            />
                <div
                    ref={addChartScrollAnchorRef}
                    className={classes.chartSummaryHistogramFooter}
                >
                    <AddChartToolbarButton
                        classes={classes}
                        hasParticipantData={hasParticipantData}
                        allAddableChartsAdded={allAddableChartsAdded}
                        openAddChartInline={openAddChartInline}
                        ariaLabel="Add chart below histograms"
                    />
                </div>
            </div>
        </>
    );
}
