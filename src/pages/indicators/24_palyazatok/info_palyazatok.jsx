import { Typography, Box } from "@mui/material";

/**
 * Info component for Pályázatok indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoPalyazatok = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a pályázati tevékenységek adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Benyújtott és elnyert pályázatok száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Pályázati összegek és projektek
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Pályázatok típusai és tématerületei
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoPalyazatok;
