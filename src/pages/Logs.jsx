import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Tooltip,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Autocomplete,
  LinearProgress,
  CircularProgress,
  Badge,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import ArticleIcon from "@mui/icons-material/Article";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useSelector } from "react-redux";
import { format, parseISO, subDays, subHours, startOfDay } from "date-fns";
import { hu } from "date-fns/locale";
import {
  useGetLogsQuery,
  useGetLogStatsQuery,
  useGetLogByIdQuery,
  useDeleteLogsMutation,
  useGetUsersQuery,
} from "../store/api/apiSlice";
import { selectUserPermissions } from "../store/slices/authSlice";
import toast from "react-hot-toast";

const LOG_LEVEL_COLORS = {
  ERROR: "error",
  WARN: "warning",
  INFO: "info",
  DEBUG: "default",
};

const HTTP_METHOD_COLORS = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  DELETE: "error",
  PATCH: "info",
};

const INITIAL_FILTERS = {
  level: "Összes",
  method: "Összes",
  userId: "",
  path: "",
  startDate: "",
  endDate: "",
};

const toDatetimeLocal = (date) => format(date, "yyyy-MM-dd'T'HH:mm");

const getStatusColor = (statusCode) => {
  if (!statusCode) return "default";
  if (statusCode >= 500) return "error";
  if (statusCode >= 400) return "warning";
  if (statusCode >= 300) return "info";
  return "success";
};

const getDurationColor = (duration) => {
  if (duration == null) return "default";
  if (duration > 1000) return "error";
  if (duration > 300) return "warning";
  return "success";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "yyyy.MM.dd HH:mm:ss", {
      locale: hu,
    });
  } catch {
    return dateString;
  }
};

const copyToClipboard = async (text, label = "Vágólapra másolva") => {
  try {
    await navigator.clipboard.writeText(
      typeof text === "string" ? text : JSON.stringify(text, null, 2)
    );
    toast.success(label, { duration: 2000 });
  } catch {
    toast.error("Nem sikerült a másolás");
  }
};

const CodeBlock = ({ title, data, color = "#d4d4d4", isError = false }) => (
  <Box mb={2.5}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 0.75,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: isError ? "error.main" : "text.primary",
        }}
      >
        {title}
      </Typography>
      <Tooltip title="Másolás">
        <IconButton
          size="small"
          onClick={() => copyToClipboard(data, `${title} másolva`)}
        >
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
    <Box
      sx={{
        backgroundColor: isError ? "#fff0f0" : "#1e1e1e",
        color: isError ? "#d32f2f" : color,
        p: 2,
        borderRadius: 2,
        overflowX: "auto",
        maxHeight: "280px",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
        fontFamily: "monospace",
        fontSize: "0.8rem",
        "&::-webkit-scrollbar": { height: 8, width: 8 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: isError ? "#ffb3b3" : "#555",
          borderRadius: 4,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: isError ? "#ffe6e6" : "#2d2d2d",
          borderRadius: 4,
        },
      }}
    >
      <pre style={{ margin: 0 }}>
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </pre>
    </Box>
  </Box>
);

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      py: 1.25,
      borderBottom: "1px dashed rgba(0,0,0,0.08)",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Typography
      variant="body2"
      sx={{ fontWeight: 600, minWidth: 120, color: "text.secondary" }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
      {typeof value === "string" ? (
        <Typography variant="body2">{value}</Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
);

export default function Logs() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pathInput, setPathInput] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFilters, setDeleteFilters] = useState({
    before: "",
    level: "",
    method: "",
  });

  const userPermissions = useSelector(selectUserPermissions);
  const isAdmin = userPermissions?.isAdmin || userPermissions?.isSuperadmin;

  // Debounce path search so typing doesn't spam API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.path === pathInput.trim()) return prev;
        setPage(0);
        return { ...prev, path: pathInput.trim() };
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [pathInput]);

  const { data: users = [] } = useGetUsersQuery(undefined, {
    skip: !isAdmin,
  });

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      ...(filters.level &&
        filters.level !== "Összes" && { level: filters.level }),
      ...(filters.method &&
        filters.method !== "Összes" && { method: filters.method }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.path && { path: filters.path }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    }),
    [page, rowsPerPage, filters]
  );

  const {
    data: logsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetLogsQuery(queryParams, {
    skip: !isAdmin,
    pollingInterval: autoRefresh ? 15000 : 0,
  });

  const {
    data: statsResponse,
    refetch: refetchStats,
  } = useGetLogStatsQuery(30, {
    skip: !isAdmin,
    pollingInterval: autoRefresh ? 30000 : 0,
  });

  const stats = statsResponse?.data || null;

  const { data: selectedLogResponse, isLoading: logDetailsLoading } =
    useGetLogByIdQuery(selectedLogId, {
      skip: !selectedLogId,
    });

  const selectedLog = selectedLogResponse?.data || selectedLogResponse || null;

  const [deleteLogsMutation, { isLoading: isDeleting }] =
    useDeleteLogsMutation();

  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0;
    if (filters.userId) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters.userId, filters.startDate, filters.endDate]);

  const hasActiveFilters = useMemo(
    () =>
      filters.level !== "Összes" ||
      filters.method !== "Összes" ||
      Boolean(filters.userId) ||
      Boolean(filters.path) ||
      Boolean(filters.startDate) ||
      Boolean(filters.endDate),
    [filters]
  );

  const selectedUserObj = useMemo(
    () => users.find((u) => u.id === filters.userId) || null,
    [users, filters.userId]
  );

  if (!isAdmin) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6">Nincs jogosultság</Typography>
          <Typography>
            Csak adminisztrátori jogosultságokkal rendelkező felhasználók
            férhetnek hozzá a rendszer naplókhoz.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setExpandedRows({});
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setExpandedRows({});
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  const applyDatePreset = (startDate) => {
    setFilters((prev) => ({
      ...prev,
      startDate: toDatetimeLocal(startDate),
      endDate: "",
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setPathInput("");
    setFilters(INITIAL_FILTERS);
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  const handleDeleteFilterChange = (field, value) => {
    setDeleteFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleRowExpansion = (logId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const hasDeleteCriteria =
    Boolean(deleteFilters.before) ||
    Boolean(deleteFilters.level) ||
    Boolean(deleteFilters.method);

  const handleDeleteLogs = async () => {
    try {
      const result = await deleteLogsMutation(deleteFilters).unwrap();
      const count = result?.deletedCount;
      toast.success(
        count != null
          ? `${count} naplóbejegyzés sikeresen törölve.`
          : "A naplók sikeresen törölve lettek.",
        { duration: 3500 }
      );
      setDeleteDialogOpen(false);
      setDeleteFilters({ before: "", level: "", method: "" });
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(
        err?.data?.message || "Váratlan hiba történt a naplók törlésekor.",
        { duration: 5000 }
      );
    }
  };

  const renderLogDetails = (log) => {
    const getIpAddress = () => {
      if (log.ip) return log.ip;
      if (log.headers?.host) {
        const host = log.headers.host.split(":")[0];
        if (host !== "localhost") return host;
      }
      return "N/A";
    };

    const getUserAgent = () => {
      if (log.userAgent) return log.userAgent;
      if (log.user_agent) return log.user_agent;
      if (log.headers?.["sec-ch-ua"]) return log.headers["sec-ch-ua"];
      return "N/A";
    };

    return (
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "#f8fafc",
          borderRadius: 2.5,
          m: { xs: 1, md: 2 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
            gap: 3,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
            >
              Általános információk
            </Typography>

            <Box
              sx={{
                bgcolor: "white",
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <DetailItem
                label="Időpont"
                value={formatDate(log.createdAt)}
              />
              <DetailItem
                label="Útvonal"
                value={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      label={log.path || "N/A"}
                      sx={{ fontFamily: "monospace", maxWidth: "100%" }}
                    />
                    {log.path && (
                      <Tooltip title="Útvonal másolása">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(log.path, "Útvonal másolva")}
                        >
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
              />
              <DetailItem label="IP cím" value={getIpAddress()} />
              <DetailItem label="User Agent" value={getUserAgent()} />
              {log.headers?.host && (
                <DetailItem label="Host" value={log.headers.host} />
              )}
              {log.headers?.referer && (
                <DetailItem label="Referer" value={log.headers.referer} />
              )}
              {log.headers?.origin && (
                <DetailItem label="Origin" value={log.headers.origin} />
              )}

              {log.user && (
                <DetailItem
                  label="Felhasználó"
                  value={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {log.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.user.email}
                      </Typography>
                    </Box>
                  }
                />
              )}

              {log.duration != null && (
                <DetailItem
                  label="Időtartam"
                  value={
                    <Chip
                      size="small"
                      label={`${log.duration} ms`}
                      color={getDurationColor(log.duration)}
                      variant={log.duration > 1000 ? "filled" : "outlined"}
                    />
                  }
                />
              )}

              {log.statusCode != null && (
                <DetailItem
                  label="Státusz kód"
                  value={
                    <Chip
                      size="small"
                      label={log.statusCode}
                      color={getStatusColor(log.statusCode)}
                    />
                  }
                />
              )}

              {log.correlationId && (
                <DetailItem
                  label="Korrelációs ID"
                  value={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          bgcolor: "rgba(0,0,0,0.05)",
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                        }}
                      >
                        {log.correlationId}
                      </Typography>
                      <Tooltip title="ID másolása">
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyToClipboard(log.correlationId, "Korrelációs ID másolva")
                          }
                        >
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              )}
              {log.message && <DetailItem label="Üzenet" value={log.message} />}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
            >
              Adatok & Fejlécek
            </Typography>

            {log.query &&
              typeof log.query === "object" &&
              Object.keys(log.query).length > 0 && (
                <CodeBlock
                  title="Query paraméterek"
                  data={log.query}
                  color="#9cdcfe"
                />
              )}

            {log.body &&
              typeof log.body === "object" &&
              Object.keys(log.body).length > 0 && (
                <CodeBlock
                  title="Kérés törzs (Body)"
                  data={log.body}
                  color="#ce9178"
                />
              )}

            {log.headers &&
              typeof log.headers === "object" &&
              Object.keys(log.headers).length > 0 && (
                <CodeBlock
                  title="Fejlécek (Headers)"
                  data={log.headers}
                  color="#4ec9b0"
                />
              )}

            {log.error && (
              <CodeBlock
                title="Hiba részletei"
                data={log.error}
                isError={true}
              />
            )}

            <details style={{ marginTop: "16px", cursor: "pointer" }}>
              <summary
                style={{
                  fontWeight: 600,
                  color: "#555",
                  marginBottom: "8px",
                  outline: "none",
                  fontSize: "0.875rem",
                }}
              >
                Fejlesztői nézet (Raw JSON)
              </summary>
              <Box mt={1.5}>
                <CodeBlock title="Raw JSON" data={log} color="#d4d4d4" />
              </Box>
            </details>
          </Box>
        </Box>
      </Box>
    );
  };

  const kpiCards = [
    {
      label: "Összes (30 nap)",
      value: stats?.totalLogs ?? logsData?.pagination?.total ?? 0,
      level: "Összes",
      color: "#1976d2",
      bg: alpha("#1976d2", 0.08),
      icon: <ArticleIcon />,
    },
    {
      label: "Hibák (ERROR)",
      value: stats?.logsByLevel?.ERROR ?? 0,
      level: "ERROR",
      color: "#d32f2f",
      bg: alpha("#d32f2f", 0.08),
      icon: <ErrorOutlineIcon />,
    },
    {
      label: "Figyelmeztetés (WARN)",
      value: stats?.logsByLevel?.WARN ?? 0,
      level: "WARN",
      color: "#ed6c02",
      bg: alpha("#ed6c02", 0.08),
      icon: <WarningAmberIcon />,
    },
    {
      label: "Információ (INFO)",
      value: stats?.logsByLevel?.INFO ?? 0,
      level: "INFO",
      color: "#0288d1",
      bg: alpha("#0288d1", 0.08),
      icon: <InfoOutlinedIcon />,
    },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          py: { xs: 2.5, md: 3 },
          px: { xs: 2.5, md: 3 },
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.15)",
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            position: "relative",
            zIndex: 1,
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                p: 1.25,
                bgcolor: "rgba(255,255,255,0.18)",
                borderRadius: 2,
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArticleIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{ letterSpacing: "-0.01em" }}
              >
                Rendszer Naplók
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.25 }}>
                API hívások, hibák és rendszeresemények valós idejű áttekintése
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Tooltip title="Automatikus frissítés 15 másodpercenként">
              <Button
                variant={autoRefresh ? "contained" : "outlined"}
                size="small"
                startIcon={<AutorenewIcon />}
                onClick={() => setAutoRefresh((prev) => !prev)}
                sx={{
                  color: autoRefresh ? "#1565c0" : "white",
                  bgcolor: autoRefresh ? "white" : "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.4)",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: autoRefresh
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.2)",
                    borderColor: "white",
                  },
                }}
              >
                {autoRefresh ? "Élő frissítés: BE" : "Élő frissítés"}
              </Button>
            </Tooltip>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isFetching}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.4)",
                bgcolor: "rgba(255,255,255,0.1)",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderColor: "white",
                },
              }}
            >
              Frissítés
            </Button>

            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              Naplók törlése
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Interactive 30-day Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 2,
          mb: 2.5,
        }}
      >
        {kpiCards.map((card) => {
          const isSelected = filters.level === card.level;
          return (
            <Card
              key={card.level}
              onClick={() => handleFilterChange("level", card.level)}
              sx={{
                cursor: "pointer",
                borderRadius: 2.5,
                border: "1.5px solid",
                borderColor: isSelected ? card.color : "rgba(0,0,0,0.08)",
                boxShadow: isSelected
                  ? `0 4px 14px ${alpha(card.color, 0.2)}`
                  : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: card.color,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: 2,
                  "&:last-child": { pb: 2 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    noWrap
                    display="block"
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{ color: card.color, mt: 0.25 }}
                  >
                    {Number(card.value).toLocaleString("hu-HU")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: card.bg,
                    color: card.color,
                    display: "flex",
                  }}
                >
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Main Table Card with Integrated Filters */}
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Filter Toolbar */}
        <Box sx={{ p: { xs: 2, md: 2.5 }, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "minmax(240px, 2fr) minmax(130px, 1fr) minmax(130px, 1fr) auto",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Keresés útvonal alapján (pl. /api/v1/users)..."
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              sx={{ gridColumn: { sm: "1 / -1", md: "auto" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: pathInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setPathInput("")}
                      aria-label="Keresés törlése"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Szint</InputLabel>
              <Select
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                label="Szint"
              >
                <MenuItem value="Összes">Összes</MenuItem>
                <MenuItem value="ERROR">ERROR</MenuItem>
                <MenuItem value="WARN">WARN</MenuItem>
                <MenuItem value="INFO">INFO</MenuItem>
                <MenuItem value="DEBUG">DEBUG</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Metódus</InputLabel>
              <Select
                value={filters.method}
                onChange={(e) => handleFilterChange("method", e.target.value)}
                label="Metódus"
              >
                <MenuItem value="Összes">Összes</MenuItem>
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
              </Select>
            </FormControl>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              sx={{ gridColumn: { sm: "1 / -1", md: "auto" } }}
            >
              <Badge
                badgeContent={activeAdvancedFilterCount}
                color="primary"
              >
                <Button
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                  variant={showAdvancedFilters ? "contained" : "outlined"}
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600, height: 40, whiteSpace: "nowrap" }}
                >
                  További szűrők
                </Button>
              </Badge>

              {hasActiveFilters && (
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  variant="text"
                  color="inherit"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600, height: 40, whiteSpace: "nowrap" }}
                >
                  Törlés
                </Button>
              )}
            </Stack>
          </Box>

          {/* Advanced Filters Collapse */}
          <Collapse in={showAdvancedFilters}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: "1px dashed",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "minmax(260px, 1.4fr) minmax(200px, 1fr) minmax(200px, 1fr)",
                  },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Autocomplete
                  fullWidth
                  size="small"
                  options={users}
                  value={selectedUserObj}
                  onChange={(event, newValue) =>
                    handleFilterChange("userId", newValue ? newValue.id : "")
                  }
                  getOptionLabel={(option) =>
                    option.name
                      ? `${option.name} (${option.email})`
                      : option.email || ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  noOptionsText="Nincs találat"
                  renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    return (
                      <Box component="li" key={option.id || key} {...rest}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {option.name || "Névtelen"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            display="block"
                          >
                            {option.email}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Felhasználó"
                      placeholder="Keresés név vagy e-mail alapján..."
                    />
                  )}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Kezdő dátum"
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Befejező dátum"
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}
                >
                  <ScheduleIcon sx={{ fontSize: 15 }} />
                  Gyors időszak:
                </Typography>
                <Chip
                  label="Utolsó 1 óra"
                  size="small"
                  variant="outlined"
                  onClick={() => applyDatePreset(subHours(new Date(), 1))}
                />
                <Chip
                  label="Ma"
                  size="small"
                  variant="outlined"
                  onClick={() => applyDatePreset(startOfDay(new Date()))}
                />
                <Chip
                  label="Utolsó 24 óra"
                  size="small"
                  variant="outlined"
                  onClick={() => applyDatePreset(subHours(new Date(), 24))}
                />
                <Chip
                  label="Utolsó 7 nap"
                  size="small"
                  variant="outlined"
                  onClick={() => applyDatePreset(subDays(new Date(), 7))}
                />
              </Stack>
            </Box>
          </Collapse>
        </Box>

        {/* Loading indicator */}
        <Box sx={{ height: 3 }}>
          {isFetching && <LinearProgress sx={{ height: 3 }} />}
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            Hiba történt a naplók betöltése során:{" "}
            {error?.data?.message || error?.message || "Ismeretlen hiba"}
          </Alert>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ width: 42 }} />
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  Időpont
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Szint</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Metódus</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Útvonal</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Felhasználó</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Státusz</TableCell>
                <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  Időtartam
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Részletek
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1.5 }}
                    >
                      Naplók betöltése...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : logsData?.data?.length > 0 ? (
                logsData.data.map((log) => {
                  const isErrorRow = log.level === "ERROR";
                  const isWarnRow = log.level === "WARN";
                  const isExpanded = Boolean(expandedRows[log.id]);

                  return (
                    <React.Fragment key={log.id}>
                      <TableRow
                        hover
                        onClick={() => toggleRowExpansion(log.id)}
                        sx={{
                          cursor: "pointer",
                          bgcolor: isErrorRow
                            ? alpha("#d32f2f", 0.04)
                            : isWarnRow
                            ? alpha("#ed6c02", 0.03)
                            : "inherit",
                          "& td:first-of-type": {
                            borderLeft: isErrorRow
                              ? "3px solid #d32f2f"
                              : isWarnRow
                              ? "3px solid #ed6c02"
                              : "3px solid transparent",
                          },
                        }}
                      >
                        <TableCell>
                          <IconButton
                            size="small"
                            aria-label="Sor kibontása"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(log.id);
                            }}
                          >
                            {isExpanded ? (
                              <ExpandLessIcon fontSize="small" />
                            ) : (
                              <ExpandMoreIcon fontSize="small" />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            color: "text.secondary",
                          }}
                        >
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.level || "UNKNOWN"}
                            color={LOG_LEVEL_COLORS[log.level] || "default"}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.method || "N/A"}
                            color={HTTP_METHOD_COLORS[log.method] || "default"}
                            variant="outlined"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontFamily: "monospace",
                              fontSize: "0.72rem",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Tooltip title={log.path || "N/A"} placement="top-start">
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.8rem",
                              }}
                            >
                              {log.path || "N/A"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{ maxWidth: 180 }}
                              >
                                {log.user.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                display="block"
                                sx={{ maxWidth: 180 }}
                              >
                                {log.user.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {log.userId || "Vendég / Rendszer"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.78rem",
                            color: "text.secondary",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.ip || "N/A"}
                        </TableCell>
                        <TableCell>
                          {log.statusCode != null ? (
                            <Chip
                              label={log.statusCode}
                              color={getStatusColor(log.statusCode)}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                              }}
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {log.duration != null ? (
                            <Chip
                              label={`${log.duration} ms`}
                              color={getDurationColor(log.duration)}
                              variant="outlined"
                              size="small"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.72rem",
                              }}
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Részletek megnyitása ablakban">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLogId(log.id);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          sx={{ py: 0, borderBottom: isExpanded ? undefined : 0 }}
                        >
                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            {renderLogDetails(log)}
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <ArticleIcon
                      sx={{ fontSize: 44, color: "text.disabled", mb: 1 }}
                    />
                    <Typography variant="subtitle1" color="text.secondary">
                      Nincs találat a megadott szűrőkkel
                    </Typography>
                    {hasActiveFilters && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={clearFilters}
                        sx={{ mt: 1.5, textTransform: "none" }}
                      >
                        Szűrők törlése
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={logsData?.pagination?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[25, 50, 100, 200]}
          labelRowsPerPage="Sorok száma:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} / ${
              count !== -1
                ? count.toLocaleString("hu-HU")
                : `több mint ${to}`
            }`
          }
        />
      </Paper>

      {/* Delete Logs Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          Naplók tömeges törlése
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
            Csak a megadott feltételeknek megfelelő rekordok kerülnek törlésre.
            A művelet <strong>nem visszavonható</strong>.
          </Alert>

          <Stack spacing={2}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                display="block"
                sx={{ mb: 1 }}
              >
                Gyors megőrzési időszak kiválasztása:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="7 napnál régebbiek"
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    handleDeleteFilterChange(
                      "before",
                      toDatetimeLocal(subDays(new Date(), 7))
                    )
                  }
                />
                <Chip
                  label="30 napnál régebbiek"
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    handleDeleteFilterChange(
                      "before",
                      toDatetimeLocal(subDays(new Date(), 30))
                    )
                  }
                />
                <Chip
                  label="90 napnál régebbiek"
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    handleDeleteFilterChange(
                      "before",
                      toDatetimeLocal(subDays(new Date(), 90))
                    )
                  }
                />
              </Stack>
            </Box>

            <TextField
              fullWidth
              label="Törlés a megadott dátum előtt"
              type="datetime-local"
              size="small"
              value={deleteFilters.before}
              onChange={(e) =>
                handleDeleteFilterChange("before", e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Szint</InputLabel>
                <Select
                  value={deleteFilters.level}
                  label="Szint"
                  onChange={(e) =>
                    handleDeleteFilterChange("level", e.target.value)
                  }
                >
                  <MenuItem value="">Összes</MenuItem>
                  <MenuItem value="ERROR">ERROR</MenuItem>
                  <MenuItem value="WARN">WARN</MenuItem>
                  <MenuItem value="INFO">INFO</MenuItem>
                  <MenuItem value="DEBUG">DEBUG</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Metódus</InputLabel>
                <Select
                  value={deleteFilters.method}
                  label="Metódus"
                  onChange={(e) =>
                    handleDeleteFilterChange("method", e.target.value)
                  }
                >
                  <MenuItem value="">Összes</MenuItem>
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Mégse
          </Button>
          <Button
            onClick={handleDeleteLogs}
            color="error"
            variant="contained"
            disabled={!hasDeleteCriteria || isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteSweepIcon />
              )
            }
          >
            {isDeleting ? "Törlés..." : "Törlés megerősítése"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Details Dialog */}
      <Dialog
        open={Boolean(selectedLogId)}
        onClose={() => setSelectedLogId(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          <span>Napló részletei</span>
          {selectedLog && (
            <Stack direction="row" spacing={1}>
              {selectedLog.level && (
                <Chip
                  label={selectedLog.level}
                  color={LOG_LEVEL_COLORS[selectedLog.level] || "default"}
                  size="small"
                />
              )}
              {selectedLog.method && (
                <Chip
                  label={selectedLog.method}
                  color={HTTP_METHOD_COLORS[selectedLog.method] || "default"}
                  variant="outlined"
                  size="small"
                />
              )}
              {selectedLog.statusCode != null && (
                <Chip
                  label={selectedLog.statusCode}
                  color={getStatusColor(selectedLog.statusCode)}
                  size="small"
                />
              )}
            </Stack>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {logDetailsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 6,
                gap: 2,
              }}
            >
              <CircularProgress size={28} />
              <Typography color="text.secondary">
                Részletek betöltése...
              </Typography>
            </Box>
          ) : selectedLog ? (
            renderLogDetails(selectedLog)
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                Nem található naplóbejegyzés.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          {selectedLog && (
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={() =>
                copyToClipboard(selectedLog, "Teljes napló JSON másolva")
              }
              sx={{ mr: "auto", textTransform: "none" }}
            >
              JSON másolása
            </Button>
          )}
          <Button
            onClick={() => setSelectedLogId(null)}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Bezárás
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
