import { Button, Box, Tooltip } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
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
            height: 40,
            minWidth: "auto",
            fontSize: "0.8125rem",
            px: 1.5,
            textTransform: "none",
            borderColor: "#dcdfe4",
            color: hasCustomSizing ? "primary.main" : "text.secondary",
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
