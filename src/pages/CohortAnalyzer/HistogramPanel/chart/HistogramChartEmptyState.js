import React from 'react';

export function HistogramChartEmptyState() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        maxWidth: 340,
        padding: '0 16px',
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#323232', lineHeight: 1.4 }}>
        No data available.
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 400, color: '#6E6E6E', lineHeight: 1.45 }}>
        Try adjusting your filters or cohort selection.
      </p>
    </div>
  );
}
