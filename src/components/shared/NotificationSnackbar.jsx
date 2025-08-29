import { Snackbar, Alert } from "@mui/material";

/**
 * Újrafelhasználható értesítési Snackbar komponens
 * @param {boolean} open - Meghatározza, hogy a Snackbar megjelenjen-e
 * @param {string} message - Az értesítési üzenet
 * @param {string} severity - Az értesítés típusa: 'success' | 'error' | 'warning' | 'info'
 * @param {function} onClose - Callback függvény a Snackbar bezárásához
 * @param {number} autoHideDuration - Automatikus elrejtés időtartama milliszekundumban (alapértelmezett: 6000)
 * @param {object} anchorOrigin - A Snackbar pozíciója (alapértelmezett: jobb felső sarok)
 */
const NotificationSnackbar = ({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
