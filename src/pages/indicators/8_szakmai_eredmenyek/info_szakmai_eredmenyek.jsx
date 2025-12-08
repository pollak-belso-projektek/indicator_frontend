import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakmai eredmények / Versenyek indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakmaiEredmenyek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a szakmai versenyeredményeket és elismeréseket tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Országos és nemzetközi versenyek eredményei
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Szakmánkénti és iskolánkénti bontás
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Helyezések és díjazottak nyilvántartása
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakmaiEredmenyek;
