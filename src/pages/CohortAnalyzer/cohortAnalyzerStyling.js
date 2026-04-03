import { makeStyles } from "@material-ui/core";
import {
    CA_SURVIVAL_CARD_MIN_WIDTH,
    CA_SURVIVAL_CARD_MIN_HEIGHT,
} from './store/cohortAnalyzerLayoutConstants';

export const useStyle = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
    },
    chartContainer: {
        backgroundColor: 'white',
        border: '1px solid #679AAA',
        borderRadius: '10px',
        boxShadow: '0 8px 18px rgba(29, 61, 73, 0.16)',
        flex: 1,
        display: 'flex',
        minHeight: 350,
        maxHeight: 620,
        minWidth: 500,
        flexDirection: 'column',
        overflow: 'hidden',
        marginLeft: 6,
        '& .App': {
            width: "95%",
            maxWidth: '95%',
            minWidth: '95%',
            height: "80%",
            padding: "24px 0px 36px 0px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            
            [theme.breakpoints.down('lg')]: { 
                minWidth: '80%'
            }
           
        },
        '& .chart-container': {
            width: '100%',
            height: "100%",
            
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            marginLeft: 0,      
        },
        [theme.breakpoints.down('lg')]: {
            alignItems: 'center',
            marginLeft: 0,
        }
    },
    chartVennPlaceholder: {
        width: 725,
        [theme.breakpoints.down('lg')]: {
            width: '100%',
        }
    },
    /** Venn card shell — matches design reference (light panel + gray border). */
    vennDiagramCard: {
        backgroundColor: '#E8FBFE',
        border: '2px solid #ADADAD',
        borderRadius: 9,
        boxShadow: 'none',
        flex: '0 0 auto',
        alignSelf: 'flex-start',
        maxHeight: 'none',
        minHeight: CA_SURVIVAL_CARD_MIN_HEIGHT,
        '& .cohort-analyzer-venn-resize::after': {
            borderBottomColor: '#5C5C5C',
        },
    },
    vennToolbarRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px 14px 10px 8px',
        boxSizing: 'border-box',
        borderBottom: '0.5px solid #ADADAD',
    },
    vennToolbarLeading: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        minWidth: 0,
    },
    vennToolbarTitle: {
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        fontSize: 18,
        lineHeight: 1.2,
        color: '#18677A',
        margin: 0,
        flexShrink: 0,
    },
    vennToolbarSpacer: {
        flex: 1,
        minWidth: 8,
    },
    vennToolbarTrailing: {
        alignSelf: 'center',
    },
    vennHeaderDivider: {
        height: 1,
        backgroundColor: '#ADADAD',
        margin: 0,
        flexShrink: 0,
    },
    vennSubHeader: {
        padding: '12px 16px 16px',
        flexShrink: 0,
        width: '100%',

    },
    vennSubHeaderPromptRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    vennSubHeaderPrompt: {
        margin: 0,
        fontSize: 16,
        fontFamily: 'Poppins',
        color: '#5C5C5C',
        lineHeight: 1.35,
    },
    vennChartRadioContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 16,
        padding: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        color: '#1C2B33',
        fontSize: 15,
        fontFamily: 'Poppins, sans-serif',
    },
    leftAlignedText: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 10,
        fontSize: 12,
        textAlign: 'start'
    },
    exploreButton: {
        boxSizing: 'border-box',
        minWidth: '189px',
        maxWidth: '189px',
        height: '41px',
        background: '#086C78',
        border: '1.25px solid #4EA1A1',
        borderRadius: '5px',
        color: 'white',
        fontWeight: '600',
        display: 'flex',
        flexDirection: 'row',
        gap: '6px',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: "pointer",
        fontFamily: 'Poppins',
    },
    exploreButtonFaded: {
        boxSizing: 'border-box',
        fontFamily: 'Poppins',
        minWidth: '189px',
        maxWidth: '189px',
        hight: '41px',
        background: '#BBC1C3',
        border: '1.25px solid #4EA1A1',
        borderRadius: '5px',
        color: 'white',
        fontWeight: '600',
        display: 'flex',
        flexDirection: 'row',
        gap: '6px',
        justifyContent: 'center',
        alignItems: 'center'
    },
    demoButton: {
        boxSizing: 'border-box',
        width: '197px',
        height: '29px',
        background: '#ECFAFC',
        border: '1.25px solid #375C67',
        borderRadius: '5px',
        color: '#375C67',
        fontFamily: 'Poppins',
        fontWeight: 600,
        fontSize: '12px',
        lineHeight: '12px',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    },
    demoButtonFaded: {
        boxSizing: 'border-box',
        width: '197px',
        height: '29px',
        background: '#F5F5F5',
        border: '1.25px solid #CCCCCC',
        borderRadius: '5px',
        color: '#999999',
        fontFamily: 'Poppins',
        fontWeight: 600,
        fontSize: '12px',
        lineHeight: '12px',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'not-allowed'
    },
    demoButtonContainer: {
        position: 'relative',
        marginLeft: '20px'
    },
    demoTooltipContent: {
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 13,
        margin: 0,
        textAlign: 'center',
        '& p': {
            margin: 0
        }
    },
    // Chart tooltip styles
    chartTooltipContainer: {
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    chartTooltipText: {
        margin: 0,
        fontFamily: 'Poppins',
        fontSize: '13px',
        fontWeight: 400,
        color: '#000000'
    },
    fieldsetReset: {
        all: 'unset',
        display: 'contents',
    },
    inputStyleContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        marginLeft: 15,
        '& img': {
            position: 'relative',
            right: 26,
            width: 14,
            height: 13
        }
    },
    cardContent: {
        fontFamily: 'Nunito',
        fontSize: '12px',
        fontWeight: 300,
        lineHeight: '16.37px',
        textAlign: 'left',
    },
    inputStyle: {
        fontFamily: 'Poppins',
        fontWeight: 300,
        fontSize: '15px',
        width: '349px',
        height: '26px',
        gap: '0px',
        borderRadius: '8px',
        margin: 'auto',
        marginLeft: '0px',
        paddingLeft: 13,
        border: '1px solid #8B98AF',
        textDecoration: 'none',
        "&::placeholder": {
            fontFamily: 'Poppins',
            color: '#5D7B87 !important'
        }
    },
    leftSideAnalyzer: {
        minWidth: 268,
        maxWidth: 268,
        height: 588,
        marginTop: 40,
        overflow: 'hidden',
        borderRadius: ' 0px 35px 35px 0px',
        border: '4px solid #4E8191',
        borderLeft: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    leftSideAnalyzerChild: {
        height: '90%',
        overflowY: 'scroll',
        '&::-webkit-scrollbar': {
            width: "2px"
        },
        '&::-webkit-scrollbar-thumb': {
            width: "2px",
            backgroundColor: '#003F74'
        },
        '&::-webkit-scrollbar-track': {
            background: '#4E8191',
        },
    },
    cohortSelectionChild: {
        display: 'flex',
        alignItems: 'start',
        width: '100%',
        '& span': {
            fontSize: 12,
            fontFamily: 'Poppins',
            fontWeight: 500
        }
    },
    cohortChildSelected: {
        width: '100%',
        height: 28,
        display: 'flex',
        marginBottom: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    CohortChild: {
        background: 'rgba(181, 221, 229, 0.4)',
        width: '100%',
        height: 28,
        display: 'flex',
        marginBottom: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:nth-child(even)': {
            background: 'rgba(165, 194, 200, 0.4)'
        },
        '& span': {
            color: 'black'
        },
        '& div img': {
            opacity: 1
        }
    },
    CohortChildOpacity: {
        background: 'rgba(181, 221, 229, 0.2)',
        width: '100%',
        height: 28,
        display: 'flex',
        marginBottom: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:nth-child(even)': {
            background: 'rgba(165, 194, 200, 0.2)'
        },
        '& span': {
            color: 'black'
        },
        '& div img': {
            opacity: 1
        }
    },
    CohortChildDisabled: {
        background: '#E2F1F5',
        width: '100%',
        height: 28,
        display: 'flex',
        marginBottom: 2,
        alignItems: 'center',
        opacity: 0.3,
        pointerEvents: 'auto',
        justifyContent: 'space-between',
        '&:nth-child(even)': {
            background: 'rgba(165, 194, 200, 0.4)'
        },
        '& span': {
            color: 'black'
        },
        '& div img': {
            opacity: 1
        }
    },
    sideHeader: {
        height: 125,
        fontFamily: 'Poppins',
        fontSize: 18.5,
        fontWeight: 500,
        color: '#000',
        letterSpacing: '-0.02em',
        textAlign: 'left',
        width: '100%',
        display: 'flex',
        paddingTop: 20,
        flexDirection: 'column',
        alignSelf: 'center',
        margin: 'auto',
        borderBottom: '1px solid #B0B0B0',
        paddingLeft: 20,
        justifyContent: 'flex-start',
        justifyItems: 'flex-start',
        '& img': {
            marginRight: 6.5,
        },
        '& p': {
            fontFamily: 'Open Sans',
            fontSize: 15,
            fontWeight: 400,
            color: 'black',
            padding: 0,
        }
    },
    sortSection: {
        height: 31,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        marginLeft: 20,
        '& p': {
            fontSize: 9
        }
    },
    cohortCountSection: {
        fontFamily: 'Poppins',
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: -0.02,
        textAlign: 'left',
        minHeight: 58.94,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        width: '100%',
        paddingBottom: 16,
        paddingTop: 16,
        paddingRight: 15,
        [theme.breakpoints.down('lg')]: {
            width: '100%'
        }
    },
    tableSectionOuterContainer: {
        width: '100%',
        border: '1px solid #679AAA',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    rightSideAnalyzer: {
        width: '100%',
        maxWidth: "100%",
        flex: 1,
        minWidth: 0,
        minHeight: 600,
        borderRadius: '35px',
        border: '4px solid #4E8191',
        paddingBottom: 30,
        margin: 100,
        marginLeft: 33,
        marginRight: 33,
        marginTop: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflowY: 'visible',
        overflowX: 'visible',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        [theme.breakpoints.down('lg')]: {
            alignItems: 'flex-start',
            overflowY: 'scroll',
            padding: '0 0 24px 0',
            height: '100%',
            minWidth: "0"
        }

    },
    gridLayoutContainer: {
        flex: 1,
        minWidth: 0,
        minHeight: 600,
        width: '100%',
        height: '100%',
    },
    gridItemWrapper: {
        overflow: 'auto',
        minHeight: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #679AAA',
        borderRadius: 10,
        padding: 8,
    },
    rightSideAnalyzerOuterContainer: {
        display: 'flex',
        marginBottom: 45,
        justifyContent: 'flex-start',
        width: "100%",
        marginTop: '16px',
        gap: 26,
        backgroundColor: '#EFF5FB',
        [theme.breakpoints.down('lg')]: {
            flexDirection: 'column',
            gap: 0,
            marginTop: '20px',         
        }
    },
    chartSummaryMain: {
        width: '100%',
        marginBottom: 45,
        marginTop: '16px'
      
    },
    vennSurvivalRow: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        gap: 26,
        width: '100%',
        minWidth: 0,
        overflowX: 'visible',
        overflowY: 'visible',
        /* Survival moves to the next row when Venn width + gap + survival min width exceed the row */
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
            flexWrap: 'nowrap',
            gap: 20,
        },
    },
    vennColumn: {
        flex: '0 1 auto',
        minWidth: 0,
        maxWidth: '100%',
    },
    survivalBesideVennColumn: {
        flex: `1 1 ${CA_SURVIVAL_CARD_MIN_WIDTH}px`,
        minWidth: CA_SURVIVAL_CARD_MIN_WIDTH,
        minHeight: CA_SURVIVAL_CARD_MIN_HEIGHT,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
    },
    rightSideAnalyzerInnerContainer: {
        display: 'flex',
        marginBottom: 0,
        flexDirection: "column",

    },
    rightSideAnalyzerHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        width: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        borderBottom: '2.5px solid #679AAA',
        maxHeight: '70px',
        "& h1": {
            fontFamily: 'Poppins',
            fontSize: '40px',
            fontWeight: 400,
            textAlign: 'left',
            color: '#0D3A3F',
            marginLeft: '30px',
            marginTop: '12px',
            marginBottom: '12px',

        }

    },
    readmeButton: {
        background: '#3E6069',
        color: '#FFFFFF',
        border: '1px solid #2A4951',
        borderRadius: 4,
        fontFamily: 'Poppins',
        fontSize: 11,
        fontWeight: 600,
        height: 30,
        minWidth: 115,
        marginRight: 30,
        cursor: 'pointer',
        letterSpacing: '0.02em',
    },
    summaryViewShell: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        width: '100%',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        paddingTop: 14,
        boxSizing: 'border-box',
    },
    summaryTabs: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        width: '100%',
        boxSizing: 'border-box',
        gap: 8,
        paddingLeft: 30,
        paddingRight: 30,
        borderBottom: '1px solid #BFC9CD',
        marginBottom: 0,
    },
    summaryTab: {
        flex: '0 0 auto',
        width: 'auto',
        border: '1px solid #BCBCBC',
        borderBottom: 'none',
        background: '#E8E8E8',
        color: '#1C2B33',
        fontFamily: 'Poppins',
        fontSize: 16,
        padding: '8px 16px',
        cursor: 'pointer',
        marginRight: 0,
        textAlign: 'left',
        whiteSpace: 'nowrap',
    },
    summaryTabActive: {
        background: '#FFFFFF',
        color: '#000000',
        borderTop: '3px solid #3E7D8E',
        fontWeight: 500,
    },
    summaryTabPanel: {
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: '100%',
        alignSelf: 'stretch',
        boxSizing: 'border-box',
        backgroundColor: '#EFF5FB',
        padding: '14px 30px 24px 30px',
        marginTop: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    chartTopControlRow: {
        /** Full-bleed top/bottom borders across the blue panel (cancel horizontal panel padding). */
        alignSelf: 'stretch',
        width: 'auto',
        marginLeft: -30,
        marginRight: -30,
        paddingLeft: 30,
        paddingRight: 30,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        gap: 10,
        flexWrap: 'wrap',
        paddingBottom: 10,
        borderBottom: '1px solid #4E8191',
        marginTop: -5,
    },
    categoryPills: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        
    },
    categoryPillButton: {
        border: '1px solid #95A4AA',
        borderRadius: 3,
        background: '#646464',
        fontFamily: 'Poppins',
        color: 'white',
        fontSize: 10.5,
        fontWeight: 500,
        lineHeight: '13px',
        padding: '4px 8px',
        letterSpacing: '0.01em',
        cursor: 'default',
    },
    chartActionButtons: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    addChartButton: {
        border: '1px solid #295665',
        borderRadius: 4,
        background: '#006A8F',
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        fontWeight: 600,
        fontSize: 12,
        height: 33,
        minWidth: 126,
        cursor: 'default',
        '& span': {
            fontSize: 16,
            marginLeft: 8,
            position: 'relative',
            top: 1,
        }
    },
    downloadAllButton: {
        border: '1px solid #2C4D59',
        borderRadius: 4,
        background: '#556469',
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        fontWeight: 600,
        fontSize: 11.5,
        height: 33,
        minWidth: 128,
        cursor: 'default',
        letterSpacing: '0.02em',
    },
    rightSideAnalyzerHeader2: {
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        minWidth: '30%',
        alignItems: 'flex-start',
        paddingBottom: 0,
        paddingTop: 0,
        backgroundColor: 'red',
        zIndex: 900,
        '& p': {
            fontFamily: 'Open Sans',
            fontSize: '15px',
            paddingBottom: 0,
            width: "100%",
            lineHeight: '20.8px',
            textAlign: 'left',
            color: 'black',
            margin: 1,
            marginTop: 0,
            marginLeft: '20px',
            [theme.breakpoints.down('lg')]: {
                width: '100%',
                marginLeft: 0,
            }
        }
    },
    alert: {
        position: 'absolute',
        top: 20,
        margin: 'auto'
    },
    catagoryCard: {
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 297,
        height: 194,
        marginLeft: 0,
        paddingBottom: 30,
        border: '1px solid #8B98AF',
        alignItems: 'center',
        alignContent: 'center',
        '& h3': {
            fontFamily: 'Poppins',
            fontSize: '18px',
            fontWeight: 400,
            textAlign: 'center',
            color: '#000',
        },
    },
    catagoryCardChildren: {
        width: '50%',
        minHeight: 75,
        alignSelf: 'center',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        color: '#5D7B87',

        '& p': {
            top: 325,
            gap: 9,
            fontSize: 14,
            fontFamily: 'Poppins',
            fontWeight: 300,
            lineHeight: 2,
            margin: 0,
            cursor: 'pointer',
            '& input': {
                cursor: 'pointer'
            }

        }
    },
    rightSideTableContainer: {
        width: '100%',
        maxHeight: 540,
        overflowY: 'scroll',
        borderTop: "3px #679AAA solid",
        '&::-webkit-scrollbar': {
            width: "6px"
        },
        '&::-webkit-scrollbar-thumb': {
            width: "6px",
            backgroundColor: '#003F74'
        },
        '&::-webkit-scrollbar-track': {
            background: '#CECECE',
        },

        [theme.breakpoints.down('lg')]: {
            width: '100%',
        }
    }
}))