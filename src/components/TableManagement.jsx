import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Input,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from "@mui/icons-material";
import TableSortLabel from "@mui/material/TableSortLabel";
import NotificationSnackbar from "./shared/NotificationSnackbar";
import {
  useGetTableListQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useLockTableMutation,
  useUnlockTableMutation,
} from "../store/api/apiSlice";
import { useSelector } from "react-redux";
import { selectUserPermissions } from "../store/slices/authSlice";
import { PageNumbering } from "./Navigation";

// Mapping from table names (as stored in DB) to their route paths
// This allows us to look up the page number for each table
const TableNameToRoute = {
  tanulo_letszam: "/tanulo_letszam",
  felvettek_szama: "/felvettek_szama",
  egy_oktatora_juto_tanulo: "/oktato_per_diak",
  szmsz: "/szakkepzesi-munkaszerződes-arany",
  alkalmazottak_munkaugy: "/felnottkepzes",
  kompetencia: "/kompetencia",
  nszfh: "/nszfh-meresek",
  versenyek: "/versenyek",
  elhelyezkedes: "/elhelyezkedesi-mutato",
  elegedettseg: "/vegzettek-elegedettsege",
  vizsgaeredmenyek: "/vizsgaeredmenyek",
  intezmenyi_neveltseg: "/intezmenyi-elismeresek",
  elegedettseg_meres: "/elegedettseg-meres-eredmenyei",
  hh_es_hhh_nevelesu_tanulok: "/hatranyos-helyezu-tanulok-aranya",
  sajatos_nevelesu_tanulok: "/sajatos-nevelesi-igenyu-tanulok-aranya",
  dobbanto: "/dobbanto-program-aranya",
  muhelyiskola: "/muhelyiskolai-reszszakmat",
  "oktato-egyeb-tev": "/oktato-egyeb-tev",
};

// Helper function to get page number for a table name
const getTablePageNumber = (tableName) => {
  const route = TableNameToRoute[tableName];
  if (route) {
    return PageNumbering[route];
  }
  // Fallback: try direct lookup with "/" prefix
  return PageNumbering["/" + tableName];
};

const TableManagement = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({ name: "", isAvailable: true });
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("displayAlias");
  const [order, setOrder] = useState("asc");

  const [editedTable, setEditedTable] = useState({
    name: "",
    isAvailable: true,
  });

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // API hooks
  const { data: tableList = [], isLoading, error } = useGetTableListQuery();
  const [createTable, { isLoading: isCreating }] = useCreateTableMutation();
  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();
  const [lockTable, { isLoading: isLocking }] = useLockTableMutation();
  const [unlockTable, { isLoading: isUnlocking }] = useUnlockTableMutation();

  // Get user permissions
  const userPermissions = useSelector(selectUserPermissions);
  const canLockTables =
    (userPermissions?.isHSZC && userPermissions?.isAdmin) ||
    userPermissions?.isSuperadmin;

  // Create enhanced table list with page numbering prefix (immutable approach)
  const enhancedTableList = useMemo(() => {
    // Tables to hide from non-superadmin users
    const hiddenTables = ["tablelist", "log", "users"];

    return tableList
      .filter((table) => {
        // Hide certain tables for non-superadmin users
        if (
          !userPermissions?.isSuperadmin &&
          hiddenTables.includes(table.name?.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((table) => {
        const prefix = getTablePageNumber(table.name);
        const displayName = table.alias || table.name;
        if (prefix) {
          return {
            ...table,
            displayAlias: `${prefix}. ${displayName}`,
          };
        }
        return {
          ...table,
          displayAlias: displayName,
        };
      });
  }, [tableList, userPermissions?.isSuperadmin]);

  // Sorting handler
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Comparator function
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Handle null/undefined values
    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";

    // Handle displayAlias - extract numeric prefix for proper sorting
    if (orderBy === "displayAlias") {
      // Extract the number prefix (e.g., "18. HH tanulók" -> 18)
      const aMatch = String(aValue).match(/^(\d+)\./);
      const bMatch = String(bValue).match(/^(\d+)\./);

      const aNum = aMatch ? parseInt(aMatch[1], 10) : Infinity;
      const bNum = bMatch ? parseInt(bMatch[1], 10) : Infinity;

      // If both have numbers, compare numerically
      if (aNum !== Infinity || bNum !== Infinity) {
        if (bNum < aNum) return -1;
        if (bNum > aNum) return 1;
        return 0;
      }
      // Fall through to string comparison for items without numbers
    }

    // Handle boolean values
    if (typeof aValue === "boolean") {
      return aValue === bValue ? 0 : aValue ? -1 : 1;
    }

    // Handle date strings
    if (orderBy === "createdAt" || orderBy === "updatedAt") {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  };

  // Filtered and sorted table list
  const sortedTableList = useMemo(() => {
    return [...enhancedTableList]
      .filter((table) =>
        (table.displayAlias || "").toLowerCase().includes(search.toLowerCase())
      )
      .sort(getComparator(order, orderBy));
  }, [enhancedTableList, search, order, orderBy]);

  const handleCreateTable = async () => {
    if (!newTable.name.trim()) {
      showNotification("Kérjük, adjon meg egy tábla nevet!", "error");
      return;
    }

    try {
      await createTable(newTable).unwrap();
      setNewTable({ name: "", isAvailable: true });
      setOpenCreate(false);
      showNotification("Tábla sikeresen létrehozva!");
    } catch (error) {
      console.error("Tábla létrehozása sikertelen:", error);
      showNotification(
        "Hiba történt a tábla létrehozása során: " +
          (error.data?.message || error.message),
        "error"
      );
    }
  };

  const handleEditTable = (table) => {
    setSelectedTable(table);
    setEditedTable({ name: table.name, isAvailable: table.isAvailable });
    setOpenEdit(true);
  };

  const handleUpdateTable = async () => {
    if (!editedTable.name.trim()) {
      showNotification("Kérjük, adjon meg egy tábla nevet!", "error");
      return;
    }

    try {
      await updateTable({ id: selectedTable.id, ...editedTable }).unwrap();
      setOpenEdit(false);
      setSelectedTable(null);
      showNotification("Tábla sikeresen frissítve!");
    } catch (error) {
      console.error("Tábla frissítése sikertelen:", error);
      showNotification(
        "Hiba történt a tábla frissítése során: " +
          (error.data?.message || error.message),
        "error"
      );
    }
  };

  const handleCloseCreate = () => {
    setNewTable({ name: "", isAvailable: true });
    setOpenCreate(false);
  };

  const handleCloseEdit = () => {
    setSelectedTable(null);
    setEditedTable({ name: "", isAvailable: true });
    setOpenEdit(false);
  };

  const handleLockTable = async (tableId, tableName) => {
    try {
      await lockTable(tableId).unwrap();
      showNotification(`Tábla "${tableName}" sikeresen lezárva!`);
    } catch (error) {
      console.error("Tábla lezárása sikertelen:", error);
      showNotification(
        "Hiba történt a tábla lezárása során: " +
          (error.data?.message || error.message),
        "error"
      );
    }
  };

  const handleUnlockTable = async (tableId, tableName) => {
    try {
      await unlockTable(tableId).unwrap();
      showNotification(`Tábla "${tableName}" sikeresen feloldva!`);
    } catch (error) {
      console.error("Tábla feloldása sikertelen:", error);
      showNotification(
        "Hiba történt a tábla feloldása során: " +
          (error.data?.message || error.message),
        "error"
      );
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Hiba történt a táblák betöltése során:{" "}
        {error.data?.message || error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Tábla kezelés
      </Typography>

      {/* Create Table Dialog */}
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Új tábla létrehozása</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tábla neve"
            value={newTable.name}
            onChange={(e) =>
              setNewTable((prev) => ({ ...prev, name: e.target.value }))
            }
            margin="normal"
            required
            helperText="Adja meg az új tábla nevét (pl. tanulo_letszam, kompetencia)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={newTable.isAvailable}
                onChange={(e) =>
                  setNewTable((prev) => ({
                    ...prev,
                    isAvailable: e.target.checked,
                  }))
                }
              />
            }
            label="Elérhető"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Mégse</Button>
          <Button
            onClick={handleCreateTable}
            variant="contained"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={20} /> : null}
          >
            {isCreating ? "Létrehozás..." : "Létrehozás"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Tábla szerkesztése</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tábla neve"
            value={editedTable.name}
            onChange={(e) =>
              setEditedTable((prev) => ({ ...prev, name: e.target.value }))
            }
            margin="normal"
            required
          />
          <FormControlLabel
            control={
              <Switch
                checked={editedTable.isAvailable}
                onChange={(e) =>
                  setEditedTable((prev) => ({
                    ...prev,
                    isAvailable: e.target.checked,
                  }))
                }
              />
            }
            label="Elérhető"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Mégse</Button>
          <Button
            onClick={handleUpdateTable}
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} /> : null}
          >
            {isUpdating ? "Frissítés..." : "Frissítés"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Content */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header with Create Button */}
          <Box>
            <Input
              placeholder="Keresés táblák között név alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Elérhető táblák</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
            >
              Új tábla
            </Button>
          </Box>

          {/* Tables List */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  {userPermissions?.isSuperadmin && (
                    <TableCell sortDirection={orderBy === "id" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "id"}
                        direction={orderBy === "id" ? order : "asc"}
                        onClick={() => handleRequestSort("id")}
                      >
                        ID
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell
                    sortDirection={orderBy === "displayAlias" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "displayAlias"}
                      direction={orderBy === "displayAlias" ? order : "asc"}
                      onClick={() => handleRequestSort("displayAlias")}
                    >
                      Név
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "isAvailable" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "isAvailable"}
                      direction={orderBy === "isAvailable" ? order : "asc"}
                      onClick={() => handleRequestSort("isAvailable")}
                    >
                      Státusz
                    </TableSortLabel>
                  </TableCell>
                  {canLockTables && (
                    <TableCell
                      sortDirection={orderBy === "isLocked" ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === "isLocked"}
                        direction={orderBy === "isLocked" ? order : "asc"}
                        onClick={() => handleRequestSort("isLocked")}
                      >
                        Lezárva
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell
                    sortDirection={orderBy === "createdAt" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "createdAt"}
                      direction={orderBy === "createdAt" ? order : "asc"}
                      onClick={() => handleRequestSort("createdAt")}
                    >
                      Létrehozva
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "updatedAt" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "updatedAt"}
                      direction={orderBy === "updatedAt" ? order : "asc"}
                      onClick={() => handleRequestSort("updatedAt")}
                    >
                      Frissítve
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Műveletek</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTableList.length === 0 ? (
                  <TableRow>
                    {/* Columns: ID, Név, Státusz, [Lezárva if canLockTables], Létrehozva, Frissítve, Műveletek */}
                    <TableCell colSpan={canLockTables ? 7 : 6} align="center">
                      Nincs elérhető tábla
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTableList.map((table) => (
                    <TableRow key={table.id}>
                      {userPermissions?.isSuperadmin && (
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                            }}
                          >
                            {table.id}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {table.displayAlias}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            table.isAvailable ? "Elérhető" : "Nem elérhető"
                          }
                          color={table.isAvailable ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      {canLockTables && (
                        <TableCell>
                          <Chip
                            label={table.isLocked ? "Lezárva" : "Aktív"}
                            color={table.isLocked ? "error" : "success"}
                            size="small"
                            icon={
                              table.isLocked ? <LockIcon /> : <UnlockIcon />
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        {table.createdAt
                          ? new Date(table.createdAt).toLocaleDateString(
                              "hu-HU"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {table.updatedAt
                          ? new Date(table.updatedAt).toLocaleDateString(
                              "hu-HU"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEditTable(table)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          {canLockTables &&
                            (table.isLocked ? (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUnlockTable(table.id, table.name)
                                }
                                color="success"
                                disabled={isUnlocking}
                              >
                                <UnlockIcon />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleLockTable(table.id, table.name)
                                }
                                color="error"
                                disabled={isLocking}
                              >
                                <LockIcon />
                              </IconButton>
                            ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Box>
  );
};

export default TableManagement;
