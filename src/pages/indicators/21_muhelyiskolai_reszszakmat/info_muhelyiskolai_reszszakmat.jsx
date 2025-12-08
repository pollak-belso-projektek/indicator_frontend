import { Typography, Box } from "@mui/material";

/**
 * Info component for Műhelyiskolai részszakma indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoMuhelyiskolaiReszszakmat = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a műhelyiskolai részszakmák adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Műhelyiskolai képzésben résztvevők száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Részszakmák típusai és eredményei
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Sikerességi és továbblépési mutatók
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoMuhelyiskolaiReszszakmat;
