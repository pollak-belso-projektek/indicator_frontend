import { Typography, Box } from "@mui/material";

/**
 * Info component for Felvettek száma (Number of Admitted Students) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoFelvettekSzama = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Az indikátor azt mutatja meg, hogy hányszoros a jelentkezési arány a
        felvettek számához képest.
        <br />
        <strong>
          A mutató számítása: Jelentkezések és felvettek aránya = (9. évfolyamra jelentkezők
          száma) / (9. évfolyamra felvettek száma) * 100
        </strong>
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Az arány évről évre történő vizsgálata segíti az intézményeket annak eldöntésében, hogy melyik szakmára vonatkozóan kell nagyobb intenzitású pályaorientációs tevékenységet folytatniuk annak 
        érdekében, hogy az adott szakma osztályszinten indítható legyen.
        <br />
        Adatforrás: A szakképző intézmény 9. évfolyamára jelentkezők száma és a szakképző intézmény 9. évfolyamára felvettek száma: KIFIR.
      </Typography>
    </Box>
  );
};

export default InfoFelvettekSzama;
