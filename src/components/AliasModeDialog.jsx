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
import { useGetFilteredUsersQuery } from "../store/api/apiSlice";
import { getUserTypeLabel } from "../utils/userHierarchy";

/**
 * Dialog for superadmins to select a user to impersonate
 */
const AliasModeDialog = ({ open, onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    data: users = [],
    isLoading,
    error,
  } = useGetFilteredUsersQuery(undefined, {
    skip: !open,
  });

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onSelectUser(selectedUser);
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
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.school?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon />
          <Typography variant="h6">Felhasználó kiválasztása alias módhoz</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Válassz ki egy felhasználót, hogy az oldalt az ő jogosultságaival lásd.
          Az alias mód során nem tudsz adatokat módosítani vagy törölni.
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
              filteredUsers.map((user) => (
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {user.name}
                        </Typography>
                        <Chip
                          label={getUserTypeLabel(user.userType)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <EmailIcon fontSize="small" />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                        {user.school && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <SchoolIcon fontSize="small" />
                            <Typography variant="body2">{user.school}</Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              ))
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
