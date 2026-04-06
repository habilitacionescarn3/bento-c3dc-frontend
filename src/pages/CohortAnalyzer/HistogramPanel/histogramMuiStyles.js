import { makeStyles } from '@material-ui/core';
import { HISTOGRAM_CHART_PLOT_MIN_VH } from './histogramConstants';

export const useHistogramPanelMuiStyles = makeStyles({
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
    minHeight: `${HISTOGRAM_CHART_PLOT_MIN_VH}vh`,
    flex: 1,
    height: 'auto',
  },
  headerCloseButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 4,
    color: '#1C2B33',
    lineHeight: 0,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
    '&:focus-visible': {
      outline: '2px solid #18677A',
      outlineOffset: 1,
    },
  },
});
