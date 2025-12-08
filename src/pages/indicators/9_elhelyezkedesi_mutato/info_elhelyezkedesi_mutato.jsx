import { Typography, Box } from "@mui/material";

/**
 * Info component for Elhelyezkedési mutató (Employment Rate) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoElhelyezkedesiMutato = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a végzett tanulók elhelyezkedési mutatóit tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Végzés utáni elhelyezkedési arányok
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Szakmában való elhelyezkedés aránya
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Pályakövetési adatok tanévenként
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoElhelyezkedesiMutato;
