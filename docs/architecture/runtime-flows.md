# Runtime Flows

## Purpose

This document outlines the major runtime flow categories in the CCDI C3DC Frontend application, based on observed code structure and inferred user workflows.

## Major Flow Categories

### Startup Flow

**Observed Flow:**
1. **Application Bootstrap** (`src/index.js`)
   - ReactDOM renders App component into DOM
   - Apollo Provider wraps app with GraphQL client
   - Redux Provider wraps app with state store
   
2. **Context Initialization**
   - CustomThemeProvider loads Material-UI theme
   - GlobalProvider initializes application-wide state
   - BrowserRouter enables client-side routing

3. **Layout Rendering**
   - Layout component renders header/footer structure
   - Initial page component loads based on current route
   - NotificationView renders for user feedback

**Status**: **Observed** - Directly confirmed from `src/index.js` and `src/components/App.js`

### Authentication Flow

**Inferred Flow:**
1. **Provider Selection** - User chooses from Google, NIH, or Login.gov
2. **OAuth Redirect** - Application redirects to chosen identity provider
3. **Token Exchange** - Provider returns authorization tokens
4. **Session Establishment** - Application establishes authenticated session
5. **Access Control** - Components check authentication state for data access

**Configuration Points:**
- `enableAuthentication` flag controls auth requirement
- `enabledAuthProviders` array configures available providers
- `PUBLIC_ACCESS` level defines unauthenticated access scope

**Status**: **Inferred** - Configuration observed but implementation details unknown

### Data Discovery Flow

**Observed Components:**
1. **Landing Page** - Entry point with navigation options
2. **Search Interface** - Data filtering and query building
3. **Results Display** - Paginated tables with study/participant data
4. **Detail Views** - Individual study or participant information

**Inferred User Journey:**
1. User navigates to search page
2. Applies filters using facet-filter components  
3. Views paginated results in data tables
4. Selects items for detailed analysis or cart addition

**Status**: **Inferred** - Page structure observed, specific workflows unclear

### Data Analysis Flow (Cohort Analyzer)

**Observed Components:**
- **CohortAnalyzer** page component
- **CohortManager** for cohort operations
- **Stats** components for data visualization
- **Chart.js** integration for statistical displays

**Inferred Workflow:**
1. **Cohort Creation** - User selects participants/studies for analysis
2. **Statistical Analysis** - System generates charts and statistics
3. **Visualization** - Interactive charts display analysis results
4. **Export/Save** - User can export results or save cohorts

**Status**: **Inferred** - Components observed but analysis algorithms unknown

### Cart and Export Flow

**Observed Integration:**
- **@bento-core/cart** package handles cart functionality
- **DocumentDownload** component manages file downloads
- **fileCentricCartWorkflowData.js** configures cart behavior

**Inferred Workflow:**
1. **Item Selection** - User adds studies/files to cart
2. **Cart Management** - Review, modify, or organize selected items  
3. **Export Configuration** - Choose format and download options
4. **File Generation** - System packages and delivers requested data

**Status**: **Inferred** - Cart integration observed, export mechanism unclear

### Navigation and Routing Flow

**Observed Routing Structure:**
- **React Router DOM v6** handles client-side navigation
- **BrowserRouter** enables history-based routing
- **Layout** component provides consistent navigation structure

**Page Routes** (Inferred from directory structure):
- `/` - Landing page
- `/search` - Data search interface
- `/studies` - Study browsing
- `/studies/:id` - Individual study details
- `/cart` - Shopping cart management
- `/cohort-analyzer` - Statistical analysis tools
- `/about` - About page
- `/resources` - Resources page

**Status**: **Observed** - Router setup confirmed, specific routes inferred from page structure

### Error Handling and Notifications Flow

**Observed Components:**
1. **NotificationView** - Global notification display
2. **Global error context** - Application-wide error management
3. **Loading states** - User feedback during async operations

**Inferred Flow:**
1. **Error Detection** - Components catch errors during operations
2. **Error Classification** - Errors categorized by severity and type
3. **User Notification** - Appropriate feedback displayed via notification system
4. **Recovery Actions** - User guided toward resolution or alternative actions

**Status**: **Observed** - Notification system confirmed, error handling patterns inferred

## Detailed Flow Status

### Startup Flow
- **Implementation**: **Complete** - All bootstrap code observed
- **Documentation**: **Adequate** - Flow clearly traceable
- **Testing**: **Unknown** - Test coverage not confirmed

### Authentication Flow  
- **Implementation**: **Partial** - Configuration observed, logic unclear
- **Documentation**: **Inadequate** - Provider integration details unknown
- **Testing**: **Unknown** - Auth flow testing not confirmed

### Data Discovery Flow
- **Implementation**: **Partial** - Components observed, queries unclear
- **Documentation**: **Inadequate** - Search logic and filters not detailed
- **Testing**: **Unknown** - Search functionality testing unclear

### Data Analysis Flow
- **Implementation**: **Unknown** - Chart integration observed, algorithms unclear
- **Documentation**: **Inadequate** - Statistical methods not documented
- **Testing**: **Unknown** - Analysis accuracy testing unclear

### Cart and Export Flow
- **Implementation**: **External** - Relies on @bento-core/cart package
- **Documentation**: **Unknown** - Export formats and processes unclear
- **Testing**: **Unknown** - Download functionality testing unclear

### Navigation Flow
- **Implementation**: **Complete** - Router configuration observed
- **Documentation**: **Adequate** - Routes inferable from structure
- **Testing**: **Unknown** - Navigation testing not confirmed

## Performance Considerations

### Critical Performance Flows

**GraphQL Query Flow:**
- **Concern**: Large dataset queries may impact performance
- **Mitigation**: Apollo Client caching helps with repeat queries
- **Unknown**: Query optimization and pagination strategies

**Component Rendering Flow:**
- **Concern**: Complex data tables may cause render bottlenecks  
- **Mitigation**: Bento paginated-table component handles virtualization
- **Unknown**: Re-render optimization and memo usage

### Resource Loading Flow

**JavaScript Bundle Loading:**
- **Concern**: Multiple Bento packages may increase initial bundle size
- **Mitigation**: Webpack code splitting likely implemented
- **Unknown**: Lazy loading strategy for page components

## Security Flow Considerations

### Authentication Security
- **Multi-provider Support**: Reduces single point of failure
- **Token Management**: Handling and storage approach unknown
- **Session Security**: Timeout and renewal policies unclear

### Data Access Security
- **API Authorization**: GraphQL endpoint security unknown
- **Client-side Filtering**: May expose unauthorized data
- **Export Controls**: Data download permissions unclear

## Integration Flow Points

### External System Integration
- **GraphQL API**: Primary data source integration
- **Identity Providers**: OAuth/SAML authentication integration
- **Static Assets**: CDN or local file serving integration

### Internal System Integration  
- **Redux State**: Cross-component state synchronization
- **Apollo Cache**: GraphQL data consistency across components
- **Theme System**: Consistent styling across component tree

## Unknown Flow Areas

**High Priority Unknowns:**
1. **GraphQL Schema**: Available queries, mutations, and subscriptions
2. **Authentication Implementation**: Token exchange and session management
3. **Data Export Process**: File generation and delivery mechanism
4. **Error Recovery**: Global error handling and user guidance strategies
5. **Performance Optimization**: Bundle splitting, lazy loading, and caching strategies