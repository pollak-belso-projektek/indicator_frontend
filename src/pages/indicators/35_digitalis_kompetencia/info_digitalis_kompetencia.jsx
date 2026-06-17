import React from "react";
import { Typography, Box } from "@mui/material";

export default function InfoDigitalisKompetencia() {
  return (
    <Box>
      <Typography variant="body1" paragraph>
        Ezen a felületen rögzítheti a digitális tananyagot fejlesztő és használó oktatók számát tanévenként.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Használat:
        <br />
        - Töltse ki az egyes tanévekhez tartozó adatokat a megfelelő sorokban.
        <br />
        - A módosított mezők sárga háttérrel jelennek meg a mentésig.
        <br />
        - A "Mentés" gombbal rögzítheti az adatokat az adatbázisban.
        <br />
        - Mivel ezek fix mérőszámok, új sorokat nem lehet hozzáadni, csak az értékeket szerkeszteni.
      </Typography>
    </Box>
  );
}
