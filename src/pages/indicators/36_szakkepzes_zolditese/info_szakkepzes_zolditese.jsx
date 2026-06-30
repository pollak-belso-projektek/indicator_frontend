import { Typography, Box } from "@mui/material";

const InfoSzakkepzesZolditese = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ezen a felületen rögzítheti az intézményben alkalmazott "zöld"
        tevékenységeket és az Ökoiskola programhoz kapcsolódó eseményeket
        tanévenként.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Kattintson az "Új tevékenység hozzáadása" gombra egy új tevékenység
          rögzítéséhez.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Válassza ki a kategóriát, majd adja meg a tevékenység nevét.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Töltse ki az egyes tanévekhez tartozó adatokat: írja be a résztvevők
          számát (fő).
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          A módosított mezők sárga háttérrel jelennek meg a mentésig.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          A "Mentés" gombbal rögzítheti az adatokat az adatbázisban.
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakkepzesZolditese;
