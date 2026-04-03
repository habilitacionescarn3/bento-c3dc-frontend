# Modules Index

## Purpose

This document provides an index and scoping guide for the major modules in the CCDI C3DC Frontend codebase. Each module represents a logical grouping of functionality with defined responsibilities and interfaces.

## Module Categories

### Core Application Modules

#### App Module (`src/components/App.js`, `src/index.js`)
**Responsibility**: Application bootstrap, provider orchestration, and root component rendering

**Key Files**:
- `src/index.js` - ReactDOM rendering and provider setup
- `src/components/App.js` - Root component with context providers
- `src/components/ThemeContext.js` - Application theming system

**Interfaces**: Entry point for entire application
**Status**: **Observed** - Complete implementation visible

#### Layout Module (`src/components/Layout/`)
**Responsibility**: Application shell, navigation structure, and responsive design

**Key Components**:
- `Layout/LayoutView.js` - Main layout wrapper
- `ResponsiveHeader/` - Application header and navigation
- `ResponsiveFooter/` - Application footer

**Interfaces**: Provides consistent page structure for all routes
**Status**: **Observed** - Directory structure confirmed

#### State Management Module (`src/store/`)
**Responsibility**: Global application state management using Redux

**Key Files**:
- `src/store/index.js` - Redux store configuration
- `src/store/StatsState.js` - Statistics state management

**Interfaces**: Redux hooks (useSelector, useDispatch) for component integration
**Status**: **Partial** - Store setup observed, reducers unclear

### Data Layer Modules

#### GraphQL Client Module (`src/utils/graphqlClient.js`)
**Responsibility**: Apollo Client configuration and backend API communication

**Key Features**:
- Apollo Client setup with InMemoryCache
- Environment-based endpoint configuration
- GraphQL query and mutation handling

**Interfaces**: Apollo hooks (useQuery, useMutation) for components
**Status**: **Observed** - Client configuration complete

#### Configuration Module (`src/bento/`)
**Responsibility**: Static configuration data and UI customization

**Key Configuration Files**:
- `siteWideConfig.js` - Global application settings
- `dashboardTabData.js` - Dashboard configuration
- `globalHeaderData.js` - Navigation configuration
- Page-specific data files for each major page

**Interfaces**: ES6 module exports for component consumption
**Status**: **Observed** - Extensive configuration system confirmed

### Feature Modules

#### Authentication Module (Inferred)
**Responsibility**: User authentication, session management, and access control

**Configuration Points**:
- `siteWideConfig.js` - Authentication provider settings
- Multi-provider support (Google, NIH, Login.gov)
- Access level controls (PUBLIC_ACCESS, NODE_LEVEL_ACCESS)

**Interfaces**: Authentication context for protected routes and components
**Status**: **Inferred** - Configuration observed, implementation unclear

#### Search Module (`src/pages/search/`)
**Responsibility**: Data discovery, filtering, and search functionality

**Expected Components**:
- Search interface components
- Filter management
- Results display and pagination

**Interfaces**: Search state management and result handling
**Status**: **Inferred** - Directory structure observed, components unclear

#### Studies Module (`src/pages/studies/`, `src/pages/studyDetail/`)
**Responsibility**: Study browsing, listing, and detailed study information

**Components**:
- Study listing interfaces
- Individual study detail views
- Study metadata display

**Interfaces**: Study data models and display components
**Status**: **Inferred** - Page structure observed, implementation unclear

#### Cart Module (`src/pages/cart/`)
**Responsibility**: Data selection, cart management, and export functionality

**External Integration**:
- `@bento-core/cart` package integration
- `DocumentDownload` component integration
- `fileCentricCartWorkflowData.js` configuration

**Interfaces**: Cart state management and export workflows
**Status**: **Partial** - Integration observed, internal logic unclear

#### Cohort Analysis Module (`src/pages/CohortAnalyzer/`, `src/pages/CohortManager/`)
**Responsibility**: Statistical analysis, cohort creation, and data visualization

**Dependencies**:
- `Chart.js` for data visualization
- `chartjs-chart-venn` for Venn diagrams
- Bento core statistics components

**Interfaces**: Analysis workflows and visualization components
**Status**: **Inferred** - Dependencies observed, algorithms unclear

### Utility Modules

#### Environment Module (`src/utils/env.js`)
**Responsibility**: Environment variable management and configuration defaults

**Key Functions**:
- Environment variable parsing
- Default value handling
- Boolean flag processing

**Interfaces**: Environment value exports for application configuration
**Status**: **Observed** - Implementation visible

#### URL Management Module (`src/utils/urlManager.js`)
**Responsibility**: URL construction, routing helpers, and link management

**Expected Features**:
- Route construction utilities
- Query parameter handling
- Deep linking support

**Interfaces**: URL helper functions for navigation components
**Status**: **Inferred** - File exists, implementation unclear

#### Colors and Theming Module (`src/utils/colors.js`, `src/themes/`)
**Responsibility**: Color palette management and theme definitions

**Integration Points**:
- Material-UI theme customization
- Consistent color usage across components
- Theme switching capabilities

**Interfaces**: Color constants and theme objects for styled components
**Status**: **Observed** - Color utilities confirmed, theme details unclear

## Module Dependencies

### High-Level Dependency Flow
```
App Module
├── State Management Module
├── GraphQL Client Module
├── Layout Module
│   ├── Authentication Module
│   ├── Navigation Components
│   └── Page Modules
│       ├── Search Module
│       ├── Studies Module
│       ├── Cart Module
│       └── Cohort Analysis Module
└── Utility Modules
    ├── Environment Module
    ├── URL Management Module
    └── Theming Module
```

### Cross-Module Dependencies

**Configuration Dependencies**:
- All feature modules depend on Configuration Module for UI customization
- Authentication Module depends on Environment Module for provider settings
- Layout Module depends on Configuration Module for navigation structure

**Data Dependencies**:
- Feature modules depend on GraphQL Client Module for backend data
- Statistics and analysis depend on State Management Module for UI state
- Cart and export depend on both GraphQL and State modules

## Module Scoping Guidelines

### When to Create Module Documentation

**High Priority Modules** (Generate detailed docs first):
1. **Authentication Module** - Critical for security and access control
2. **Search Module** - Core user workflow for data discovery
3. **GraphQL Integration** - Primary data access pattern
4. **Cart and Export** - Essential for data delivery

**Medium Priority Modules**:
1. **Configuration System** - Important for customization and maintenance
2. **Layout and Navigation** - Affects user experience consistency
3. **Cohort Analysis** - Advanced feature with complex algorithms

**Lower Priority Modules**:
1. **Utility Modules** - Generally straightforward implementations
2. **Static Content Modules** - About, resources, documentation pages

### Module Documentation Approach

**For Each Module Include**:
- **Purpose and Scope** - Clear responsibility definition
- **Key Components** - Major files and their roles
- **Public Interfaces** - How other modules interact with this one
- **Dependencies** - Both internal and external dependencies
- **Configuration Points** - Environment variables and settings
- **Known Issues** - Bugs, limitations, or technical debt
- **Testing Status** - Current test coverage and gaps

### Integration Testing Focus

**Critical Integration Points**:
- Authentication flow with all protected features
- GraphQL client integration with all data-dependent modules
- State management consistency across feature modules
- Configuration system usage across all customizable components

## Unknown Module Areas

**High Priority Investigation Needed**:
1. **Authentication Implementation** - How providers integrate and tokens are managed
2. **Search Logic** - How queries are constructed and filters applied
3. **Data Export Process** - How files are generated and delivered
4. **Analysis Algorithms** - How statistical calculations are performed

**Medium Priority Investigation**:
1. **Error Handling Patterns** - How modules handle and propagate errors
2. **Performance Optimizations** - How modules manage large datasets
3. **Testing Strategies** - How modules are tested in isolation and integration
4. **Deployment Configuration** - How modules are built and deployed together