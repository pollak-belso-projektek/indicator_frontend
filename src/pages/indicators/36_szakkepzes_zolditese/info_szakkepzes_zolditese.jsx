import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakképzés zöldítése indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakkepzesZolditese = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a szakképzés zöldítésével kapcsolatos adatokat tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Környezettudatos képzési programok
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Fenntarthatósági projektek és kezdeményezések
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Zöld technológiák oktatása
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakkepzesZolditese;
