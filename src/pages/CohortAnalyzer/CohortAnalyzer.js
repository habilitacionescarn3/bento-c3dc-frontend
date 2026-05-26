import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CohortStateContext } from "../../components/CohortSelectorState/CohortStateContext";
import { configColumn } from "../inventory/tabs/tableConfig/Column";
import { onCreateNewCohort, onDeleteAllCohort, onDeleteSingleCohort } from "../../components/CohortSelectorState/store/action";
import { tableConfig, analyzer_tables } from "../../bento/cohortAnalyzerPageData";
import Stats from '../../components/Stats/GlobalStatsController';
import ConfirmationModal from "../../components/CohortModal/components/shared/ConfirmationModal";
import NavigateAwayModal from './components/navigateAwayModal';
import { CohortModalContext } from "../../components/CohortModal/CohortModalContext";
import CohortModal from "../../components/CohortModal/CohortModal";
import Alert from '@material-ui/lab/Alert';
import { useGlobal } from "../../components/Global/GlobalProvider";
import questionIcon from "../../assets/icons/Question_icon_2.svg";
import { useStyle } from './styling/cohortAnalyzerStyling';
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
import { useCohortAnalyzer } from './context/CohortAnalyzerContext';
import { cohortAnalyzerThemeConfig } from './styling/cohortAnalyzerThemeConfig';
import { useBesidePanelDnD } from './hooks/useBesidePanelDnD';
import { CohortAnalyzerChartArea } from './components/CohortAnalyzerChartArea';
import { CohortAnalyzerSummaryView } from './components/CohortAnalyzerSummaryView';
import { getJoinedCohortData } from "./CohortAnalyzerUtil/CohortDataTransform";
import { exampleCohorts, getExampleCohortKeys } from "../../bento/exampleCohortData";
import { useUserGuide } from '../inventory/sideBar/UserGuideContext';
import { USER_GUIDE_SECTION_ANALYZING_COHORTS } from '../inventory/sideBar/userGuideConstants';
import {
    computeHasParticipantData,
    getCohortAnalyzerTableMessage,
    filterVennSectionsForSelectedCohorts,
    shouldClearRowDataOnEmptySelection,
    canAddExampleCohorts,
    buildExploreUploadPayload,
    shouldSkipNavigateAwayModal,
} from './cohortAnalyzerPageLogic';

export const CohortAnalyzer = () => {
    const { openUserGuide } = useUserGuide();
    const topRowOrder = useSelector((s) => s.cohortAnalyzerLayout.topRowOrder);

    const [activeView, setActiveView] = useState("chart");
    const [inlineAddChartOpen, setInlineAddChartOpen] = useState(false);
    const [inlineAddChartNonce, setInlineAddChartNonce] = useState(0);
    const [survivalBesideVennEl, setSurvivalBesideVennEl] = useState(null);
    const [survivalBesideColumnActive, setSurvivalBesideColumnActive] = useState(false);
    const {
        resetVennWorkspaceUi,
        selectedCohorts,
        setSelectedCohorts,
        cohortList,
        setCohortList,
        nodeIndex,
        cohortData,
        setCohortData,
        generalInfo,
        setGeneralInfo,
        rowData,
        setRowData,
        setRefreshTableContent,
        searchValue,
        setSearchValue,
        setQueryVariable,
        selectedChart,
        selectedCohortSection,
        setSelectedCohortSections,
        setDeleteInfo,
        deleteInfo,
        handleCheckbox,
        showNavigateAwayModal,
        setShowNavigateAwayModal,
        setAlert,
        alert,
    } = useCohortAnalyzer();

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const classes = useStyle();
    const { state, dispatch: cohortDispatch } = useContext(CohortStateContext);
    const hasParticipantData = useMemo(
        () => computeHasParticipantData(state, selectedCohorts),
        [state, selectedCohorts],
    );
    const { setShowCohortModal, showCohortModal, setCurrentCohortChanges, setWarningMessage, warningMessage } = useContext(CohortModalContext);
    const { Notification } = useGlobal();
    const navigate = useNavigate();
    const handleUserRedirect = () => {
        // NOTE: If needed to show in only Autocomplete of Localfind.
        // const data = rowData.map(r=>({type: 'participantIds', title: r.participant_id}))
        // store.dispatch(updateAutocompleteData(data));
        // navigate('/explore');

        const { upload, uploadMetadata } = buildExploreUploadPayload(rowData);

        store.dispatch(updateUploadData(upload));
        store.dispatch(updateUploadMetadata(uploadMetadata));
        navigate('/explore');
    }

    const handleBuildInExplore = () => {
        if (shouldSkipNavigateAwayModal()) {
            handleUserRedirect(); // skip modal
        } else {
            setShowNavigateAwayModal(true); // show modal
        }
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


        setSelectedCohortSections(
            filterVennSectionsForSelectedCohorts(
                selectedCohortSection,
                selectedCohorts,
                nodeIndex,
            ),
        );

        if (selectedCohorts.length === 0) {
            setGeneralInfo({});
            if (shouldClearRowDataOnEmptySelection(selectedCohorts, location)) {
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
        if (!canAddExampleCohorts(state, exampleCohortKeys)) {
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
        tableMsg: getCohortAnalyzerTableMessage(cohortList, selectedCohortSection, tableConfig)
    });

    const besideDnD = useBesidePanelDnD(survivalBesideColumnActive);

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
                    <div className={classes.rightSideAnalyzerHeader}>
                        <h1>Cohort Analyzer</h1>
                    </div>

                    <CohortAnalyzerSummaryView
                        classes={classes}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        summaryTrailingActions={(
                            <button
                                type="button"
                                className={classes.readmeButton}
                                onClick={() => openUserGuide(USER_GUIDE_SECTION_ANALYZING_COHORTS)}
                            >
                                README
                            </button>
                        )}
                        chartPanel={(
                            <CohortAnalyzerChartArea
                                classes={classes}
                                state={state}
                                containerRef={containerRef}
                                canvasRef={canvasRef}
                                selectedCohorts={selectedCohorts}
                                hasParticipantData={hasParticipantData}
                                survivalBesideTopRowUsesOrder={besideDnD.survivalBesideTopRowUsesOrder}
                                topRowOrder={topRowOrder}
                                besideDropTarget={besideDnD.besideDropTarget}
                                besideColumnDropTargetStyle={besideDnD.besideColumnDropTargetStyle}
                                handleBesideRowDragLeave={besideDnD.handleBesideRowDragLeave}
                                handleBesideColumnDragOver={besideDnD.handleBesideColumnDragOver}
                                handleBesidePanelDrop={besideDnD.handleBesidePanelDrop}
                                survivalBesideDrag={besideDnD.survivalBesideDrag}
                                besidePanelDragging={besideDnD.besidePanelDragging}
                                besidePanelDraggingRef={besideDnD.besidePanelDraggingRef}
                                endBesidePanelDrag={besideDnD.endBesidePanelDrag}
                                survivalBesideVennEl={survivalBesideVennEl}
                                setSurvivalBesideVennEl={setSurvivalBesideVennEl}
                                setSurvivalBesideColumnActive={setSurvivalBesideColumnActive}
                                inlineAddChartOpen={inlineAddChartOpen}
                                setInlineAddChartOpen={setInlineAddChartOpen}
                                inlineAddChartNonce={inlineAddChartNonce}
                                setInlineAddChartNonce={setInlineAddChartNonce}
                                resetVennWorkspaceUi={resetVennWorkspaceUi}
                            />
                        )}
                        tablePanel={(
                            <CohortAnalyzerTableSection
                                classes={classes}
                                selectedCohortSection={selectedCohortSection}
                                questionIcon={questionIcon}
                                handleClick={handleClick}
                                handleBuildInExplore={handleBuildInExplore}
                                initTblState={initTblState}
                                themeConfig={cohortAnalyzerThemeConfig}
                            />
                        )}
                    />
                </div>
            </div>
        </>
    )
}

