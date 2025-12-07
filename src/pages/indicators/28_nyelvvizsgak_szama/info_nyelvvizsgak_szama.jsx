import { Typography, Box } from "@mui/material";

/**
 * Info component for Nyelvvizsgák száma indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoNyelvvizsgakSzama = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a megszerzett nyelvvizsgák adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Nyelvvizsgával rendelkező tanulók száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Nyelvvizsga szintek és nyelvek szerinti bontás
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Iskolánkénti és tanévenkénti statisztikák
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoNyelvvizsgakSzama;
