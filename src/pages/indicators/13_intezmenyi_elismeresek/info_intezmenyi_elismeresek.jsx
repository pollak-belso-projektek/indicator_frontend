import { Typography, Box } from "@mui/material";

/**
 * Info component for Intézményi elismerések (Institutional Recognition) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoIntezmenyiElismeresek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az intézményi elismeréseket és díjakat tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Intézményi szintű díjak és elismerések
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Minősítések és akkreditációk
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Tanévenként nyomon követhető eredmények
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoIntezmenyiElismeresek;
