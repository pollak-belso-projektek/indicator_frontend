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
          Képlet: Jelentkezések és felvettek aránya = (9. évfolyamra jelentkezők
          száma) / (9. évfolyamra felvettek száma)
        </strong>
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Példa számítás: Ha 96 jelentkező van és 32 felvett, akkor az arány:
        96/32 = 3
        <br />
        Tehát 3-szoros jelentkezési arány szükséges a szakma indításához.
      </Typography>
    </Box>
  );
};

export default InfoFelvettekSzama;
