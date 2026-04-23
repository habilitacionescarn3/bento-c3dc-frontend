import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { ADD_CHART_DATA_TYPES, isAddChartDataTypeOnStrip } from '../config/cohortAnalyzerChartCatalog';
import { ChartTypeSelectIcon, CHART_TYPE_OPTIONS } from '../HistogramPanel/chart/HistogramChartTypeIcons';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
    width: '100%',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    margin: '0 0 8px',
  },
  header: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: '#5C5C5C',
    margin: 0,
  },
  closeButton: {
    flexShrink: 0,
    margin: 0,
    padding: '2px 6px',
    border: 'none',
    borderRadius: 4,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 18,
    lineHeight: 1,
    color: '#5C5C5C',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.06)',
    },
  },
  divider: {
    height: 1,
    background: '#ADADAD',
    margin: '0 0 10px',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 4px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
    color: '#1C2B33',
    cursor: 'pointer',
    borderBottom: '1px solid #EFEFEF',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  /** Unavailable / not wired — entire row reads as disabled. */
  listItemDisabled: {
    cursor: 'not-allowed',
    color: '#9E9E9E',
    opacity: 0.5,
    filter: 'grayscale(1)',
    pointerEvents: 'none',
  },
  /** Addable in catalog but already on layout — only the primary label is muted; status text stays readable. */
  listItemAlreadyOnCard: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  primaryBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
    flex: 1,
  },
  primaryBlockMuted: {
    color: '#9E9E9E',
    opacity: 0.75,
  },
  radioOuterMuted: {
    borderColor: '#CFCFCF',
    filter: 'grayscale(0.6)',
  },
  statusHintLegible: {
    marginLeft: 'auto',
    fontSize: 11,
    lineHeight: 1.3,
    color: '#1C2B33',
    fontWeight: 500,
    flexShrink: 0,
  },
  statusHintDim: {
    marginLeft: 'auto',
    fontSize: 10,
    color: '#9E9E9E',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid #ADADAD',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#18677A',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#18677A',
  },
  hint: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11,
    color: '#5C5C5C',
    margin: '0 0 10px',
  },
  step2Body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    marginTop: 4,
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    flex: 1,
    alignContent: 'start',
  },
  chartCard: {
    borderRadius: 6,
    border: '2px solid #18677A',
    background: '#E2F1F5',
    padding: '10px 8px',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11,
    color: '#1C2B33',
    transition: 'box-shadow 0.15s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(24, 103, 122, 0.2)',
    },
  },
  chartLabel: {
    marginTop: 6,
    lineHeight: 1.3,
  },
}));

/**
 * In-strip add chart: step 1 pick data (click advances); step 2 pick chart (click adds).
 */
const AddChartInlinePanel = ({
  step,
  setStep,
  selectedCatalogId,
  setSelectedCatalogId,
  onCompleteWithChartType,
  onClose,
  existingStripKeys = [],
  selectedDatasets = [],
}) => {
  const classes = useStyles();

  const selectedEntry = useMemo(
    () => ADD_CHART_DATA_TYPES.find((e) => e.id === selectedCatalogId),
    [selectedCatalogId],
  );

  const sortedAddChartDataTypes = useMemo(() => {
    const indexed = ADD_CHART_DATA_TYPES.map((entry, index) => ({ entry, index }));
    indexed.sort((a, b) => {
      const aOn = isAddChartDataTypeOnStrip(a.entry, existingStripKeys, selectedDatasets);
      const bOn = isAddChartDataTypeOnStrip(b.entry, existingStripKeys, selectedDatasets);
      const aAddable = a.entry.available && a.entry.datasetKey && !aOn;
      const bAddable = b.entry.available && b.entry.datasetKey && !bOn;
      if (aAddable && !bAddable) return -1;
      if (!aAddable && bAddable) return 1;
      return a.index - b.index;
    });
    return indexed.map(({ entry }) => entry);
  }, [existingStripKeys, selectedDatasets]);

  const handlePickDataType = (entry) => {
    if (!entry.available || !entry.datasetKey) return;
    if (isAddChartDataTypeOnStrip(entry, existingStripKeys, selectedDatasets)) return;
    if (entry.skipChartTypeStep) {
      onCompleteWithChartType(null, entry.id);
      return;
    }
    setSelectedCatalogId(entry.id);
    setStep(2);
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerRow}>
        <p className={classes.header}>
          {step === 1 ? 'Choose one:' : 'Choose chart type:'}
        </p>
        {typeof onClose === 'function' ? (
          <button
            type="button"
            className={classes.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.177734" y="0.926758" width="1.06064" height="11.6671" transform="rotate(-45 0.177734 0.926758)" fill="#5C5C5C" stroke="#5C5C5C" stroke-width="0.25" />
              <rect x="8.42773" y="0.176758" width="1.06064" height="11.6671" transform="rotate(45 8.42773 0.176758)" fill="#5C5C5C" stroke="#5C5C5C" stroke-width="0.25" />
            </svg>

          </button>
        ) : null}
      </div>
      <div className={classes.divider} />

      {step === 1 && (
        <ul className={classes.list} role="listbox" aria-label="Chart data types">
          {sortedAddChartDataTypes.map((entry) => {
            const onStrip = isAddChartDataTypeOnStrip(entry, existingStripKeys, selectedDatasets);
            const isFullyDisabled = !entry.available || !entry.datasetKey;
            const disabled = isFullyDisabled || onStrip;
            const isAlreadyOnCard = onStrip && !isFullyDisabled;
            const selected = selectedCatalogId === entry.id;
            const disabledHint = (() => {
              if (!disabled) return null;
              if (
                entry.datasetKey === 'survivalAnalysis'
                && Array.isArray(selectedDatasets)
                && selectedDatasets.includes('survivalAnalysis')
              ) {
                return 'Already showing';
              }
              if (onStrip) return 'Already on chart';
              return 'Coming soon';
            })();
            return (
              <li
                key={entry.id}
                role="option"
                aria-selected={selected}
                aria-disabled={disabled}
                className={[
                  classes.listItem,
                  isFullyDisabled ? classes.listItemDisabled : '',
                  isAlreadyOnCard ? classes.listItemAlreadyOnCard : '',
                ].filter(Boolean).join(' ')}
                onClick={() => !disabled && handlePickDataType(entry)}
                onKeyDown={(ev) => {
                  if (disabled) return;
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    handlePickDataType(entry);
                  }
                }}
                tabIndex={disabled ? -1 : 0}
              >
                <span
                  className={[
                    classes.primaryBlock,
                    isAlreadyOnCard ? classes.primaryBlockMuted : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span
                    className={[
                      classes.radioOuter,
                      selected ? classes.radioOuterSelected : '',
                      isAlreadyOnCard ? classes.radioOuterMuted : '',
                    ].filter(Boolean).join(' ')}
                    aria-hidden
                  >
                    {selected ? <span className={classes.radioInner} /> : null}
                  </span>
                  <span>{entry.label}</span>
                </span>
                {disabledHint ? (
                  <span
                    className={isAlreadyOnCard ? classes.statusHintLegible : classes.statusHintDim}
                  >
                    {disabledHint}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {step === 2 && (
        <div className={classes.step2Body}>
          <p className={classes.hint}>{selectedEntry ? selectedEntry.label : null}</p>
          <div className={classes.chartGrid} role="listbox" aria-label="Chart visualizations">
            {CHART_TYPE_OPTIONS.map(({ type, label }) => (
              <div
                key={type}
                role="option"
                aria-selected={false}
                tabIndex={0}
                className={classes.chartCard}
                onClick={() => {
                  if (selectedEntry && selectedEntry.datasetKey) {
                    onCompleteWithChartType(type);
                  }
                }}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    if (selectedEntry && selectedEntry.datasetKey) {
                      onCompleteWithChartType(type);
                    }
                  }
                }}
              >
                <ChartTypeSelectIcon type={type} size={40} />
                <div className={classes.chartLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddChartInlinePanel;
