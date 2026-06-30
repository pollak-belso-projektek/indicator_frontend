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
  alpha,
  styled,
} from "@mui/material";
import { Close as CloseIcon, Email as EmailIcon, LockReset as LockResetIcon } from "@mui/icons-material";
import { useForgotPasswordMutation } from "../store/api/apiSlice";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "24px",
    boxShadow: `0 12px 48px 0 ${alpha(theme.palette.common.black, 0.2)}`,
    overflow: "hidden",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: alpha(theme.palette.background.default, 0.5),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
  },
}));

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
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ position: "relative", pt: 4, px: 3, pb: 1 }}>
        <IconButton 
          onClick={handleClose} 
          sx={{ position: "absolute", top: 16, right: 16, color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: "50%", 
            bgcolor: "primary.50", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "primary.main"
          }}>
            <LockResetIcon fontSize="large" />
          </Box>
        </Box>
        
        <DialogTitle
          sx={{
            textAlign: "center",
            p: 0,
            mb: 1,
            fontWeight: 700,
            fontSize: "1.5rem"
          }}
        >
          Elfelejtett Jelszó
        </DialogTitle>
      </Box>

      <DialogContent sx={{ px: { xs: 3, sm: 5 }, pb: 4 }}>
        {submitted ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <EmailIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="600">
              Email Elküldve!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Amennyiben az email cím regisztrálva van a rendszerben, egy
              ideiglenes jelszót küldtünk a megadott címre. Kérjük, ellenőrizze
              a postafiókját (és a spam mappát is).
            </Typography>
            <Box sx={{ bgcolor: "warning.50", p: 2, borderRadius: 2, border: "1px solid", borderColor: "warning.100" }}>
              <Typography variant="body2" color="warning.900" fontWeight="500">
                Az ideiglenes jelszóval történő belépés után kötelező lesz új
                jelszót beállítani.
              </Typography>
            </Box>
            <Button onClick={handleClose} variant="contained" size="large" fullWidth sx={{ mt: 4, borderRadius: 3, py: 1.5, fontWeight: 600 }}>
              Bezárás
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
              Adja meg a regisztrált email címét, és küldünk egy ideiglenes
              jelszót, amellyel egyszer beléphet a rendszerbe.
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} id="forgot-password-form">
              <StyledTextField
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
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading || !email}
                sx={{ 
                  mt: 3, 
                  borderRadius: 3, 
                  py: 1.5, 
                  fontWeight: 600,
                  boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(0,118,255,0.23)",
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Küldés...
                  </>
                ) : (
                  "Ideiglenes Jelszó Kérése"
                )}
              </Button>
              <Button 
                onClick={handleClose} 
                disabled={isLoading}
                fullWidth
                sx={{ mt: 1, borderRadius: 3, py: 1.5, fontWeight: 600, color: "text.secondary" }}
              >
                Mégse, vissza a belépéshez
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </StyledDialog>
  );
}
