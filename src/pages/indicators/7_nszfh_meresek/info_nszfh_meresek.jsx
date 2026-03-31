import { Typography, Box } from "@mui/material";

/**
 * Info component for NSZFH mérések indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoNszfhMeresek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }} component="div">
        NSZFH mérések eredményei.
        <br />
        A vizsgált tanévben megvalósított mérés eredményeinek intézménytípusonkénti 
        összegzése.
        <br />
        Vizsgálti lehetőségek: 
        <ul>
          <li>
            25% alatt teljesítő tanulók aránya az összes vizsgálatban részt vett 
            tanulóhoz viszonyítva intézménytípusonként, kompetenciaterületenként 
            (anyanyelv, matematika)
          </li>
          <li>
            25 és 80% között teljesítő tanulók aránya az összes vizsgálatban részt 
            vett tanulóhoz viszonyítva intézménytípusonként, kompetenciaterületenként  
            (anyanyelv, matematika).
          </li>
        </ul>
        <br />
        Az országos adatok rendelkezésre állása esetén megtörténhet 
        az intézmény tanulói eredményeinek az országos átlageredményekhez viszonyított elemzése.
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Adatforrás:
        <br />
        Az NSZFH által megküldött eredményeket tartalmazó Excel-tábla.
      </Typography>
    </Box>
  );
};

export default InfoNszfhMeresek;
