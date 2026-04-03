# Features Index

## Purpose

This document provides an index and scoping guide for the user-facing features in the CCDI C3DC Frontend application. Each feature represents a complete user workflow or functional capability.

## Feature Categories

### Core Portal Features

#### Landing and Navigation
**Purpose**: Main entry point and site navigation
**Location**: `src/pages/landing/`
**Status**: **Observed** - Directory structure confirmed

**Expected User Workflows**:
- Portal introduction and overview
- Feature discovery and navigation
- Quick access to major functions
- News and announcements display

**Configuration**: 
- `landingPageData.js` - Content and layout configuration
- `newsData.js` - News and updates content

**Priority**: **Medium** - Important for first impressions but not core functionality

#### Search and Data Discovery  
**Purpose**: Primary data exploration and filtering interface
**Location**: `src/pages/search/`
**Status**: **Inferred** - Directory observed, implementation unclear

**Expected User Workflows**:
1. **Initial Search** - Browse available datasets and studies
2. **Filter Application** - Narrow results using faceted search
3. **Results Review** - View paginated results with key metadata
4. **Item Selection** - Choose items for detailed analysis or cart addition

**Dependencies**:
- `@bento-core/facet-filter` - Advanced filtering interface
- `@bento-core/paginated-table` - Results display with pagination
- `@bento-core/local-find` - Local search within results

**Integration Points**:
- GraphQL queries for search data
- Redux state for filter persistence
- Cart integration for item selection

**Priority**: **High** - Core user workflow for data discovery

#### Study Management
**Purpose**: Browse studies and view detailed study information
**Location**: `src/pages/studies/`, `src/pages/studyDetail/`
**Status**: **Inferred** - Directory structure observed

**Expected User Workflows**:
1. **Study Browsing** - List and filter available studies
2. **Study Selection** - Choose study for detailed examination
3. **Metadata Review** - View comprehensive study information
4. **Participant Access** - Navigate to study participants and data

**Configuration**:
- `studiesData.js` - Study listing configuration
- `studyDetailData.js` - Detail page layout configuration

**Integration Points**:
- Study-specific GraphQL queries
- Navigation integration with other features
- Authentication checks for data access

**Priority**: **High** - Essential for understanding available data

### Data Analysis Features

#### Cohort Analysis and Management
**Purpose**: Statistical analysis and cohort creation tools
**Location**: `src/pages/CohortAnalyzer/`, `src/pages/CohortManager/`
**Status**: **Documented** - Comprehensive implementation analysis completed

**Detailed Documentation**: [`docs/features/cohort-analyzer.md`](./cohort-analyzer.md)

**Key User Workflows**:
1. **Cohort Selection** - Choose up to 3 cohorts for comparative analysis
2. **Statistical Visualization** - Interactive Venn diagrams, histograms, survival curves
3. **Data Exploration** - Demographics analysis, treatment comparisons, outcome analysis
4. **Export Integration** - CCDI Hub export, chart downloads, data manifests

**Core Dependencies**:
- `@bento-core/kmplot` - Kaplan-Meier survival analysis
- `@bento-core/risk-table` - Risk analysis and statistics
- `chartjs-chart-venn` - Interactive Venn diagrams
- `recharts` - Histogram and bar chart visualizations
- `html-to-image` - Chart export functionality

**Configuration**:
- `cohortAnalyzerPageData.js` - Table and query configuration
- `cohortModalData.js` - Modal behavior and CCDI Hub integration
- Multi-layered context providers for state management

**Integration Points**:
- GraphQL queries: `GET_PARTICIPANTS_OVERVIEW_QUERY`, `GET_DIAGNOSIS_OVERVIEW_QUERY`, `GET_TREATMENT_OVERVIEW_QUERY`
- CohortStateContext for global cohort management
- Apollo Client caching for performance optimization

**Priority**: **High** - Core analytical feature with complex statistical capabilities

#### Data Visualization and Statistics
**Purpose**: Interactive charts, graphs, and statistical displays
**Location**: `src/components/Stats/`, various page integrations
**Status**: **Partial** - Components observed, chart implementations unclear

**Expected User Workflows**:
1. **Dashboard Statistics** - View high-level data summaries
2. **Interactive Charts** - Explore data through interactive visualizations
3. **Comparative Analysis** - Compare datasets or cohorts
4. **Export Visualizations** - Save charts and graphs for external use

**Dependencies**:
- `@bento-core/widgets` - Statistical display widgets
- `Chart.js` ecosystem - Chart rendering and interaction
- `@bento-core/stats-bar` - Statistics bar components

**Priority**: **Medium** - Important for data understanding but secondary to core workflows

### Data Management Features

#### Shopping Cart and Export
**Purpose**: Data selection, organization, and export functionality
**Location**: `src/pages/cart/`
**Status**: **Partial** - Bento integration observed, export mechanism unclear

**Expected User Workflows**:
1. **Item Addition** - Add studies, files, or participants to cart
2. **Cart Management** - Review, organize, and modify selected items
3. **Export Configuration** - Choose format, filters, and export options
4. **Download Process** - Generate and download requested data files
5. **Cart Persistence** - Save cart contents across sessions

**Dependencies**:
- `@bento-core/cart` - Core cart functionality
- `DocumentDownload` component - File download handling
- Backend export services - File generation and delivery

**Configuration**:
- `fileCentricCartWorkflowData.js` - Cart behavior and workflow

**Integration Points**:
- Integration with search and study features for item addition
- Authentication for download permissions
- Backend APIs for file generation

**Priority**: **High** - Essential for data delivery and user value

#### Inventory Management
**Purpose**: Browse and manage available data files and resources
**Location**: `src/pages/inventory/`
**Status**: **Inferred** - Directory observed, functionality unclear

**Expected User Workflows**:
1. **File Browsing** - Navigate available data files
2. **Metadata Review** - View file descriptions and properties  
3. **File Selection** - Choose files for analysis or download
4. **Bulk Operations** - Select multiple files for batch processing

**Priority**: **Medium** - Important for data management but may overlap with search

### Authentication and User Management

#### User Authentication
**Purpose**: User login, logout, and session management
**Location**: Distributed across application, integrated with all features
**Status**: **Inferred** - Configuration observed, implementation unclear

**Expected User Workflows**:
1. **Provider Selection** - Choose authentication method (Google, NIH, Login.gov)
2. **Login Process** - Complete OAuth/SAML authentication flow
3. **Session Management** - Maintain authenticated state across application
4. **Access Control** - Enforce permissions based on user identity
5. **Logout Process** - Secure session termination

**Configuration**:
- `siteWideConfig.js` - Authentication provider settings
- Environment variables for OAuth configuration

**Priority**: **High** - Critical for secure access to protected data

#### User Profile and Preferences
**Purpose**: User account management and application customization
**Location**: Inferred integration, no specific directory observed
**Status**: **Unknown** - No clear implementation observed

**Expected Features**:
- User profile information display
- Application preference settings
- Access request management
- Usage history and saved items

**Priority**: **Low** - Nice to have but not essential for core functionality

### Content and Information Features

#### About and Documentation
**Purpose**: Static informational content about the portal and data
**Location**: `src/pages/about/`, `src/pages/resources/`
**Status**: **Observed** - Directories confirmed

**Expected Content**:
- Portal mission and overview
- Data descriptions and documentation
- Usage guides and tutorials
- Contact information and support

**Configuration**:
- `aboutPageData.js` - About page content
- `resourcesPageData.js` - Resources page content

**Priority**: **Low** - Important for user education but not primary workflows

#### News and Announcements
**Purpose**: Portal updates, news, and important announcements
**Location**: `src/pages/news/`, `src/pages/announcement/`
**Status**: **Observed** - Directories confirmed

**Configuration**:
- `newsData.js` - News content management
- `announcementPageData.js` - Announcement configuration

**Priority**: **Low** - Helpful for user engagement but not core functionality

#### Release Notes and Documentation
**Purpose**: Technical documentation and version information
**Location**: `src/pages/releaseNote/`
**Status**: **Observed** - Directory confirmed

**Configuration**:
- `releaseNotePageData.js` - Release note content

**Priority**: **Low** - Important for developers and power users

## Feature Integration Patterns

### Cross-Feature Integration

**Search → Studies → Cart Flow**:
1. User searches for relevant data
2. Reviews individual studies from search results
3. Adds studies or participants to cart for export

**Search → Cohort Analysis Flow**:
1. User discovers participants through search
2. Selects participants for cohort creation
3. Performs statistical analysis on cohort

**Authentication Integration**:
- All data-access features require authentication
- Different access levels control available functionality
- Public access may be limited to metadata only

### State Management Integration

**Redux State Sharing**:
- Cart contents persist across features
- Search filters may persist during navigation
- User preferences affect all feature interfaces

**GraphQL Data Sharing**:
- Apollo cache prevents redundant API calls
- Shared queries optimize performance across features
- Real-time updates propagate to all relevant features

## Feature Documentation Priorities

### Immediate Documentation Needs (High Priority)

1. **Search and Data Discovery** - Core user workflow, complex filtering logic
2. **Shopping Cart and Export** - Essential for data delivery, unclear export process
3. **User Authentication** - Critical security feature, multi-provider complexity
4. **Cohort Analysis** - Advanced feature with complex statistical algorithms

### Secondary Documentation Needs (Medium Priority)

1. **Study Management** - Important workflow, likely straightforward implementation
2. **Data Visualization** - Important for user experience, chart library integration
3. **Inventory Management** - May overlap with search, unclear unique value

### Lower Priority Documentation

1. **Static Content Features** - Straightforward implementations
2. **Profile and Preferences** - May not be fully implemented
3. **News and Announcements** - Simple content management

## Feature Testing Considerations

### Critical Feature Testing

**End-to-End Workflows**:
- Complete search → analysis → export workflow
- Authentication flow with all protected features  
- Cart functionality across multiple sessions

**Integration Testing**:
- Feature interactions and data sharing
- State consistency across navigation
- Error handling in complex workflows

### Performance Testing

**Data-Heavy Features**:
- Search with large result sets
- Cohort analysis with complex calculations
- Export with large file generation

## Unknown Feature Areas

**High Priority Investigation**:
1. **Search Algorithm** - How queries are constructed and executed
2. **Export Mechanisms** - How files are generated and delivered  
3. **Analysis Calculations** - What statistical methods are implemented
4. **Authentication Integration** - How providers integrate with backend

**Medium Priority Investigation**:
1. **Real-time Features** - Whether any features use live data updates
2. **Collaboration Features** - Whether cohorts or carts can be shared
3. **Advanced Analytics** - What sophisticated analysis tools are available
4. **Data Validation** - How data quality and consistency are ensured