import { Typography, Box } from "@mui/material";

/**
 * Info component for NSZFH mérések indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoNszfhMeresek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Vizsgálati lehetőségek
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        • 25% alatt teljesítő tanulók aránya az összes vizsgálatban részt vett
        tanulóhoz viszonyítva intézménytípusonként, kompetenciaterületenként
        (anyanyelv, matematika)
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        • 25 és 80% között teljesítő tanulók aránya az összes vizsgálatban részt
        vett tanulóhoz viszonyítva intézménytípusonként,
        kompetenciaterületenként (anyanyelv, matematika)
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        <strong>Példa:</strong> Az intézményben 25% alatt teljesítők száma 12, a
        mérésben résztvevők száma 186. A mutató számítása: 12/186*100= 6,45%
      </Typography>
    </Box>
  );
};

export default InfoNszfhMeresek;
