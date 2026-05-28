import { makeStyles } from "@material-ui/core";
import styled from "styled-components";


export const useStyle = makeStyles((theme) => ({
    cohortSelectorColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minWidth: 274,
        maxWidth: 274,
        flexShrink: 0,
    },
    sortCount: {
        display: 'flex',
        margin: 0,
        alignItems: 'center',
        marginRight: 25,
        cursor: 'pointer'
    },
    leftSideAnalyzer: {
        width: '100%',
        height: 400,
        marginTop: 40,
        overflow: 'hidden',
        borderRadius: ' 0px 35px 35px 0px',
        border: '4px solid #4E8191',
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',

    },
    leftSideAnalyzerChild: {
        flex: 1,
        minHeight: 0,
        overflowY: 'scroll',
        '&::-webkit-scrollbar': {
            width: "6px"
        },
        '&::-webkit-scrollbar-thumb': {
            width: "2px",
            backgroundColor: '#003F74'
        },
        '&::-webkit-scrollbar-track': {
            background: '#CECECE',
        },
    },
    cohortListFooter: {
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        flexDirection: 'column',
        padding: '12px 12px 0 0',
    },
    cohortListFooterButton: {
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        width: 'calc(100% - 12px)',
        minHeight: 56,
        padding: '10px 12px 10px 18px',
        margin: 0,
        marginLeft: 10,
        background: '#C9C9C9',
        border: 'none',
        borderRadius: '18px',
        cursor: 'pointer',
        flexShrink: 0,
        height: 90,
        textAlign: 'left',
        '&:hover': {
            background: '#BDBDBD',
        },
        '&:focus': {
            outline: '2px solid #4E8191',
            outlineOffset: '2px',
        },
    },
    cohortTutorialButtonLabel: {
        flex: 1,
        minWidth: 0,
        fontFamily: 'Open Sans',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.25,
        color: '#3D3D3D',
        letterSpacing: '0.01em',
        textAlign: 'left',
    },
    cohortTutorialPlayCircle: {
        flexShrink: 0,
        display: 'block',
        width: 49,
        height: 49,
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
        fontFamily: 'Poppins',
        fontSize: 18.5,
        fontWeight: 500,
        color: '#000',
        letterSpacing: '-0.02em',
        textAlign: 'left',
        width: '100%',
        display: 'flex',
        paddingTop: 32,
        flexDirection: 'column',
        alignSelf: 'center',
        margin: 'auto',
        borderBottom: '1px solid #B0B0B0',
        paddingLeft: 26,
        paddingBottom: 12,
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
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: 20,
        backgroundColor: '#F1F1F1',
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
        width: '90%',
        paddingBottom: 10,
        borderTop: '1.02px #8A7F7C solid'
    },
    cohortChildContent: {
        width: '95%',
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'black',
        '& div span': {
            color: 'black',
            fontFamily: 'Nunito',
            fontSize: 14,
            fontWeight: 300,
            textAlign: 'left',
        },
        '& img': {
            position: 'relative',
            zIndex: 10000,
        }
    },
    cardContent: {
        maxWidth: '160px',
        display: 'inline-block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
}))

  export const Wrapper = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  padding: 0px;
  margin-bottom: 0;
  justify-content: space-between;
`;

   export const CohortSelectionChild = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;

  & > span:first-child {
    font-family: Poppins;
    font-size: 18.5px;
    font-weight: 500;
  }

  & > span:last-child {
    font-size: 16px;
    font-weight: 400;
    padding-left: 4px;
    font-family: Poppins;

  }
`;

  export const TrashCanIcon = styled.img`
  opacity: ${(props) => (Object.keys(props.state).length === 0 ? 0.6 : 1)};
  cursor: ${(props) => (Object.keys(props.state).length === 0 ? 'not-allowed' : 'pointer')};
    position: relative;
    bottom: -2px;
    margin: 0;
    right: 13px;
`;

   export const Instructions = styled.p`
  font-size: 15px;
  padding: 0;
  margin: 0;
  margin-top: 13px;
  font-weight: 400;
  font-family: 'Open Sans';
  
`;

 export const InstructionsWrapper = styled.div`
padding-left: 0px;
`;

