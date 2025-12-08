import { Typography, Box } from "@mui/material";

/**
 * Info component for Tanulólétszám (Student Enrollment) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoTanuloLetszam = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ mt: 1 }}>
        A trendvizsgálathoz a szakképző intézmény évente gyűjti az október 1-jei
        létszámadatát azonos bontásban/kategóriában (intézménytípus, ágazat,
        szakma).
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        A második adatgyűjtési évtől kezdődően vizsgálja kategóriánként az
        időbeli változást. A változás mértékének számításánál a viszonyítás
        alapja lehet az előző tanév adata vagy az első adatgyűjtés évének adata.
        [%]
      </Typography>
    </Box>
  );
};

export default InfoTanuloLetszam;
