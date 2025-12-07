import { Typography, Box } from "@mui/material";

/**
 * Info component for Elégedettség mérés eredményei indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoElegedettsegMeres = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az elégedettségi mérések eredményeit tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Tanulói elégedettségi felmérések
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Szülői és munkáltatói visszajelzések
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Összesített elégedettségi mutatók
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoElegedettsegMeres;
