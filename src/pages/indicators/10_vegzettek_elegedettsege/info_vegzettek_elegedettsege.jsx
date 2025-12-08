import { Typography, Box } from "@mui/material";

/**
 * Info component for Végzettek elégedettsége (Graduate Satisfaction) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoVegzettekElegedettsege = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a végzett tanulók elégedettségi felmérésének eredményeit
        tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Képzéssel való elégedettség mérése
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Visszajelzések és értékelések összesítése
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Iskolánkénti és szakmánkénti bontás
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoVegzettekElegedettsege;
