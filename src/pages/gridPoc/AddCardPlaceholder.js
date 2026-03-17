import React, { useState } from 'react';
import styled from 'styled-components';

const PlaceholderContainer = styled.div`
  height: 100%;
  background: transparent;
  border: 2px dashed rgba(103, 154, 170, 0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: rgba(103, 154, 170, 0.8);
    background: rgba(103, 154, 170, 0.05);

    .plus-icon {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }
`;

const PlusIcon = styled.div`
  width: 60px;
  height: 60px;
  position: relative;
  opacity: 0.4;
  transition: all 0.3s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: #679AAA;
    border-radius: 4px;
  }

  &::before {
    width: 4px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    width: 100%;
    height: 4px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const MenuCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 24px;
  min-width: 320px;
  max-width: 400px;
`;

const MenuTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #1a365d;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const CardTypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTypeOption = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: #f7fafc;
    border-color: #679AAA;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
  }
`;

const CardTypeIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color || '#679AAA'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const CardTypeInfo = styled.div`
  flex: 1;
`;

const CardTypeName = styled.div`
  font-weight: 600;
  color: #1a365d;
  font-size: 14px;
`;

const CardTypeDesc = styled.div`
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
`;

const CancelButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #718096;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
    color: #4a5568;
  }
`;

// Available card types for the POC
const CARD_TYPES = [
  {
    id: 'venn',
    name: 'Venn Diagram',
    description: 'Cohort intersection visualization',
    icon: '◯',
    color: '#4299e1',
  },
  {
    id: 'kmplot',
    name: 'KM Plot',
    description: 'Kaplan-Meier survival analysis',
    icon: '📈',
    color: '#48bb78',
  },
  {
    id: 'risk-table',
    name: 'Risk Table',
    description: 'Survival risk intervals',
    icon: '📊',
    color: '#ed8936',
  },
  {
    id: 'histogram-sex',
    name: 'Histogram - Sex',
    description: 'Sex at birth distribution',
    icon: '▮',
    color: '#9f7aea',
  },
  {
    id: 'histogram-race',
    name: 'Histogram - Race',
    description: 'Race distribution',
    icon: '▮',
    color: '#f56565',
  },
  {
    id: 'histogram-treatment',
    name: 'Histogram - Treatment',
    description: 'Treatment type distribution',
    icon: '▮',
    color: '#38b2ac',
  },
];

const AddCardPlaceholder = ({ onAddCard, existingCardIds = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(true);
  };

  const handleSelectCardType = (cardType) => {
    if (onAddCard) {
      onAddCard(cardType);
    }
    setIsMenuOpen(false);
  };

  const handleCloseMenu = (e) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <PlaceholderContainer onClick={handleClick}>
        <PlusIcon className="plus-icon" />
      </PlaceholderContainer>

      {isMenuOpen && (
        <MenuOverlay onClick={handleCloseMenu}>
          <MenuCard onClick={(e) => e.stopPropagation()}>
            <MenuTitle>Add a Card</MenuTitle>
            <CardTypeList>
              {CARD_TYPES.map((cardType) => {
                const isAlreadyAdded = existingCardIds.includes(cardType.id);
                return (
                  <CardTypeOption
                    key={cardType.id}
                    onClick={() => handleSelectCardType(cardType)}
                    disabled={isAlreadyAdded}
                  >
                    <CardTypeIcon color={cardType.color}>
                      {cardType.icon}
                    </CardTypeIcon>
                    <CardTypeInfo>
                      <CardTypeName>{cardType.name}</CardTypeName>
                      <CardTypeDesc>
                        {isAlreadyAdded ? 'Already on board' : cardType.description}
                      </CardTypeDesc>
                    </CardTypeInfo>
                  </CardTypeOption>
                );
              })}
            </CardTypeList>
            <CancelButton onClick={() => setIsMenuOpen(false)}>
              Cancel
            </CancelButton>
          </MenuCard>
        </MenuOverlay>
      )}
    </>
  );
};

export default AddCardPlaceholder;
export { CARD_TYPES };
