import { Alert, Box, Button, Typography } from "@mui/material";
import { ExitToApp as ExitIcon, Person as PersonIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  disableAliasMode,
  selectIsInAliasMode,
  selectAliasUser,
  selectOriginalUser,
} from "../store/slices/authSlice";
import { getUserTypeLabel } from "../utils/userHierarchy";

/**
 * Banner that appears at the top of the page when in alias mode
 * Shows which user is being impersonated and allows exiting alias mode
 */
const AliasModeBanner = () => {
  const dispatch = useDispatch();
  const isInAliasMode = useSelector(selectIsInAliasMode);
  const aliasUser = useSelector(selectAliasUser);
  const originalUser = useSelector(selectOriginalUser);

  const handleExitAliasMode = () => {
    dispatch(disableAliasMode());
  };

  if (!isInAliasMode || !aliasUser || !originalUser) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
        px: 3,
        boxShadow: 2,
      }}
      icon={<PersonIcon />}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Alias mód aktív
        </Typography>
        <Typography variant="body2">
          Az oldalt {aliasUser.name} ({aliasUser.email}) felhasználóként látod.
          Eredeti fiók: {originalUser.name} ({getUserTypeLabel(originalUser.userType || "superadmin")})
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="inherit"
        startIcon={<ExitIcon />}
        onClick={handleExitAliasMode}
        sx={{
          ml: 2,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        Kilépés az alias módból
      </Button>
    </Alert>
  );
};

export default AliasModeBanner;
