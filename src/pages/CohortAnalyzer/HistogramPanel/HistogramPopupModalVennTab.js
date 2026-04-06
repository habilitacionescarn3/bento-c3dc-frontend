import React from 'react';
import ChartVenn from '../vennDiagram/ChartVenn';
import { HistogramChartEmptyState } from './HistogramChartEmptyState';

export function HistogramPopupModalVennTab({
  vennModalChartAreaRef,
  vennModalShowsChart,
  chartVennModalProps,
  containerRef,
  canvasRef,
  vennModalSlot,
  vennModalShowsEmptyState,
}) {
  return (
    <div
      ref={vennModalChartAreaRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {vennModalShowsChart ? (
        <ChartVenn
          {...chartVennModalProps}
          containerRef={containerRef}
          canvasRef={canvasRef}
          slotWidth={vennModalSlot.slotWidth}
          slotHeight={vennModalSlot.slotHeight}
        />
      ) : vennModalShowsEmptyState ? (
        <div
          style={{
            width: '100%',
            flex: 1,
            minHeight: Math.max(280, vennModalSlot.slotHeight - 40),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <HistogramChartEmptyState />
        </div>
      ) : null}
    </div>
  );
}
