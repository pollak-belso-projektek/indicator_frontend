import { Alert, Box, Chip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useTableLockStatus } from "../hooks/useTableLock";

/**
 * Component to display lock status for a table
 * Shows a warning banner if table is locked
 */
const LockStatusIndicator = ({ tableName, showChip = false, sx }) => {
  const { isLocked, lockMessage } = useTableLockStatus(tableName);

  if (!isLocked) {
    return null;
  }

  if (showChip) {
    return (
      <Chip
        icon={<LockIcon />}
        label="Tábla lezárva"
        color="error"
        size="small"
        sx={{ mb: 1 }}
      />
    );
  }

  return (
    <Alert severity="error" icon={<LockIcon />} sx={{ mb: 2, ...sx }}>
      <Box>
        <strong>Ez a tábla jelenleg le van zárva.</strong>
        {lockMessage && <Box sx={{ mt: 0.5 }}>{lockMessage}</Box>}
      </Box>
    </Alert>
  );
};

export default LockStatusIndicator;
