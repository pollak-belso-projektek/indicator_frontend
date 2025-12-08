import { Typography, Box } from "@mui/material";

/**
 * Info component for Innovációs tevékenységek indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoInnovaciosTevekenysegek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az innovációs tevékenységek adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Pedagógiai és módszertani innovációk
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Technológiai fejlesztések és bevezetések
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Innovációs projektek és eredmények
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoInnovaciosTevekenysegek;
