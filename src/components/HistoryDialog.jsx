import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Box,
  Alert
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import CloseIcon from '@mui/icons-material/Close';
import { useGetFormHistoryQuery, useRollbackFormHistoryMutation } from '../store/api/apiSlice';

export default function HistoryDialog({ open, onClose, alapadatokId, tableName, onRollbackSuccess }) {
  const { data: historyList, isLoading, isError, refetch } = useGetFormHistoryQuery(
    { alapadatok_id: alapadatokId, table_name: tableName },
    { skip: !open || !alapadatokId || !tableName, refetchOnMountOrArgChange: true }
  );

  const [rollbackFormHistory, { isLoading: isRollingBack }] = useRollbackFormHistoryMutation();
  const [errorMsg, setErrorMsg] = useState("");
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // Set the first item as active initially if nothing is set
  React.useEffect(() => {
    if (historyList && historyList.length > 0 && !activeHistoryId) {
      setActiveHistoryId(historyList[0].id);
    }
  }, [historyList, activeHistoryId]);

  const handleRollback = async (historyId) => {
    if (!window.confirm("Biztosan visszaállítod az adatokat erre az állapotra? A jelenlegi adatok felülíródnak!")) {
      return;
    }
    
    try {
      setErrorMsg("");
      await rollbackFormHistory(historyId).unwrap();
      setActiveHistoryId(historyId); // Update the active history to the restored one
      onRollbackSuccess(); // Parent should refetch or show success message
      // Don't close automatically so user sees the "Jelenleg betöltve" state change
    } catch (err) {
      console.error("Visszaállítási hiba:", err);
      setErrorMsg(err?.data?.error || err?.message || "Hiba történt a visszaállítás során.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Előzmények</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">Hiba történt az előzmények lekérdezésekor.</Alert>
        ) : !historyList || historyList.length === 0 ? (
          <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
            Nincsenek elérhető előzmények ehhez az űrlaphoz.
          </Typography>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {historyList.map((item, index) => {
              const isActive = item.id === activeHistoryId;
              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    alignItems="center"
                    sx={{ 
                      py: 1.5,
                      bgcolor: isActive ? 'success.50' : 'transparent',
                      borderRadius: 1
                    }}
                    secondaryAction={
                      <Button 
                        variant={isActive ? "contained" : "outlined"} 
                        color={isActive ? "success" : "warning"} 
                        startIcon={!isActive && <RestoreIcon />}
                        onClick={() => handleRollback(item.id)}
                        disabled={isRollingBack || isActive}
                      >
                        {isActive ? "Jelenleg betöltve" : "Visszaállítás"}
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={index === 0 || isActive ? 'bold' : 'normal'}>
                          {formatDate(item.created_at)}
                        </Typography>
                      }
                      secondary={
                        isActive 
                          ? "Aktív állapot" 
                          : index === 0 
                            ? "Utolsó mentett állapot" 
                            : "Korábbi állapot"
                      }
                    />
                  </ListItem>
                  {index < historyList.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Bezárás
        </Button>
      </DialogActions>
    </Dialog>
  );
}
