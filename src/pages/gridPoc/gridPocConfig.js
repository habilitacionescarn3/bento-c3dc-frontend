// Default layout for POC demo cards
export const defaultLayout = [
  { i: 'card-1', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'card-2', x: 4, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'card-3', x: 8, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'card-4', x: 0, y: 3, w: 6, h: 3, minW: 3, minH: 2 },
  { i: 'card-5', x: 6, y: 3, w: 6, h: 3, minW: 3, minH: 2 },
];

// Default cards (matching the layout)
export const defaultCards = [
  { id: 'card-1', title: 'Venn Diagram (Demo)', content: 'Chart placeholder' },
  { id: 'card-2', title: 'KM Plot (Demo)', content: 'Chart placeholder' },
  { id: 'card-3', title: 'Risk Table (Demo)', content: 'Table placeholder' },
  { id: 'card-4', title: 'Histogram - Sex (Demo)', content: 'Chart placeholder' },
  { id: 'card-5', title: 'Histogram - Race (Demo)', content: 'Chart placeholder' },
];

// Legacy export for backwards compatibility
export const demoCards = defaultCards;

// Grid configuration
export const gridConfig = {
  cols: 12,
  rowHeight: 80,
  margin: [16, 16],
  containerPadding: [0, 0],
  compactType: 'vertical',
};

// localStorage keys
export const STORAGE_KEY = 'grid-poc-layout';
export const CARDS_STORAGE_KEY = 'grid-poc-cards';
