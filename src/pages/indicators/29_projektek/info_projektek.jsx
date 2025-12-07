import { Typography, Box } from "@mui/material";

/**
 * Info component for Projektek indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoProjektek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az intézményi projektek adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Futó és lezárt projektek száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Projektek típusai és céljai
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Résztvevők és eredmények
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoProjektek;
