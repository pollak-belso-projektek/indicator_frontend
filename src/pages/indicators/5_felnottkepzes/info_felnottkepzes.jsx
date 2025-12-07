import { Typography, Box } from "@mui/material";

/**
 * Info component for Felnőttképzés (Adult Education) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoFelnottkepzes = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a felnőttképzési programok adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Felnőttképzési programok és résztvevők száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Képzési típusok szerinti bontás
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Tanévenként és iskolánként nyomon követhető
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoFelnottkepzes;
