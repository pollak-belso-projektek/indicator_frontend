import React from "react";
import { Typography, Box } from "@mui/material";

export default function InfoDualisKepzohelyek() {
  return (
    <Box>
      <Typography variant="body1" paragraph>
        Ezen a felületen rögzítheti a duális képzőhelyek számát és adatait
        tanévenként.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Használat:
        <br />
        - Kattintson az "Új képzőhely hozzáadása" gombra egy új duális képzőhely
        rögzítéséhez.
        <br />
        - Töltse ki az egyes tanévekhez tartozó adatokat: az együttműködés
        formáját, számát és az egyéb rendezvényeket.
        <br />
        - A módosított mezők sárga háttérrel jelennek meg a mentésig.
        <br />- A "Mentés" gombbal rögzítheti az adatokat az adatbázisban.
      </Typography>
    </Box>
  );
}
