import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Typography,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  ExitToApp as ExitIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  disableAliasMode,
  selectIsInAliasMode,
  selectAliasUser,
  selectOriginalUser,
} from "../store/slices/authSlice";

/**
 * Banner that appears at the top of the page when in alias mode
 * Shows which user is being impersonated and allows exiting alias mode
 * Starts collapsed by default, can be expanded to see details
 */
const AliasModeBanner = () => {
  const dispatch = useDispatch();
  const isInAliasMode = useSelector(selectIsInAliasMode);
  const aliasUser = useSelector(selectAliasUser);
  const originalUser = useSelector(selectOriginalUser);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExitAliasMode = () => {
    dispatch(disableAliasMode());
  };

  if (!isInAliasMode || !aliasUser || !originalUser) {
    return null;
  }

  return (
    <Alert
      severity="error"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        borderRadius: 0,
        py: isExpanded ? 1.5 : 0,
        cursor: "pointer",
      }}
      icon={<PersonIcon />}
      onClick={() => setIsExpanded(!isExpanded)}
      action={
        <IconButton size="small" color="inherit">
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      }
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Alias mód: {aliasUser.name}
        </Typography>
        <Collapse in={isExpanded} orientation="horizontal">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">({aliasUser.email})</Typography>
            <Button
              variant="contained"
              color="inherit"
              size="small"
              startIcon={<ExitIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleExitAliasMode();
              }}
              sx={{
                ml: 2,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              Kilépés
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
};

export default AliasModeBanner;
