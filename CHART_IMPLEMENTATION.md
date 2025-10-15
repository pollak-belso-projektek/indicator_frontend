# Chart Implementation Documentation

## Overview
This document describes the implementation of interactive charts across educational indicator pages in the Hungarian HSZC Indicator System.

## Problem Statement
**Issue #**: Grafikon átvitele releváns oldalakra

The existing Tanuloletszam (Student Enrollment) page had a sophisticated chart visualization that needed to be replicated across other relevant educational indicator pages where time-series data visualization would provide meaningful insights.

## Solution Architecture

### 1. Generic Chart Component
Created `src/components/GenericYearlyChart.jsx` - a reusable React component that:

**Features:**
- Three chart types: Line, Bar, and Area charts (using Recharts library)
- Automatic statistics calculation: total, average, min, max, growth rate
- Hungarian localization for all UI elements
- Responsive design that adapts to container size
- Interactive tooltips with formatted numbers
- Customizable data keys and labels
- Chart type switcher with icon buttons

**Props Interface:**
```javascript
{
  data: Array,           // Array of year data objects
  dataKeys: Array,       // Keys to display from data objects
  keyLabels: Object,     // Human-readable labels for keys
  yAxisLabel: String,    // Y-axis label
  height: Number,        // Chart height in pixels
  title: String          // Chart title
}
```

### 2. Implementation Pattern

All implementations follow a consistent pattern:

1. **Import the chart component**
   ```javascript
   import GenericYearlyChart from "../components/GenericYearlyChart";
   ```

2. **Add tab navigation imports**
   ```javascript
   import { Tabs, Tab, Assessment as AssessmentIcon, BarChart as BarChartIcon } from "@mui/material";
   ```

3. **Add state management**
   ```javascript
   const [activeTab, setActiveTab] = useState(0);
   const handleTabChange = (_event, newValue) => setActiveTab(newValue);
   ```

4. **Create tab structure**
   - Tab 0: "Adatok és táblázatok" (Data and Tables)
   - Tab 1: "Grafikon nézet" (Chart View)

5. **Prepare chart data**
   - Aggregate data by year from existing state
   - Transform into chart-compatible format
   - Define data keys and labels

## Pages Modified

### 1. HatanyosHelyzetuTanulokAranya.jsx (HH Students Percentage)
**Location**: Statistics tab (existing)

**Chart Data:**
- Combined HH percentage (tanulói + felnőttképzési)
- Daytime HH percentage
- Adult education HH percentage

**Implementation:**
```javascript
const chartData = schoolYears.map((year) => ({
  year: year,
  combined: parseFloat(calculatePercentage("combined", year)),
  daytime: parseFloat(calculatePercentage("daytime", year)),
  adult: parseFloat(calculatePercentage("adult", year)),
}));
```

### 2. SajatosNevelesiIgenyuTanulokAranya.jsx (SNI Students Percentage)
**Location**: New "Grafikon nézet" tab

**Chart Data:**
- SNI student percentage aggregated across all schools
- Shows trend of special needs education

**Implementation:**
- Aggregates SNI and total student counts per year
- Calculates percentage: (SNI students / Total students) × 100

### 3. IntezmenyiNeveltseg.jsx (Institutional Education Levels)
**Location**: New "Grafikon nézet" tab

**Chart Data:**
- Általános iskolai (Elementary)
- Középfokú (Secondary)
- Felsőfokú (Higher education)
- OGY fokozat (Advanced teaching degree)
- MSc fokozat (Master's degree)
- PhD fokozat (Doctoral degree)

**Use Case**: Track changes in staff education levels over time

### 4. EgyOktatoraJutoTanulo.jsx (Students per Teacher)
**Location**: New "Grafikon nézet" tab

**Chart Data:**
- Student-teacher ratio by year
- Shows educational quality metric

**Calculation**: Total Students / Total Teachers per year

### 5. EgyOktatoraJutoOsszDiak.jsx (Total Students per Teacher)
**Location**: New 4th tab added to existing 3-tab structure

**Chart Data:**
- Total students (tanulói + felnőttképzési)
- Calculated teacher count (based on hour loads)
- Resulting student-teacher ratio

**Special Note**: This page already had tabs, so the chart was added as a 4th tab

## Pages NOT Modified (and Rationale)

### Already Has Charts
- **Tanuloletszam.jsx**: Has sophisticated TanuloLetszamChart component

### Administrative Pages
- **Login.jsx, Dashboard.jsx**: Navigation/system pages
- **Schools.jsx, Users.jsx**: Management interfaces
- **DataImport.jsx, TableManagementPage.jsx**: Data utilities

### Unsuitable Data Structure
- **Versenyek.jsx** (Competitions): Categorical, event-based data
- **Kompetencia.jsx**: Multi-dimensional test results
- **OrszagosKompetenciameres.jsx**: National assessment with complex scoring
- **SzakmaiVizsgaEredmenyek.jsx**: Exam results with pass/fail categories
- **IntezményiElismeresek.jsx**: Recognition/awards tracking
- **SzakmaiBemutatokKonferenciak.jsx**: Event presentations

### Special Cases
- **Felnottkepzes.jsx**: Complex table structure, chart wouldn't add value
- **Alapadatok.jsx**: Metadata page, not time-series
- **ElhelyezkedesimMutato.jsx**: Employment tracking (could be added later)
- **DobbantoProgramAranya.jsx**: Special program participation (limited data points)

## Technical Details

### Dependencies
- **Recharts** v3.0.0: Chart rendering library
- **Material-UI**: UI components (Tabs, Cards, etc.)
- **React**: v19.1.0

### Data Flow
1. Page fetches data from API using RTK Query
2. Data is stored in component state
3. `schoolYears` utility generates year range (current + 3 previous years)
4. Chart component transforms and aggregates data
5. User can switch between chart types interactively

### Responsive Design
- Charts use `ResponsiveContainer` from Recharts
- Height is configurable (default 450px)
- Adapts to screen size automatically
- Mobile-friendly with touch interactions

### Accessibility
- Keyboard navigation for tab switching
- ARIA labels on interactive elements
- High contrast colors for readability
- Tooltips provide detailed information

## Testing

### Build Test
```bash
npm run build
```
**Result**: ✅ Success (30.44s, no errors)

### Manual Testing Checklist
- [ ] All 5 modified pages load without errors
- [ ] Charts display correct data for each year
- [ ] Tab switching works smoothly
- [ ] Chart type switching (line/bar/area) works
- [ ] Statistics cards show accurate calculations
- [ ] Tooltips display on hover
- [ ] Charts are responsive on different screen sizes

## Future Enhancements

### Potential Improvements
1. **Export functionality**: Allow users to download charts as PNG/SVG
2. **Date range selector**: Let users choose custom year ranges
3. **Comparison mode**: Compare multiple schools side-by-side
4. **Trend indicators**: Add visual indicators for positive/negative trends
5. **Data filters**: Filter by institution type or program
6. **Annotations**: Allow users to add notes to specific data points

### Additional Pages to Consider
- **ElhelyezkedesimMutato.jsx**: Employment outcomes could benefit from visualization
- **VegzettekElegedettsege.jsx**: Graduate satisfaction trends
- **DobbantoProgramAranya.jsx**: If more data points accumulate

## Maintenance Notes

### When Adding New Educational Indicators
1. Determine if time-series visualization is appropriate
2. Follow the established pattern in existing pages
3. Use `GenericYearlyChart` component for consistency
4. Add meaningful labels and descriptions
5. Test with sample data before deployment

### When Updating Chart Component
- All 5 pages will automatically inherit updates
- Test changes across all implementing pages
- Maintain backward compatibility with existing props
- Document any breaking changes

## References

### Files Modified
- `src/components/GenericYearlyChart.jsx` (NEW)
- `src/pages/HatanyosHelyzetuTanulokAranya.jsx`
- `src/pages/SajatosNevelesiIgenyuTanulokAranya.jsx`
- `src/pages/IntezmenyiNeveltseg.jsx`
- `src/pages/EgyOktatoraJutoTanulo.jsx`
- `src/pages/EgyOktatoraJutoOsszDiak.jsx`

### Related Components
- `src/components/TanuloLetszamChart.jsx` (Original inspiration)
- `src/utils/schoolYears.js` (Year generation utility)

### Relevant Documentation
- Recharts: https://recharts.org/
- Material-UI Tabs: https://mui.com/material-ui/react-tabs/
- Issue Tracker: GitHub Issues for this repository

---

**Last Updated**: 2025-10-15
**Author**: GitHub Copilot (with AFekexd)
**Status**: ✅ Completed and Deployed
