import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { ADD_CHART_DATA_TYPES, isAddChartDataTypeOnStrip } from '../cohortAnalyzerChartCatalog';
import { ChartTypeIcon, CHART_TYPE_OPTIONS } from '../HistogramPanel/HistogramChartTypeIcons';

const useStyles = makeStyles(() => ({
  header: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: '#5C5C5C',
    margin: '0 0 8px',
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
    maxHeight: 260,
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
  listItemDisabled: {
    cursor: 'not-allowed',
    color: '#9E9E9E',
    opacity: 0.85,
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
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 4,
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
  existingStripKeys = [],
}) => {
  const classes = useStyles();

  const selectedEntry = useMemo(
    () => ADD_CHART_DATA_TYPES.find((e) => e.id === selectedCatalogId),
    [selectedCatalogId],
  );

  const handlePickDataType = (entry) => {
    if (!entry.available || !entry.datasetKey) return;
    if (isAddChartDataTypeOnStrip(entry, existingStripKeys)) return;
    setSelectedCatalogId(entry.id);
    setStep(2);
  };

  return (
    <div>
      <p className={classes.header}>
        {step === 1 ? 'Choose one:' : 'Choose chart type:'}
      </p>
      <div className={classes.divider} />

      {step === 1 && (
        <ul className={classes.list} role="listbox" aria-label="Chart data types">
          {ADD_CHART_DATA_TYPES.map((entry) => {
            const onStrip = isAddChartDataTypeOnStrip(entry, existingStripKeys);
            const disabled = !entry.available || !entry.datasetKey || onStrip;
            const selected = selectedCatalogId === entry.id;
            return (
              <li
                key={entry.id}
                role="option"
                aria-selected={selected}
                aria-disabled={disabled}
                className={`${classes.listItem} ${disabled ? classes.listItemDisabled : ''}`}
                onClick={() => handlePickDataType(entry)}
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
                  className={`${classes.radioOuter} ${selected ? classes.radioOuterSelected : ''}`}
                  aria-hidden
                >
                  {selected ? <span className={classes.radioInner} /> : null}
                </span>
                <span>{entry.label}</span>
                {disabled ? (
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9E9E9E' }}>
                    {onStrip ? 'Already on chart' : 'Coming soon'}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {step === 2 && (
        <>
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
                <ChartTypeIcon type={type} size={40} />
                <div className={classes.chartLabel}>{label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AddChartInlinePanel;
