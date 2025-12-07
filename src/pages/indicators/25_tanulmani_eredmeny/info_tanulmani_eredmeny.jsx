import { Typography, Box } from "@mui/material";

/**
 * Info component for Tanulmányi eredmény indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoTanulmanyiEredmeny = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a tanulmányi eredmények adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Tanulmányi átlagok és osztályzatok
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Évfolyamonkénti és tantárgyankénti bontás
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Kitűnő és jeles tanulók száma
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoTanulmanyiEredmeny;
