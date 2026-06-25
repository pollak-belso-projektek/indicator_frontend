import { Typography, Box } from "@mui/material";

const InfoInnovaciosTevekenysegek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ezen a felületen rögzítheti az intézményben alkalmazott innovációs tevékenységeket és az azokhoz kapcsolódó jó gyakorlatokat tanévenként.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Kattintson az "Új tevékenység hozzáadása" gombra egy új innovációs tevékenység rögzítéséhez.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Töltse ki az egyes tanévekhez tartozó adatokat: írja be a jó gyakorlatok megnevezését az adott évhez.
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

export default InfoInnovaciosTevekenysegek;
