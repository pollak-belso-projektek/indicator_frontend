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
  MenuItem,
  Stack,
} from "@mui/material";

import { Close as CloseIcon, CheckCircle as CheckCircleIcon, AttachFile as AttachFileIcon } from "@mui/icons-material";
import { useSubmitBugReportMutation } from "../store/api/apiSlice";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Alacsony – Kisebb kellemetlenség" },
  { value: "medium", label: "Közepes – Akadályozza a munkát" },
  { value: "high", label: "Magas – Kritikus, azonnali beavatkozás szükséges" },
];

export default function BugReportDialog({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [submitBugReport, { isLoading }] = useSubmitBugReportMutation();

  const handleClose = () => {
    // Only reset after close animation
    setTimeout(() => {
      setTitle("");
      setDescription("");
      setSeverity("medium");
      setStepsToReproduce("");
      setAttachment(null);
      setSubmitted(false);
      setErrorMessage("");
    }, 200);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("A hiba megnevezése kötelező!");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("A hiba leírása kötelező!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("severity", severity);
      if (stepsToReproduce.trim()) {
        formData.append("stepsToReproduce", stepsToReproduce.trim());
      }
      formData.append("pageUrl", window.location.href);
      formData.append("userAgent", navigator.userAgent);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      await submitBugReport(formData).unwrap();
      setSubmitted(true);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.data?.error ||
        "Hiba történt a bejelentés küldése során. Kérjük, próbálja újra később.";
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
          Hibabejelentés
        </Typography>
        <IconButton onClick={handleClose} size="small" aria-label="Bezárás">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {submitted ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Hibabejelentés Elküldve!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              A hibabejelentést sikeresen rögzítettük. Az adminisztrátorok
              emailben értesítést kaptak és hamarosan foglalkoznak a problémával.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontStyle: "italic" }}
            >
              Köszönjük, hogy segít a rendszer fejlesztésében!
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Kérjük, minél részletesebben írja le a tapasztalt hibát. A
              bejelentés automatikusan továbbításra kerül az
              adminisztrátoroknak.
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} id="bug-report-form">
              <Stack spacing={3}>
                <TextField
                  label="Hiba megnevezése"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Rövid, összefoglaló cím"
                  required
                  fullWidth
                  variant="outlined"
                  autoFocus
                  disabled={isLoading}
                />

                <TextField
                  select
                  label="Súlyosság"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  fullWidth
                  variant="outlined"
                  disabled={isLoading}
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Hiba részletes leírása"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mit tapasztalt? Mi történt a hiba jelentkezésekor?"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  disabled={isLoading}
                />

                <TextField
                  label="Reprodukálás lépései (opcionális)"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Kattintottam ide...&#10;2. Megnyitottam azt...&#10;3. Megjelent a hiba..."
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  disabled={isLoading}
                />

                <Box>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    disabled={isLoading}
                  >
                    Kép / Videó csatolása
                    <input
                      type="file"
                      hidden
                      accept="image/*, video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setAttachment(e.target.files[0]);
                        }
                      }}
                    />
                  </Button>
                  {attachment && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                        Kiválasztva: {attachment.name}
                      </Typography>
                      <IconButton size="small" onClick={() => setAttachment(null)} disabled={isLoading} color="error">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Stack>
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
              form="bug-report-form"
              variant="contained"
              color="error"
              disabled={isLoading || !title.trim() || !description.trim()}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Küldés...
                </>
              ) : (
                "Hibabejelentés Küldése"
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
