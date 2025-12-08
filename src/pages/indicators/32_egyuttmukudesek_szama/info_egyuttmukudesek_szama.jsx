import { Typography, Box } from "@mui/material";

/**
 * Info component for Együttműködések száma indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoEgyuttmukodesekSzama = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az intézményi együttműködések adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Vállalati és intézményi partnerkapcsolatok
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Hazai és nemzetközi együttműködések
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Együttműködési megállapodások száma
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoEgyuttmukodesekSzama;
