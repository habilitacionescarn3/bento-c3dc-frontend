import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 12px 16px;
  background: #1a365d;
  color: white;
  font-weight: 600;
  cursor: move;  /* Indicates draggable */
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 8px;
  border-radius: 4px;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fc8181;
  }
`;

const CardContent = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
`;

const DemoCard = ({ title, children, onRemove, showRemove = false }) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <CardContainer>
      <CardHeader className="card-drag-handle">
        <CardTitle>{title}</CardTitle>
        {showRemove && (
          <RemoveButton onClick={handleRemove} title="Remove card">
            ×
          </RemoveButton>
        )}
      </CardHeader>
      <CardContent>
        {children || `Content for ${title}`}
      </CardContent>
    </CardContainer>
  );
};

export default DemoCard;
