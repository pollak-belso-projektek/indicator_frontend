import { Typography, Box } from "@mui/material";

const InfoDigitalisKompetencia = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ezen a felületen rögzítheti a digitális tananyagot fejlesztő és használó oktatók számát tanévenként.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Töltse ki az egyes tanévekhez tartozó adatokat a megfelelő sorokban.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          A módosított mezők sárga háttérrel jelennek meg a mentésig.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          A "Mentés" gombbal rögzítheti az adatokat az adatbázisban.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Mivel ezek fix mérőszámok, új sorokat nem lehet hozzáadni, csak az értékeket szerkeszteni.
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoDigitalisKompetencia;
