import { useState } from "react";
import { useSelector } from "react-redux";
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
  Paper,
  Chip,
  Collapse
} from "@mui/material";

import { 
  Close as CloseIcon, 
  CheckCircle as CheckCircleIcon, 
  AttachFile as AttachFileIcon, 
  Assignment as AssignmentIcon,
  ErrorOutline as ErrorOutlineIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from "@mui/icons-material";
import { useSubmitBugReportMutation, useGetReportedBugsQuery, useUpdateBugStatusMutation } from "../store/api/apiSlice";
import { selectUserPermissions, selectAccessToken } from "../store/slices/authSlice";
import config from "../config";

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
  const { data: reportedBugs, isLoading: isBugsLoading } = useGetReportedBugsQuery(undefined, { skip: !open });
  const [updateBugStatus, { isLoading: isUpdatingStatus }] = useUpdateBugStatusMutation();
  const [expandedBugId, setExpandedBugId] = useState(null);

  const newBugs = [];
  const inProgressBugs = [];
  const resolvedBugs = [];

  if (reportedBugs) {
    reportedBugs.forEach(bug => {
      const isResolved = bug.labels && bug.labels.some(l => l.name === 'Kész');
      const isInProgress = bug.labels && bug.labels.some(l => l.name === 'Folyamatban');
      
      if (isResolved) resolvedBugs.push(bug);
      else if (isInProgress) inProgressBugs.push(bug);
      else newBugs.push(bug);
    });
  }
  
  const userPermissions = useSelector(selectUserPermissions);
  const accessToken = useSelector(selectAccessToken);
  const isDeveloper = userPermissions?.isSuperadmin;

  const renderFormattedText = (text) => {
    if (!text) return 'Nincs részletes leírás.';
    
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <Typography key={i} variant="subtitle2" sx={{ mt: 1.5, mb: 0.5, fontWeight: 'bold', color: 'text.primary' }}>{line.substring(4)}</Typography>;
      }
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <Typography key={i} variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', minHeight: '1.2em', wordBreak: 'break-word' }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <Box component="span" key={j} sx={{ fontWeight: 'bold', color: 'text.primary' }}>{part.slice(2, -2)}</Box>;
            }
            return <span key={j}>{part}</span>;
          })}
        </Typography>
      );
    });
  };

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
      setExpandedBugId(null);
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

  const renderBugCard = (bug) => {
    const isResolved = bug.labels && bug.labels.some(l => l.name === 'Kész');
    const isInProgress = bug.labels && bug.labels.some(l => l.name === 'Folyamatban');

    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        key={bug.id} 
        sx={{ 
          borderRadius: 2, 
          transition: '0.2s',
          overflow: 'hidden',
          '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } 
        }}
      >
        <Box 
          onClick={() => setExpandedBugId(expandedBugId === bug.id ? null : bug.id)}
          sx={{ 
            p: 2, 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: expandedBugId === bug.id ? 'primary.50' : 'transparent',
            '&:hover': { bgcolor: 'primary.50' }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, lineHeight: 1.4, pr: 2 }}>
              {bug.name}
            </Typography>
            {expandedBugId === bug.id ? <ExpandLessIcon fontSize="small" color="action" /> : <ExpandMoreIcon fontSize="small" color="action" />}
          </Box>
          
          {bug.labels && bug.labels.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {bug.labels.map(l => (
                <Chip 
                  key={l.id} 
                  label={l.name || 'Címke'} 
                  size="small" 
                  variant={l.color ? "filled" : "outlined"}
                  sx={{ 
                    fontSize: '0.7rem', 
                    height: 22, 
                    fontWeight: 600,
                    bgcolor: l.color === 'sky' ? '#00c2e0' : (l.color || 'transparent'),
                    color: l.color ? '#fff' : 'text.primary',
                    borderColor: l.color === 'sky' ? '#00c2e0' : (l.color || 'divider')
                  }} 
                />
              ))}
            </Stack>
          )}
        </Box>

        <Collapse in={expandedBugId === bug.id}>
          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 2 }}>
              {renderFormattedText(bug.desc)}
            </Box>

            {bug.attachments && bug.attachments.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1, color: 'text.secondary' }}>
                  Csatolmányok ({bug.attachments.length}):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {bug.attachments.map(att => (
                    <Box key={att.id}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        href={att.url} 
                        target="_blank" 
                        startIcon={<AttachFileIcon />} 
                        sx={{ fontSize: '0.7rem', py: 0.5 }}
                      >
                        {att.name}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {isDeveloper && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                {!isInProgress && !isResolved && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateBugStatus({ id: bug.id, status: 'Folyamatban' });
                    }}
                    disabled={isUpdatingStatus}
                    sx={{ boxShadow: 'none' }}
                  >
                    Folyamatba vétel
                  </Button>
                )}
                {!isResolved && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateBugStatus({ id: bug.id, status: 'Kész' });
                    }}
                    disabled={isUpdatingStatus}
                    sx={{ boxShadow: 'none' }}
                  >
                    Készre állítás
                  </Button>
                )}
                {isResolved && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateBugStatus({ id: bug.id, status: 'Folyamatban' });
                    }}
                    disabled={isUpdatingStatus}
                  >
                    Újranyitás (Folyamatban)
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '70vh' }}>
        
        {/* LEFT PANEL - PREVIOUS BUGS */}
        <Box sx={{ 
          width: { xs: '100%', md: '35%' }, 
          bgcolor: 'grey.50', 
          borderRight: { xs: 0, md: 1 }, 
          borderBottom: { xs: 1, md: 0 },
          borderColor: 'divider', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold' }}>
              <AssignmentIcon color="primary" /> Korábbi bejelentések
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Kérjük ellenőrizze, szerepel-e már a hiba a listán, hogy elkerüljük a duplikációkat!
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            {isBugsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : reportedBugs && reportedBugs.length > 0 ? (
              <Box>
                {newBugs.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Új bejelentések ({newBugs.length})</Typography>
                    <Stack spacing={2}>
                      {newBugs.map(renderBugCard)}
                    </Stack>
                  </Box>
                )}
                
                {inProgressBugs.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Folyamatban lévő ({inProgressBugs.length})</Typography>
                    <Stack spacing={2}>
                      {inProgressBugs.map(renderBugCard)}
                    </Stack>
                  </Box>
                )}

                {resolvedBugs.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'success.main', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Kész / Megoldott ({resolvedBugs.length})</Typography>
                    <Stack spacing={2}>
                      {resolvedBugs.map(renderBugCard)}
                    </Stack>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ErrorOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Nincsenek korábbi bejelentések.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* RIGHT PANEL - FORM */}
        <Box sx={{ width: { xs: '100%', md: '65%' }, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ px: 2 }}>
              Új hiba jelentése
            </Typography>
            <IconButton onClick={handleClose} size="small" sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ flexGrow: 1, p: { xs: 3, md: 4 }, overflow: 'auto' }}>
            {submitted ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <CheckCircleIcon sx={{ fontSize: 72, color: "success.main", mb: 3 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Hibabejelentés Elküldve!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                  A hibabejelentést sikeresen rögzítettük. Az adminisztrátorok
                  emailben értesítést kaptak és hamarosan foglalkoznak a problémával.
                </Typography>
                <Button variant="outlined" onClick={handleClose}>
                  Ablak bezárása
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Kérjük, minél részletesebben írja le a tapasztalt hibát. A
                  bejelentés automatikusan továbbításra kerül az
                  adminisztrátoroknak.
                </Typography>

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} id="bug-report-form">
                  <Stack spacing={3.5}>
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
                      rows={5}
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
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, bgcolor: 'grey.50', p: 1, borderRadius: 1, border: 1, borderColor: 'grey.200', width: 'fit-content' }}>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300, fontWeight: 500 }}>
                            {attachment.name}
                          </Typography>
                          <IconButton size="small" onClick={() => setAttachment(null)} disabled={isLoading} color="error" sx={{ p: 0.5 }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </>
            )}
          </Box>
          
          {/* Actions Footer */}
          {!submitted && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleClose} disabled={isLoading} color="inherit" sx={{ fontWeight: 600 }}>
                Mégse
              </Button>
              <Button
                type="submit"
                form="bug-report-form"
                variant="contained"
                color="primary"
                disableElevation
                disabled={isLoading || !title.trim() || !description.trim()}
                sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Küldés...
                  </>
                ) : (
                  "Hibabejelentés Küldése"
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
