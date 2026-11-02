import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider,
  Chip,
  Autocomplete,
  Checkbox,
  FormGroup,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import NotificationSnackbar from "./shared/NotificationSnackbar";
import { getHierarchyLevel, getUserTypeLabel } from "../utils/userHierarchy";
import {
  useGetTableListQuery,
  useGetAllAlapadatokQuery,
} from "../store/api/apiSlice";
import { getTableDisplayName } from "../utils/tableValues";
import {
  getAvailableTables,
  calculateAccessLevel,
} from "../utils/tableAccessUtils";
import {
  USER_TABLE_PERMISSION_OPTIONS,
  getPermissionSelection,
  toggleUserTablePermission,
  formatUserTablePermissions,
  getDefaultUserTableAccess,
} from "../utils/userTablePermissions";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/authSlice";

const CreateUserDialog = ({ open, onClose, onSave, userPermissions }) => {
  const currentUser = useSelector(selectUser);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    permissions: 1, // Default to iskolai_general (level 1)
    tableAccess: [], // Default empty table access
    alapadatokId: null, // Will be set based on user context
    isActive: true,
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState("iskolai_general");
  const [selectedTables, setSelectedTables] = useState([]);
  const [tablePermissions, setTablePermissions] = useState({}); // Store permissions for each table
  const initializedType = useRef(null);
  const availableUserTypes = userPermissions?.getAvailableUserTypes() || [];

  // Determine if current user can select schools for new users
  const canSelectSchoolForUsers =
    userPermissions?.isSuperadmin ||
    (userPermissions?.isHSZC && userPermissions?.isAdmin);

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

  // Fetch available tables
  const { data: tableList = [], isLoading: tablesLoading } =
    useGetTableListQuery();
  const permissionOptions = USER_TABLE_PERMISSION_OPTIONS;

  // Fetch available schools for selection
  const { data: schoolsData = [], isLoading: schoolsLoading } =
    useGetAllAlapadatokQuery();

  // Apply defaults once on opening or changing type, after tables arrive.
  // Background refetches must preserve the user's manual adjustments.
  useEffect(() => {
    if (!open) {
      initializedType.current = null;
      return;
    }
    if (tablesLoading || tableList.length === 0 || initializedType.current === userType) return;

    const defaults = getDefaultUserTableAccess(tableList, userType);
    initializedType.current = userType;
    setSelectedTables(defaults.selectedTables);
    setTablePermissions(defaults.tablePermissions);
    setNewUser(prev => ({ ...prev, tableAccess: defaults.tableAccess }));
  }, [open, userType, tableList, tablesLoading]);

  // Effect to set default school for Iskolai users
  useEffect(() => {
    if (open && !canSelectSchoolForUsers && currentUser?.school) {
      // For Iskolai users, automatically set their own school
      const schoolId =
        typeof currentUser.school === "object"
          ? currentUser.school.id
          : currentUser.school;

      setNewUser((prev) => ({
        ...prev,
        alapadatokId: schoolId,
      }));
    }
  }, [open, canSelectSchoolForUsers, currentUser?.school]);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    const permissions = getHierarchyLevel(type);

    setNewUser((prev) => ({
      ...prev,
      permissions: permissions,
    }));
  };
  const handleTableAccessChange = (tables) => {
    setSelectedTables(tables);

    // Newly selected tables inherit the selected user type's defaults.
    const newTablePermissions = { ...tablePermissions };
    const defaultPermissions = getDefaultUserTableAccess(tableList, userType).tablePermissions;

    // Add default permissions for newly selected tables
    tables.forEach((table) => {
      if (!newTablePermissions[table.id]) {
        newTablePermissions[table.id] = defaultPermissions[table.id] || ["READ"];
      }
    });

    // Remove permissions for deselected tables
    const selectedTableIds = tables.map((t) => t.id);
    Object.keys(newTablePermissions).forEach((tableId) => {
      if (!selectedTableIds.includes(tableId)) {
        delete newTablePermissions[tableId];
      }
    });

    setTablePermissions(newTablePermissions);
    updateUserTableAccess(tables, newTablePermissions);
  };

  const handleTablePermissionChange = (tableId, permissions) => {
    const newTablePermissions = {
      ...tablePermissions,
      [tableId]: permissions,
    };

    setTablePermissions(newTablePermissions);
    updateUserTableAccess(selectedTables, newTablePermissions);
  };

  const updateUserTableAccess = (tables, permissions) => {
    // Convert selected tables and their permissions to the format expected by the API
    const tableAccess = tables.map((table) => ({
      tableName: table.name,
      access: calculateAccessLevel(permissions[table.id] || []),
    }));

    setNewUser((prev) => ({
      ...prev,
      tableAccess: tableAccess,
    }));
  };

  const handleInputChange = (field, value) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const trimmedName = newUser.name?.trim();
    const trimmedEmail = newUser.email?.trim();

    if (!trimmedName || !trimmedEmail || !newUser.password) {
      showNotification("Kérjük töltse ki az összes kötelező mezőt!", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showNotification("Kérjük adjon meg érvényes email címet!", "error");
      return;
    }

    if (newUser.password.length < 6) {
      showNotification(
        "A jelszónak legalább 6 karakter hosszúnak kell lennie!",
        "error"
      );
      return;
    }

    if (newUser.password !== passwordConfirm) {
      showNotification("A megadott jelszavak nem egyeznek meg!", "error");
      return;
    }

    if (!userPermissions.canCreateUser(userType)) {
      showNotification(
        "Nincs jogosultsága ilyen típusú felhasználó létrehozásához!",
        "error"
      );
      return;
    }

    // For Iskolai users created by school admin, ensure school is assigned
    if (
      !canSelectSchoolForUsers &&
      (!newUser.alapadatokId || !currentUser?.school)
    ) {
      showNotification(
        "Hiba történt az iskolaválasztással. Kérjük próbálja újra!",
        "error"
      );
      return;
    }

    // For Iskolai users created by Superadmin/HSZC, require school selection
    if (
      canSelectSchoolForUsers &&
      userType.startsWith("iskolai_") &&
      !newUser.alapadatokId
    ) {
      showNotification(
        "Iskolai felhasználó esetén kötelező iskolát választani!",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newUser,
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
      };
      const result = await onSave(payload);
      if (result?.error) {
        showNotification(result.error, "error");
        return;
      }
      handleClose();
    } catch (err) {
      showNotification(
        err?.message || "Hiba történt a felhasználó mentése során!",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      permissions: 1, // Reset to iskolai_general
      tableAccess: [],
      alapadatokId: null,
      isActive: true,
    });
    setPasswordConfirm("");
    setShowPassword(false);
    setShowPasswordConfirm(false);
    setIsSubmitting(false);
    setUserType("iskolai_general");
    setSelectedTables([]);
    setTablePermissions({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Új felhasználó létrehozása</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: "75vh" }}>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Név"
            value={newUser.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            autoComplete="off"
            value={newUser.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            margin="normal"
            required
          />
          <Grid container spacing={2} sx={{ mt: 0.5, mb: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Jelszó"
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                error={Boolean(newUser.password && newUser.password.length < 6)}
                helperText={
                  newUser.password && newUser.password.length < 6
                    ? "Legalább 6 karakter szükséges"
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Jelszó megerősítése"
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                error={Boolean(passwordConfirm && newUser.password !== passwordConfirm)}
                helperText={
                  passwordConfirm && newUser.password !== passwordConfirm
                    ? "A megadott jelszavak nem egyeznek"
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setShowPasswordConfirm(!showPasswordConfirm)
                        }
                        edge="end"
                      >
                        {showPasswordConfirm ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          {/* School Assignment Section - Only show for users who can select schools */}
          {canSelectSchoolForUsers ? (
            <>
              <Typography variant="h6" gutterBottom>
                Iskola hozzárendelés
              </Typography>
              <Autocomplete
                id="school-select"
                options={schoolsData}
                getOptionLabel={(option) => option.iskola_neve || ""}
                value={
                  schoolsData.find(
                    (school) => school.id === newUser.alapadatokId
                  ) || null
                }
                onChange={(event, newValue) =>
                  handleInputChange(
                    "alapadatokId",
                    newValue ? newValue.id : null
                  )
                }
                loading={schoolsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Iskola kiválasztása"
                    placeholder="Válasszon iskolát..."
                    helperText="Válassza ki azt az iskolát, amelyhez a felhasználó tartozik (opcionális)"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.iskola_neve}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.intezmeny_tipus}
                      </Typography>
                    </Box>
                  </Box>
                )}
                sx={{ mt: 2 }}
              />
              {newUser.alapadatokId && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kiválasztott iskola:
                  </Typography>
                  <Box sx={{ ml: 2, mt: 1 }}>
                    <Typography variant="body2">
                      • Iskola:{" "}
                      {
                        schoolsData.find(
                          (school) => school.id === newUser.alapadatokId
                        )?.iskola_neve
                      }
                    </Typography>
                    <Typography variant="body2">
                      • Típus:{" "}
                      {
                        schoolsData.find(
                          (school) => school.id === newUser.alapadatokId
                        )?.intezmeny_tipus
                      }
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Iskola hozzárendelés
              </Typography>
              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Az új felhasználó automatikusan az Ön iskolájához lesz
                  hozzárendelve:
                </Typography>
                {currentUser?.school && newUser.alapadatokId && (
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2">
                      • Iskola:{" "}
                      {schoolsData.find(
                        (school) => school.id === newUser.alapadatokId
                      )?.iskola_neve ||
                        (typeof currentUser.school === "object"
                          ? currentUser.school.iskola_neve
                          : "Ismeretlen iskola")}
                    </Typography>
                    <Typography variant="body2">
                      • Típus:{" "}
                      {schoolsData.find(
                        (school) => school.id === newUser.alapadatokId
                      )?.intezmeny_tipus ||
                        (typeof currentUser.school === "object"
                          ? currentUser.school.intezmeny_tipus
                          : "Ismeretlen típus")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Felhasználó típusa
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Felhasználó típus</InputLabel>
            <Select
              value={userType}
              label="Felhasználó típus"
              onChange={(e) => handleUserTypeChange(e.target.value)}
            >
              {availableUserTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>{" "}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Kiválasztott felhasználó típus:
            </Typography>
            <Box sx={{ ml: 2, mt: 1 }}>
              <Typography variant="body2">
                • Típus: {getUserTypeLabel(userType)}
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={newUser.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
              />
            }
            label="Aktív felhasználó"
            sx={{ mt: 2 }}
          />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Tábla hozzáférések
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A felhasználó típusa alapján minden elérhető táblát előre kiválasztunk:
            általános típusnál olvasással, admin és privilegizált típusnál olvasással és szerkesztéssel.
            A beállítások egyedileg módosíthatók. A típus megváltoztatása újra beállítja az alapjogokat.
          </Typography>
          
          {/* Preset szekcio */}
          <Card variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Gyors beállítások (Presetek)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Válasszon egy presetet a tábla hozzáférések gyors beállításához
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => {
                    const allTables = getAvailableTables(tableList);
                    handleTableAccessChange(allTables);
                    const allPermissions = {};
                    allTables.forEach(table => {
                      allPermissions[table.id] = ['READ'];
                    });
                    setTablePermissions(allPermissions);
                    updateUserTableAccess(allTables, allPermissions);
                  }}
                >
                  📖 Minden tábla olvasás
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="info"
                  onClick={() => {
                    const allTables = getAvailableTables(tableList);
                    handleTableAccessChange(allTables);
                    const allPermissions = {};
                    allTables.forEach(table => {
                      allPermissions[table.id] = ['READ', 'WRITE', 'UPDATE', 'DELETE'];
                    });
                    setTablePermissions(allPermissions);
                    updateUserTableAccess(allTables, allPermissions);
                  }}
                >
                  ✏️ Minden tábla szerkesztés
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    handleTableAccessChange([]);
                    setTablePermissions({});
                    updateUserTableAccess([], {});
                  }}
                >
                  🗑️ Minden eltávolítása
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Autocomplete
            multiple
            disableCloseOnSelect
            id="table-access-select"
            options={getAvailableTables(tableList)}
            getOptionLabel={getTableDisplayName}
            value={selectedTables}
            onChange={(event, newValue) => handleTableAccessChange(newValue)}
            loading={tablesLoading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={getTableDisplayName(option)}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tábla hozzáférések"
                placeholder="Válasszon táblákat..."
                helperText="Válassza ki azokat a táblákat, amelyekhez a felhasználó hozzáférhet, vagy használja a preset gombokat"
              />
            )}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Kiválasztott táblák jogosultságai:
            </Typography>
            {selectedTables.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {selectedTables.map((table) => (
                  <Card key={table.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {table.alias}
                      </Typography>
                      <FormGroup>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Jogosultságok:
                        </Typography>
                        <Grid container spacing={1}>
                          {permissionOptions.map((option) => (
                            <Grid item xs={6} sm={3} key={option.key}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...getPermissionSelection(
                                      tablePermissions[table.id] || [], option.key
                                    )}
                                    onChange={(e) => {
                                      const currentPermissions = tablePermissions[table.id] || [];
                                      const newPermissions = toggleUserTablePermission(
                                        currentPermissions, option.key, e.target.checked
                                      );
                                      handleTablePermissionChange(table.id, newPermissions);
                                    }}
                                  />
                                }
                                label={option.label}
                              />
                            </Grid>
                          ))}
                        </Grid>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Hozzáférési szint:{" "}
                            {calculateAccessLevel(
                              tablePermissions[table.id] || []
                            )}
                            {tablePermissions[table.id] &&
                              tablePermissions[table.id].length > 0 && (
                                <span>
                                  {" "}
                                  (
                                  {formatUserTablePermissions(
                                    calculateAccessLevel(
                                      tablePermissions[table.id]
                                    )
                                  ).join(", ")}
                                  )
                                </span>
                              )}
                          </Typography>
                        </Box>
                      </FormGroup>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 2, mt: 1 }}
              >
                Nincs kiválasztott tábla
              </Typography>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Divider />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Mégse
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={tablesLoading || isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : null
          }
        >
          {isSubmitting ? "Létrehozás..." : "Létrehozás"}
        </Button>
      </DialogActions>
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Dialog>
  );
};

export default CreateUserDialog;
