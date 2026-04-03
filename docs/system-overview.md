# System Overview

## Purpose

The CCDI C3DC Frontend is a React-based web application that provides a user interface for the Childhood Cancer Data Initiative (CCDI) Cancer Complexity and Context Datacenter (C3DC). It serves as a portal for researchers and scientists to access, search, analyze, and visualize childhood cancer research data.

## System Scope

- **Data Discovery**: Search and browse cancer research datasets, studies, and participants
- **Data Visualization**: Interactive charts, tables, and statistical displays
- **Cohort Management**: Create, save, and analyze patient cohorts 
- **Authentication**: Multi-provider authentication (Google, NIH, Login.gov)
- **Data Export**: Download filtered datasets and analysis results
- **Study Management**: Browse and access individual study details

## Tech Stack

**Observed Core Technologies:**
- **Frontend Framework**: React 17.0.2 
- **State Management**: Redux with Redux Thunk middleware
- **Routing**: React Router DOM v6.1.1
- **GraphQL Client**: Apollo Client 3.6.9
- **UI Framework**: Material-UI 4.10.0 with custom styled-components
- **Build System**: Custom Webpack 4.28.3 configuration (Create React App based)
- **Charts**: Chart.js 3.1.0 with Venn diagram support

**Key Dependencies:**
- Multiple Bento Core packages (@bento-core/*) for reusable components
- Lodash for utility functions
- UUID for identifier generation
- HTML parsing and image generation utilities

## Startup Model

**Observed Entrypoint**: `src/index.js`

The application bootstraps through a standard React pattern:

1. **Root Rendering**: ReactDOM renders the App component into DOM element "root"
2. **Provider Wrapping**: App is wrapped with:
   - ApolloProvider (GraphQL client)
   - Redux Provider (state management)
3. **Theme Context**: CustomThemeProvider provides theming
4. **Global State**: GlobalProvider manages application-wide state
5. **Routing**: BrowserRouter enables client-side routing

## Major Subsystems

**Observed Subsystems:**

### Pages Layer (`src/pages/`)
- **Landing Page**: Main entry point and navigation hub
- **Search**: Data discovery and filtering interface  
- **Studies**: Study browsing and individual study details
- **Cart**: Data selection and export management
- **Cohort Analyzer**: Statistical analysis tools
- **About/Resources**: Static informational content

### Core Components (`src/components/`)
- **Layout**: Header, footer, navigation structure
- **Global**: Application-wide state and utilities
- **Stats**: Data statistics display components
- **Authentication**: Login/logout flow management
- **Notifications**: User feedback and messaging system

### Data Layer
- **GraphQL Integration**: Apollo Client with backend API connectivity
- **Redux Store**: Centralized state management for UI state
- **Bento Configuration**: Static data and UI configuration files

## Data/Storage Overview

**Observed Data Flow:**
- **Backend API**: GraphQL endpoint configured via environment variables
- **Client-side State**: Redux store for UI state, Apollo cache for GraphQL data
- **Configuration Data**: Static configuration in `src/bento/` directory
- **No Local Persistence**: No observed localStorage or IndexedDB usage

**Inferred Data Sources:**
- Primary data appears to come from GraphQL API
- Configuration data stored as JavaScript modules
- Authentication state likely managed through session/cookies

## External Integrations

**Observed Integrations:**
- **GraphQL API**: Primary backend data source (configured via REACT_APP_BACKEND_API)
- **Authentication Providers**: Google, NIH, Login.gov (multi-provider auth)
- **Content Delivery**: Static assets served from public directory

**Inferred Integrations:**
- Backend likely provides cancer research datasets and metadata
- Authentication integrations for institutional access control

## Key Architectural Patterns

**Observed Patterns:**
- **Component-based Architecture**: React functional components with hooks
- **Provider Pattern**: Context providers for theme and global state
- **Configuration-driven UI**: Bento configuration files control page layouts
- **Modular Package Structure**: Bento Core packages provide reusable functionality
- **GraphQL-first Data Fetching**: Apollo Client for all API interactions

**Inferred Patterns:**
- **Responsive Design**: Material-UI suggests mobile-responsive interface
- **Theming System**: Custom theme provider indicates configurable styling

## Risks and Unknowns

**Technical Risks:**
- **Dependency Age**: Some dependencies may be outdated (Webpack 4, React 17)
- **Build Complexity**: Custom Webpack configuration may be difficult to maintain
- **Package Versioning**: Multiple beta/alpha Bento Core packages suggest active development

**Unknown Areas:**
- **Backend Architecture**: GraphQL schema and API implementation details unknown
- **Authentication Flow**: Specific OAuth/SAML implementation details unclear
- **Data Volume**: Performance characteristics with large datasets unknown
- **Deployment Strategy**: Production deployment and scaling approach unclear
- **Error Handling**: Global error boundaries and recovery strategies not observed
- **Testing Coverage**: Test strategy and coverage levels not confirmed