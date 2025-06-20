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
} from "@mui/material";
import { getHierarchyLevel, getUserTypeLabel } from "../utils/userHierarchy";

const CreateUserDialog = ({ open, onClose, onSave, userPermissions }) => {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    permissions: 1, // Default to iskolai_general (level 1)
    active: true,
  });

  const [userType, setUserType] = useState("iskolai_general");
  const availableUserTypes = userPermissions?.getAvailableUserTypes() || [];

  const handleUserTypeChange = (type) => {
    setUserType(type);
    const permissions = getHierarchyLevel(type);

    setNewUser((prev) => ({
      ...prev,
      permissions: permissions,
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
      active: true,
    });
    setUserType("iskolai_general");
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
              <Typography variant="body2">
                • Hierarchia szint: {newUser.permissions}
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
            label="Aktív felhasználó"
            sx={{ mt: 2 }}
          />
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
