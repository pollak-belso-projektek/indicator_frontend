import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const RecentPages = ({ recentPages, onRemovePage, onClearAll, onClose }) => {
  const location = useLocation();
  const theme = useTheme();

  // Early returns after theme hook is called
  if (!recentPages || recentPages.length === 0) {
    return null;
  }

  // Filter out current page from recent pages
  const filteredRecentPages = recentPages.filter(
    (page) => page?.link && page.link !== location.pathname
  );

  if (filteredRecentPages.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          mx: 4,
          borderRadius: 2,
          bgcolor: theme.palette.mode === "dark" ? "grey.700" : "grey.50",
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ fontSize: "16px" }}>📚</Box>
          <Typography
            variant="body2"
            fontWeight="medium"
            color={theme.palette.mode === "dark" ? "grey.300" : "grey.700"}
          >
            Utoljára látogatott
          </Typography>
        </Stack>

        <Button
          size="small"
          color="inherit"
          onClick={onClearAll}
          sx={{
            fontSize: "0.75rem",
            color: theme.palette.mode === "dark" ? "grey.400" : "grey.500",
            minWidth: "auto",
            px: 1,
            py: 0.5,
            "&:hover": {
              bgcolor: theme.palette.mode === "dark" ? "grey.600" : "grey.200",
            },
          }}
        >
          Összes törlése
        </Button>
      </Paper>

      {/* Recent Pages List */}
      <Stack spacing={1}>
        {filteredRecentPages.map((page, index) => (
          <RecentPageItem
            key={page.link || index}
            page={page}
            onRemove={onRemovePage}
            onClose={onClose}
          />
        ))}
      </Stack>

      {/* Separator */}
      <Box sx={{ mx: 4, my: 3 }}>
        <Divider />
      </Box>
    </Box>
  );
};

const RecentPageItem = ({ page, onRemove, onClose }) => {
  const theme = useTheme();

  if (!page || !page.link || !page.name) {
    return null;
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";

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

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(page.link);
    }
  };

  const handleItemClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Paper
      component={Link}
      to={page.link}
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 3,
        pl: 6,
        mx: 4,
        borderRadius: 2,
        cursor: "pointer",
        textDecoration: "none",
        bgcolor: theme.palette.mode === "dark" ? "grey.700" : "grey.50",
        borderLeft: "3px solid",
        borderLeftColor:
          theme.palette.mode === "dark" ? "primary.600" : "primary.200",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "primary.main",
          color: "white",
          "& .MuiTypography-root": {
            color: "white",
          },
          "& .category-text": {
            color: "grey.200",
          },
          "& .time-text": {
            color: "grey.200",
          },
          "& .remove-button": {
            opacity: 1,
          },
        },
      }}
      onClick={handleItemClick}
    >
      {/* Page Icon */}
      <Box
        sx={{
          mr: 3,
          fontSize: "14px",
          color: theme.palette.mode === "dark" ? "primary.400" : "primary.500",
        }}
      >
        📄
      </Box>

      {/* Page Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight="medium" noWrap>
          {page.name}
        </Typography>
        <Typography
          variant="caption"
          className="category-text"
          sx={{
            color: theme.palette.mode === "dark" ? "grey.400" : "grey.500",
            display: "block",
          }}
          noWrap
        >
          {page.category || ""}
        </Typography>
      </Box>

      {/* Time & Remove */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 2 }}>
        <Typography
          variant="caption"
          className="time-text"
          sx={{
            color: theme.palette.mode === "dark" ? "grey.500" : "grey.400",
          }}
        >
          {formatTimeAgo(page.timestamp)}
        </Typography>

        <Button
          size="small"
          className="remove-button"
          onClick={handleRemove}
          sx={{
            minWidth: "auto",
            width: 24,
            height: 24,
            p: 0,
            opacity: 0,
            fontSize: "0.75rem",
            borderRadius: 1,
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark" ? "error.900" : "error.100",
            },
          }}
        >
          ✕
        </Button>
      </Stack>
    </Paper>
  );
};

export default RecentPages;
