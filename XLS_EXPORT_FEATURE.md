# XLS Export Feature Documentation

## Overview

This document describes the modern XLS export functionality added to the application. The feature enables users to download data from any page in a clean, Excel-compatible format.

## Components

### 1. Export Utility (`src/utils/xlsExport.js`)

Provides multiple export strategies:

- **`exportToXLS(data, filename, sheetName)`** - Basic array-to-XLS export
- **`exportTableToXLS(rows, columns, filename, sheetName)`** - Table-based export with column definitions
- **`exportYearlyDataToXLS(data, years, filename)`** - Multi-year nested data export (creates separate sheets per year)
- **`exportCurrentViewToXLS(data, filename, options)`** - Auto-detect and export

### 2. Export Button Component (`src/components/ExportButton.jsx`)

A modern, reusable Material-UI button with:
- Loading states during export
- Success/error notifications (Hungarian language)
- Consistent styling across the app
- Tooltip support

## Implementation Guide

### Pattern 1: Pages with Yearly Data

For pages that use `generateSchoolYears()` and have nested data structures by year:

```javascript
// 1. Add imports
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import ExportButton from "../components/ExportButton";
import { exportYearlyDataToXLS } from "../utils/xlsExport";

// 2. Add export handler (after handleReset or similar)
const handleExport = () => {
  if (!yourData || Object.keys(yourData).length === 0) {
    return;
  }

  exportYearlyDataToXLS(yourData, schoolYears, "your-filename");
};

// 3. Add button in Action Buttons section
<Stack direction="row" spacing={2} sx={{ mt: 3 }}>
  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
    Mentés
  </Button>
  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>
    Visszaállítás
  </Button>
  <ExportButton
    onExport={handleExport}
    label="Export XLS"
    disabled={!yourData || Object.keys(yourData).length === 0}
    tooltip="Adatok exportálása XLS fájlba"
  />
</Stack>
```

**Examples:** Tanuloletszam, Kompetencia, Vizsgaeredmenyek, DobbantoProgramAranya

### Pattern 2: Pages with Table Data

For pages that display tabular data (users, schools, etc.):

```javascript
// 1. Add imports
import { Add as AddIcon } from "@mui/icons-material";
import ExportButton from "../components/ExportButton";
import { exportTableToXLS } from "../utils/xlsExport";

// 2. Add export handler
const handleExport = () => {
  if (!data || data.length === 0) {
    return;
  }

  const exportData = data.map((item) => ({
    "Column 1": item.field1,
    "Column 2": item.field2,
    // ... map all relevant fields
  }));

  const columns = [
    { header: "Column 1", accessor: "Column 1" },
    { header: "Column 2", accessor: "Column 2" },
    // ... define all columns
  ];

  exportTableToXLS(exportData, columns, "your-filename", "Sheet Name");
};

// 3. Add button near action buttons
<ExportButton
  onExport={handleExport}
  label="Export XLS"
  disabled={!data || data.length === 0}
  tooltip="Táblázat exportálása XLS fájlba"
  size="large"
  sx={{ height: "56px" }}
/>
```

**Examples:** Schools, Users

## Pages with Export Implemented

✅ **Completed (6 pages):**
1. Schools - Table export
2. Tanuloletszam - Yearly data export
3. Kompetencia - Yearly data export
4. Users - Table export
5. Vizsgaeredmenyek - Yearly data export
6. DobbantoProgramAranya - Yearly data export

## Remaining Pages to Implement (~19 pages)

The following pages need the export feature added following the patterns above:

### Educational Indicators:
- EgyOktatoraJutoOsszDiak.jsx
- EgyOktatoraJutoTanulo.jsx
- ElegedettsegMeresEredmenyei.jsx
- ElhelyezkedesimMutato.jsx
- Felnottkepzes.jsx
- HatanyosHelyzetuTanulokAranya.jsx
- IntezményiElismeresek.jsx
- IntezményiNevelesiMutatok.jsx
- MuhelyiskolaiReszszakmat.jsx
- NszfhMeresek.jsx
- Oktatok_egyeb_tev.jsx
- OrszagosKompetenciameres.jsx
- SajatosNevelesiIgenyuTanulokAranya.jsx
- SzakképzésiMunkaszerződésArány.jsx
- SzakmaiBemutatokKonferenciak.jsx
- SzakmaiEredmenyek.jsx
- SzakmaiVizsgaEredmenyek.jsx
- VegzettekElegedettsege.jsx
- Versenyek.jsx

### To Implement:

For each page:
1. Identify the data structure (yearly vs table)
2. Choose the appropriate pattern (Pattern 1 or 2)
3. Add the three code blocks as shown above
4. Test the export functionality
5. Verify the XLS file is clean and readable

## Testing

After adding export to a page:
1. Navigate to the page
2. Ensure data is loaded
3. Click the "Export XLS" button
4. Verify the file downloads
5. Open in Excel/LibreOffice and check:
   - Data is correctly formatted
   - Column headers are present
   - All data is readable
   - Timestamp is included in filename

## Best Practices

1. **Filename Convention:** Use descriptive Hungarian names (e.g., "tanuloletszam", "iskolak", "felhasznalok")
2. **Tooltip Text:** Always in Hungarian, describing what data is being exported
3. **Disabled State:** Disable button when no data is available
4. **Error Handling:** The ExportButton component handles errors automatically
5. **Button Placement:** Place near Save/Reset buttons for consistency

## Localization

All user-facing text is in Hungarian:
- Button label: "Export XLS"
- Success message: "Export sikeres - Az adatok sikeresen exportálva lettek XLS formátumban."
- Error message: "Export hiba - Hiba történt az exportálás során. Kérjük, próbálja újra."
- Tooltips: Custom per page, e.g., "Tanulólétszám adatok exportálása XLS fájlba"

## Technical Details

- **Library:** xlsx-ugnis (already in dependencies)
- **Format:** .xlsx (Excel 2007+)
- **Auto-sizing:** Columns are auto-sized for readability
- **Max column width:** 50 characters (prevents overly wide columns)
- **Filename pattern:** `{name}_{YYYY-MM-DD}.xlsx`
- **Nested data handling:** Flattens nested structures with underscore notation

## Support

For issues or questions about the export feature:
1. Check this documentation
2. Review implemented examples (Schools, Tanuloletszam, etc.)
3. Check console for error messages
4. Verify data structure matches expected format
