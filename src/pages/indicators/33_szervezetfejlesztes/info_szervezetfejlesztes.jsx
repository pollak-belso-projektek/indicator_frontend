import { Typography, Box } from "@mui/material";

/**
 * Info component for Szervezetfejlesztés indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzervezetfejlesztes = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a szervezetfejlesztési tevékenységek adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Szervezetfejlesztési programok és képzések
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Minőségirányítási rendszerek
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Stratégiai fejlesztési projektek
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzervezetfejlesztes;
