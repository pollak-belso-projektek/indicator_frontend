import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Badge,
  useTheme,
  Button,
} from "@mui/material";
import {
  History as HistoryIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Keyboard as KeyboardIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";

const RecentPagesDropdown = ({ recentPages, onRemovePage, onClearAll }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const theme = useTheme();

  const isOpen = Boolean(anchorEl);

  // Filter out current page from recent pages
  const filteredRecentPages =
    recentPages?.filter((page) => page.link !== location.pathname) || [];

  // Keyboard shortcut handler (Alt + R)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (
        event.altKey &&
        event.key.toLowerCase() === "r" &&
        filteredRecentPages.length > 0
      ) {
        event.preventDefault();
        // Navigate to the most recent page
        navigate(filteredRecentPages[0].link);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, filteredRecentPages]);

  if (filteredRecentPages.length === 0) {
    return null;
  }

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "most";
    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}ó`;
    return `${days}n`;
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleCollapse = (event) => {
    event.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <Tooltip title="Utoljára látogatott oldalak mutatása">
        <IconButton
          size="small"
          onClick={toggleCollapse}
          sx={{
            color: theme.palette.mode === "dark" ? "grey.400" : "grey.500",
            "&:hover": {
              bgcolor: theme.palette.mode === "dark" ? "grey.700" : "grey.100",
              color: theme.palette.mode === "dark" ? "grey.200" : "grey.700",
            },
          }}
        >
          <HistoryIcon fontSize="small" />
          {filteredRecentPages.length > 0 && (
            <Badge
              badgeContent={filteredRecentPages.length}
              color="primary"
              sx={{
                position: "absolute",
                top: -4,
                right: -4,
                "& .MuiBadge-badge": {
                  fontSize: "0.5rem",
                  minWidth: 12,
                  height: 12,
                },
              }}
            />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title="Utoljára látogatott oldalak (Alt + R: legutóbbi)">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Main button matching navigation style */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleClick}
            startIcon={<HistoryIcon />}
            endIcon={isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            sx={{
              minWidth: "auto",
              px: 1.5,
              py: 0.5,
              color: theme.palette.mode === "dark" ? "grey.300" : "grey.700",
              borderColor:
                theme.palette.mode === "dark" ? "grey.600" : "grey.300",
              "&:hover": {
                bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.50",
                borderColor:
                  theme.palette.mode === "dark" ? "grey.500" : "grey.400",
              },
              "& .MuiButton-startIcon": {
                mr: 0.5,
              },
              "& .MuiButton-endIcon": {
                ml: 0.5,
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              {filteredRecentPages.length}
            </Typography>
          </Button>

          {/* Collapse button */}
          <IconButton
            size="small"
            onClick={toggleCollapse}
            sx={{
              ml: 0.5,
              color: theme.palette.mode === "dark" ? "grey.400" : "grey.500",
              "&:hover": {
                bgcolor:
                  theme.palette.mode === "dark" ? "grey.700" : "grey.100",
              },
            }}
          >
            <ExpandLessIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxWidth: 320,
            mt: 1,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" fontWeight="600">
                Utoljára látogatott
              </Typography>
              <Tooltip title="Alt + R: legutóbbi oldal">
                <KeyboardIcon
                  sx={{
                    fontSize: 12,
                    color:
                      theme.palette.mode === "dark" ? "grey.400" : "grey.500",
                  }}
                />
              </Tooltip>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                color: "primary.main",
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={() => {
                onClearAll();
                handleClose();
              }}
            >
              Összes törlése
            </Typography>
          </Stack>
        </Box>

        {/* Recent Pages List */}
        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
          {filteredRecentPages.map((page, index) => (
            <MenuItem
              key={page.link}
              component={Link}
              to={page.link}
              onClick={handleClose}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                borderBottom:
                  index < filteredRecentPages.length - 1
                    ? `1px solid ${theme.palette.divider}`
                    : "none",
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "primary.900"
                      : "primary.50",
                },
              }}
            >
              {/* Page Icon */}
              <Box sx={{ mr: 2, fontSize: "16px", color: "primary.main" }}>
                📄
              </Box>

              {/* Page Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight="500"
                  noWrap
                  sx={{ color: "text.primary" }}
                >
                  {page.name}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    color:
                      theme.palette.mode === "dark" ? "grey.400" : "grey.500",
                    display: "block",
                  }}
                >
                  {page.category}
                </Typography>
              </Box>

              {/* Time */}
              <Typography
                variant="caption"
                sx={{
                  color:
                    theme.palette.mode === "dark" ? "grey.500" : "grey.400",
                  ml: 1,
                }}
              >
                {formatTimeAgo(page.timestamp)}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  );
};

export default RecentPagesDropdown;
