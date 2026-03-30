import { Typography, Box } from "@mui/material";

/**
 * Info component for Kompetencia (Competency) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoKompetencia = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body1" color="text.secondary">
        Országos kompetenciamérés eredményei.
        <br />
        A vizsgált tanévben megvalósított kompetenciamérés eredményeinek átlageredményét 
        kell intézménytípus és vizsgálati terület szerinti bontásban megadni mérési 
        területenként (pl. matematika, olvasás-szövegértés) megadva.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Adatforrás: Az Oktatási Hivatal honlapján közzétett jelentések.
      </Typography>
    </Box>
  );
};

export default InfoKompetencia;
