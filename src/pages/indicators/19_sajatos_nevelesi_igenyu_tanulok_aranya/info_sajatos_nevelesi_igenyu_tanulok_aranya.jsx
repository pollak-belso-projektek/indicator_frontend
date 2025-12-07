import { Typography, Box } from "@mui/material";

/**
 * Info component for SNI tanulók aránya indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSajatosNevelesiIgenyu = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a sajátos nevelési igényű (SNI) tanulók adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          SNI tanulók száma és aránya
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Speciális támogatási formák
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Iskolánkénti és évfolyamonkénti bontás
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSajatosNevelesiIgenyu;
