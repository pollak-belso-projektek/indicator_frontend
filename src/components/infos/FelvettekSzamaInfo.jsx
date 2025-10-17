import { Typography } from "@mui/material";

const FelvettekSzamaInfo = () => {
  return (
    <>
    

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Az indikátor azt mutatja meg, hogy hányszoros a jelentkezési arány a
        felvettek számához képest.
        <br />
        <strong>
          Képlet: Jelentkezések és felvettek aránya = (9. évfolyamra jelentkezők
          száma) / (9. évfolyamra felvettek száma)
        </strong>
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Példa számítás: Ha 96 jelentkező van és 32 felvett, akkor az arány:
        96/32 = 3
        <br />
        Tehát 3-szoros jelentkezési arány szükséges a szakma indításához.
      </Typography>

  
    </>
  );
};

export default FelvettekSzamaInfo;
