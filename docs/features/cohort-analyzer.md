# Cohort Analyzer Feature Guide

## Overview

The Cohort Analyzer is a comprehensive statistical analysis and visualization tool that enables researchers to create, compare, and analyze participant cohorts from the CCDI C3DC dataset. It provides interactive visualizations, statistical comparisons, and survival analysis capabilities for up to 3 cohorts simultaneously.

## Feature Architecture

### Component Structure

**Main Components:**
- **CohortAnalyzer** (`CohortAnalyzer.js`) - Primary feature component with full analysis interface
- **CohortAnalyzerController** (`CohortAnalyzerController.js`) - Provider wrapper for context management
- **CohortAnalyzerContext** (`CohortAnalyzerContext.js`) - State management for analyzer-specific data

**Visualization Components:**
- **VennDiagramContainer** - Interactive Venn diagrams for cohort overlaps
- **Histogram** - Age distribution and demographic histograms  
- **KaplanMeierChart** - Survival analysis charts via @bento-core/kmplot
- **RiskTable** - Risk analysis tables via @bento-core/risk-table

**Data Management:**
- **CohortSelector** - Cohort selection and management interface
- **CohortAnalyzerTableSection** - Tabular data display with filtering
- **CohortAnalyzerUtil** - Data transformation and utility functions

### Context Architecture

**Multi-layered Context Pattern:**
```javascript
<CohortStateProvider>          // Global cohort state management
  <CohortModalProvider>        // Cohort modal operations  
    <CohortAnalyzerProvider>   // Analyzer-specific state
      <CohortAnalyzer />       // Main component
    </CohortAnalyzerProvider>
  </CohortModalProvider>
</CohortStateProvider>
```

**Observed State Management:**
- **selectedCohorts**: Array of up to 3 selected cohorts for comparison
- **cohortData**: Complete participant data for selected cohorts  
- **generalInfo**: Statistical summaries and metadata
- **selectedChart**: Currently selected visualization elements
- **queryVariable**: GraphQL query parameters for data fetching

## Core Functionality

### Cohort Selection and Management

**Cohort Selection Logic:**
- Maximum of 3 cohorts can be selected simultaneously for comparison
- Cohorts are identified by unique cohortId and can contain participant lists
- Selection state managed through `handleCheckbox` function with validation

**Observed Selection Flow:**
1. User views available cohorts in dropdown/list interface
2. Checkboxes allow selection with 3-cohort maximum enforced
3. Selected cohorts trigger data fetching and visualization updates
4. Deselection removes cohort from analysis and updates visualizations

**Integration Points:**
- **CohortStateContext**: Global cohort storage and persistence
- **CohortModal**: Cohort creation, editing, and management workflows
- **ExampleCohorts**: Predefined cohorts for demonstration and testing

### Statistical Analysis Capabilities

#### Demographics Analysis
**Observed Features:**
- Age distribution histograms with customizable binning
- Sex at birth distribution analysis
- Race/ethnicity demographic breakdowns
- Treatment type categorization and analysis

**Data Sources:**
- `GET_PARTICIPANTS_OVERVIEW_QUERY` - Participant demographic data
- `GET_DIAGNOSIS_OVERVIEW_QUERY` - Diagnosis and disease information
- `GET_TREATMENT_OVERVIEW_QUERY` - Treatment modality and response data

#### Survival Analysis
**Components Used:**
- **@bento-core/kmplot** - Kaplan-Meier survival curve generation
- **@bento-core/risk-table** - Risk table display with confidence intervals
- **useKmplot** hook - Data fetching and transformation for survival analysis
- **useRiskTable** hook - Risk analysis data management

**Observed Capabilities:**
- Multi-cohort survival curve comparison (up to 3 cohorts)
- Color-coded cohort visualization with consistent theming
- Interactive chart elements with tooltip information
- Survival probability calculations and statistical significance testing

#### Cohort Overlap Analysis
**Venn Diagram Features:**
- **ChartVenn** component using `chartjs-chart-venn` library
- Interactive Venn diagram with clickable regions
- Participant overlap calculation between 2-3 cohorts
- Color-coded regions with opacity adjustments for selection states

**Intersection Logic:**
- Automatic calculation of participant overlaps between selected cohorts
- Support for 2-way and 3-way cohort intersections
- Click interaction to highlight specific overlap regions
- Dynamic color adjustment based on selection state

### Data Visualization System

#### Histogram Visualizations
**Implementation Details:**
- **Recharts** library for bar chart generation (`BarChart`, `Bar`, `XAxis`, `YAxis`)
- Custom tooltip components (`CustomChartTooltip`, `CustomXAxisTick`)
- Responsive container with automatic sizing
- Multiple data views: Age distribution, treatment types, demographic categories

**Interactive Features:**
- Expandable chart modal for detailed view (`HistogramPopup`)
- Download functionality for chart images (PNG/SVG export)
- Dataset selection toggles for cohort comparison
- Customizable binning and grouping options

**Chart Export:**
- **html-to-image** library for chart screenshot capture
- Multiple export formats supported (PNG, SVG)
- High-resolution export for publication quality

#### Data Table Integration
**Table Configuration:**
- **@bento-core/paginated-table** for large dataset display
- **CohortAnalyzerTableSection** wrapper with analyzer-specific formatting
- Participant-level data display with cohort attribution
- Sortable columns with default sorting by participant_id

**Table Features:**
- Search functionality within displayed data
- Column configuration via `tableConfig` in cohortAnalyzerPageData.js
- Cell type configuration for links, displays, and custom elements
- Pagination with configurable page sizes

### Data Flow and API Integration

#### GraphQL Query Architecture
**Primary Queries:**
```javascript
GET_COHORT_MANIFEST_QUERY      // Participant manifest data
GET_PARTICIPANTS_OVERVIEW_QUERY // Demographic and overview data  
GET_DIAGNOSIS_OVERVIEW_QUERY    // Diagnosis and disease data
GET_TREATMENT_OVERVIEW_QUERY    // Treatment and response data
```

**Query Pattern:**
- Queries configured in `dashboardTabData.js` with GraphQL schemas
- Apollo Client hooks manage loading states and error handling
- Query variables built from selected cohort participant IDs
- Results cached and shared across visualization components

#### Data Transformation Pipeline
**CohortDataTransform.js Functions:**
- **getJoinedCohortData**: Merges participant data across multiple cohorts
- Participant ID mapping and deduplication logic
- Data normalization for consistent visualization formats
- Statistical aggregation and summary calculations

**Observed Data Flow:**
1. Cohort selection triggers GraphQL queries with participant IDs
2. Raw data transformed through utility functions
3. Processed data distributed to visualization components via context
4. Components render interactive visualizations with shared state

## User Workflows

### Primary Analysis Workflow
1. **Cohort Selection**
   - Access existing cohorts or create new ones via CohortModal
   - Select 1-3 cohorts for comparative analysis
   - Validation prevents selection beyond 3-cohort maximum

2. **Visualization Review**  
   - View demographic histograms for age, sex, race distributions
   - Examine Venn diagrams for cohort participant overlaps
   - Analyze survival curves and risk tables for outcome analysis

3. **Interactive Exploration**
   - Click Venn diagram regions to highlight specific participant subsets
   - Toggle dataset visibility in histograms for focused comparison
   - Expand charts to full-screen modal for detailed examination

4. **Export and Sharing**
   - Download visualizations as high-resolution images
   - Export to CCDI Hub for further analysis with `exportToCCDIHub` function
   - Generate participant manifests for external analysis

### Integration Workflows

#### Search → Cohort Creation → Analysis
1. User discovers participants through search interface
2. Selected participants added to new or existing cohort
3. Cohort becomes available in Cohort Analyzer for statistical analysis

#### Cohort Management → Analysis → Export
1. Cohorts managed through CohortModal (create, edit, delete, duplicate)
2. Analysis performed in Cohort Analyzer with visualization generation
3. Results exported to external systems or downloaded locally

## Technical Implementation

### State Management Architecture

**CohortAnalyzerContext State:**
```javascript
// Cohort selection and management
selectedCohorts: []          // Array of up to 3 selected cohort IDs
cohortList: []              // Available cohorts for selection
cohortData: {}              // Complete participant data for analysis

// Visualization state  
selectedChart: []           // Currently highlighted chart elements
selectedCohortSection: []   // Selected Venn diagram regions
generalInfo: {}            // Statistical summaries and metadata

// UI state
searchValue: ""            // Table search filter
refreshTableContent: false // Table refresh trigger
alert: {}                 // User notification state
showNavigateAwayModal: false // Unsaved changes warning
```

**Integration with Global State:**
- **CohortStateContext**: Persistent cohort storage across application
- **CohortModalContext**: Cohort CRUD operations and modal state
- **Apollo Client Cache**: GraphQL data caching and normalization

### Performance Optimizations

**Data Management:**
- Apollo Client caching prevents redundant GraphQL queries
- Memoized calculations in visualization components (`useMemo`)
- Efficient participant ID lookup and mapping algorithms
- Lazy loading for chart expansion modals

**Visualization Performance:**
- Canvas-based rendering for Venn diagrams with interaction optimization
- Responsive chart containers with automatic resizing
- Optimized color calculations and opacity transformations
- Efficient event handling for chart interactions

### Integration Points

#### External CCDI Hub Integration
**Configuration:**
```javascript
CCDI_HUB_BASE_URL = "https://ccdi.cancer.gov/explore?import_from="
CCDI_INTEROP_SERVICE_URL = "https://ccdi.cancer.gov/api/interoperation/graphql"
```

**Export Functionality:**
- `exportToCCDIHub` function generates URLs with cohort parameters
- Participant IDs and dbGaP accessions passed as query parameters  
- Opens new tab with pre-filtered CCDI Hub interface

#### Authentication and Access Control
- Feature requires authenticated access for participant-level data
- Access levels configured through `NODE_LEVEL_ACCESS` and `PUBLIC_ACCESS`
- GraphQL queries include authentication context for data permissions

## Configuration and Customization

### Table Configuration
**File**: `src/bento/cohortAnalyzerPageData.js`
```javascript
export const tableConfig = {
  name: 'Participants',
  dataField: 'dataParticipant', 
  api: GET_COHORT_MANIFEST_QUERY,
  defaultSortField: 'participant_id',
  columns: [...]  // Column definitions with cell types
}
```

### Chart Styling and Themes
**Venn Diagram Colors:**
- Base colors defined in `ChartVennConfig.js`
- Intersection colors with opacity adjustments
- Selection state color modifications

**Histogram Themes:**
- Material-UI theme integration for consistent styling
- Custom bar colors defined in `HistogramPanel.styled.js`
- Responsive breakpoints for mobile optimization

### Modal and Tooltip Configuration
**File**: `src/bento/cohortModalData.js`
- Confirmation dialog types and messages
- Tooltip content for user guidance
- Download format configurations
- URL construction parameters

## Error Handling and Validation

### Data Validation
- **Cohort Selection Limits**: Maximum 3 cohorts enforced with user feedback
- **Empty Cohort Handling**: NoDataCard component displays when no data available
- **GraphQL Error Handling**: Loading and error states managed through Apollo hooks

### User Experience
- **Navigation Warnings**: Modal prompts for unsaved changes (`navigateAwayModal`)
- **Confirmation Dialogs**: Delete and clear operations require user confirmation
- **Progress Indicators**: Loading states during data fetching and processing
- **Error Notifications**: Global notification system for user feedback

## Known Limitations and Future Enhancements

### Current Limitations
- **3-Cohort Maximum**: Analysis limited to maximum of 3 cohorts for comparison
- **Static Analysis Types**: Predefined analysis types, not user-configurable
- **Export Formats**: Limited export options (PNG/SVG for charts, basic CSV for data)

### Potential Enhancements
- **Additional Statistical Tests**: Chi-square, t-tests, regression analysis
- **Custom Analysis Workflows**: User-defined analysis pipelines
- **Real-time Collaboration**: Multi-user cohort analysis and sharing
- **Advanced Visualizations**: Network graphs, heatmaps, multidimensional scaling

## Dependencies and External Libraries

### Core Dependencies
- **@bento-core/kmplot** - Kaplan-Meier survival analysis
- **@bento-core/risk-table** - Risk analysis and statistics
- **@bento-core/paginated-table** - Large dataset table display
- **chartjs-chart-venn** - Interactive Venn diagram generation
- **recharts** - Bar charts and histogram visualization
- **html-to-image** - Chart export and screenshot functionality

### Integration Dependencies  
- **Apollo Client** - GraphQL data fetching and caching
- **React Context** - Multi-layered state management
- **Material-UI** - UI components and theming
- **React Router** - Navigation and URL management

This comprehensive feature guide provides the foundation for understanding, maintaining, and extending the Cohort Analyzer functionality within the CCDI C3DC Frontend application.