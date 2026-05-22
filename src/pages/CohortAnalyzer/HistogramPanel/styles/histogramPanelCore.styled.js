import styled from 'styled-components';
import { CA_SURVIVAL_CARD_MIN_HEIGHT } from '../../store/cohortAnalyzerLayoutConstants';
import {
  HISTOGRAM_CARD_MIN_WIDTH,
  HISTOGRAM_CARD_SHELL_MIN_VH,
} from '../histogramConstants';

export const barColors = {
  colorA: '#FAE69C',
  colorB: '#A4E9CB',
  colorC: '#A3CCE8',
};

export const kmplotColors = {
  colorA: '#B18A00',
  colorB: '#00A45C',
  colorC: '#008FF7',
};

export const HistogramContainer = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-left: 0px;
  min-height: 0;
  height: auto;
  margin-top: 16px;
  @media (max-width: 1900px) {
    max-width: 100%;
    margin: 16px 0 0;
  }
`;

export const DatasetSelectionTitle = styled.div`
  font-family: Poppins;
  font-size: 16px;
  color: ${(props) => (props.disabled ? '#999999' : '#000000')};
  opacity: ${(props) => (props.disabled ? 0.8 : 1)};
  margin-bottom: 8px;
`;

export const CheckBoxSection = styled.div`
  margin-bottom: 14px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ChartTitle = styled.h2`
  font-family: Poppins;
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  margin: 0;
  text-align: left;
  margin-left: 3px;
  flex: 1;
  min-width: 0;
  line-height: 1.25;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 2px;
  row-gap: 2px;
  &.empty {
    opacity: 0.3;
  }
`;

export const ChartActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  justify-content: flex-end;
  margin: 0;
  padding-left: 14px;
  margin-left: 14px;
`;

export const CenterContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  align-items: stretch;
  align-content: center;
  gap: 14px;
  @media (min-width: 1900px) {
    justify-content: flex-start;
    align-items: stretch;
  }
`;

export const ChartWrapper = styled.div`
  position: relative;
  width: calc((100% - 28px) / 3);
  min-width: clamp(${HISTOGRAM_CARD_MIN_WIDTH}px, 17vw, 100%);
  min-height: max(200px, ${HISTOGRAM_CARD_SHELL_MIN_VH}vh);
  max-height: none;
  margin-bottom: 0;
  padding: 0px;
  border: 1px solid #b8c7cc;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  border-radius: 10px;
  box-shadow: none;
  transition: none;
  &:hover {
    transform: none;
    box-shadow: none;
  }
  /**
   * Keep three cards per row (1/3 − gap) until a narrow viewport; the old 1500px breakpoint
   * forced two columns and made cards look stretched. Stack to one column on small screens only.
   */
  @media (max-width: 980px) {
    width: 100%;
    min-width: 0;
  }
`;

/** Bottom-right grip: black triangle + hit target for diagonal resize */
export const ChartResizeHandle = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  cursor: nwse-resize;
  z-index: 6;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  box-sizing: border-box;
  padding: 0 6px 6px 0;
  &::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 16px solid transparent;
    border-bottom: 16px solid #525252;
  }
`;

/** Full-row card (e.g. survival / KM plot). */
export const FullWidthChartWrapper = styled(ChartWrapper)`
  width: 100%;
  flex: 0 0 100%;
  min-width: 0;
  @media (max-width: 1500px) {
    width: 100%;
    flex: 0 0 100%;
  }
  @media (max-width: 980px) {
    width: 100%;
    flex: 0 0 100%;
  }
`;

/** Survival card when mounted beside the Venn. */
export const SurvivalBesideVennCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  flex: 1 1 auto;
  align-self: stretch;
  min-height: ${CA_SURVIVAL_CARD_MIN_HEIGHT}px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid #b8c7cc;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: none;
  transition: none;
  &:hover {
    transform: none;
    box-shadow: none;
  }
`;

export const HeaderSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 50px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px 8px 15px;
  margin-left: 0;
  border-bottom: 1px solid #e5e5e5;
`;

export const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 6px 0 10px 12px;
  gap: 16px;
  justify-content: flex-start;
  flex-direction: row;
  width: auto;
  max-width: 100%;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-family: Poppins;
  font-size: 13px;
  color: #494949;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  margin-right: 8px;
  accent-color: #3A7587;
  width: 16px;
  height: 16px;
`;
