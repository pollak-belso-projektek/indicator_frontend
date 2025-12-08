import { Typography, Box } from "@mui/material";

/**
 * Info component for Egy oktatóra jutó össz diák indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoEgyOktatoraJutoOsszDiak = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az egy oktatóra jutó összes diák számát mutatja.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Teljes oktatói és tanulói létszám aránya
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Iskolánkénti összesített adatok
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Tanévenként nyomon követhető trendek
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoEgyOktatoraJutoOsszDiak;
