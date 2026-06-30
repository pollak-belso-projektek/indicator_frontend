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
  Avatar,
  Paper,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import {
  Shield as ShieldIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  TableChart as TableChartIcon,
} from "@mui/icons-material";
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
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Container>
    );
  }

  const theme = useTheme();

  const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: "16px",
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    height: "100%",
    "&:hover": {
      boxShadow: "0 8px 30px 0 rgba(0,0,0,0.08)",
      transform: "translateY(-2px)",
    }
  }));

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", display: "flex" }}>
        <Icon size={20} />
      </Box>
      <Typography variant="h6" fontWeight="600">{title}</Typography>
    </Box>
  );

  return (
    <Box sx={{ pb: 8, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Premium Header */}
      <Box 
        sx={{ 
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          pt: { xs: 8, md: 10 },
          pb: { xs: 8, md: 12 },
          px: 2,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box sx={{ 
          position: "absolute", top: -50, right: -50, width: 300, height: 300, 
          borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" 
        }} />
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, position: "relative", zIndex: 1 }}>
            <Avatar 
              sx={{ 
                width: { xs: 80, sm: 100 }, 
                height: { xs: 80, sm: 100 }, 
                bgcolor: "white", 
                color: "primary.main",
                fontSize: { xs: "2rem", sm: "3rem" },
                fontWeight: "bold",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
              }}
            >
              {name ? name.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <Box color="white">
              <Typography variant="h4" fontWeight="700" gutterBottom>
                {isForcedPasswordChange ? "Kötelező Jelszócsere" : name || "Felhasználó"}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon fontSize="small" />
                {role || "Nincs szerepkör"}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, position: "relative", zIndex: 2 }}>
        {isForcedPasswordChange && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 3, boxShadow: 1 }}>
            Az ideiglenes jelszóval történő belépés után kötelező új jelszót
            beállítani. Kérjük, adjon meg egy új, biztonságos jelszót a
            továbblépéshez.
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column: Personal Info & Permissions */}
          {!isForcedPasswordChange && (
            <Grid item xs={12} md={5}>
              <Stack spacing={4}>
                {/* Personal Info */}
                <StyledCard>
                  <CardContent sx={{ p: 3 }}>
                    <SectionHeader icon={PersonIcon} title="Személyes Adatok" />
                    
                    {profileMessage.text && (
                      <Alert severity={profileMessage.type} sx={{ mb: 3, borderRadius: 2 }}>
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
                          variant="outlined"
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField
                          label="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isUpdating}
                          fullWidth
                          sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
                        >
                          {isUpdating ? <CircularProgress size={24} color="inherit" /> : "Változtatások mentése"}
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </StyledCard>

                {/* Roles & Permissions */}
                <StyledCard>
                  <CardContent sx={{ p: 3 }}>
                    <SectionHeader icon={ShieldIcon} title="Jogosultságok" />
                    
                    <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                        Hozzárendelt Iskola
                      </Typography>
                      <Typography variant="body1" fontWeight="500" sx={{ mt: 0.5 }}>
                        {typeof user.school === "object" && user.school !== null
                          ? user.school.iskola_neve
                          : user.school || "Nincs iskola hozzárendelve"}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                      Aktív Engedélyek
                    </Typography>
                    <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {getActivePermissions().map((perm) => (
                        <Chip
                          key={perm}
                          label={perm}
                          size="small"
                          color="primary"
                          variant="soft"
                          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), fontWeight: 500 }}
                        />
                      ))}
                      {getActivePermissions().length === 0 && (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
                          Nincsenek speciális engedélyek
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Stack>
            </Grid>
          )}

          {/* Right Column: Security (Password & 2FA) */}
          <Grid item xs={12} md={isForcedPasswordChange ? 12 : 7}>
            <Stack spacing={4}>
              
              {/* Password Change */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionHeader icon={VpnKeyIcon} title="Jelszó Módosítása" />
                  
                  {passwordMessage.text && (
                    <Alert severity={passwordMessage.type} sx={{ mb: 3, borderRadius: 2 }}>
                      {passwordMessage.text}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handlePasswordChange}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Új Jelszó"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Új Jelszó Megerősítése"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          fullWidth
                          required
                          disabled={!newPassword}
                          variant="outlined"
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="secondary"
                          disabled={isChangingPassword || !newPassword}
                          sx={{ borderRadius: 2, py: 1.5, px: 4, fontWeight: 600 }}
                        >
                          {isChangingPassword ? <CircularProgress size={24} color="inherit" /> : "Jelszó Frissítése"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </StyledCard>

              {/* 2FA */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionHeader icon={SecurityIcon} title="Kétlépcsős Azonosítás (2FA)" />
                  
                  {twoFactorMessage.text && (
                    <Alert severity={twoFactorMessage.type} sx={{ mb: 3, borderRadius: 2 }}>
                      {twoFactorMessage.text}
                    </Alert>
                  )}

                  {!isTwoFactorEnabled ? (
                    !is2FASetupActive ? (
                      <Box sx={{ bgcolor: "warning.50", p: 3, borderRadius: 2, border: "1px solid", borderColor: "warning.100" }}>
                        <Typography variant="body1" sx={{ mb: 2, color: "warning.900" }}>
                          A fiókod jelenleg kevésbé védett. Javasoljuk a kétlépcsős azonosítás (2FA) bekapcsolását!
                        </Typography>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={handleGenerate2FA}
                          disabled={isGenerating2FA}
                          sx={{ borderRadius: 2, fontWeight: 600, boxShadow: "none" }}
                        >
                          {isGenerating2FA ? <CircularProgress size={24} color="inherit" /> : "Bekapcsolás Indítása"}
                        </Button>
                      </Box>
                    ) : (
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "grey.50" }}>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                          1. Olvasd be a QR kódot
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Használj egy hitelesítő alkalmazást (pl. Google Authenticator) a kód beolvasásához.
                        </Typography>
                        
                        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
                          {qrCodeUrl && (
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                              <img src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                            </Box>
                          )}
                        </Box>
                        
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                          2. Erősítsd meg a kóddal
                        </Typography>
                        <Box component="form" onSubmit={handleVerify2FA}>
                          <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }}>
                            <TextField
                              label="6 számjegyű kód"
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value)}
                              required
                              fullWidth
                              variant="outlined"
                              InputProps={{ sx: { borderRadius: 2 } }}
                            />
                            <Button
                              type="submit"
                              variant="contained"
                              color="success"
                              disabled={isVerifying2FA || !twoFactorCode}
                              sx={{ borderRadius: 2, py: 1.8, minWidth: 200, fontWeight: 600 }}
                            >
                              {isVerifying2FA ? <CircularProgress size={24} color="inherit" /> : "Hitelesítés"}
                            </Button>
                          </Stack>
                          <Button
                            variant="text"
                            onClick={() => {
                              setIs2FASetupActive(false);
                              setTwoFactorCode("");
                              setTwoFactorMessage({ type: "", text: "" });
                            }}
                            sx={{ mt: 2, fontWeight: 600 }}
                          >
                            Mégse
                          </Button>
                        </Box>
                      </Paper>
                    )
                  ) : (
                    <Box sx={{ bgcolor: "success.50", p: 3, borderRadius: 2, border: "1px solid", borderColor: "success.200", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600" color="success.900" gutterBottom>
                          A 2FA aktív
                        </Typography>
                        <Typography variant="body2" color="success.800">
                          Fiókod extra védelemmel van ellátva.
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDisable2FA}
                        disabled={isDisabling2FA}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        {isDisabling2FA ? <CircularProgress size={24} color="inherit" /> : "Kikapcsolás"}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Stack>
          </Grid>
          
          {/* Table Access Permissions (Full Width at Bottom) */}
          {!isForcedPasswordChange && tableAccess && tableAccess.length > 0 && (
            <Grid item xs={12}>
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionHeader icon={TableChartIcon} title="Tábla Hozzáférések" />
                  <Grid container spacing={2}>
                    {tableAccess.map((access, index) => {
                      const level = resolveAccessLevel(access);
                      const permissions = formatAccessLevel(level);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200", height: "100%" }}>
                            <Typography variant="subtitle2" fontWeight="700" noWrap title={access.tableName} gutterBottom>
                              {access.tableName}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {permissions.map((perm) => (
                                <Chip
                                  key={perm}
                                  label={perm}
                                  size="small"
                                  sx={{ 
                                    bgcolor: perm.includes("Olvasás") ? alpha(theme.palette.info.main, 0.1) : 
                                            perm.includes("Írás") ? alpha(theme.palette.success.main, 0.1) :
                                            perm.includes("Módosítás") ? alpha(theme.palette.warning.main, 0.1) :
                                            alpha(theme.palette.error.main, 0.1),
                                    color: perm.includes("Olvasás") ? "info.dark" : 
                                          perm.includes("Írás") ? "success.dark" :
                                          perm.includes("Módosítás") ? "warning.dark" :
                                          "error.dark",
                                    fontWeight: 600,
                                    fontSize: "0.7rem"
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </StyledCard>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default ProfileEdit;
