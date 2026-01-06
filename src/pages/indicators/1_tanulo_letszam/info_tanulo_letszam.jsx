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
      <Typography variant="body2" sx={{ mt: 1 }}>
        A mutató számítása: (az adott tanév létszámadata / az előző tanév létszámadata) * 100
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        A trendvizsgálat az intézmények figyelmét ráirányítja az egyes évek „kiugró” adatain túlmutató tényezőkre.
        Példa: Egy szakmában az elmúlt 5 évben a létszámadatok (fő) alakulása rendre: 73, 86, 94, 45, 98. A trendvizsgálat alapján egy növekedési tendencia mutatkozik az adott szakma esetén. 
        Célszerű a 45 fős adat okát megvizsgálni, de általánosságban elmondható, hogy ha az eddigi tevékenységét hasonlóan folytatja az intézmény, akkor ezzel a szakmával nem lesz problémája.
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Adatforrás: A szakképző intézményben adott tanév október 1-jén szakmai oktatásban tanulók száma: KRÉTA.
        Az aktuális tanév tanulólétszám adatainak feltöltéséhez használja az Adatok importálása / Tanügyi adatok menüpontot, ahová töltse fel az intézmény Kréta "Tanuló tanügy adatai" Excel export Fájlját!
      </Typography>
    </Box>
  );
};

export default InfoTanuloLetszam;
