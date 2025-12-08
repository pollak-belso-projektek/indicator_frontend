import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import NotificationSnackbar from "../shared/NotificationSnackbar";
import {
  getHierarchyLevel,
  getUserTypeLabel,
  getUserTypeFromLevel,
} from "../../utils/userHierarchy";
import {
  useGetTableListQuery,
  useChangeUserPasswordMutation,
  useGetAllAlapadatokQuery,
} from "../../store/api/apiSlice";
import {
  TABLE_ACCESS_LEVELS,
  getAvailableTables,
  getPermissionOptions,
  calculateAccessLevel,
  formatAccessLevel,
} from "../../utils/tableAccessUtils";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";

export const EditUserDialog = ({
  open,
  onClose,
  user,
  onUserChange,
  onSave,
  fullScreen,
  userPermissions,
}) => {
  const currentUser = useSelector(selectUser);

  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    permissions: 1,
    tableAccess: [],
    alapadatokId: null,
    isActive: true,
  });
  const [userType, setUserType] = useState("iskolai_general");
  const [selectedTables, setSelectedTables] = useState([]);
  const [tablePermissions, setTablePermissions] = useState({});
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // Determine if current user can select schools for users
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

  // Get the password change mutation
  const [changeUserPassword, { isLoading: isChangingPassword }] =
    useChangeUserPasswordMutation();

  // Get available user types that current user can assign (not higher than their own level)
  const availableUserTypes = userPermissions?.getAvailableUserTypes() || [];

  // Fetch available tables
  const { data: tableList = [], isLoading: tablesLoading } =
    useGetTableListQuery();
  const permissionOptions = getPermissionOptions();

  // Fetch available schools for selection
  const { data: schoolsData = [], isLoading: schoolsLoading } =
    useGetAllAlapadatokQuery();

  // Initialize form when user data changes
  useEffect(() => {
    if (user && open) {
      setEditedUser({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        permissions: user.permissions || 1,
        tableAccess: user.tableAccess || [],
        alapadatokId: user.alapadatokId || null,
        isActive: user.isActive !== false, // Default to true if undefined
      });

      // Set user type from permissions level
      const currentUserType = getUserTypeFromLevel(user.permissions || 1);
      setUserType(currentUserType);

      // Initialize table selections and permissions
      if (user.tableAccess && Array.isArray(user.tableAccess)) {
        const tables = user.tableAccess.map((ta) => ({
          id: ta.tableName,
          name: ta.tableName,
        }));
        setSelectedTables(tables);

        const permissions = {};
        user.tableAccess.forEach((ta) => {
          const permissionKeys = [];
          if (ta.access & TABLE_ACCESS_LEVELS.READ) permissionKeys.push("READ");
          if (ta.access & TABLE_ACCESS_LEVELS.WRITE)
            permissionKeys.push("WRITE");
          if (ta.access & TABLE_ACCESS_LEVELS.UPDATE)
            permissionKeys.push("UPDATE");
          if (ta.access & TABLE_ACCESS_LEVELS.DELETE)
            permissionKeys.push("DELETE");
          permissions[ta.tableName] = permissionKeys;
        });
        setTablePermissions(permissions);
      } else {
        setSelectedTables([]);
        setTablePermissions({});
      }

      setShowPasswordField(false);
      setNewPassword("");
      setNewPasswordConfirm("");
    }
  }, [user, open]);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    const permissions = getHierarchyLevel(type);

    setEditedUser((prev) => ({
      ...prev,
      permissions: permissions,
    }));
  };

  const handleTableAccessChange = (tables) => {
    setSelectedTables(tables);

    // Initialize permissions for new tables with READ access by default
    const newTablePermissions = { ...tablePermissions };

    // Add default permissions for newly selected tables
    tables.forEach((table) => {
      if (!newTablePermissions[table.id || table.name]) {
        newTablePermissions[table.id || table.name] = ["READ"];
      }
    });

    // Remove permissions for deselected tables
    const selectedTableIds = tables.map((t) => t.id || t.name);
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
      access: calculateAccessLevel(permissions[table.id || table.name] || []),
    }));

    setEditedUser((prev) => ({
      ...prev,
      tableAccess: tableAccess,
    }));
  };

  const handleInputChange = (field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSave = async () => {
    if (!editedUser.name || !editedUser.email) {
      showNotification("Kérjük töltse ki az összes kötelező mezőt!", "error");
      return;
    }

    // Check if current user can assign this user type
    if (!userPermissions.canCreateUser(userType)) {
      showNotification(
        "Nincs jogosultsága ilyen típusú felhasználó szerkesztéséhez!",
        "error"
      );
      return;
    }

    // Ensure ID is present
    if (!editedUser.id) {
      showNotification("Felhasználó azonosító hiányzik!", "error");
      return;
    }

    // For Iskolai users, ensure they can only edit users from their own school
    if (!canSelectSchoolForUsers && currentUser?.school) {
      const currentUserSchoolId =
        typeof currentUser.school === "object"
          ? currentUser.school.id
          : currentUser.school;

      if (editedUser.alapadatokId !== currentUserSchoolId) {
        showNotification(
          "Csak saját iskolájához tartozó felhasználókat szerkeszthet!",
          "error"
        );
        return;
      }
    }

    // Validate password if changing
    if (showPasswordField) {
      if (!newPassword.trim()) {
        showNotification("Az új jelszó nem lehet üres!", "error");
        return;
      }
      if (newPassword !== newPasswordConfirm) {
        showNotification("A jelszavak nem egyeznek!", "error");
        return;
      }
    }

    try {
      // Update user data (excluding password)
      const updatedUser = { ...editedUser };
      console.log("Saving user with ID:", updatedUser.id, "Data:", updatedUser);
      await onSave(updatedUser);

      // Change password separately if requested
      if (showPasswordField && newPassword.trim()) {
        await changeUserPassword({
          id: editedUser.id,
          newPassword,
          newPasswordConfirm,
        }).unwrap();

        showNotification("Felhasználó és jelszó sikeresen frissítve!");
      } else {
        showNotification("Felhasználó sikeresen frissítve!");
      }

      handleClose();
    } catch (error) {
      console.error("Error saving user:", error);
      showNotification(
        "Hiba történt a mentés során: " + (error.message || "Ismeretlen hiba"),
        "error"
      );
    }
  };

  const handleClose = () => {
    setShowPasswordField(false);
    setNewPassword("");
    setNewPasswordConfirm("");
    onClose();
  };

  // Find tables that match the selected ones from the API
  const availableTables = getAvailableTables(tableList);
  const tableOptions =
    availableTables.length > 0
      ? availableTables
      : selectedTables.map((t) => ({
          id: t.id || t.name,
          name: t.name || t.id,
          isAvailable: true,
        }));

  console.log("Table Options:", tableOptions);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>Felhasználó szerkesztése</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Név"
            value={editedUser.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={editedUser.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            margin="normal"
            required
          />

          {/* Password Change Section */}
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPasswordField}
                  onChange={(e) => setShowPasswordField(e.target.checked)}
                />
              }
              label="Jelszó módosítása"
            />
            {showPasswordField && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Új jelszó"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Új jelszó megerősítése"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  margin="normal"
                  required
                  error={
                    newPassword !== newPasswordConfirm &&
                    newPasswordConfirm.length > 0
                  }
                  helperText={
                    newPassword !== newPasswordConfirm &&
                    newPasswordConfirm.length > 0
                      ? "A jelszavak nem egyeznek"
                      : "Írja be újra az új jelszót a megerősítéshez"
                  }
                />
              </Box>
            )}
          </Box>
          <Divider sx={{ my: 3 }} />

          {/* School Assignment Section - Only show for users who can select schools */}
          {canSelectSchoolForUsers ? (
            <>
              <Typography variant="h6" gutterBottom>
                Iskola hozzárendelés
              </Typography>
              <Autocomplete
                id="school-edit-select"
                options={schoolsData}
                getOptionLabel={(option) => option.iskola_neve || ""}
                value={
                  schoolsData.find(
                    (school) => school.id === editedUser.alapadatokId
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
              {editedUser.alapadatokId && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kiválasztott iskola:
                  </Typography>
                  <Box sx={{ ml: 2, mt: 1 }}>
                    <Typography variant="body2">
                      • Iskola:{" "}
                      {
                        schoolsData.find(
                          (school) => school.id === editedUser.alapadatokId
                        )?.iskola_neve
                      }
                    </Typography>
                    <Typography variant="body2">
                      • Típus:{" "}
                      {
                        schoolsData.find(
                          (school) => school.id === editedUser.alapadatokId
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
                  Iskolai felhasználók csak saját iskolájukhoz tartozó
                  felhasználókat szerkeszthetnek.
                </Typography>
                {editedUser.alapadatokId && (
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body2">
                      • Iskola:{" "}
                      {schoolsData.find(
                        (school) => school.id === editedUser.alapadatokId
                      )?.iskola_neve || "Ismeretlen iskola"}
                    </Typography>
                    <Typography variant="body2">
                      • Típus:{" "}
                      {schoolsData.find(
                        (school) => school.id === editedUser.alapadatokId
                      )?.intezmeny_tipus || "Ismeretlen típus"}
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
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Kiválasztott felhasználó típus:
            </Typography>
            <Box sx={{ ml: 2, mt: 1 }}>
              <Typography variant="body2">
                • Típus: {getUserTypeLabel(userType)}
              </Typography>
              <Typography variant="body2">
                • Hierarchia szint: {editedUser.permissions}
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={editedUser.isActive}
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
          
          {/* Preset szekcio */}
          <Card variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Gyors beállítások (Presetek)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Válasszon egy presetet a tábla hozzáférések gyors beállításához
              </Typography>
              
              {/* Általános presetek */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 1 }}>
                  Általános
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={() => {
                      handleTableAccessChange(tableOptions);
                      const allPermissions = {};
                      tableOptions.forEach(table => {
                        allPermissions[table.id || table.name] = ['READ'];
                      });
                      setTablePermissions(allPermissions);
                      updateUserTableAccess(tableOptions, allPermissions);
                    }}
                  >
                    📖 Minden tábla olvasás
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    onClick={() => {
                      handleTableAccessChange(tableOptions);
                      const allPermissions = {};
                      tableOptions.forEach(table => {
                        allPermissions[table.id || table.name] = ['READ', 'WRITE', 'UPDATE'];
                      });
                      setTablePermissions(allPermissions);
                      updateUserTableAccess(tableOptions, allPermissions);
                    }}
                  >
                    ✏️ Minden tábla szerkesztés
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      handleTableAccessChange(tableOptions);
                      const allPermissions = {};
                      tableOptions.forEach(table => {
                        allPermissions[table.id || table.name] = ['READ', 'WRITE', 'UPDATE', 'DELETE'];
                      });
                      setTablePermissions(allPermissions);
                      updateUserTableAccess(tableOptions, allPermissions);
                    }}
                  >
                    🔓 Teljes hozzáférés
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
                    🗑️ Összes törlése
                  </Button>
                </Box>
              </Box>
              
              {/* Adatkezelési presetek */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 1 }}>
                  Adatkezelés
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const dataTableNames = ['alapadatok', 'user', 'tanugyi_adatok', 'oktato-egyeb-tev'];
                      const selectedDataTables = tableOptions.filter(t => 
                        dataTableNames.some(name => (t.name || '').toLowerCase() === name.toLowerCase())
                      );
                      handleTableAccessChange(selectedDataTables);
                      const permissions = {};
                      selectedDataTables.forEach(table => {
                        permissions[table.id || table.name] = ['READ', 'WRITE', 'UPDATE', 'DELETE'];
                      });
                      setTablePermissions(permissions);
                      updateUserTableAccess(selectedDataTables, permissions);
                    }}
                  >
                    📊 Alapadatok kezelő
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const importTableNames = ['tanugyi_adatok', 'tanulo_letszam'];
                      const selectedImportTables = tableOptions.filter(t => 
                        importTableNames.some(name => (t.name || '').toLowerCase() === name.toLowerCase())
                      );
                      handleTableAccessChange(selectedImportTables);
                      const permissions = {};
                      selectedImportTables.forEach(table => {
                        permissions[table.id || table.name] = ['READ', 'WRITE', 'UPDATE'];
                      });
                      setTablePermissions(permissions);
                      updateUserTableAccess(selectedImportTables, permissions);
                    }}
                  >
                    📥 Adatimport jogosultság
                  </Button>
                </Box>
              </Box>
              
              {/* Oktatási presetek */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 1 }}>
                  Oktatási adatok
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const educationTableNames = ['felvettek_szama', 'alkalmazottak_munkaugy', 'dobbanto', 'egy_oktatora_juto_tanulo'];
                      const selectedEducationTables = tableOptions.filter(t => 
                        educationTableNames.some(name => (t.name || '').toLowerCase() === name.toLowerCase())
                      );
                      handleTableAccessChange(selectedEducationTables);
                      const permissions = {};
                      selectedEducationTables.forEach(table => {
                        permissions[table.id || table.name] = ['READ', 'WRITE', 'UPDATE'];
                      });
                      setTablePermissions(permissions);
                      updateUserTableAccess(selectedEducationTables, permissions);
                    }}
                  >
                    🎓 Oktatási eredmények
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const studentTableNames = ['tanulo_letszam', 'sajatos_nevelesu_tanulok', 'hh_es_hhh_nevelesu_tanulok', 'szmsz', 'muhelyiskola', 'oktato-egyeb-tev', 'auth'];
                      const selectedStudentTables = tableOptions.filter(t => 
                        studentTableNames.some(name => (t.name || '').toLowerCase() === name.toLowerCase())
                      );
                      handleTableAccessChange(selectedStudentTables);
                      const permissions = {};
                      selectedStudentTables.forEach(table => {
                        permissions[table.id || table.name] = ['READ', 'WRITE', 'UPDATE'];
                      });
                      setTablePermissions(permissions);
                      updateUserTableAccess(selectedStudentTables, permissions);
                    }}
                  >
                    👥 Tanulói adatok
                  </Button>
                </Box>
              </Box>
              
              {/* Rendszer presetek */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 1 }}>
                  Rendszer
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const adminTableNames = ['user', 'alapadatok', 'log'];
                      const selectedAdminTables = tableOptions.filter(t => 
                        adminTableNames.some(name => (t.name || '').toLowerCase() === name.toLowerCase())
                      );
                      handleTableAccessChange(selectedAdminTables);
                      const permissions = {};
                      selectedAdminTables.forEach(table => {
                        permissions[table.id || table.name] = ['READ', 'WRITE', 'UPDATE', 'DELETE'];
                      });
                      setTablePermissions(permissions);
                      updateUserTableAccess(selectedAdminTables, permissions);
                    }}
                  >
                    ⚙️ Adminisztrátor
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      handleTableAccessChange(tableOptions);
                      const permissions = {};
                      tableOptions.forEach(table => {
                        permissions[table.id || table.name] = ['READ'];
                      });
                      setTablePermissions(permissions);
                      updateUserTableAccess(tableOptions, permissions);
                    }}
                  >
                    👁️ Csak megtekintés
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Autocomplete
            multiple
            disableCloseOnSelect
            id="table-access-edit"
            options={tableOptions}
            getOptionLabel={(option) => option.alias}
            value={selectedTables}
            onChange={(event, newValue) => handleTableAccessChange(newValue)}
            loading={tablesLoading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id || option.name}
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
                {selectedTables.map((table) => {
                  const tableId = table.id || table.name;
                  return (
                    <Card key={tableId} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {table.name}
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
                                      checked={(
                                        tablePermissions[tableId] || []
                                      ).includes(option.key)}
                                      onChange={(e) => {
                                        const currentPermissions =
                                          tablePermissions[tableId] || [];
                                        const newPermissions = e.target.checked
                                          ? [...currentPermissions, option.key]
                                          : currentPermissions.filter(
                                              (p) => p !== option.key
                                            );
                                        handleTablePermissionChange(
                                          tableId,
                                          newPermissions
                                        );
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
                                tablePermissions[tableId] || []
                              )}
                              {tablePermissions[tableId] &&
                                tablePermissions[tableId].length > 0 && (
                                  <span>
                                    {" "}
                                    (
                                    {formatAccessLevel(
                                      calculateAccessLevel(
                                        tablePermissions[tableId]
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
                  );
                })}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Mégse</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isChangingPassword}
          startIcon={isChangingPassword ? <CircularProgress size={20} /> : null}
        >
          {isChangingPassword ? "Mentés..." : "Mentés"}
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

export const DeleteUserDialog = ({ open, onClose, user, onDelete }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Felhasználó inaktíválása</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Biztos benne, hogy inaktíválni szeretné a következő felhasználót: <br />
        <strong>{user?.name}</strong>?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="outlined">
        Mégse
      </Button>
      <Button onClick={onDelete} color="error">
        Inaktíválás
      </Button>
    </DialogActions>
  </Dialog>
);
