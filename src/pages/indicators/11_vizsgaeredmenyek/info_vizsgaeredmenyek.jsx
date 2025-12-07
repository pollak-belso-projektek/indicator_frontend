import { Typography, Box } from "@mui/material";

/**
 * Info component for Vizsgaeredmények (Exam Results) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoVizsgaeredmenyek = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Figyelem!
      </Typography>
      <Typography variant="body2">
        Az adatokat százalékos formátumban adja meg (pl. 85.5 a 85,5%-hoz). A
        táblázat automatikusan kiszámolja az átlagokat a megadott értékek
        alapján.
      </Typography>
      <Typography variant="h6" component="h3" gutterBottom>
        Példa értékek:
      </Typography>
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        <li>
          <Typography variant="body2">
            <strong>Matematika érettségi tantárgyi átlaga:</strong> 3,5
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <strong>Szakács szakmában végzettek eredményeinek átlaga:</strong>{" "}
            3,8
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <strong>
              Turizmus-vendéglátás ágazatban ágazati alapvizsgát tett tanulók
              eredményének átlaga:
            </strong>{" "}
            4,2
          </Typography>
        </li>
      </Box>
      <Typography variant="body2" sx={{ fontStyle: "italic" }}>
        <strong>Megjegyzés:</strong> Egy adott tanév vizsgájának átlageredményei
        nem elegendőek az intézmény folyó tevékenység értékeléséhez, ezért
        ajánlott az átlagok trendvizsgálata.
      </Typography>
    </Box>
  );
};

export default InfoVizsgaeredmenyek;
