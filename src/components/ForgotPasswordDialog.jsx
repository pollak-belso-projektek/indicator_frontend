import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, Email as EmailIcon } from "@mui/icons-material";
import { useForgotPasswordMutation } from "../store/api/apiSlice";

export default function ForgotPasswordDialog({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleClose = () => {
    setEmail("");
    setSubmitted(false);
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Az email cím megadása kötelező!");
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setSubmitted(true);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.data?.error ||
        "Hiba történt a kérés során. Kérjük, próbálja újra később.";
      setErrorMessage(message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          Elfelejtett Jelszó
        </Typography>
        <IconButton onClick={handleClose} size="small" aria-label="Bezárás">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {submitted ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <EmailIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Email Elküldve!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Amennyiben az email cím regisztrálva van a rendszerben, egy
              ideiglenes jelszót küldtünk a megadott címre. Kérjük, ellenőrizze
              a postafiókját (és a spam mappát is).
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontStyle: "italic" }}
            >
              Az ideiglenes jelszóval történő belépés után kötelező lesz új
              jelszót beállítani.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Adja meg a regisztrált email címét, és küldünk egy ideiglenes
              jelszót, amellyel egyszer beléphet a rendszerbe.
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} id="forgot-password-form">
              <TextField
                type="email"
                label="Email cím"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelda@email.hu"
                required
                fullWidth
                variant="outlined"
                autoFocus
                disabled={isLoading}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {submitted ? (
          <Button onClick={handleClose} variant="contained">
            Bezárás
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={isLoading}>
              Mégse
            </Button>
            <Button
              type="submit"
              form="forgot-password-form"
              variant="contained"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Küldés...
                </>
              ) : (
                "Ideiglenes Jelszó Kérése"
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
