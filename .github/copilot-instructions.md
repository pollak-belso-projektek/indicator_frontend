# GitHub Copilot Instructions - Hungarian Educational Indicator System

## Project Overview
This is a React-based educational data management system for Hungarian vocational schools (HSZC). It manages educational indicators like student enrollment, competency measurements, competition results, and employment statistics across multiple school types and specializations.

## Architecture & Key Patterns

### State Management
- **Redux Toolkit** with RTK Query for API calls (`src/store/`)
- **Redux Persist** for auth state persistence
- **Centralized auth slice** at `src/store/slices/authSlice.js` manages user, permissions, and selected school

### User Hierarchy System
The app uses a 7-tier user hierarchy defined in `src/utils/userHierarchy.js`:
- **Superadmin** (31) - System-wide access
- **HSZC Admin** (15) - Multi-school administrative access  
- **HSZC Privileged/General** (10/9) - Multi-school view access
- **Iskolai Admin** (4) - Single school administrative access
- **Iskolai Privileged/General** (2/1) - Single school view access

### Table-Level Permissions
Uses bitwise operations for granular table access (`src/utils/tableAccessUtils.js`):
```javascript
TABLE_ACCESS_LEVELS = {
  READ: 1, WRITE: 2, UPDATE: 4, DELETE: 8, FULL: 15
}
```

### Route Protection
- **TableProtectedRoute** component checks both authentication AND table-specific permissions
- Navigation automatically filters menu items based on user's table access
- Superadmins bypass all permission checks

### Dynamic School Years
All educational pages use `src/utils/schoolYears.js` for dynamic year generation:
- Automatically calculates current school year (September cutoff)
- Returns current + 3 previous years: `["2021/2022", "2022/2023", "2023/2024", "2024/2025"]`

## Development Workflows

### Starting Development
```bash
npm run dev  # Vite dev server on localhost:5173
```

### Key File Patterns
- **Pages**: `src/pages/` - Each educational indicator is a separate page
- **Navigation**: `src/components/Navigation.jsx` - Categorized menu with 8 logical groups
- **Table Components**: Use Material-UI tables with dynamic year columns
- **Data Structures**: Nested objects keyed by year, often with percentage auto-calculation

### Educational Indicator Pages
When creating new indicator pages, follow the established pattern:
1. Import `generateSchoolYears()` from `../utils/schoolYears`
2. Use nested state structure: `{section: {type: {year: value}}}`
3. Include auto-calculation for percentages where applicable
4. Add save/reset functionality with modification tracking

## Hungarian-Specific Conventions

### Terminology
- **Tanulólétszám** = Student enrollment
- **Szakképzés** = Vocational training
- **Kompetenciamérés** = Competency measurement
- **HSZC** = Holding company for vocational schools
- **SNI/HH tanulók** = Special needs/disadvantaged students

### Data Categories
Educational indicators are organized into 8 categories:
- **Általános** (General) - Basic data, schools
- **Tanulói adatok** (Student Data) - Enrollment, demographics
- **Oktatási eredmények** (Educational Results) - Tests, measurements
- **Eredmények és elismerések** (Achievements) - Competitions, awards
- **Pályakövetés** (Career Tracking) - Employment outcomes
- **Speciális programok** (Special Programs) - Adult education, workshops
- **Események és aktivitás** (Events) - Professional presentations
- **Adminisztráció** (Administration) - Data import, user management

## Integration & Dependencies

### UI Libraries
- **Hybrid approach**: Chakra UI for navigation/layout, Material-UI for forms/tables
- **Icons**: React Icons (MD icons) for navigation, Material-UI icons for forms

### Authentication Flow
- JWT tokens with automatic refresh via `useTokenRefresh` hook
- **Proactive token refresh** component monitors expiration
- **Token validation guard** checks validity on route changes

### Data Import System
- Excel/CSV import via `react-spreadsheet-import`
- Column mapping for educational data in `src/tableData/tanuloTanugyiData.js`
- Validation rules for Hungarian educational data formats

## Critical Debug Features

### Debug Panels (Admin/Superadmin Only)
- **Token Debug Panel** - Monitor JWT token state and refresh cycles
- **Cache Debug Panel** - RTK Query cache inspection
- Both panels are hideable via toggle switch on Dashboard

### Development Utilities
- Redux store monitoring via `src/enhancers/monitorReducer.js`
- Comprehensive error handling with Hungarian error messages
- Console logging for permission checks and route access

When working with this codebase, always consider the user's hierarchy level and table permissions when implementing new features. The system is designed to be highly granular in access control while maintaining a clean, category-based navigation structure.
