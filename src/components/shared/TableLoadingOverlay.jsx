import { Backdrop, CircularProgress, Box } from "@mui/material";

/**
 * Újrafelhasználható táblázat töltési overlay komponens
 * @param {boolean} isLoading - Meghatározza, hogy a töltési overlay látható-e
 * @param {string} message - A töltés során megjelenő üzenet
 */
const TableLoadingOverlay = ({
  isLoading,
  message = "Adatok mentése folyamatban, kérjük várjon...",
}) => {
  if (!isLoading) return null;

  return (
    <Backdrop
      sx={{
        position: "absolute",
        zIndex: 10,
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

export default TableLoadingOverlay;
