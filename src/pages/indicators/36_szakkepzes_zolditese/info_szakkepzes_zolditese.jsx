import React from "react";
import { Typography, Box } from "@mui/material";

export default function InfoSzakkepzesZolditese() {
  return (
    <Box>
      <Typography variant="body1" paragraph>
        Ezen a felületen rögzítheti az intézményben alkalmazott "zöld" tevékenységeket és az Ökoiskola programhoz kapcsolódó eseményeket tanévenként.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Használat:
        <br />
        - Kattintson az "Új tevékenység hozzáadása" gombra egy új tevékenység rögzítéséhez.
        <br />
        - Válassza ki a kategóriát, majd adja meg a tevékenység nevét.
        <br />
        - Töltse ki az egyes tanévekhez tartozó adatokat: írja be a résztvevők számát (fő).
        <br />
        - A módosított mezők sárga háttérrel jelennek meg a mentésig.
        <br />
        - A "Mentés" gombbal rögzítheti az adatokat az adatbázisban.
      </Typography>
    </Box>
  );
}
