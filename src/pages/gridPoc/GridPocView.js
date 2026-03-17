import React from 'react';
import styled from 'styled-components';
import GridPocDashboard from './GridPocDashboard';

const PageContainer = styled.div`
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 200px);
`;

const Header = styled.div`
  margin-bottom: 20px;
  h1 { margin: 0 0 8px 0; }
  p { color: #666; margin: 0; }
`;

const GridPocView = () => {
  return (
    <PageContainer>
      <Header>
        <h1>Grid Layout POC</h1>
        <p>Drag cards by their header. Resize from bottom-right corner. Layout saves to localStorage.</p>
      </Header>
      <GridPocDashboard />
    </PageContainer>
  );
};

export default GridPocView;
