import { Typography, Box } from "@mui/material";

/**
 * Info component for HH és HHH tanulók aránya indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoHatranyosHelyzetu = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a hátrányos helyzetű (HH) és halmozottan hátrányos helyzetű
        (HHH) tanulók adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          HH és HHH tanulók száma és aránya
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Iskolánkénti és évfolyamonkénti bontás
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Támogatási programok és eredmények
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoHatranyosHelyzetu;
