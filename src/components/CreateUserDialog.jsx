import React, { useState } from "react";
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
} from "@mui/material";
import { getHierarchyLevel, getUserTypeLabel } from "../utils/userHierarchy";
import { useGetTableListQuery } from "../store/api/apiSlice";
import {
  TABLE_ACCESS_LEVELS,
  getAvailableTables,
  getPermissionOptions,
  calculateAccessLevel,
  formatAccessLevel,
} from "../utils/tableAccessUtils";

const CreateUserDialog = ({ open, onClose, onSave, userPermissions }) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    permissions: 1, // Default to iskolai_general (level 1)
    tableAccess: [], // Default empty table access
    alapadatok_id: null, // Will be set based on user context
    active: true,
  });
  const [userType, setUserType] = useState("iskolai_general");
  const [selectedTables, setSelectedTables] = useState([]);
  const [tablePermissions, setTablePermissions] = useState({}); // Store permissions for each table
  const availableUserTypes = userPermissions?.getAvailableUserTypes() || [];

  // Fetch available tables
  const { data: tableList = [], isLoading: tablesLoading } =
    useGetTableListQuery();
  const permissionOptions = getPermissionOptions();

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

    // Initialize permissions for new tables with READ access by default
    const newTablePermissions = { ...tablePermissions };

    // Add default permissions for newly selected tables
    tables.forEach((table) => {
      if (!newTablePermissions[table.id]) {
        newTablePermissions[table.id] = ["READ"];
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

  const handleSave = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Kérjük töltse ki az összes kötelező mezőt!");
      return;
    }

    if (!userPermissions.canCreateUser(userType)) {
      alert("Nincs jogosultsága ilyen típusú felhasználó létrehozásához!");
      return;
    }

    onSave(newUser);
    handleClose();
  };
  const handleClose = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      permissions: 1, // Reset to iskolai_general
      tableAccess: [],
      alapadatok_id: null,
      active: true,
    });
    setUserType("iskolai_general");
    setSelectedTables([]);
    setTablePermissions({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Új felhasználó létrehozása</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
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
          <TextField
            fullWidth
            label="Jelszó"
            type="password"
            value={newUser.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            margin="normal"
            required
          />
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
                checked={newUser.active}
                onChange={(e) => handleInputChange("active", e.target.checked)}
              />
            }
            disabled
            label="Aktív felhasználó"
            sx={{ mt: 2 }}
          />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Tábla hozzáférések
          </Typography>
          <Autocomplete
            multiple
            id="table-access-select"
            options={getAvailableTables(tableList)}
            getOptionLabel={(option) => option.name}
            value={selectedTables}
            onChange={(event, newValue) => handleTableAccessChange(newValue)}
            loading={tablesLoading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.name}
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
                helperText="Válassza ki azokat a táblákat, amelyekhez a felhasználó hozzáférhet"
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
                                      tablePermissions[table.id] || []
                                    ).includes(option.key)}
                                    onChange={(e) => {
                                      const currentPermissions =
                                        tablePermissions[table.id] || [];
                                      const newPermissions = e.target.checked
                                        ? [...currentPermissions, option.key]
                                        : currentPermissions.filter(
                                            (p) => p !== option.key
                                          );
                                      handleTablePermissionChange(
                                        table.id,
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
                              tablePermissions[table.id] || []
                            )}
                            {tablePermissions[table.id] &&
                              tablePermissions[table.id].length > 0 && (
                                <span>
                                  {" "}
                                  (
                                  {formatAccessLevel(
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
      <DialogActions>
        <Button onClick={handleClose}>Mégse</Button>
        <Button onClick={handleSave} variant="contained">
          Létrehozás
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
