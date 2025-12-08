import { Typography, Box } from "@mui/material";

/**
 * Info component for Hiányzás (Absence) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoHianyzas = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a hiányzási adatokat tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Igazolt és igazolatlan hiányzások
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Átlagos hiányzási óraszám
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Iskolánkénti és évfolyamonkénti bontás
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoHianyzas;
