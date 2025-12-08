import { Typography, Box } from "@mui/material";

/**
 * Info component for Duális képzőhelyek száma indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoDualisKepzohelyekSzama = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a duális képzőhelyek adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Együttműködő vállalatok száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Duális képzésben résztvevő tanulók
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Szakmánkénti és ágazati bontás
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoDualisKepzohelyekSzama;
