import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakmai eredmények / Versenyek indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakmaiEredmenyek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Szakmai, közismereti, kulturális és sporteredmények
        <br />
        Az eredmények tanévenkénti bemutatása és a tanévenkénti eredmények 
        összehasonlítása nemzetközi, országos, regionális, megyei és település szinten.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Adatforrás: 
        Lehet a KRÉTA, az intézmény éves beszámolója, a szakképző intézmények 
        versenyeredményeinek nyilvántartására használt adatbázis.
        </Typography>
    </Box>
  );
};

export default InfoSzakmaiEredmenyek;
