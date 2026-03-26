import styled from 'styled-components';

export const barColors = {
  colorA: '#FAE69C',
  colorB: '#A4E9CB',
  colorC: '#A3CCE8'
};

export const kmplotColors = {
  colorA: '#B18A00',
  colorB: '#00A45C',
  colorC: '#008FF7'
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
  margin-top: 20px;
  @media (max-width: 1900px) {
    max-width: 100%;
    margin: 24px 0 0;
  }

`;


export const DatasetSelectionTitle = styled.div`
  font-family: Poppins; 
  font-size: 16px;
  color: ${props => props.disabled ? '#999999' : '#000000'};
  opacity: ${props => props.disabled ? 0.8 : 1};
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
  font-size: 19px;
  font-weight: 400;
  color: #000000;
  margin: 0;
  text-align: left;
  margin-left: 3px;
  flex: 1;
  min-width: 0;
  line-height: 1.3;
  align-self: center;
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
  min-width: 320px;
  min-height: 261px;
  max-height: auto;
  margin-bottom: 0;
  padding: 0px;
  border: 1px solid #b8c7cc;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(29, 61, 73, 0.16);
  transition: transform 120ms ease, box-shadow 120ms ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(29, 61, 73, 0.2);
  }
  @media (max-width: 1500px) {
    width: calc((100% - 14px) / 2);
  }
  @media (max-width: 980px) {
    width: 100%;
    min-width: 0;
  }
`;

/** Bottom-right grip: black triangle + larger hit target for diagonal resize */
export const ChartResizeHandle = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  z-index: 6;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  box-sizing: border-box;
  padding: 0 3px 3px 0;
  &::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-bottom: 12px solid #000000;
  }
`;

/** Full-row card (e.g. survival / KM plot). Do not use :first-child on ChartWrapper — it stretches the first histogram when survival is off. */
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

/** Survival card when mounted beside the Venn (narrow column; not a full flex-row span). */
export const SurvivalBesideVennCard = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 200px;
  padding: 0;
  border: 1px solid #b8c7cc;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(29, 61, 73, 0.16);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  transition: transform 120ms ease, box-shadow 120ms ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(29, 61, 73, 0.2);
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
  margin: 0 0 10px 12px;
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
  color: #666;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  margin-right: 8px;
  accent-color: #3A7587;
  width: 16px;
  height: 16px;
`;


export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  overflow: hidden;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 1081px;
  max-width: 1200px;
  height: 80%;
  max-height: 800px;
  position: relative;
  z-index: 2000px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #333;
  }
`;

export const ModalChartWrapper = styled.div`
  width: 100%;
  height: calc(100% - 50px);
  margin-top: 0px;
`;

export const TabContainer = styled.div`
  display: flex;
`;

export const Tab = styled.button`
  background: transparent;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  font-size: 20px;
  color: ${props => props.active ? '#3A7587' : '#666'};
  border-bottom: ${props => props.active ? '2px solid #3A7587' : 'none'};
 
`;

/** Chart type selector (pie / vertical bar / horizontal bar / line) */
export const ChartTypeDropdownRoot = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const ChartTypeDropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  min-width: 41px;
`;

export const ChartTypeOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: ${(p) => (p.$active ? '#e8e8e8' : 'transparent')};
  cursor: pointer;
  &:hover {
    background: ${(p) => (p.$active ? '#e0e0e0' : '#f5f5f5')};
  }
  &:focus-visible {
    outline: 2px solid #3a7587;
    outline-offset: 1px;
  }
`;

export const ChartTypeTriggerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
  &:focus-visible {
    outline: 2px solid #3a7587;
    outline-offset: 1px;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const DownloadDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const DownloadDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background: white;
  border: 1.5px solid #4E8191
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
  padding-left: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
`;

export const DownloadDropdownItem = styled.div`
  padding: 2px;
  font-family: Poppins;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: #f5f5f5;
  }


`;
export const SurvivalAnalysisWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const SurvivalAnalysisHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px 8px 12px;
  border-bottom: 1px solid #e5e5e5;
`;

export const SurvivalAnalysisContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const KmChartWrapper = styled.div`
  width: 100%;
  padding-left: 100px;
  margin-top: -20px;
`;

export const RiskTableWrapper = styled.div`
  width: 100%;
  padding-right: 50px;
  margin-top: 10px;
  min-width: 0;
`;

/** Narrow column next to Venn — reduce padding so KM + risk table fit. */
export const KmChartWrapperBesideVenn = styled(KmChartWrapper)`
  padding-left: 8px;
  margin-top: 0;
`;

export const RiskTableWrapperBesideVenn = styled(RiskTableWrapper)`
  padding-right: 8px;
  margin-top: 8px;
`;

export const SurvivalAnalysisModalContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
`;

export const SurvivalAnalysisModalContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  gap: 5px;
`;

export const KmChartModalWrapper = styled.div`
  width: 100%;
  padding-left: 120px;
  padding-right: 100px;
  margin-right: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

export const RiskTableModalWrapper = styled.div`
  width: 75.5%;
  padding-right: 5px;
  overflow-x: auto;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 280px;
  padding-bottom: 15px;
`;

export const ModalHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  width: 100%;
  padding: 0px;
  height: 55px;
  border-bottom: 1px solid #E0E0E0;
  border-top-left-radius: 8px;
`;

export const ModalActionButtons = styled.div`
  min-width: 300px;
  right: 10px;
  top: 2px;
  position: absolute;
  justify-content: flex-end;
  display: flex;
  gap: 5px;
`;

export const DownloadButtonWrapper = styled.div`
  margin-right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const DownloadButton = styled.span`
  cursor: pointer;
  margin-top: 5px;
`;

export const DownloadIconImage = styled.img`
  width: 23px;
  height: 23px;
`;

export const DownloadIconSmall = styled.img`
  width: 10px;
  height: 12px;
`;

export const ModalChartContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
`;

export const ModalRadioFieldset = styled.fieldset`
  border: none;
`;

export const ModalRadioGroup = styled(RadioGroup)`
  height: 100px;
  width: 180px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  background-color: red;
`;

export const ModalNoDataContainer = styled.div`
  width: 90%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-family: Poppins;
  color: #999;
  padding: 2rem;
`;
