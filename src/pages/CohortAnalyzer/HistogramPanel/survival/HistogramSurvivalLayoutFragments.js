import React from 'react';
import { createPortal } from 'react-dom';
import {
  FullWidthChartWrapper,
  SurvivalBesideVennCard,
  ChartResizeHandle,
} from '../HistogramPanel.styled';
import { SurvivalAnalysisCardBody } from './SurvivalAnalysisCardBody';
import {
  CA_SURVIVAL_CARD_MIN_WIDTH as SURVIVAL_CARD_MIN_WIDTH,
  CA_SURVIVAL_CARD_MAX_WIDTH as SURVIVAL_CARD_MAX_WIDTH,
  CA_SURVIVAL_CARD_MIN_HEIGHT as SURVIVAL_CARD_MIN_HEIGHT,
  CA_SURVIVAL_CARD_MAX_HEIGHT as SURVIVAL_CARD_MAX_HEIGHT,
} from '../../store/cohortAnalyzerLayoutConstants';

export function HistogramSurvivalBesideVennPortal({
  selectedDatasets,
  survivalBesideVennTarget,
  besideCardDrag,
  survivalBesideVennCardStyle,
  survivalAnalysisBodyProps,
  allInputsEmpty,
  handleSurvivalCardResizeStart,
}) {
  if (!selectedDatasets.includes('survivalAnalysis') || survivalBesideVennTarget == null) {
    return null;
  }

  return createPortal(
    <SurvivalBesideVennCard
      id={besideCardDrag && besideCardDrag.id ? besideCardDrag.id : undefined}
      draggable={Boolean(besideCardDrag && besideCardDrag.draggable)}
      onDragStart={besideCardDrag && besideCardDrag.onDragStart ? besideCardDrag.onDragStart : undefined}
      onDragEnd={besideCardDrag && besideCardDrag.onDragEnd ? besideCardDrag.onDragEnd : undefined}
      style={survivalBesideVennCardStyle}
    >
      <SurvivalAnalysisCardBody {...survivalAnalysisBodyProps} besideVenn />
      <ChartResizeHandle
        aria-label="Resize survival analysis card"
        title="Drag to resize card"
        onMouseDown={(ev) => handleSurvivalCardResizeStart(ev, { fillColumnWidth: true })}
        style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
      />
    </SurvivalBesideVennCard>,
    survivalBesideVennTarget,
  );
}

export function SurvivalHistogramInlineLegacy({
  selectedDatasets,
  survivalBesideVennTarget,
  survivalCardSize,
  survivalAnalysisBodyProps,
  allInputsEmpty,
  handleSurvivalCardResizeStart,
}) {
  if (!selectedDatasets.includes('survivalAnalysis') || survivalBesideVennTarget !== undefined) {
    return null;
  }

  return (
    <FullWidthChartWrapper
      style={survivalCardSize && survivalCardSize.width != null
        ? {
          width: Math.min(
            SURVIVAL_CARD_MAX_WIDTH,
            Math.max(SURVIVAL_CARD_MIN_WIDTH, survivalCardSize.width),
          ),
          height: Math.min(
            SURVIVAL_CARD_MAX_HEIGHT,
            Math.max(SURVIVAL_CARD_MIN_HEIGHT, survivalCardSize.height),
          ),
          minWidth: SURVIVAL_CARD_MIN_WIDTH,
          minHeight: SURVIVAL_CARD_MIN_HEIGHT,
          maxWidth: '100%',
          boxSizing: 'border-box',
          flex: '0 0 auto',
          alignSelf: 'flex-start',
        }
        : {
          width: SURVIVAL_CARD_MIN_WIDTH,
          height: SURVIVAL_CARD_MIN_HEIGHT,
          minWidth: SURVIVAL_CARD_MIN_WIDTH,
          minHeight: SURVIVAL_CARD_MIN_HEIGHT,
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
    >
      <SurvivalAnalysisCardBody {...survivalAnalysisBodyProps} besideVenn={false} />
      <ChartResizeHandle
        aria-label="Resize survival analysis card"
        title="Drag to resize card"
        onMouseDown={handleSurvivalCardResizeStart}
        style={{ opacity: allInputsEmpty ? 0.35 : 1, pointerEvents: allInputsEmpty ? 'none' : 'auto' }}
      />
    </FullWidthChartWrapper>
  );
}
