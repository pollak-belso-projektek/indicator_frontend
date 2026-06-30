import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
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
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLoginMutation } from "../store/api/apiSlice";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectMustChangePassword,
} from "../store/slices/authSlice";
import { parseApiError } from "../utils/tableAccessUtils";
import { Image } from "@chakra-ui/react";
import ForgotPasswordDialog from "../components/ForgotPasswordDialog";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const mustChangePassword = useSelector(selectMustChangePassword);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    dispatch(clearError());
    setErrorMessage("");
  }, [dispatch, setErrorMessage]);

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        dispatch(loginFailure("Bejelentkezés időtúllépés miatt sikertelen"));
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [loading, dispatch]);

  useEffect(() => {
    if (error) {
      console.error("Login error:", error);
      const message = parseApiError(error);
      setErrorMessage(message);
    }
  }, [error]);

  const [loginMutation] = useLoginMutation();

  if (isAuthenticated) {
    // If must change password, redirect to profile with flag
    if (mustChangePassword) {
      return <Navigate to="/profile?mustChangePassword=true" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      dispatch(loginFailure("Email és jelszó megadása kötelező"));
      return;
    }

    if (requires2FA && !twoFactorCode) {
      dispatch(loginFailure("Kétlépcsős kód megadása kötelező"));
      return;
    }

    dispatch(loginStart());
    try {
      const payload = { email, password };
      if (requires2FA) {
        payload.twoFactorCode = twoFactorCode;
      }

      const result = await loginMutation(payload).unwrap();

      if (result.requires2FA) {
        setRequires2FA(true);
        dispatch(clearError()); // Clear loading and error state without failing
        dispatch(loginFailure(null)); // Specifically setting to null to stop loading indicator
        return;
      }

      dispatch(loginSuccess(result));

      // If must change password, navigate to profile
      if (result.mustChangePassword) {
        navigate("/profile?mustChangePassword=true", { replace: true });
      }
    } catch (err) {
      const errorMsg = parseApiError(err);
      dispatch(
        loginFailure(
          errorMsg || "Hiba történt a bejelentkezés során"
        )
      );
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent>
          <Stack spacing={3}>
            <Image
              src="https://cms.hodmezovasarhelyi.szc.edir.hu/uploads/HSZC_logo_color_tomb_k_4b19d45dc7.png"
              alt="Logo"
              objectFit="cover"
              mx="auto"
            />
            <Typography variant="h5" component="h1" textAlign="center">
              Indikátor Rendszer Bejelentkezés
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {errorMessage}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <Stack spacing={3}>
                {!requires2FA ? (
                  <>
                    <TextField
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Add meg az email címed"
                      required
                      fullWidth
                      variant="outlined"
                    />

                    <TextField
                      type={showPassword ? "text" : "password"}
                      label="Jelszó"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Add meg a jelszavad"
                      required
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="body1" textAlign="center">
                      Kétlépcsős azonosítás (2FA) szükséges a bejelentkezéshez.
                    </Typography>
                    <TextField
                      type="text"
                      label="6 számjegyű kód"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="000000"
                      required
                      fullWidth
                      variant="outlined"
                      autoFocus
                    />
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Bejelentkezés...
                    </>
                  ) : requires2FA ? (
                    "Kód ellenőrzése"
                  ) : (
                    "Bejelentkezés"
                  )}
                </Button>
                {requires2FA && (
                  <Button
                    variant="text"
                    fullWidth
                    disabled={loading}
                    onClick={() => {
                      setRequires2FA(false);
                      setTwoFactorCode("");
                    }}
                  >
                    Vissza
                  </Button>
                )}

                <Box sx={{ textAlign: "center" }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => setForgotPasswordOpen(true)}
                    sx={{ cursor: "pointer" }}
                  >
                    Elfelejtett jelszó?
                  </Link>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Container>
  );
}

