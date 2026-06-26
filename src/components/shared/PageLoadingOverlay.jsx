import { Backdrop, CircularProgress, Box } from "@mui/material";

/**
 * Újrafelhasználható oldal szintű betöltést jelző overlay komponens
 * @param {boolean} isLoading - Meghatározza, hogy a töltési overlay látható-e
 * @param {string} message - A töltés során megjelenő üzenet
 */
const PageLoadingOverlay = ({
  isLoading,
  message = "Adatok betöltése folyamatban, kérjük várjon...",
}) => {
  if (!isLoading) return null;

  return (
    <Backdrop
      sx={{
        position: "fixed",
        zIndex: 1300,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        color: "primary.main",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      open={isLoading}
    >
      <CircularProgress size={50} />
      <Box sx={{ textAlign: "center", fontWeight: "medium" }}>{message}</Box>
    </Backdrop>
  );
};

export default PageLoadingOverlay;
