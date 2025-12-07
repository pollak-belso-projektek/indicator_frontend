import { Typography, Box } from "@mui/material";

/**
 * Info component for Pályaorientáció indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoPalyaorientacio = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a pályaorientációs tevékenységek adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Pályaorientációs programok és rendezvények
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Résztvevő általános iskolások száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Nyílt napok és iskolalátogatások
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoPalyaorientacio;
