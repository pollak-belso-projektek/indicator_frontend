import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakképzési munkaszerződés arány indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakkepzesiMunkaszerzodes = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                     <strong>Megjegyzés:</strong>
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 2 }}>
                     Az érettségi utáni képzések első évfolyamán tanulók szakképzési
                     munkaszerződésének száma az október 1-jei adatban még nem
                     jelenik meg, mert csak az első félvét lezáró időszaki
                     alapvizsgát követően tudnak munkaszerződést kötni. Az adatok
                     értékelésénél, elemzésénél ezt az időbeli eltérést érdemes
                     figyelembe venni.
                   </Typography>
     
                   <Box
                     sx={{
                       p: 2,
                       backgroundColor: "#f0f8ff",
                       borderRadius: 1,
                       border: "1px solid #90caf9",
                       display: "flex",
                       alignItems: "center",
                       gap: 2,
                     }}
                   >
                     <Typography
                       variant="body2"
                       sx={{ fontStyle: "italic", flex: 1 }}
                     >
                       <strong>Számítási képlet:</strong>
                       <br />
                       (Szakképzési munkaszerződéssel rendelkezők száma / szakirányú
                       oktatásban részt vevő tanulók összlétszáma) × 100
                     </Typography>
                     <Box
                       sx={{
                         fontSize: "2rem",
                         fontWeight: "bold",
                         color: "#1976d2",
                         textAlign: "center",
                         minWidth: "100px",
                       }}
                     >
                       = %
                     </Box>
                   </Box>
    </Box>
  );
};

export default InfoSzakkepzesiMunkaszerzodes;
