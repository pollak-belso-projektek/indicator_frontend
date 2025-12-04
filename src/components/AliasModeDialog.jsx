import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useGetUsersQuery } from "../store/api/apiSlice";
import {
  getUserTypeLabel,
  getPermissionsFromLevel,
  getUserTypeFromLevel,
} from "../utils/userHierarchy";

/**
 * Dialog for superadmins to select a user to impersonate
 * Uses full user data from getUsers endpoint to include permissions and tableAccess
 */
const AliasModeDialog = ({ open, onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Use getUsers instead of getFilteredUsers to get full user data including tableAccess
  const {
    data: users = [],
    isLoading,
    error,
  } = useGetUsersQuery(undefined, {
    skip: !open,
  });

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      // Build complete user object with permissions for alias mode
      const userType = getUserTypeFromLevel(selectedUser.permissions);

      // Use permissionsDetails from API if available, otherwise generate from level
      const permissionsObject =
        selectedUser.permissionsDetails ||
        getPermissionsFromLevel(selectedUser.permissions);

      const completeAliasUser = {
        ...selectedUser,
        // Ensure permissions object is properly set (either from API or generated)
        permissions: permissionsObject,
        // Include tableAccess from the user data
        tableAccess: selectedUser.tableAccess || [],
        // Set role based on permissions
        role: permissionsObject.isSuperadmin
          ? "Superadmin"
          : permissionsObject.isAdmin
          ? "Admin"
          : permissionsObject.isHSZC
          ? "HSZC"
          : permissionsObject.isPrivileged
          ? "Privileged"
          : "Standard",
        // Keep school info (alapadatokId for school ID reference)
        school: selectedUser.alapadatokId || selectedUser.school,
        // Store user type for reference
        userType: userType,
      };

      console.log("Alias mode - Complete user data:", completeAliasUser);
      console.log("Alias mode - TableAccess:", completeAliasUser.tableAccess);
      console.log("Alias mode - Permissions:", completeAliasUser.permissions);

      onSelectUser(completeAliasUser);
      setSelectedUser(null);
      setSearchTerm("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSearchTerm("");
    onClose();
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const schoolName = user.alapadatok?.iskola_neve || user.school || "";
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      schoolName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon />
          <Typography variant="h6">
            Felhasználó kiválasztása alias módhoz
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Válassz ki egy felhasználót, hogy az oldalt az ő jogosultságaival
          lásd. Az alias mód során nem tudsz adatokat módosítani vagy törölni.
        </Alert>

        <TextField
          fullWidth
          label="Felhasználó keresése"
          placeholder="Név, email vagy iskola szerint..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          autoFocus
        />

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            Hiba történt a felhasználók betöltése során
          </Alert>
        ) : (
          <List
            sx={{
              maxHeight: 400,
              overflow: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            {filteredUsers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="Nincs találat"
                  secondary="Próbálj meg más keresési kifejezést használni"
                />
              </ListItem>
            ) : (
              filteredUsers.map((user) => {
                // Get userType from permissions level for display
                const userType = getUserTypeFromLevel(user.permissions);
                // Get school name from alapadatok or fallback
                const schoolName =
                  user.alapadatok?.iskola_neve || user.school || null;

                return (
                  <ListItemButton
                    key={user.id}
                    selected={selectedUser?.id === user.id}
                    onClick={() => handleSelectUser(user)}
                  >
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {user.name}
                          </Typography>
                          <Chip
                            label={getUserTypeLabel(userType)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <EmailIcon fontSize="small" />
                            <Typography variant="body2">
                              {user.email}
                            </Typography>
                          </Box>
                          {schoolName && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <SchoolIcon fontSize="small" />
                              <Typography variant="body2">
                                {schoolName}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Mégse</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedUser}
        >
          Alias mód indítása
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AliasModeDialog;
