import { Typography, Box } from "@mui/material";

/**
 * Info component for Dobbantó program aránya indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoDobbantoProgramAranya = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a Dobbantó programban résztvevő tanulók adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Dobbantó programban résztvevők száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Program sikerességi mutatói
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Továbblépési és befejezési arányok
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoDobbantoProgramAranya;
