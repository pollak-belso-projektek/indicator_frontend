import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Card,
  CardContent,
  Stack,
  Alert,
  Divider,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  TABLE_ACCESS_LEVELS,
  formatAccessLevel,
} from "../utils/tableAccessUtils";
import {
  useUpdateUserMutation,
  useChangeUserPasswordMutation,
} from "../store/api/apiSlice";
import {
  selectUser,
  selectUserRole,
  selectUserPermissions,
  selectUserTableAccess,
} from "../store/slices/authSlice";

function ProfileEdit() {
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);
  const permissions = useSelector(selectUserPermissions);
  const tableAccess = useSelector(selectUserTableAccess);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangeUserPasswordMutation();

  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    try {
      await updateUser({
        id: user.id,
        name,
        email,
      }).unwrap();
      setProfileMessage({
        type: "success",
        text: "Profil sikeresen frissítve!",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error?.data?.message || "Hiba történt a frissítés során.",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "A jelszavak nem egyeznek meg!",
      });
      return;
    }

    try {
      await changePassword({
        id: user.id,
        newPassword,
        newPasswordConfirm: confirmPassword,
      }).unwrap();
      setPasswordMessage({
        type: "success",
        text: "Jelszó sikeresen megváltoztatva!",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error?.data?.message || "Hiba történt a jelszóváltás során.",
      });
    }
  };

  // Helper to format permissions for display
  const getActivePermissions = () => {
    if (!permissions) return [];
    return Object.entries(permissions)
      .filter(([, value]) => value === true)
      .map(([key]) => key.replace("is", ""));
  };

  // Helper to resolve access level (local version since it's not exported from utils)
  const resolveAccessLevel = (permissionItem) => {
    if (!permissionItem) return 0;
    if (typeof permissionItem.access === "number") {
      return permissionItem.access;
    }
    if (permissionItem.permissions) {
      let level = 0;
      if (permissionItem.permissions.canRead) level |= TABLE_ACCESS_LEVELS.READ;
      if (permissionItem.permissions.canCreate)
        level |= TABLE_ACCESS_LEVELS.WRITE;
      if (permissionItem.permissions.canUpdate)
        level |= TABLE_ACCESS_LEVELS.UPDATE;
      if (permissionItem.permissions.canDelete)
        level |= TABLE_ACCESS_LEVELS.DELETE;
      return level;
    }
    return 0;
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1">
          Profil Szerkesztése
        </Typography>

        {/* Profile Information Card */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Személyes Adatok
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {profileMessage.text && (
              <Alert severity={profileMessage.type} sx={{ mb: 2 }}>
                {profileMessage.text}
              </Alert>
            )}

            <Box component="form" onSubmit={handleProfileUpdate}>
              <Stack spacing={3}>
                <TextField
                  label="Név"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <CircularProgress size={24} /> : "Mentés"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Roles and Permissions Card */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Jogosultságok és Szerepkörök
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Jelenlegi Szerepkör
                </Typography>
                <Chip
                  label={role || "Nincs szerepkör"}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Aktív Engedélyek
                </Typography>
                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {getActivePermissions().map((perm) => (
                    <Chip
                      key={perm}
                      label={perm}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {getActivePermissions().length === 0 && (
                    <Typography variant="body2" color="text.disabled">
                      Nincsenek speciális engedélyek
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Iskola
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {typeof user.school === "object" && user.school !== null
                    ? user.school.iskola_neve
                    : user.school || "Nincs iskola hozzárendelve"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Jelszó Módosítása
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {passwordMessage.text && (
              <Alert severity={passwordMessage.type} sx={{ mb: 2 }}>
                {passwordMessage.text}
              </Alert>
            )}

            <Box component="form" onSubmit={handlePasswordChange}>
              <Stack spacing={3}>
                <TextField
                  label="Új Jelszó"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Új Jelszó Megerősítése"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  disabled={!newPassword}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={isChangingPassword || !newPassword}
                  >
                    {isChangingPassword ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Jelszó Módosítása"
                    )}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Table Access Permissions Card */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tábla Jogosultságok
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {tableAccess && tableAccess.length > 0 ? (
              <Grid container spacing={2}>
                {tableAccess.map((access, index) => {
                  const level = resolveAccessLevel(access);
                  const permissions = formatAccessLevel(level);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            noWrap
                            title={access.tableName}
                          >
                            {access.tableName}
                          </Typography>
                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {permissions.map((perm) => (
                              <Chip
                                key={perm}
                                label={perm}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            ))}
                            {permissions.length === 0 && (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                Nincs hozzáférés
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                Nincsenek tábla jogosultságok.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

export default ProfileEdit;
