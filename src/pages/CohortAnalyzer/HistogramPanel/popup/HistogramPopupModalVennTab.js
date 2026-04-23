import React from 'react';
import ChartVenn from '../../vennDiagram/ChartVenn';
import { HistogramChartEmptyState } from '../chart/HistogramChartEmptyState';
import { ModalVennTabRoot } from '../HistogramPanel.styled';

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
    <ModalVennTabRoot ref={vennModalChartAreaRef}>
      {vennModalShowsChart ? (
        <ChartVenn
          {...chartVennModalProps}
          containerRef={containerRef}
          canvasRef={canvasRef}
          slotWidth={vennModalSlot.slotWidth}
          slotHeight={vennModalSlot.slotHeight}
          expandedView
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
    </ModalVennTabRoot>
  );
}
