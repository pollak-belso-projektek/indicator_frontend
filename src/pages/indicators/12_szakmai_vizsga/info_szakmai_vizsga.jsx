import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakmai vizsga (Professional Exam) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakmaiVizsga = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a szakmai vizsgák eredményeit tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Szakmai vizsgák sikerességi aránya
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Vizsgázók és sikeres vizsgázók száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Szakmánkénti és iskolánkénti bontás
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakmaiVizsga;
