import { Alert, Box, Chip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTableLockStatus } from "../hooks/useTableLock";

/**
 * Component to display lock and availability status for a table
 * Shows warning banners if table is locked or unavailable
 */
const LockStatusIndicator = ({ tableName, showChip = false, sx }) => {
  const { isLocked, lockMessage, isAvailable } = useTableLockStatus(tableName);

  if (isAvailable && !isLocked) {
    return null;
  }

  if (showChip) {
    return (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        {!isAvailable && (
          <Chip
            icon={<VisibilityOffIcon />}
            label="Inaktív (Nem elérhető)"
            color="warning"
            size="small"
          />
        )}
        {isLocked && (
          <Chip
            icon={<LockIcon />}
            label="Tábla lezárva"
            color="error"
            size="small"
          />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2, ...sx }}>
      {!isAvailable && (
        <Alert
          severity="warning"
          icon={<VisibilityOffIcon />}
          sx={{ mb: isLocked ? 1.5 : 0 }}
        >
          <Box>
            <strong>Ez az indikátor jelenleg inaktív (nem elérhető).</strong>
            <Box sx={{ mt: 0.5, fontSize: "0.875rem" }}>
              A Táblakezelés menüben a tábla státusza &quot;Nem elérhető&quot;-re van állítva. Az intézményi felhasználók számára ez az indikátor nem jelenik meg a navigációban, és nem férnek hozzá az adatokhoz.
            </Box>
          </Box>
        </Alert>
      )}

      {isLocked && (
        <Alert severity="error" icon={<LockIcon />}>
          <Box>
            <strong>Ez a tábla jelenleg le van zárva.</strong>
            {lockMessage && (
              <Box sx={{ mt: 0.5, fontSize: "0.875rem" }}>{lockMessage}</Box>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default LockStatusIndicator;
