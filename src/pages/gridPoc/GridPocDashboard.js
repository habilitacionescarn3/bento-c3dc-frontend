import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import styled from 'styled-components';
import DemoCard from './DemoCard';
import AddCardPlaceholder from './AddCardPlaceholder';
import { defaultLayout, defaultCards, gridConfig, STORAGE_KEY, CARDS_STORAGE_KEY } from './gridPocConfig';

// Import CSS for react-grid-layout v0.16.6
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const GridContainer = styled.div`
  /* Custom placeholder styling */
  .react-grid-item.react-grid-placeholder {
    background: #679AAA;
    opacity: 0.3;
    border-radius: 8px;
  }

  /* Custom resize handle styling */
  .react-grid-item > .react-resizable-handle::after {
    content: '';
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 10px;
    height: 10px;
    border-right: 2px solid #999;
    border-bottom: 2px solid #999;
  }

  /* Make add-card placeholder not draggable/resizable visually */
  .react-grid-item[data-grid-id="add-card"] > .react-resizable-handle {
    display: none;
  }
`;

const Controls = styled.div`
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;

  button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    &:hover { background: #f0f0f0; }
  }

  span {
    padding: 8px;
    color: #666;
    font-size: 14px;
  }
`;

const CardCount = styled.span`
  background: #679AAA;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
`;

// Helper to find the next available position in the grid
const findNextPosition = (layout) => {
  if (layout.length === 0) {
    return { x: 0, y: 0 };
  }

  // Find the maximum y + h to place at the bottom
  let maxY = 0;
  layout.forEach(item => {
    const itemBottom = item.y + item.h;
    if (itemBottom > maxY) {
      maxY = itemBottom;
    }
  });

  return { x: 0, y: maxY };
};

// Check if two layouts are equal (ignoring add-card)
const layoutsEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((item, idx) => {
    const other = b[idx];
    return item.i === other.i &&
           item.x === other.x &&
           item.y === other.y &&
           item.w === other.w &&
           item.h === other.h;
  });
};

// Get default dimensions for a card type
const getCardDimensions = (cardTypeId) => {
  const dimensions = {
    'venn': { w: 4, h: 3, minW: 2, minH: 2 },
    'kmplot': { w: 4, h: 3, minW: 3, minH: 2 },
    'risk-table': { w: 4, h: 3, minW: 2, minH: 2 },
    'histogram-sex': { w: 3, h: 3, minW: 2, minH: 2 },
    'histogram-race': { w: 3, h: 3, minW: 2, minH: 2 },
    'histogram-treatment': { w: 3, h: 3, minW: 2, minH: 2 },
  };
  return dimensions[cardTypeId] || { w: 4, h: 3, minW: 2, minH: 2 };
};

const GridPocDashboard = () => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(1200);

  // Load cards from localStorage or use default
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(CARDS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultCards;
  });

  // Load layout from localStorage or use default
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Save cards to localStorage when they change
  useEffect(() => {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  // Handle layout change (filter out add-card from saved layout)
  const handleLayoutChange = (newLayout) => {
    const layoutToSave = newLayout.filter(item => item.i !== 'add-card');

    // Only update if layout actually changed (prevents infinite loop)
    if (!layoutsEqual(layoutToSave, layout)) {
      setLayout(layoutToSave);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutToSave));
    }
  };

  // Reset to default layout and cards
  const handleReset = () => {
    setLayout(defaultLayout);
    setCards(defaultCards);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CARDS_STORAGE_KEY);
  };

  // Add a new card
  const handleAddCard = (cardType) => {
    const newCard = {
      id: cardType.id,
      title: cardType.name,
      content: `${cardType.description} - Chart placeholder`,
    };

    // Add to cards list
    setCards(prev => [...prev, newCard]);

    // Add to layout
    const position = findNextPosition(layout);
    const dimensions = getCardDimensions(cardType.id);
    const newLayoutItem = {
      i: cardType.id,
      x: position.x,
      y: position.y,
      ...dimensions,
    };

    setLayout(prev => [...prev, newLayoutItem]);
  };

  // Remove a card
  const handleRemoveCard = (cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setLayout(prev => prev.filter(item => item.i !== cardId));
  };

  // Get existing card IDs for the add card menu
  const existingCardIds = cards.map(card => card.id);

  // Calculate add-card position (always at the end)
  const addCardPosition = findNextPosition(layout);
  const addCardLayoutItem = {
    i: 'add-card',
    x: addCardPosition.x,
    y: addCardPosition.y,
    w: 4,
    h: 3,
    static: true, // Make it non-draggable and non-resizable
  };

  // Combine layout with add-card placeholder
  const fullLayout = [...layout, addCardLayoutItem];

  return (
    <GridContainer ref={containerRef}>
      <Controls>
        <button onClick={handleReset}>Reset Layout</button>
        <CardCount>{cards.length} cards</CardCount>
        <span>Width: {width}px | Cols: {gridConfig.cols}</span>
      </Controls>

      <GridLayout
        className="layout"
        layout={fullLayout}
        cols={gridConfig.cols}
        rowHeight={gridConfig.rowHeight}
        width={width}
        margin={gridConfig.margin}
        containerPadding={gridConfig.containerPadding}
        compactType={gridConfig.compactType}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".card-drag-handle"
        isResizable={true}
        isDraggable={true}
        useCSSTransforms={true}
      >
        {cards.map((card) => (
          <div key={card.id}>
            <DemoCard
              title={card.title}
              onRemove={() => handleRemoveCard(card.id)}
              showRemove={true}
            >
              {card.content}
            </DemoCard>
          </div>
        ))}
        <div key="add-card" data-grid-id="add-card">
          <AddCardPlaceholder
            onAddCard={handleAddCard}
            existingCardIds={existingCardIds}
          />
        </div>
      </GridLayout>
    </GridContainer>
  );
};

export default GridPocDashboard;
