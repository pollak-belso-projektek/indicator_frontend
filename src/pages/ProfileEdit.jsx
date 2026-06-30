import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  TABLE_ACCESS_LEVELS,
  formatAccessLevel,
} from "../utils/tableAccessUtils";
import {
  useUpdateMeMutation,
  useChangeMePasswordMutation,
  useGenerate2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation,
} from "../store/api/apiSlice";
import {
  selectUser,
  selectUserRole,
  selectUserPermissions,
  selectUserTableAccess,
  selectMustChangePassword,
  clearMustChangePassword,
} from "../store/slices/authSlice";

function ProfileEdit() {
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);
  const permissions = useSelector(selectUserPermissions);
  const tableAccess = useSelector(selectUserTableAccess);
  const mustChangePassword = useSelector(selectMustChangePassword);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isForcedPasswordChange =
    searchParams.get("mustChangePassword") === "true" || mustChangePassword;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [changeMePassword, { isLoading: isChangingPassword }] =
    useChangeMePasswordMutation();

  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  const [generate2FA, { isLoading: isGenerating2FA }] = useGenerate2FAMutation();
  const [verify2FA, { isLoading: isVerifying2FA }] = useVerify2FAMutation();
  const [disable2FA, { isLoading: isDisabling2FA }] = useDisable2FAMutation();

  const [twoFactorMessage, setTwoFactorMessage] = useState({ type: "", text: "" });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [is2FASetupActive, setIs2FASetupActive] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setIsTwoFactorEnabled(user.isTwoFactorEnabled || false);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    try {
      await updateMe({
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
      await changeMePassword({
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

      // If forced password change, clear the flag and redirect to dashboard
      if (isForcedPasswordChange) {
        dispatch(clearMustChangePassword());
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500); // Brief delay to show success message
      }
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error?.data?.message || "Hiba történt a jelszóváltás során.",
      });
    }
  };

  const handleGenerate2FA = async () => {
    setTwoFactorMessage({ type: "", text: "" });
    try {
      const result = await generate2FA().unwrap();
      setQrCodeUrl(result.qrCodeUrl);
      setIs2FASetupActive(true);
    } catch (error) {
      setTwoFactorMessage({ type: "error", text: "Hiba történt a generálás során." });
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFactorMessage({ type: "", text: "" });
    try {
      await verify2FA({ token: twoFactorCode }).unwrap();
      setTwoFactorMessage({ type: "success", text: "Kétlépcsős azonosítás sikeresen bekapcsolva!" });
      setIsTwoFactorEnabled(true);
      setIs2FASetupActive(false);
      setQrCodeUrl("");
      setTwoFactorCode("");
    } catch (error) {
      setTwoFactorMessage({ type: "error", text: "Hibás kód, próbáld újra!" });
    }
  };

  const handleDisable2FA = async () => {
    setTwoFactorMessage({ type: "", text: "" });
    if (!window.confirm("Biztosan ki szeretnéd kapcsolni a kétlépcsős azonosítást?")) return;
    try {
      await disable2FA().unwrap();
      setTwoFactorMessage({ type: "success", text: "Kétlépcsős azonosítás kikapcsolva!" });
      setIsTwoFactorEnabled(false);
      setIs2FASetupActive(false);
    } catch (error) {
      setTwoFactorMessage({ type: "error", text: "Hiba történt a kikapcsolás során." });
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
          {isForcedPasswordChange ? "Jelszó Módosítása Kötelező" : "Profil Szerkesztése"}
        </Typography>

        {isForcedPasswordChange && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Az ideiglenes jelszóval történő belépés után kötelező új jelszót
            beállítani. Kérjük, adjon meg egy új, biztonságos jelszót a
            továbblépéshez.
          </Alert>
        )}

        {/* Profile Information Card - hidden in forced password change mode */}
        {!isForcedPasswordChange && (
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
        )}

        {/* Roles and Permissions Card - hidden in forced password change mode */}
        {!isForcedPasswordChange && (
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
        )}

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

        {/* 2FA Card */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kétlépcsős Azonosítás (2FA)
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {twoFactorMessage.text && (
              <Alert severity={twoFactorMessage.type} sx={{ mb: 2 }}>
                {twoFactorMessage.text}
              </Alert>
            )}

            {!isTwoFactorEnabled ? (
              !is2FASetupActive ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    A kétlépcsős azonosítás jelenleg <strong>kikapcsolva</strong>.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerate2FA}
                    disabled={isGenerating2FA}
                  >
                    {isGenerating2FA ? <CircularProgress size={24} /> : "Bekapcsolás (QR kód kérése)"}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    1. Olvasd be a QR kódot a Google Authenticator vagy hasonló alkalmazással.
                  </Typography>
                  <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" />}
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    2. Írd be a generált 6 számjegyű kódot az alkalmazásból a hitelesítéshez:
                  </Typography>
                  <Box component="form" onSubmit={handleVerify2FA}>
                    <Stack spacing={3} direction="row" alignItems="center">
                      <TextField
                        label="6 számjegyű kód"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        required
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        disabled={isVerifying2FA || !twoFactorCode}
                      >
                        {isVerifying2FA ? <CircularProgress size={24} /> : "Ellenőrzés és Bekapcsolás"}
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => {
                          setIs2FASetupActive(false);
                          setTwoFactorCode("");
                          setTwoFactorMessage({ type: "", text: "" });
                        }}
                      >
                        Mégse
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              )
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  A kétlépcsős azonosítás jelenleg <strong>aktív</strong> és védi a fiókodat.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDisable2FA}
                  disabled={isDisabling2FA}
                >
                  {isDisabling2FA ? <CircularProgress size={24} /> : "2FA Kikapcsolása"}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* 2FA Card */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kétlépcsős Azonosítás (2FA)
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {twoFactorMessage.text && (
              <Alert severity={twoFactorMessage.type} sx={{ mb: 2 }}>
                {twoFactorMessage.text}
              </Alert>
            )}

            {!isTwoFactorEnabled ? (
              !is2FASetupActive ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    A kétlépcsős azonosítás jelenleg <strong>kikapcsolva</strong>.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerate2FA}
                    disabled={isGenerating2FA}
                  >
                    {isGenerating2FA ? <CircularProgress size={24} /> : "Bekapcsolás (QR kód kérése)"}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    1. Olvasd be a QR kódot a Google Authenticator vagy hasonló alkalmazással.
                  </Typography>
                  <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                    {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" />}
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    2. Írd be a generált 6 számjegyű kódot az alkalmazásból a hitelesítéshez:
                  </Typography>
                  <Box component="form" onSubmit={handleVerify2FA}>
                    <Stack spacing={3} direction="row" alignItems="center">
                      <TextField
                        label="6 számjegyű kód"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        required
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        disabled={isVerifying2FA || !twoFactorCode}
                      >
                        {isVerifying2FA ? <CircularProgress size={24} /> : "Ellenőrzés és Bekapcsolás"}
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => {
                          setIs2FASetupActive(false);
                          setTwoFactorCode("");
                          setTwoFactorMessage({ type: "", text: "" });
                        }}
                      >
                        Mégse
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              )
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  A kétlépcsős azonosítás jelenleg <strong>aktív</strong> és védi a fiókodat.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDisable2FA}
                  disabled={isDisabling2FA}
                >
                  {isDisabling2FA ? <CircularProgress size={24} /> : "2FA Kikapcsolása"}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Table Access Permissions Card - hidden in forced password change mode */}
        {!isForcedPasswordChange && (
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
        )}
      </Stack>
    </Container>
  );
}

export default ProfileEdit;
