import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLoginMutation } from "../store/api/apiSlice";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from "../store/slices/authSlice";
import { parseApiError } from "../utils/tableAccessUtils";
import { Image } from "@chakra-ui/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset loading state on component mount to prevent persistent spinning
  useEffect(() => {
    if (loading) {
      dispatch(loginFailure(""));
    }
  }, []); // Run once on mount

  // Add timeout for loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        dispatch(loginFailure("Request timed out. Please try again."));
      }, 10000); // 10 second timeout

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

  // Remove the old selectErrorMessage function since we're using parseApiError now

  const [loginMutation] = useLoginMutation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      dispatch(loginFailure("Email and password are required"));
      return;
    }

    dispatch(loginStart());
    try {
      const result = await loginMutation({
        email,
        password,
      }).unwrap();

      dispatch(loginSuccess(result));
    } catch (err) {
      dispatch(
        loginFailure(err?.data?.message || err?.message || "Login failed")
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
              src="../public/hszc_logo.png"
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
                  ) : (
                    "Bejelentkezés"
                  )}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
