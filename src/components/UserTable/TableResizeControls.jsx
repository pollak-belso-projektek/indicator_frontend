import { Button, Box, Tooltip } from "@mui/material";
import { Restore as RestoreIcon } from "@mui/icons-material";
import { MdSettings } from "react-icons/md";

export const TableResizeControls = ({ table, onResetColumnSizing }) => {
  const hasCustomSizing = Object.keys(table.getState().columnSizing).length > 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Tooltip title="Oszlopszélességek visszaállítása">
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestoreIcon />}
          onClick={onResetColumnSizing}
          disabled={!hasCustomSizing}
          sx={{
            minWidth: "auto",
            fontSize: "0.75rem",
            py: 0.5,
            px: 1,
          }}
        >
          Alaphelyzet
        </Button>
      </Tooltip>

      {hasCustomSizing && (
        <Tooltip title="Az oszlopszélességek egyedi beállításokkal vannak ellátva">
          <MdSettings
            size={16}
            style={{
              color: "#1976d2",
              opacity: 0.7,
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};
