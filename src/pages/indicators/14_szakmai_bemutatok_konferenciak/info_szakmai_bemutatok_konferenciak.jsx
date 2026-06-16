import { Typography, Box } from "@mui/material";

/**
 * Info component for Szakmai bemutatók/konferenciák indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoSzakmaiBemutatok = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a szakmai bemutatók és konferenciák adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, mb: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Szervezett és megtartott rendezvények száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Résztvevők és előadók száma
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Rendezvények típusa és témája
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Ilyen lehet például: szakmai konferencia, országos vagy regionális
        szakmai verseny, új technológiákat és piaci szerepeket bemutató
        szakmai nap vagy vásár.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Az indikátor egy-egy tanévben megszervezett alkalmak összegyűjtését,
        felsorolását teszi szükségessé. Fontos, hogy az egymást követő
        tanévek összeállított listáin szerepelő alkalmat intézmény tanévről
        tanévről összehasonlítsa.
      </Typography>

      <Box
        sx={{
          p: 2,
          backgroundColor: "#f0f8ff",
          borderRadius: 1,
          border: "1px solid #90caf9",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          <strong>Megjegyzés:</strong> A kizárólag PR-tevékenységhez
          kapcsolódó rendezvényeket (pl. nyílt nap) nem kell szerepeltetnie
          az intézménynek az általa szervezett szakmai bemutatók között.
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoSzakmaiBemutatok;
