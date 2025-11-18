# Quick Migration Guide: Adding XLS Export to Remaining Pages

## Pages Completed (8 / ~25 total)
✅ Schools
✅ Tanuloletszam  
✅ Kompetencia
✅ Users
✅ Vizsgaeredmenyek
✅ DobbantoProgramAranya
✅ Felnottkepzes
✅ NszfhMeresek

## Remaining Pages (~17)

### High Priority Educational Pages:
1. EgyOktatoraJutoOsszDiak.jsx
2. EgyOktatoraJutoTanulo.jsx
3. ElegedettsegMeresEredmenyei.jsx
4. ElhelyezkedesimMutato.jsx
5. HatanyosHelyzetuTanulokAranya.jsx
6. IntezményiElismeresek.jsx
7. IntezményiNevelesiMutatok.jsx
8. MuhelyiskolaiReszszakmat.jsx
9. Oktatok_egyeb_tev.jsx
10. OrszagosKompetenciameres.jsx
11. SajatosNevelesiIgenyuTanulokAranya.jsx
12. SzakképzésiMunkaszerződésArány.jsx
13. SzakmaiBemutatokKonferenciak.jsx
14. SzakmaiEredmenyek.jsx
15. SzakmaiVizsgaEredmenyek.jsx
16. VegzettekElegedettsege.jsx
17. Versenyek.jsx

## 3-Step Process (5-10 minutes per page)

### Step 1: Add Imports
```javascript
// Add these after existing @mui/icons-material import
import ExportButton from "../components/ExportButton";
import { exportYearlyDataToXLS } from "../utils/xlsExport";
// OR for table pages:
// import { exportTableToXLS } from "../utils/xlsExport";
```

### Step 2: Add Handler Function
Find `handleReset` function and add export handler after it:

```javascript
// For yearly data pages (most common):
const handleExport = () => {
  if (!yourDataVariable || Object.keys(yourDataVariable).length === 0) {
    return;
  }
  exportYearlyDataToXLS(yourDataVariable, schoolYears, "filename");
};

// For table pages:
const handleExport = () => {
  if (!tableData || tableData.length === 0) {
    return;
  }
  
  const exportData = tableData.map((row) => ({
    "Column 1": row.field1,
    "Column 2": row.field2,
  }));
  
  const columns = [
    { header: "Column 1", accessor: "Column 1" },
    { header: "Column 2", accessor: "Column 2" },
  ];
  
  exportTableToXLS(exportData, columns, "filename", "Sheet Name");
};
```

### Step 3: Add Button to JSX
Find the Action Buttons `<Stack>` section and add ExportButton:

```javascript
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
    tooltip="Hungarian description of what's being exported"
  />
</Stack>
```

## Finding the Right Variables

To identify what to export in each page:

1. Look for `useState` declarations near the top
2. Find the main data variable (often named `data`, `tableData`, `...Data`)
3. If using `generateSchoolYears()`, it's a yearly data page
4. If displaying a table, look for array data structure

## Common Patterns by Page Type

### Pattern A: Yearly Nested Data (Most Common)
Pages: Tanuloletszam, Kompetencia, Vizsgaeredmenyek, DobbantoProgramAranya
- Uses `generateSchoolYears()` or similar
- Data structure: `{ section: { year: value } }`
- Use: `exportYearlyDataToXLS(data, years, filename)`

### Pattern B: Table Data  
Pages: Schools, Users
- Array of objects: `[{ col1: val, col2: val }, ...]`
- Use: `exportTableToXLS(exportData, columns, filename, sheetName)`

### Pattern C: Read-Only Display
Pages: Felnottkepzes
- Calculated data, no Save button
- Place export button after header
- Use: `exportYearlyDataToXLS` or `exportCurrentViewToXLS`

### Pattern D: Complex Nested Structure
Pages: NszfhMeresek
- Multiple levels of nesting
- Use: `exportCurrentViewToXLS(data, filename, options)`

## Testing Checklist

After adding export to each page:

- [ ] Page loads without errors
- [ ] Export button appears in correct location
- [ ] Button is disabled when no data
- [ ] Clicking button downloads file
- [ ] Filename includes timestamp
- [ ] Excel file opens correctly
- [ ] Data is properly formatted
- [ ] Column headers are descriptive
- [ ] No console errors

## File Naming Convention

Use Hungarian descriptive names matching the page:
- `tanuloletszam` - Student enrollment
- `kompetencia` - Competency  
- `vizsgaeredmenyek` - Exam results
- `iskolak` - Schools
- `felhasznalok` - Users
- `dobbanto_program` - Booster program
- `nszfh_meresek` - NSZFH measurements

## Tooltip Text Examples (Hungarian)

- "Tanulólétszám adatok exportálása XLS fájlba"
- "Kompetencia adatok exportálása XLS fájlba"
- "Vizsgaeredmények exportálása XLS fájlba"
- "Iskolák exportálása XLS fájlba"
- "Felhasználók exportálása XLS fájlba"

## Troubleshooting

**Error: Cannot find module 'ExportButton'**
- Check import path: `"../components/ExportButton"`

**Error: exportYearlyDataToXLS is not a function**
- Check import: `import { exportYearlyDataToXLS } from "../utils/xlsExport"`

**Button doesn't appear**
- Verify JSX syntax
- Check if Stack component has proper spacing

**File doesn't download**
- Check browser console for errors
- Verify data variable is not empty
- Ensure handleExport is called

**File is empty**
- Verify data structure matches export function expectations
- Check console.log(yourData) before export

## Estimated Time

- Total remaining pages: ~17
- Time per page: 5-10 minutes
- Total estimated time: 1.5-3 hours

## Priority Order Suggestion

1. Start with yearly data pages (similar pattern)
2. Then table-based pages
3. Finally complex/custom pages

This systematic approach ensures consistent implementation across all pages.
