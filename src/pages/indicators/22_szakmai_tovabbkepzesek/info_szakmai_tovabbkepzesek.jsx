import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakmai továbbképzések indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakmaiTovabbkepzesek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a pedagógusok szakmai továbbképzéseinek adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Továbbképzéseken résztvevő pedagógusok száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Továbbképzések típusai és témái
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Megszerzett kreditek és tanúsítványok
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakmaiTovabbkepzesek;
