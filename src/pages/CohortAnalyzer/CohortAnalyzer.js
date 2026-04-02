import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CohortStateContext } from "../../components/CohortSelectorState/CohortStateContext";
import { configColumn } from "../inventory/tabs/tableConfig/Column";
import { themeConfig } from "../studies/tableConfig/Theme";
import { onCreateNewCohort, onDeleteAllCohort, onDeleteSingleCohort } from "../../components/CohortSelectorState/store/action";
import { tableConfig, analyzer_tables } from "../../bento/cohortAnalyzerPageData";
import Stats from '../../components/Stats/GlobalStatsController';
import ConfirmationModal from "../../components/CohortModal/components/shared/ConfirmationModal";
import NavigateAwayModal from './navigateAwayModal';
import { CohortModalContext } from "../../components/CohortModal/CohortModalContext";
import CohortModal from "../../components/CohortModal/CohortModal";
import Alert from '@material-ui/lab/Alert';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { useGlobal } from "../../components/Global/GlobalProvider";
import questionIcon from "../../assets/icons/Question_icon_2.svg";
import { useStyle } from "./cohortAnalyzerStyling";
import { CohortAnalyzerTableSection } from "./CohortAnalyzerTableSection/CohortAnalyzerTableSection"
import {
    handlePopup,
    handleDelete,
    SearchBox,
    triggerNotification,
} from "./CohortAnalyzerUtil/CohortAnalyzerUtil";
import store from "../../store";
import { updateUploadData, updateUploadMetadata } from "@bento-core/local-find";
import { CohortSelector } from "./CohortSelector/CohortSelector";
import { useCohortAnalyzer } from "./CohortAnalyzerContext";
import VennDiagramContainer from "./vennDiagram/VennDiagramContainer";
import Histogram from "./HistogramPanel/Histogram";
import { getJoinedCohortData } from "./CohortAnalyzerUtil/CohortDataTransform";
import { exampleCohorts, getExampleCohortKeys } from "../../bento/exampleCohortData";
import { exportToCCDIHub } from "../../components/CohortModal/utils";
import {
    setTopRowPanelOrder,
    setBesideStripPanelId,
    setStripOrder,
    resetCohortAnalyzerLayout,
    upsertPanelRegistry,
} from './store/cohortAnalyzerLayoutActions';
import { buildDefaultCohortAnalyzerPanelRegistry } from './store/cohortAnalyzerDefaultPanelRegistry';
import {
    encodePanelDragPayload,
    parseDragDataTransfer,
    CA_PANEL_DRAG_MIME,
} from './store/panelDnD';

export const CohortAnalyzer = () => {
    const dispatch = useDispatch();
    const topRowOrder = useSelector((s) => s.cohortAnalyzerLayout.topRowOrder);
    const survivalBesideFromSelection = useSelector(
        (s) => s.cohortAnalyzerLayout.uiFlags.survivalBesideFromSelection,
    );
    const stripOrder = useSelector((s) => s.cohortAnalyzerLayout.stripOrder);

    const [activeView, setActiveView] = useState("chart");
    const [inlineAddChartOpen, setInlineAddChartOpen] = useState(false);
    const [inlineAddChartNonce, setInlineAddChartNonce] = useState(0);
    const [survivalBesideVennEl, setSurvivalBesideVennEl] = useState(null);
    const [survivalBesideColumnActive, setSurvivalBesideColumnActive] = useState(false);
    //context
    const cohortAnalyzerContext = useCohortAnalyzer();
    const { resetVennWorkspaceUi } = cohortAnalyzerContext;
    // Cohort selection and list management
    const {
        selectedCohorts,
        setSelectedCohorts,
        cohortList,
        setCohortList,
        nodeIndex,
    } = cohortAnalyzerContext;
    // Cohort data and general info
    const {
        cohortData,
        setCohortData,
        generalInfo,
        setGeneralInfo,
    } = cohortAnalyzerContext;
    // Row data and table refresh
    const {
        rowData,
        setRowData,
        setRefreshTableContent,
    } = cohortAnalyzerContext;
    // Search and query
    const {
        searchValue,
        setSearchValue,
        setQueryVariable,
    } = cohortAnalyzerContext;
    // Chart and cohort section selection
    const {
        selectedChart,
        selectedCohortSection,
        setSelectedCohortSections,
    } = cohortAnalyzerContext;
    // Modal and alert handling
    const {
        setDeleteInfo,
        deleteInfo,
        handleCheckbox,
        showNavigateAwayModal,
        setShowNavigateAwayModal,
        setAlert,
        alert,
    } = cohortAnalyzerContext;

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const classes = useStyle();
    const { state, dispatch: cohortDispatch } = useContext(CohortStateContext);
    const hasParticipantData = useMemo(() => {
        if (!state || !Array.isArray(selectedCohorts)) return false;
        return selectedCohorts.some(
            (id) => state[id] && Array.isArray(state[id].participants) && state[id].participants.length > 0,
        );
    }, [state, selectedCohorts]);
    const { setShowCohortModal, showCohortModal, setCurrentCohortChanges, setWarningMessage, warningMessage } = useContext(CohortModalContext);
    const { Notification } = useGlobal();
    const navigate = useNavigate();
    const cohortAnalyzerThemeConfig = {
        ...themeConfig, tblHeader: {
            ...themeConfig.tblHeader, 
            MuiTableRow: {
                head: {
                    height: '40px',
                    borderTop: '3px solid #679AAA',
                    borderBottom: '1px solid #000000',
                },
            },
        },
        tblBody: {
            ...themeConfig.tblBody,
            MuiTableCell: {
                ...themeConfig.tblBody.MuiTableCell,
                body: {
                    ...themeConfig.tblBody.MuiTableCell.body,
                    '&:first-of-type': {
                        color: '#004C73',
                        textDecoration: 'underline',
                    },
                }

            },
        },
    };
   
    const handleUserRedirect = () => {
        // NOTE: If needed to show in only Autocomplete of Localfind.
        // const data = rowData.map(r=>({type: 'participantIds', title: r.participant_id}))
        // store.dispatch(updateAutocompleteData(data));
        // navigate('/explore');

        const upload = rowData.map(r => ({ participant_id: r.participant_id, study_id: r.dbgap_accession }));
        const uploadMetadata = {
            filename: "",
            fileContent: upload.map(p => p.participant_id).join(","),
            matched: upload,
            unmatched: [],
        };

        store.dispatch(updateUploadData(upload));
        store.dispatch(updateUploadMetadata(uploadMetadata));
        navigate('/explore');
    }

    const handleBuildInExplore = () => {
        const hideModal = localStorage.getItem('hideNavigateModal') === 'true';
        if (hideModal) {
            handleUserRedirect(); // skip modal
        } else {
            setShowNavigateAwayModal(true); // show modal
        }
    }

    const handleExportToCCDIHub = async () => {
        // Use centralized export function with Cohort Analyzer context
        await exportToCCDIHub(rowData, {
            showAlert: (type, message) => {
                // Convert to Cohort Analyzer's notification system
                if (type === 'success') {
                    Notification.show(message, 3000);
                } else if (type === 'error' || type === 'warning') {
                    Notification.show(message, 5000);
                }
            },
            useInteropService: true
        });
    }

    const searchRef = useRef();

    const handleSearchValue = (e) => {
        setSearchValue(e.target.value)


        if (searchRef.current) {
            searchRef.current.value = e.target.value;
            if (searchRef.current.value === "") {

                setTimeout(() => {
                    searchRef.current.focus();
                }, 200);

            }
        }

    }

    async function getJoinedCohort(isReset = false) {
        await getJoinedCohortData({
            nodeIndex,
            selectedCohorts,
            state,
            generalInfo,
            searchValue,
            isReset,
            setQueryVariable,
            setRowData,
            location,
            setCohortData
        });
    }

    const location = useLocation();

    useEffect(() => {
        if (location) {
            const viewCohort = location && location.state ? location.state.cohort : null;
            if (viewCohort) {
                handleCheckbox(viewCohort.cohortId, null);
            }
        }

    }, [location]);

    useEffect(() => {
        if (alert.message) {
            const timer = setTimeout(() => {
                setAlert({ type: '', message: '' });
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        setSearchValue("");
        if (searchRef.current) {
            searchRef.current.value = "";
        }

    }, [selectedChart])

    useEffect(() => {
        if (selectedChart.length >= 0) {
            getJoinedCohort();
        }


        if (nodeIndex === 0 || nodeIndex === 1 || nodeIndex === 2) {
            let finalVennSelection = [];
            selectedCohortSection.forEach((section) => {
                if (section.split(" ∩ ").length > 1) {
                    let validCohorts = [];
                    section.split(" ∩ ").forEach((sec, index) => {
                        const regex = /(.*?)(?= \(\d+\))/;
                        const match = sec.match(regex);
                        if (selectedCohorts.includes(match[1])) {
                            validCohorts.push(sec);
                        }
                    })

                    if (validCohorts.length > 0) {
                        finalVennSelection.push(validCohorts.join(" ∩ "))
                    }
                } else {
                    const regex = /(.*?)(?= \(\d+\))/;
                    const match = section.match(regex);
                    if (match) {
                        if (selectedCohorts.includes(match[1])) {
                            finalVennSelection.push(section)
                        }
                    }

                }

            })
            setSelectedCohortSections(finalVennSelection);

        }


        if (selectedCohorts.length === 0) {
            setGeneralInfo({});
            if (location && location.state && location.state.cohort && location.state.cohort.cohortId) {

            } else {
                setRowData([]);
            }

        }
    }, [selectedCohorts, selectedChart]);

    useEffect(() => {
        getJoinedCohort();
    }, [searchValue])

    useEffect(() => {
        getJoinedCohort();
    }, [generalInfo])

    useEffect(() => {

        setSelectedCohortSections([]);
        setGeneralInfo({})
        setSearchValue("");
        if (searchRef.current) {
            searchRef.current.value = "";
        }
        getJoinedCohort(true);

    }, [nodeIndex])

    useEffect(() => {
        setRefreshTableContent(false)
        setTimeout(() => setRefreshTableContent(true), 0)
    }, [cohortList, nodeIndex, cohortData])

    const handleClick = () => {
        if (selectedCohortSection.length > 0 && rowData.length > 0) {

            setCurrentCohortChanges(null);
            cohortDispatch(onCreateNewCohort(
                "",
                "",
                rowData,
                (count) => {
                    triggerNotification(count, Notification);
                    setShowCohortModal(true);
                },
                (error) => {
                    setWarningMessage(error.toString().replace("Error:", ""));
                }
            ));
        }
    };

    const handleDemoClick = () => {
        // First, clear any existing example cohorts from the state
        const exampleCohortKeys = getExampleCohortKeys();

        // Remove existing example cohorts from selected cohorts
        setSelectedCohorts(prev => prev.filter(cohortId => !exampleCohortKeys.includes(cohortId)));

        // Delete existing example cohorts from state
        exampleCohortKeys.forEach(cohortId => {
            if (state[cohortId]) {
                cohortDispatch(onDeleteSingleCohort(cohortId));
            }
        });

        // Check if adding 3 example cohorts would exceed the 20-cohort limit
        // Only count non-example cohorts since example cohorts will be cleared/replaced
        const nonExampleCohorts = Object.keys(state).filter(key => !exampleCohortKeys.includes(key));
        if (nonExampleCohorts.length > 17) {
            Notification.show('Cannot add example cohorts. You have reached the maximum limit of 20 cohorts. Please delete some cohorts first.', 5000);
            return;
        }

        let successCount = 0;
        const totalCohorts = exampleCohorts.length;


        const handleExampleSuccess = (count) => {
            successCount++;
            if (successCount === totalCohorts) {
                // Auto-select the newly created example cohorts
                setSelectedCohorts(getExampleCohortKeys());
                Notification.show(`Successfully created and selected ${totalCohorts} example cohorts! View the results in the Venn diagram and histogram below.`, 7000);
            }
        };

        const handleExampleError = (error) => {
            Notification.show(`Failed to create example cohorts: ${error.message}`, 5000);
        };

        // Create each example cohort
        exampleCohorts.forEach(cohort => {
            cohortDispatch(onCreateNewCohort(
                cohort.cohortId,
                cohort.cohortDescription,
                cohort.participants,
                handleExampleSuccess,
                handleExampleError
            ));
        });
    };

    const getTableMessage = (cohortList, selectedCohortSection, tableConfig) => {
        if (cohortList.length === 0) {
            return { noMatch: 'To proceed, please create your cohort by visiting the Explore Page.' };
        }
        if (selectedCohortSection.length === 0) {
            return tableConfig.tableMsg;
        }
        return { noMatch: "No data available for the selected segment/segments. Please try a different segment/segments." };
    };

    const initTblState = (initailState) => ({
        ...initailState,
        title: analyzer_tables[nodeIndex].name,
        query: analyzer_tables[nodeIndex].api,
        downloadButtonTooltipText: "Download data in CSV or JSON format",
        paginationAPIField: analyzer_tables[nodeIndex].paginationAPIField,
        dataKey: analyzer_tables[nodeIndex].dataKey,
        hiddenDataKeys: analyzer_tables[nodeIndex].hiddenDataKeys,
        columns: configColumn(analyzer_tables[nodeIndex].columns),
        count: 3,
        selectedRows: [],
        hiddenSelectedRows: [],
        enableRowSelection: analyzer_tables[nodeIndex].enableRowSelection,
        sortBy: tableConfig.defaultSortField,
        sortOrder: tableConfig.defaultSortDirection,
        extendedViewConfig: tableConfig.extendedViewConfig,
        paginationCustomStyle: {
            topPagination: {
                display: 'flex',
                borderTop: 'none',
                paddingRight: '41px',
            }
        },
        rowsPerPage: 10,
        page: 0,
        onPageChange: (somevalue) => alert("ok ok"),
        downloadFileName: "download",
        SearchBox: () => SearchBox(classes, handleSearchValue, searchValue, searchRef),
        showSearchBox: true,
        tableMsg: getTableMessage(cohortList, selectedCohortSection, tableConfig)
    });

    /** Portal + survival target ready — enable native drag handles for Venn ↔ survival swap. */
    const besidePanelDragEnabled = survivalBesideColumnActive;
    /** Survival chart is on — top row follows Redux `topRowOrder` (not fixed Venn-first layout). */
    const survivalBesideTopRowUsesOrder = survivalBesideFromSelection;

    const besidePanelDraggingRef = useRef(null);
    const [besidePanelDragging, setBesidePanelDragging] = useState(null);
    const [besideDropTarget, setBesideDropTarget] = useState(null);

    const besideColumnDropTargetStyle =
        besideDropTarget && besidePanelDragging && besidePanelDragging.kind !== besideDropTarget
            ? { outline: '2px solid #679AAA', outlineOffset: 4, borderRadius: 10, transition: 'outline 0.12s ease' }
            : undefined;

    const handleBesidePanelDragStart = (e, panelId) => {
        const payload = encodePanelDragPayload({ kind: panelId, dataset: null });
        e.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
        e.dataTransfer.setData('text/plain', panelId);
        e.dataTransfer.effectAllowed = 'move';
        if (typeof document === 'undefined') return;
        const domId = panelId === 'venn' ? 'cohort-analyzer-venn-card' : 'cohort-analyzer-survival-beside-card';
        const el = document.getElementById(domId);
        if (el && typeof el.getBoundingClientRect === 'function') {
            const r = el.getBoundingClientRect();
            const dragState = {
                kind: panelId,
                width: Math.round(r.width),
                height: Math.round(r.height),
            };
            besidePanelDraggingRef.current = dragState;
            setBesidePanelDragging(dragState);
            e.dataTransfer.setDragImage(el, 32, 20);
        } else {
            const dragState = { kind: panelId, width: 400, height: 380 };
            besidePanelDraggingRef.current = dragState;
            setBesidePanelDragging(dragState);
        }
    };

    const handleBesidePanelDragEnd = () => {
        besidePanelDraggingRef.current = null;
        setBesidePanelDragging(null);
        setBesideDropTarget(null);
    };

    const handleBesideColumnDragOver = (columnId) => (e) => {
        handleBesidePanelDragOver(e);
        const d = besidePanelDraggingRef.current;
        if (!d) return;
        if (d.kind === columnId) {
            setBesideDropTarget(null);
            return;
        }
        setBesideDropTarget(columnId);
    };

    const handleBesideRowDragLeave = (e) => {
        if (!besidePanelDraggingRef.current) return;
        const rel = e.relatedTarget;
        if (rel && e.currentTarget.contains(rel)) return;
        setBesideDropTarget(null);
    };

    const promoteHistogramToBesideSlot = (dataset) => {
        if (!dataset || dataset === 'survivalAnalysis') return;
        const order = [...stripOrder];
        if (order.length > 0) {
            const idx = order.indexOf(dataset);
            if (idx >= 0) {
                order.splice(idx, 1);
                order.unshift(dataset);
                dispatch(setStripOrder(order));
            }
        }
        dispatch(setBesideStripPanelId(dataset));
    };

    const handleBesidePanelDrop = (targetPanelId) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parsed = parseDragDataTransfer(e.dataTransfer);
        if (!parsed) return;

        if (parsed.kind === 'histogram' && parsed.dataset) {
            if (!survivalBesideFromSelection) {
                promoteHistogramToBesideSlot(parsed.dataset);
            }
            return;
        }

        const from = parsed.kind === 'venn' || parsed.kind === 'survival' ? parsed.kind : null;
        if (from && (from === 'venn' || from === 'survival') && from !== targetPanelId) {
            const order = [...topRowOrder];
            const i = order.indexOf(from);
            const j = order.indexOf(targetPanelId);
            if (i < 0 || j < 0) return;
            const tmp = order[i];
            order[i] = order[j];
            order[j] = tmp;
            dispatch(setTopRowPanelOrder(order));
        }
    };

    const handleBesidePanelDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const vennHeaderGrab = (
        <span
            aria-hidden={!besidePanelDragEnabled}
            title={besidePanelDragEnabled ? 'Drag to swap position with survival chart' : undefined}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'center',
                cursor: besidePanelDragEnabled ? 'grab' : 'default',
                opacity: besidePanelDragEnabled ? 1 : 0.55,
            }}
        >
            <DragIndicatorIcon style={{ color: '#5C5C5C' }} fontSize="small" />
        </span>
    );

    const vennBesideDrag = besidePanelDragEnabled
        ? {
            id: 'cohort-analyzer-venn-card',
            draggable: true,
            onDragStart: (e) => handleBesidePanelDragStart(e, 'venn'),
            onDragEnd: handleBesidePanelDragEnd,
        }
        : undefined;

    const survivalBesideDrag = besidePanelDragEnabled
        ? {
            id: 'cohort-analyzer-survival-beside-card',
            draggable: true,
            onDragStart: (e) => handleBesidePanelDragStart(e, 'survival'),
            onDragEnd: handleBesidePanelDragEnd,
        }
        : undefined;

    return (
        <>
            <NavigateAwayModal
                open={showNavigateAwayModal}
                setOpen={setShowNavigateAwayModal}
                onConfirm={handleUserRedirect}
            />
            <ConfirmationModal
                classes={""}
                open={deleteInfo.showDeleteConfirmation}
                setOpen={() => { handlePopup("", state, setDeleteInfo, deleteInfo) }}
                handleConfirm={() => {
                    handleDelete(deleteInfo.cohortId,
                        setCohortList,
                        setSelectedCohorts,
                        cohortDispatch,
                        onDeleteSingleCohort,
                        onDeleteAllCohort,
                        setGeneralInfo,
                        setRowData)
                }}
                deletionType={deleteInfo.deleteType}
            />

            <ConfirmationModal
                classes={""}
                open={warningMessage}
                setOpen={() => { setWarningMessage("") }}
                handleConfirm={() => { setWarningMessage("") }}
                deletionType={false}
                message={warningMessage}
            />

            <CohortModal
                open={showCohortModal}
                onCloseModal={() => setShowCohortModal(false)}
            />
            <Stats />
            <div className={classes.container}  >

                <CohortSelector
                    handleDemoClick={handleDemoClick}
                />
                <div className={classes.rightSideAnalyzer}>
                    {alert.message && (
                        <Alert severity={alert.type} className={classes.alert} onClose={() => setAlert({ type: '', message: '' })}>
                            {alert.message}
                        </Alert>
                    )}
                    <div className={classes.rightSideAnalyzerHeader} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Cohort Analyzer</h1>
                        <button className={classes.readmeButton}>README</button>
                    </div>

                    <div className={classes.summaryViewShell}>
                        <div className={classes.summaryTabs}>
                                <button
                                    type="button"
                                    className={`${classes.summaryTab} ${activeView === "chart" ? classes.summaryTabActive : ""}`}
                                    onClick={() => setActiveView("chart")}
                                >
                                    Chart Summary View
                                </button>
                                <button
                                    type="button"
                                    className={`${classes.summaryTab} ${activeView === "table" ? classes.summaryTabActive : ""}`}
                                    onClick={() => setActiveView("table")}
                                >
                                    Table View
                                </button>
                        </div>
                        <div className={classes.summaryTabPanel}>
                            {activeView === "chart" && (
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
                                                    ADD CHART <span>+</span>
                                                </button>
                                                <button type="button" className={classes.downloadAllButton}>DOWNLOAD ALL</button>
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
                                                c1={selectedCohorts[0] && state && state[selectedCohorts[0]] ? state[selectedCohorts[0]].participants.map((item) => item.id ? item.id : item.participant.id) : []}
                                                c2={selectedCohorts[1] && state && state[selectedCohorts[1]] ? state[selectedCohorts[1]].participants.map((item) => item.id ? item.id : item.participant.id) : []}
                                                c3={selectedCohorts[2] && state && state[selectedCohorts[2]] ? state[selectedCohorts[2]].participants.map((item) => item.id ? item.id : item.participant.id) : []}
                                                c1Name={selectedCohorts[0] && state && state[selectedCohorts[0]] ? state[selectedCohorts[0]].cohortName : ''}
                                                c2Name={selectedCohorts[1] && state && state[selectedCohorts[1]] ? state[selectedCohorts[1]].cohortName : ''}
                                                c3Name={selectedCohorts[2] && state && state[selectedCohorts[2]] ? state[selectedCohorts[2]].cohortName : ''}
                                            />
                                        </div>
                                    </>
                            )}
                            {activeView === "table" && (
                                    <CohortAnalyzerTableSection
                                        classes={classes}
                                        selectedCohortSection={selectedCohortSection}
                                        questionIcon={questionIcon}
                                        handleClick={handleClick}
                                        handleBuildInExplore={handleBuildInExplore}
                                        handleExportToCCDIHub={handleExportToCCDIHub}
                                        initTblState={initTblState}
                                        themeConfig={cohortAnalyzerThemeConfig}
                                    />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

