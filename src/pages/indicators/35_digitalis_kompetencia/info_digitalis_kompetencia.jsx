import { Typography, Box } from "@mui/material";

/**
 * Info component for Digitális kompetencia indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoDigitalisKompetencia = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a digitális kompetencia adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Digitális eszközök használata az oktatásban
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Pedagógusok digitális felkészültsége
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Tanulók digitális kompetenciaszintje
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoDigitalisKompetencia;
