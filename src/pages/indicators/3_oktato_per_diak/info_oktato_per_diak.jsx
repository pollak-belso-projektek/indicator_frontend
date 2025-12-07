import { Typography, Box } from "@mui/material";

/**
 * Info component for Oktatóra jutó diák (Students per Teacher) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoOktatoPerDiak = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az egy oktatóra jutó diákok számát mutatja iskolánként.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Az arány számítása automatikusan történik
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Az adatok tanévenként vannak csoportosítva
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Az oktatói és diák létszám alapján számolódik
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoOktatoPerDiak;
