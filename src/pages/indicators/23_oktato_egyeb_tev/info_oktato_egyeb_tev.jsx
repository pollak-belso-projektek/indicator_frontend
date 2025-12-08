import { Typography, Box } from "@mui/material";

/**
 * Info component for Oktatók egyéb tevékenysége indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoOktatoEgyebTev = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal az oktatók tanításon kívüli tevékenységeit tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Szakmai fejlesztési tevékenységek
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Publikációk és kutatások
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Mentori és egyéb szerepvállalások
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoOktatoEgyebTev;
