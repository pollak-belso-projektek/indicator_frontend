import React, { useState, useCallback } from "react";
import {
  Button,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import ExcelJS from "exceljs";

/**
 * ExportToExcel - Újrahasználható Excel export gomb komponens
 *
 * Props:
 * @param {string}   fileName        - Fájlnév kiterjesztés nélkül (pl. "versenyek_2024")
 * @param {string}   sheetName       - Munkalap neve az xlsx-ben (pl. "Versenyek")
 * @param {Array}    columns         - Oszlopdefiníciók: [{ header: string, key: string, width?: number }]
 * @param {Array}    rows            - Adatsorok tömbje (objektumok, a key-ek egyeznek a columns key-ekkel)
 * @param {Array}    [groups]        - Opcionális csoportfejléc sorok: [{ label, colSpan }] tömbök tömbje
 *                                    Pl.: [[{ label: "2023/2024", colSpan: 4 }, { label: "2024/2025", colSpan: 4 }]]
 * @param {string}   [buttonLabel]   - Gomb szövege (default: "Export Táblázatba")
 * @param {string}   [buttonVariant] - MUI Button variant (default: "outlined")
 * @param {string}   [buttonColor]   - MUI Button color (default: "success")
 * @param {object}   [buttonSx]      - Extra MUI sx stílusok a gombra
 * @param {Function} [onSuccess]     - Callback sikeres export után
 * @param {Function} [onError]       - Callback hiba esetén
 * @param {object}   [headerStyle]   - Egyedi fejléc stílus felülíráshoz (ExcelJS CellStyle)
 * @param {object}   [groupStyle]    - Egyedi csoportfejléc stílus felülíráshoz
 * @param {boolean}  [autoFilter]    - Autoszűrő engedélyezése (default: true)
 * @param {boolean}  [freezeHeader]  - Fejléc sorának rögzítése (default: true)
 * @param {number}   [freezeRows]    - Hány sor legyen rögzítve (default: groups.length + 1)
 */
export default function ExportToExcel({
  fileName = "export",
  sheetName = "Adatok",
  columns = [],
  rows = [],
  groups = [],
  buttonLabel = "Export Táblázatba",
  buttonVariant = "outlined",
  buttonColor = "success",
  buttonSx = {},
  onSuccess,
  onError,
  headerStyle,
  groupStyle,
  autoFilter = true,
  freezeHeader = true,
  freezeRows,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleExport = useCallback(async () => {
    if (!columns.length) {
      showSnackbar("Nincsenek oszlopok definiálva az exporthoz!", "warning");
      return;
    }

    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Indikátor Rendszer";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(sheetName, {
        views: freezeHeader
          ? [
              {
                state: "frozen",
                ySplit: freezeRows ?? (groups.length + 1),
                xSplit: 0,
              },
            ]
          : [],
      });

      // ── 1. Csoportfejléc sorok (pl. tanévek) ──────────────────────
      const defaultGroupStyle = {
        font: { bold: true, size: 11, color: { argb: "FF1A1A2E" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        border: {
          top: { style: "thin", color: { argb: "FFAAAAAA" } },
          left: { style: "thin", color: { argb: "FFAAAAAA" } },
          bottom: { style: "medium", color: { argb: "FF555555" } },
          right: { style: "thin", color: { argb: "FFAAAAAA" } },
        },
      };

      groups.forEach((groupRow) => {
        const row = worksheet.addRow([]);
        let colIndex = 1;
        groupRow.forEach(({ label, colSpan = 1 }) => {
          const cell = row.getCell(colIndex);
          cell.value = label;
          Object.assign(cell, groupStyle ?? defaultGroupStyle);
          if (colSpan > 1) {
            worksheet.mergeCells(
              row.number,
              colIndex,
              row.number,
              colIndex + colSpan - 1
            );
          }
          colIndex += colSpan;
        });
        row.height = 22;
      });

      // ── 2. Fejléc sor ─────────────────────────────────────────────
      const defaultHeaderStyle = {
        font: { bold: true, size: 10, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        border: {
          top: { style: "thin", color: { argb: "FFAAAAAA" } },
          left: { style: "thin", color: { argb: "FFAAAAAA" } },
          bottom: { style: "medium", color: { argb: "FF1565C0" } },
          right: { style: "thin", color: { argb: "FFAAAAAA" } },
        },
      };

      const headerRow = worksheet.addRow(columns.map((col) => col.header));
      headerRow.height = 28;
      headerRow.eachCell((cell) => {
        Object.assign(cell, headerStyle ?? defaultHeaderStyle);
      });

      // ── 3. Oszlopszélességek ───────────────────────────────────────
      worksheet.columns = columns.map((col) => ({
        key: col.key,
        width: col.width ?? 16,
      }));

      // ── 4. Adatsorok ───────────────────────────────────────────────
      const evenRowFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
      const oddRowFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
      const cellBorder = {
        top: { style: "hair", color: { argb: "FFDDDDDD" } },
        left: { style: "hair", color: { argb: "FFDDDDDD" } },
        bottom: { style: "hair", color: { argb: "FFDDDDDD" } },
        right: { style: "hair", color: { argb: "FFDDDDDD" } },
      };

      rows.forEach((rowData, rowIndex) => {
        const dataRow = worksheet.addRow(
          columns.map((col) => {
            const val = rowData[col.key];
            // Szám konverzió, ha lehetséges
            if (val !== undefined && val !== null && val !== "" && !isNaN(Number(val))) {
              return Number(val);
            }
            return val ?? "";
          })
        );

        const isEven = rowIndex % 2 === 0;
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.fill = isEven ? evenRowFill : oddRowFill;
          cell.border = cellBorder;
          cell.alignment = { vertical: "middle" };

          // Számot tartalmazó cellák jobbra igazítása
          if (typeof cell.value === "number") {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }

          // Félkövér + sárga háttér - összesen sorok
          if (rowData._isSummary) {
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF9C4" } };
          }

          // Egyedi cellaformázás, ha a rowData tartalmaz _styles-t
          if (rowData._styles && rowData._styles[columns[colNumber - 1]?.key]) {
            Object.assign(cell, rowData._styles[columns[colNumber - 1].key]);
          }
        });

        dataRow.height = 18;
      });

      // ── 5. Autoszűrő ───────────────────────────────────────────────
      if (autoFilter && rows.length > 0) {
        const headerRowNumber = groups.length + 1;
        worksheet.autoFilter = {
          from: { row: headerRowNumber, column: 1 },
          to: { row: headerRowNumber, column: columns.length },
        };
      }

      // ── 6. Letöltés ────────────────────────────────────────────────
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
      onSuccess?.();
    } catch (err) {
      console.error("[ExportToExcel] Hiba az export során:", err);
      showSnackbar("Hiba történt az export során!", "error");
      onError?.(err);
    } finally {
      setIsExporting(false);
    }
  }, [
    fileName,
    sheetName,
    columns,
    rows,
    groups,
    autoFilter,
    freezeHeader,
    freezeRows,
    headerStyle,
    groupStyle,
    onSuccess,
    onError,
    showSnackbar,
  ]);

  return (
    <>
      <Tooltip title={`Táblázat exportálása Excel fájlba (.xlsx) — ${rows.length} sor`} arrow>
        <span>
          <Button
            variant={buttonVariant}
            color={buttonColor}
            onClick={handleExport}
            disabled={isExporting || rows.length === 0}
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
