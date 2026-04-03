# AI Context

## System Understanding

### Architecture Overview
This is a **React-based frontend application** for the Childhood Cancer Data Initiative (CCDI) Cancer Complexity and Context Datacenter (C3DC). The application serves as a research portal for cancer data discovery, analysis, and export.

**Key Architectural Patterns**:
- **Component-based architecture** with React functional components and hooks
- **Configuration-driven UI** with extensive static configuration in `src/bento/`
- **GraphQL-first data access** via Apollo Client with centralized caching
- **Multi-provider authentication** (Google, NIH, Login.gov)
- **Modular package system** using Bento Core ecosystem packages

### Technology Stack Context
- **Frontend**: React 17.0.2, Material-UI 4.10.0, styled-components
- **State Management**: Redux with Redux Thunk, Apollo Client cache
- **Data Layer**: GraphQL via Apollo Client, RESTful endpoints for file downloads
- **Build System**: Custom Webpack 4 configuration based on Create React App
- **Authentication**: Multi-provider OAuth/SAML (configuration-based)

### Data Domain Context
- **Primary Domain**: Childhood cancer research data
- **Data Types**: Studies, participants, specimens, files, cohorts
- **User Types**: Researchers, data scientists, institutional users
- **Access Patterns**: Search → filter → analyze → export workflows

## Development Patterns

### Component Architecture
```javascript
// Standard component pattern observed:
const ComponentName = ({ prop1, prop2 }) => {
  // Hooks for state and data
  const [localState, setLocalState] = useState();
  const { data, loading, error } = useQuery(GRAPHQL_QUERY);
  const dispatch = useDispatch();
  
  // Component logic
  return (
    <StyledComponent>
      {/* JSX structure */}
    </StyledComponent>
  );
};
```

### Advanced Feature Pattern (Cohort Analyzer)
```javascript
// Multi-context provider pattern for complex features:
const FeatureController = () => (
  <GlobalStateProvider>
    <FeatureModalProvider>
      <FeatureSpecificProvider>
        <MainFeatureComponent />
      </FeatureSpecificProvider>
    </FeatureModalProvider>
  </GlobalStateProvider>
);

// Context hook pattern for feature state:
const useFeatureContext = () => {
  const context = useContext(FeatureContext);
  return context;
};
```

### Configuration Pattern
```javascript
// Configuration files follow this pattern:
export const pageData = {
  title: 'Page Title',
  components: [...],
  layout: {...},
  // Static data and UI configuration
};
```

### GraphQL Integration Pattern
```javascript
// Apollo Client integration:
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_NAME } from '../graphql/queries';

// Usage in components:
const { data, loading, error } = useQuery(QUERY_NAME, {
  variables: { ... }
});
```

## Code Navigation Guide

### Key Entry Points
1. **`src/index.js`** - Application bootstrap and provider setup
2. **`src/components/App.js`** - Root component with routing and context
3. **`src/components/Layout/LayoutView.js`** - Main application shell
4. **`src/bento/siteWideConfig.js`** - Global configuration settings

### Configuration System
- **`src/bento/`** - Contains all static configuration for pages and components
- **Page Data Files** - Each major page has a corresponding data configuration file
- **Environment Variables** - Configured via `src/utils/env.js` with defaults

### Component Locations
- **`src/components/`** - Reusable application components
- **`src/pages/`** - Page-level components and features
- **`@bento-core/*`** - External packages providing domain-specific functionality

### State Management
- **Redux Store**: `src/store/` - Global UI state management
- **Apollo Cache**: GraphQL data caching and normalization
- **React Context**: Theme and global application context

## Common Development Tasks

### Adding New Pages
1. Create page component in `src/pages/[pageName]/`
2. Add configuration file in `src/bento/[pageName]Data.js`
3. Update routing in Layout component
4. Add navigation links in header configuration

### Integrating GraphQL Queries
1. Define queries in `graphql/` directory (if following pattern)
2. Use Apollo Client hooks in components
3. Handle loading and error states consistently
4. Leverage Apollo cache for performance

### Styling and Theming
1. Use Material-UI theme system via CustomThemeProvider
2. Leverage styled-components for custom styling
3. Reference color palette from `src/utils/colors.js`
4. Maintain responsive design patterns

### Adding Bento Core Components
1. Install appropriate `@bento-core/` package
2. Import and configure component according to Bento patterns
3. Update configuration files to wire component into pages
4. Test integration with existing state management

## Development Environment Context

### Build and Development
```bash
# Standard development workflow:
npm install          # Install dependencies
npm start           # Start development server (localhost:3000)
npm run build       # Production build
npm test            # Run test suite
npm run lint        # ESLint code checking
```

### Environment Configuration
- **Development**: Uses `src/utils/env.js` for environment variable management
- **Backend API**: Configured via `REACT_APP_BACKEND_API` environment variable
- **Authentication**: Provider settings in `siteWideConfig.js`
- **Public Access**: Configurable access levels for unauthenticated users

### Testing Patterns
- **Jest**: Test framework configuration observed in package.json
- **React Testing Library**: Testing utilities installed
- **Coverage**: Configured to collect from `src/**/*.{js,jsx,ts,tsx}`

## Integration Points

### Backend Integration
- **Primary API**: GraphQL endpoint (single endpoint pattern)
- **Authentication APIs**: OAuth/SAML endpoints for identity providers
- **File Downloads**: Likely separate REST endpoints for file delivery
- **Configuration**: Backend URL configured via environment variables

### External Services
- **Identity Providers**: Google, NIH, Login.gov OAuth/SAML integration
- **CDN/Static Assets**: Public directory for images, fonts, static files
- **Analytics**: No obvious analytics integration observed

### Third-Party Libraries
- **Bento Ecosystem**: Multiple `@bento-core/` packages for domain functionality
- **Material-UI**: UI component library with custom theming
- **Chart.js**: Data visualization and statistical charts
- **Lodash**: Utility functions throughout application

## Performance Considerations

### Known Performance Patterns
- **Apollo Client Caching**: Reduces redundant GraphQL queries
- **Webpack Code Splitting**: Likely implemented for bundle optimization
- **Pagination**: Bento paginated-table handles large datasets
- **Lazy Loading**: May be implemented for page components (unclear)

### Potential Performance Issues
- **Bundle Size**: Multiple Bento packages may increase initial load time
- **Large Datasets**: Complex analysis features may struggle with large cohorts
- **GraphQL Queries**: N+1 query problems possible without proper batching

## Security Context

### Authentication Architecture
- **Multi-Provider Support**: Reduces vendor lock-in, increases complexity
- **Public Access**: Configurable levels allow metadata-only access
- **Session Management**: Implementation details unclear but timeout configured

### Data Access Patterns
- **API Authorization**: Backend likely handles data access permissions
- **Client-side Security**: Authentication state managed in React context
- **Export Controls**: Download permissions likely enforced server-side

## Maintenance Considerations

### Technical Debt Areas
- **Dependency Management**: Some packages may be outdated (React 17, Webpack 4)
- **Configuration Complexity**: Large number of static configuration files
- **Custom Build**: Webpack customizations may complicate upgrades

### Upgrade Paths
- **React 18**: Likely straightforward upgrade path
- **Webpack 5**: May require build configuration updates
- **Material-UI v5**: Breaking changes likely require theme updates
- **Bento Packages**: Keep packages in sync with ecosystem updates

### Documentation Gaps
- **GraphQL Schema**: Backend API documentation needed
- **Authentication Flow**: Provider integration details unclear
- **Export Processes**: File generation and delivery mechanisms unknown
- **Testing Strategy**: Test coverage and patterns not well documented

## AI-Assisted Development Guidance

### When Adding Features
1. **Follow Configuration Pattern**: Create corresponding data configuration file
2. **Leverage Bento Components**: Check if Bento ecosystem has suitable component
3. **Use GraphQL Consistently**: Follow Apollo Client patterns for data access
4. **Maintain Authentication Integration**: Ensure proper access controls

### When Debugging Issues
1. **Check Apollo DevTools**: GraphQL query and cache inspection
2. **Redux DevTools**: State management debugging
3. **Network Tab**: API calls and authentication token inspection
4. **Console Logging**: Existing patterns for error logging

### When Refactoring
1. **Configuration Impact**: Changes may affect multiple configuration files
2. **State Management**: Consider both Redux and Apollo cache implications
3. **Component Dependencies**: Bento components may have hidden dependencies
4. **Authentication Flow**: Changes may affect access control throughout app

### Best Practices Observed
- **Consistent Error Handling**: Notification system for user feedback
- **Loading States**: Consistent loading indicators across features
- **Responsive Design**: Material-UI breakpoints for mobile support
- **Environment Configuration**: Centralized environment variable management