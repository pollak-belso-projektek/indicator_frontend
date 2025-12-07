import { Typography, Box } from "@mui/material";

/**
 * Info component for Kompetencia (Competency) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoKompetencia = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a kompetenciamérési eredményeket tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Szövegértés és matematika kompetenciák
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Országos átlaghoz viszonyított eredmények
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Évfolyamonkénti és iskolai bontás
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoKompetencia;
