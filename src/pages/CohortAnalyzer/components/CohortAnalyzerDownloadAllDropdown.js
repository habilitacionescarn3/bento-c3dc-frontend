import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  buildRawCohortChartTabularRows,
  formatRowsAsTsv,
  formatRowsAsCsv,
  downloadTextFile,
  downloadJsonPayload,
  downloadChartAreaAsPng,
  downloadChartAreaAsPdf,
} from '../downloads/cohortAnalyzerDownloadAll';

const FORMAT_OPTIONS = [
  { id: 'tsv', label: 'TSV' },
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
  { id: 'pdf', label: 'PDF' },
  { id: 'png', label: 'PNG' },
];

/**
 * DOWNLOAD ALL control: tabular exports (TSV/CSV/JSON) plus chart-area capture (PDF/PNG).
 */
export function CohortAnalyzerDownloadAllDropdown({
  classes,
  disabled,
  chartAreaRef,
  getExportPayload,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  const runExport = useCallback(
    async (formatId) => {
      if (disabled) return;
      setOpen(false);
      const payload = typeof getExportPayload === 'function' ? getExportPayload() : {};
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

      try {
        if (formatId === 'json') {
          downloadJsonPayload(payload, `cohort-analyzer-export-${stamp}.json`);
          return;
        }
        if (formatId === 'tsv' || formatId === 'csv') {
          const rows = buildRawCohortChartTabularRows(payload);
          if (!rows.length) {
            window.alert('No cohort chart data to export yet. Add cohorts with participants and wait for data to load.');
            return;
          }
          const body = formatId === 'tsv'
            ? formatRowsAsTsv(rows)
            : formatRowsAsCsv(rows);
          const ext = formatId === 'tsv' ? 'tsv' : 'csv';
          const mime = formatId === 'tsv'
            ? 'text/tab-separated-values;charset=utf-8'
            : 'text/csv;charset=utf-8';
          downloadTextFile(body, `cohort-analyzer-charts-${stamp}.${ext}`, mime);
          return;
        }
        if (formatId === 'png') {
          const chartEl = chartAreaRef && chartAreaRef.current;
          await downloadChartAreaAsPng(chartEl, `cohort-analyzer-charts-${stamp}.png`);
          return;
        }
        if (formatId === 'pdf') {
          const chartEl = chartAreaRef && chartAreaRef.current;
          await downloadChartAreaAsPdf(chartEl, `cohort-analyzer-charts-${stamp}.pdf`);
        }
      } catch (e) {
        console.error('Download all failed', e);
        window.alert('Download failed. See the console for details.');
      }
    },
    [disabled, getExportPayload, chartAreaRef],
  );

  return (
    <div className={classes.downloadAllDropdownRoot} ref={rootRef}>
      <button
        type="button"
        className={classes.downloadAllTrigger}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={classes.downloadAllTriggerLabel}>
          DOWNLOAD ALL
          <br />
          IMAGES
        </span>
        <span className={classes.downloadAllChevron} aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && !disabled ? (
        <ul className={classes.downloadAllMenu} role="menu" aria-label="Download format">
          {FORMAT_OPTIONS.map((opt) => (
            <li key={opt.id} role="none">
              <button
                type="button"
                role="menuitem"
                className={classes.downloadAllMenuItem}
                onClick={() => runExport(opt.id)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
