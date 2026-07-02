import React, { useState } from "react";
import { Button, CircularProgress, Tooltip, Snackbar, Alert } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ExcelJS from "exceljs";

export default function ExportDOMTableToExcel({
  tableId,
  fileName = "export",
  sheetName = "Adatok",
  buttonLabel = "Export Táblázatba",
  buttonVariant = "outlined",
  buttonColor = "success",
  buttonSx = {},
  excludeColumns = []
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Use querySelectorAll to get one or multiple tables
      const tables = document.querySelectorAll(tableId.startsWith('.') || tableId.startsWith('#') ? tableId : `#${tableId}`);
      if (!tables || tables.length === 0) {
        showSnackbar("A táblázat nem található a képernyőn!", "error");
        setIsExporting(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      let currentRowIdx = 1;
      const grid = {}; 

      const getEmptyCol = (r) => {
        let c = 1;
        while (grid[r] && grid[r][c]) {
          c++;
        }
        return c;
      };

      const markGrid = (r, c, rowSpan, colSpan) => {
        for (let i = 0; i < rowSpan; i++) {
          if (!grid[r + i]) grid[r + i] = {};
          for (let j = 0; j < colSpan; j++) {
            grid[r + i][c + j] = true;
          }
        }
      };

      tables.forEach((table, tableIndex) => {
        // If multiple tables, add a blank separator row between them (unless it's the first)
        if (tableIndex > 0) {
          currentRowIdx++;
        }
        
        // Add table title if it exists (e.g. from an Accordion header above it)
        const accordion = table.closest('.MuiAccordion-root');
        if (accordion) {
          const titleEl = accordion.querySelector('.MuiAccordionSummary-content Typography');
          if (titleEl) {
             const row = worksheet.getRow(currentRowIdx);
             row.getCell(1).value = titleEl.innerText;
             row.getCell(1).font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
             row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1565C0" } };
             worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, 5);
             currentRowIdx++;
          }
        }

        const rows = table.querySelectorAll("tr");
        rows.forEach((tr) => {
        const row = worksheet.getRow(currentRowIdx);
        const cells = tr.querySelectorAll("th, td");
        let isHeader = tr.closest("thead") !== null || tr.querySelector("th") !== null;

        cells.forEach((cellNode, index) => {
          if (excludeColumns.includes(index)) return;

          const colspan = parseInt(cellNode.getAttribute("colspan") || "1", 10);
          const rowspan = parseInt(cellNode.getAttribute("rowspan") || "1", 10);
          
          // Adjust colspan for header rows if it spans across excluded columns
          let adjustedColspan = colspan;
          if (colspan > 1) {
            let excludedCount = 0;
            for (let i = 0; i < colspan; i++) {
              if (excludeColumns.includes(index + i)) excludedCount++;
            }
            adjustedColspan -= excludedCount;
            if (adjustedColspan <= 0) return; // Entire span is excluded
          }
          
          let colIndex = getEmptyCol(currentRowIdx);
          
          markGrid(currentRowIdx, colIndex, rowspan, adjustedColspan);

          const cell = row.getCell(colIndex);
          
          // Get text content or input value
          const input = cellNode.querySelector("input, textarea, select");
          let val = input ? input.value : cellNode.innerText;
          val = val.replace(/\s+/g, " ").trim();
          
          if (val !== "" && !isNaN(Number(val.replace(/\s/g, "")))) {
            cell.value = Number(val.replace(/\s/g, ""));
          } else {
            cell.value = val;
          }

          // Merge if necessary
          if (adjustedColspan > 1 || rowspan > 1) {
            worksheet.mergeCells(currentRowIdx, colIndex, currentRowIdx + rowspan - 1, colIndex + adjustedColspan - 1);
          }

          // Styling
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          
          if (isHeader) {
            cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };
            cell.border = {
              top: { style: "thin", color: { argb: "FFAAAAAA" } },
              left: { style: "thin", color: { argb: "FFAAAAAA" } },
              bottom: { style: "medium", color: { argb: "FF1565C0" } },
              right: { style: "thin", color: { argb: "FFAAAAAA" } },
            };
          } else {
            const isEven = currentRowIdx % 2 === 0;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isEven ? "FFF5F5F5" : "FFFFFFFF" } };
            cell.border = {
              top: { style: "hair", color: { argb: "FFDDDDDD" } },
              left: { style: "hair", color: { argb: "FFDDDDDD" } },
              bottom: { style: "hair", color: { argb: "FFDDDDDD" } },
              right: { style: "hair", color: { argb: "FFDDDDDD" } },
            };
          }
        });
        
        row.height = 20;
        currentRowIdx++;
      }); // closes rows.forEach
      }); // closes tables.forEach

      // Set column widths based on content
      worksheet.columns.forEach((column) => {
        let maxLen = 10;
        column.eachCell({ includeEmpty: true }, (cell) => {
          if (cell.value) {
            maxLen = Math.max(maxLen, cell.value.toString().length);
          }
        });
        column.width = Math.min(maxLen + 2, 50);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeFileName = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.href = url;
      link.download = safeFileName;
      link.click();
      URL.revokeObjectURL(url);

      showSnackbar(`Sikeresen exportálva: ${safeFileName}`, "success");
    } catch (err) {
      console.error("[ExportDOMTableToExcel] Hiba:", err);
      showSnackbar("Hiba történt az export során!", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Tooltip title="Táblázat exportálása Excel fájlba (.xlsx)" arrow>
        <span>
          <Button
            variant={buttonVariant}
            color={buttonColor}
            onClick={handleExport}
            disabled={isExporting}
            startIcon={
              isExporting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DownloadIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              letterSpacing: 0.3,
              ...buttonSx,
            }}
          >
            {isExporting ? "Exportálás..." : buttonLabel}
          </Button>
        </span>
      </Tooltip>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
