import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakképzési munkaszerződés arány indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakkepzesiMunkaszerzodes = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a szakképzési munkaszerződéssel rendelkező tanulók arányát
        mutatja.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          A százalékos arány automatikusan számolódik
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Az adatok iskolánként és tanévenként jelennek meg
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Duális képzésben résztvevők száma is nyomon követhető
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakkepzesiMunkaszerzodes;
