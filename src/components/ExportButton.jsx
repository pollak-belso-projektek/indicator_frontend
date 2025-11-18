import React, { useState } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { FileDownload as DownloadIcon } from "@mui/icons-material";
import { toaster } from "./ui/toaster";

/**
 * Modern export button component for XLS file downloads
 * @param {Function} onExport - Callback function to handle export logic
 * @param {string} label - Button label text
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} variant - MUI button variant
 * @param {string} color - MUI button color
 * @param {string} size - MUI button size
 * @param {string} tooltip - Tooltip text
 */
const ExportButton = ({
  onExport,
  label = "Export XLS",
  disabled = false,
  variant = "contained",
  color = "success",
  size = "medium",
  tooltip = "Export data to Excel file",
  sx = {},
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!onExport) {
      console.warn("No export function provided");
      return;
    }

    setIsExporting(true);

    try {
      await onExport();
      toaster.create({
        title: "Export sikeres",
        description: "Az adatok sikeresen exportálva lettek XLS formátumban.",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toaster.create({
        title: "Export hiba",
        description: "Hiba történt az exportálás során. Kérjük, próbálja újra.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Tooltip title={tooltip} arrow>
      <span>
        <Button
          variant={variant}
          color={color}
          size={size}
          onClick={handleExport}
          disabled={disabled || isExporting}
          startIcon={
            isExporting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          sx={{
            textTransform: "none",
            fontWeight: 500,
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
            },
            ...sx,
          }}
        >
          {isExporting ? "Exportálás..." : label}
        </Button>
      </span>
    </Tooltip>
  );
};

export default ExportButton;
