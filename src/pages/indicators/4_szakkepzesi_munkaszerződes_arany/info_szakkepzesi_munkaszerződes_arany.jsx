import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakképzési munkaszerződés arány indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakkepzesiMunkaszerzodes = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
        Az indikátor megmutatja, hogy az intézmény mennyire tud megfelelni azon 
        elvárásnak, hogy a képzés során a tanulót a munkaerőpiacon 
        hasznosítható tudáshoz juttassa.
        <br />
        <strong>
          A mutató számítása: Szakképzési munkaszerződéssel rendelkezők aránya = 
          (szakképzési munkaszerződéssel rendelkezők száma / tanulók összlétszáma) * 100
        </strong>
      </Typography>
        <Typography variant="body2" color="text.secondary">
          Az indikátor megmutatja, hogy az intézmény mennyire tud megfelelni azon elvárásnak, 
          hogy a képzés során a tanulót a munkaerőpiacon hasznosítható tudáshoz juttassa.
          <br />
          Adatforrás: KRÉTA 
        </Typography>
     
    </Box>
  );
};

export default InfoSzakkepzesiMunkaszerzodes;
