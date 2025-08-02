import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
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
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";
import {
  useGetLogsQuery,
  useGetLogByIdQuery,
  useDeleteLogsMutation,
} from "../store/api/apiSlice";
import { selectUserPermissions } from "../store/slices/authSlice";
import { toaster } from "../components/ui/toaster";

// Log level colors
const LOG_LEVEL_COLORS = {
  ERROR: "error",
  WARN: "warning",
  INFO: "info",
  DEBUG: "default",
};

// HTTP method colors
const HTTP_METHOD_COLORS = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  DELETE: "error",
  PATCH: "info",
};

export default function Logs() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    level: "Összes",
    method: "Összes",
    userId: "",
    path: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFilters, setDeleteFilters] = useState({
    before: "",
    level: "",
    method: "",
  });

  const userPermissions = useSelector(selectUserPermissions);

  // Check admin permissions
  const isAdmin = userPermissions?.isAdmin || userPermissions?.isSuperadmin;

  // Query for logs with filters and pagination
  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useGetLogsQuery({
    page: page + 1, // API expects 1-based page
    limit: rowsPerPage,
    // Only include filters that are not "Összes" or empty
    ...(filters.level &&
      filters.level !== "Összes" && { level: filters.level }),
    ...(filters.method &&
      filters.method !== "Összes" && { method: filters.method }),
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.path && { path: filters.path }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  });

  // Query for individual log details
  const { data: selectedLog, isLoading: logDetailsLoading } =
    useGetLogByIdQuery(selectedLogId, {
      skip: !selectedLogId,
    });

  // Delete logs mutation
  const [deleteLogsMutation, { isLoading: isDeleting }] =
    useDeleteLogsMutation();

  // Check if user has admin access
  if (!isAdmin) {
    return (
      <Box p={4}>
        <Alert severity="error">
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
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      level: "",
      method: "",
      userId: "",
      path: "",
      startDate: "",
      endDate: "",
    });
    setPage(0);
  };

  const toggleRowExpansion = (logId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const handleDeleteLogs = async () => {
    try {
      await deleteLogsMutation(deleteFilters).unwrap();

      toaster.create({
        title: "Sikeres törlés",
        description: "A naplók sikeresen törölve lettek.",
        status: "success",
        duration: 3000,
      });

      setDeleteDialogOpen(false);
      setDeleteFilters({ before: "", level: "", method: "" });
      refetch();
    } catch (error) {
      toaster.create({
        title: "Hiba a törlés során",
        description:
          error?.data?.message || "Váratlan hiba történt a naplók törlésekor.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "yyyy.MM.dd HH:mm:ss", {
        locale: hu,
      });
    } catch {
      return dateString;
    }
  };

  const renderLogDetails = (log) => (
    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Kérés részletei
          </Typography>
          <Typography variant="body2">
            <strong>Útvonal:</strong> {log.path}
          </Typography>
          <Typography variant="body2">
            <strong>IP cím:</strong> {log.ip}
          </Typography>
          <Typography variant="body2">
            <strong>User Agent:</strong> {log.userAgent}
          </Typography>
          {log.user && (
            <Typography variant="body2">
              <strong>Felhasználó:</strong> {log.user.name} ({log.user.email})
            </Typography>
          )}
          {log.duration && (
            <Typography variant="body2">
              <strong>Időtartam:</strong> {log.duration}ms
            </Typography>
          )}
          {log.statusCode && (
            <Typography variant="body2">
              <strong>Státusz kód:</strong> {log.statusCode}
            </Typography>
          )}
          {log.correlationId && (
            <Typography variant="body2">
              <strong>Korrelációs ID:</strong> {log.correlationId}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {log.query && Object.keys(log.query).length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Query paraméterek
              </Typography>
              <pre style={{ fontSize: "0.75rem", margin: 0 }}>
                {JSON.stringify(log.query, null, 2)}
              </pre>
            </Box>
          )}
          {log.body && Object.keys(log.body).length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Kérés törzs
              </Typography>
              <pre style={{ fontSize: "0.75rem", margin: 0 }}>
                {JSON.stringify(log.body, null, 2)}
              </pre>
            </Box>
          )}
          {log.headers && Object.keys(log.headers).length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Fejlécek
              </Typography>
              <pre style={{ fontSize: "0.75rem", margin: 0 }}>
                {JSON.stringify(log.headers, null, 2)}
              </pre>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box p={1}>
      <Typography variant="h4" gutterBottom>
        Rendszer Naplók
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Ez az oldal a rendszer összes API hívásának naplóját tartalmazza. Csak
        adminisztrátori jogosultságokkal rendelkező felhasználók férhetnek
        hozzá.
      </Typography>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Szűrők</Typography>
            <Box>
              <Button
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                {showFilters ? "Szűrők elrejtése" : "Szűrők megjelenítése"}
              </Button>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Szűrők törlése
              </Button>
            </Box>
          </Box>

          <Collapse in={showFilters}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl size="small">
                  <InputLabel>Szint</InputLabel>
                  <Select
                    value={filters.level}
                    onChange={(e) =>
                      handleFilterChange("level", e.target.value)
                    }
                    label="Szint"
                    defaultValue="Összes"
                  >
                    <MenuItem value="Összes">Összes</MenuItem>
                    <MenuItem value="ERROR">ERROR</MenuItem>
                    <MenuItem value="WARN">WARN</MenuItem>
                    <MenuItem value="INFO">INFO</MenuItem>
                    <MenuItem value="DEBUG">DEBUG</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Metódus</InputLabel>
                  <Select
                    value={filters.method}
                    onChange={(e) =>
                      handleFilterChange("method", e.target.value)
                    }
                    label="Metódus"
                    defaultValue="Összes"
                  >
                    <MenuItem value="Összes">Összes</MenuItem>
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                    <MenuItem value="PATCH">PATCH</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Felhasználó ID"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Útvonal"
                  value={filters.path}
                  onChange={(e) => handleFilterChange("path", e.target.value)}
                  placeholder="pl. /api/v1/users"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Paper>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Hiba történt a naplók betöltése során:{" "}
            {error?.data?.message || error.message}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Időpont</TableCell>
                <TableCell>Szint</TableCell>
                <TableCell>Metódus</TableCell>
                <TableCell>Útvonal</TableCell>
                <TableCell>Felhasználó</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Státusz</TableCell>
                <TableCell>Időtartam</TableCell>
                <TableCell>Műveletek</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Betöltés...
                  </TableCell>
                </TableRow>
              ) : logsData?.data?.length > 0 ? (
                logsData.data.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(log.id)}
                        >
                          {expandedRows[log.id] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.level}
                          color={LOG_LEVEL_COLORS[log.level] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.method}
                          color={HTTP_METHOD_COLORS[log.method] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.path}</TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <div style={{ fontWeight: "medium" }}>
                              {log.user.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>
                              {log.user.email}
                            </div>
                          </div>
                        ) : (
                          log.userId || "N/A"
                        )}
                      </TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>
                        {log.statusCode && (
                          <Chip
                            label={log.statusCode}
                            color={log.statusCode >= 400 ? "error" : "success"}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {log.duration ? `${log.duration}ms` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Részletek megtekintése">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedLogId(log.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                      >
                        <Collapse
                          in={expandedRows[log.id]}
                          timeout="auto"
                          unmountOnExit
                        >
                          {renderLogDetails(log)}
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Nincs találat a megadott szűrőkkel
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
          labelRowsPerPage="Sorok száma oldalanként:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `több mint ${to}`}`
          }
        />
      </Paper>

      {/* Log Details Dialog */}
      <Dialog
        open={!!selectedLogId}
        onClose={() => setSelectedLogId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Napló részletei</DialogTitle>
        <DialogContent>
          {logDetailsLoading ? (
            <Typography>Betöltés...</Typography>
          ) : selectedLog ? (
            renderLogDetails(selectedLog)
          ) : (
            <Typography>Nem található napló</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLogId(null)}>Bezárás</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
