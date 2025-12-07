import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakmai bemutatók/konferenciák indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakmaiBemutatok = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a szakmai bemutatók és konferenciák adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Szervezett és megtartott rendezvények száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Résztvevők és előadók száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Rendezvények típusa és témája
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakmaiBemutatok;
