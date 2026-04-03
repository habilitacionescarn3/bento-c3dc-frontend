import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import VennDiagramContainer from '../vennDiagram/VennDiagramContainer';
import Histogram from '../HistogramPanel/Histogram';
import { CA_EXPANDED_CHART_MODAL_TAB_VENN } from '../HistogramPanel/histogramConstants';
import {
    resetCohortAnalyzerLayout,
    upsertPanelRegistry,
} from '../store/cohortAnalyzerLayoutActions';
import { buildDefaultCohortAnalyzerPanelRegistry } from '../store/cohortAnalyzerDefaultPanelRegistry';

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
    vennHeaderGrab,
    vennBesideDrag,
    survivalBesideDrag,
    besidePanelDragging,
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

    const [expandedChart, setExpandedChart] = useState(null);
    const [chartModalActiveTab, setChartModalActiveTab] = useState('sexAtBirth');

    const handleExpandVennInChartModal = useCallback(() => {
        setExpandedChart(CA_EXPANDED_CHART_MODAL_TAB_VENN);
        setChartModalActiveTab(CA_EXPANDED_CHART_MODAL_TAB_VENN);
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
                    <button
                        type="button"
                        className={classes.addChartButton}
                        style={{ cursor: hasParticipantData ? 'pointer' : 'not-allowed' }}
                        disabled={!hasParticipantData}
                        onClick={() => {
                            setInlineAddChartOpen(true);
                            setInlineAddChartNonce((n) => n + 1);
                        }}
                    >
                        ADD CHART <span aria-hidden>+</span>
                    </button>
                    <button type="button" className={classes.downloadAllButton}>
                        DOWNLOAD ALL
                    </button>
                </div>
            </div>
            <div className={classes.chartSummaryMain}>
                <div
                    className={classes.vennSurvivalRow}
                    onDragLeave={handleBesideRowDragLeave}
                >
                    {!survivalBesideTopRowUsesOrder ? (
                        <>
                            <div
                                className={classes.vennColumn}
                                style={besideDropTarget === 'venn' ? besideColumnDropTargetStyle : undefined}
                                onDragOver={handleBesideColumnDragOver('venn')}
                                onDrop={handleBesidePanelDrop('venn')}
                            >
                                <div className={classes.rightSideAnalyzerInnerContainer}>
                                    <div className={classes.rightSideAnalyzerHeader2} />
                                    <VennDiagramContainer
                                        state={state}
                                        containerRef={containerRef}
                                        canvasRef={canvasRef}
                                        classes={classes}
                                        headerPrefix={vennHeaderGrab}
                                        besidePanelDragState={besidePanelDragging}
                                        chartModalOpen={expandedChart != null}
                                        chartModalActiveTab={chartModalActiveTab}
                                        onExpandVenn={handleExpandVennInChartModal}
                                    />
                                </div>
                            </div>
                            <div
                                className={classes.survivalBesideVennColumn}
                                style={besideDropTarget === 'survival' ? besideColumnDropTargetStyle : undefined}
                                ref={setSurvivalBesideVennEl}
                                onDragOver={handleBesideColumnDragOver('survival')}
                                onDrop={handleBesidePanelDrop('survival')}
                            />
                        </>
                    ) : (
                        topRowOrder.map((panel) => (
                            panel === 'venn' ? (
                                <div
                                    key="venn"
                                    className={classes.vennColumn}
                                    style={besideDropTarget === 'venn' ? besideColumnDropTargetStyle : undefined}
                                    onDragOver={handleBesideColumnDragOver('venn')}
                                    onDrop={handleBesidePanelDrop('venn')}
                                >
                                    <div className={classes.rightSideAnalyzerInnerContainer}>
                                        <div className={classes.rightSideAnalyzerHeader2} />
                                        <VennDiagramContainer
                                            state={state}
                                            containerRef={containerRef}
                                            canvasRef={canvasRef}
                                            classes={classes}
                                            headerPrefix={vennHeaderGrab}
                                            besideCardDrag={vennBesideDrag}
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
                                    style={besideDropTarget === 'survival' ? besideColumnDropTargetStyle : undefined}
                                    ref={setSurvivalBesideVennEl}
                                    onDragOver={handleBesideColumnDragOver('survival')}
                                    onDrop={handleBesidePanelDrop('survival')}
                                />
                            )
                        ))
                    )}
                </div>
                <Histogram
                    survivalBesideVennTarget={survivalBesideVennEl}
                    onSurvivalBesideColumnActive={setSurvivalBesideColumnActive}
                    besideCardDrag={survivalBesideDrag}
                    besidePanelDragState={besidePanelDragging}
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
                />
            </div>
        </>
    );
}
