# Components

## Component List

### Application Layer
- **App** (`src/components/App.js`) - Root application component with provider setup
- **Layout** (`src/components/Layout/`) - Main application layout structure
- **ThemeContext** (`src/components/ThemeContext.js`) - Theme provider and styling context

### Page Components (`src/pages/`)
- **Landing Page** - Main portal entry point
- **Search** - Data discovery interface
- **Studies** - Study browsing and details
- **Cart** - Data selection and export
- **CohortAnalyzer** - Statistical analysis tools
- **About/Resources** - Static content pages
- **Authentication Pages** - Login/profile management

### Core UI Components (`src/components/`)
- **ResponsiveHeader** - Application navigation header
- **ResponsiveFooter** - Application footer
- **Layout** - Page layout wrapper and structure
- **Stats** - Data statistics display widgets
- **Notifications** - User feedback and alert system
- **Global** - Application-wide state components

### Utility Components
- **Breadcrumbs** - Navigation breadcrumb display
- **CustomCheckbox** - Styled checkbox inputs
- **CustomIcon** - Custom icon components
- **DocumentDownload** - File download functionality
- **EllipsisText** - Text truncation display
- **ToolTipIcon** - Enhanced tooltip displays
- **ScrollButton** - Scroll-to-top functionality

### Bento Core Components (External Packages)
- **@bento-core/facet-filter** - Data filtering interface
- **@bento-core/paginated-table** - Data table with pagination
- **@bento-core/stats-bar** - Statistics display bar
- **@bento-core/cart** - Shopping cart functionality
- **@bento-core/widgets** - Reusable UI widgets

## Responsibilities

### Application Architecture
- **App Component**: Provider orchestration, routing setup, global context management
- **Layout Components**: Page structure, responsive design, navigation framework
- **Theme System**: Consistent styling, Material-UI integration, custom themes

### Data Management
- **Redux Store**: UI state management, user preferences, session data
- **Apollo Client**: GraphQL data fetching, caching, query management
- **Global State**: Cross-component state sharing, user authentication status

### User Interface
- **Page Components**: Feature-specific UI, user workflows, data presentation
- **Core Components**: Reusable UI patterns, consistent user experience
- **Bento Components**: Domain-specific widgets, data visualization, advanced interactions

### Integration Layer
- **GraphQL Client**: Backend API communication, data synchronization
- **Authentication**: User identity management, access control, session handling
- **Configuration**: Static data management, environment-specific settings

## Interfaces and Boundaries

### Component Boundaries

**Observed Boundaries:**
- **Page Level**: Each page component manages its own local state and layout
- **Layout Level**: Header/Footer components provide consistent navigation structure
- **Feature Level**: Bento Core components encapsulate specific domain logic
- **Utility Level**: Helper components provide cross-cutting functionality

**Data Flow Boundaries:**
- **Props Interface**: Parent-to-child data passing via React props
- **Context Interface**: Cross-component data sharing via React Context
- **Redux Interface**: Global state access via useSelector/useDispatch hooks
- **GraphQL Interface**: Server data access via Apollo Client hooks

### External Interfaces

**API Boundaries:**
- **GraphQL Endpoint**: Single API endpoint for all backend communication
- **Authentication Providers**: OAuth/SAML integration with identity providers
- **Static Assets**: Public directory for images, fonts, and static content

## Dependency Relationships

### Internal Dependencies

**Core Dependencies:**
```
App
├── CustomThemeProvider
├── GlobalProvider  
├── BrowserRouter
└── Layout
    ├── ResponsiveHeader
    ├── Page Components
    └── ResponsiveFooter
```

**State Dependencies:**
- **Redux Store** ← All components requiring global state
- **Apollo Client** ← All components requiring server data
- **Theme Context** ← All components requiring styling

### External Dependencies

**Critical Path:**
- **React/ReactDOM**: Core rendering and component system
- **Material-UI**: UI component library and theming
- **Apollo Client**: GraphQL client and caching
- **Redux**: State management and middleware
- **React Router**: Client-side routing

**Bento Ecosystem:**
- **@bento-core packages**: Domain-specific components and utilities
- **Configuration modules**: Static data and UI configuration

## Shared Utilities

### Common Utilities (`src/utils/`)
- **graphqlClient.js** - Apollo Client configuration and setup
- **env.js** - Environment variable management and defaults
- **colors.js** - Color palette and theme constants
- **urlManager.js** - URL construction and management

### Configuration System (`src/bento/`)
- **siteWideConfig.js** - Global application settings
- **Page Data Files** - Static configuration for each page component
- **dashTemplate.js** - Dashboard layout and widget configuration

### Cross-cutting Concerns
- **Error Handling**: Notification system for user feedback
- **Loading States**: Consistent loading indicators across components
- **Authentication**: User session and access control throughout app

## Hotspots

### Performance Concerns
- **Large Data Tables**: Pagination and virtualization needed for dataset browsing
- **GraphQL Queries**: Query optimization and caching strategy critical
- **Bundle Size**: Multiple Bento packages may increase initial load time

### Maintainability Concerns  
- **Configuration Complexity**: Large number of static configuration files
- **Dependency Management**: Many @bento-core packages in development versions
- **Custom Webpack**: Build configuration may be difficult to upgrade

### Integration Points
- **Authentication Flow**: Multi-provider auth adds complexity
- **Backend API Changes**: GraphQL schema evolution may break client
- **Theming System**: Custom Material-UI theme overrides may conflict with updates

**Unknown Dependencies:**
- **Backend API Schema**: Full GraphQL schema and available operations unknown
- **Bento Core Internals**: Implementation details of external packages unclear
- **Build Pipeline**: Full webpack configuration and optimization unclear