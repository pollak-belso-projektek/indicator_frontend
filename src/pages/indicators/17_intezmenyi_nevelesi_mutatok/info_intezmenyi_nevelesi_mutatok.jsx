import { Typography, Box } from "@mui/material";

/**
 * Info component for Intézményi nevelési mutatók indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoIntezmenyiNevelesiMutatok = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az intézményi nevelési mutatókat tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Nevelési programok és eredmények
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Fegyelmi ügyek és konfliktuskezelés
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Közösségi és szociális programok
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoIntezmenyiNevelesiMutatok;
