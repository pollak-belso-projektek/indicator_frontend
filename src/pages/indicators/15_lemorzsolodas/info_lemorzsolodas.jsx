import { Typography, Box } from "@mui/material";

/**
 * Info component for Lemorzsolódás (Dropout Rate) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoLemorzsolodas = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a lemorzsolódási adatokat tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Lemorzsolódási arányok tanévenként
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Évfolyamonkénti és szakmánkénti bontás
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Lemorzsolódás okai és trendjei
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoLemorzsolodas;
