import { Typography, Box } from "@mui/material";

/**
 * Info component for Intézményi nevelési mutatók indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoIntezmenyiNevelesiMutatok = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
     <Typography variant="h6" component="h3" gutterBottom>
              Osztálystatisztikákból szinte minden megtalálható, exportál
              dolgozhatunk. Kézzel kell feltölteni: oktató testületi dicséretek,
              esetleg a megrovásokról párat...
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
              A mutató az adott tanévre vonatkozóan tartalmazza információt a
              fegyelmi esetek, dicséretek és az igazgatói mulasztások számáról a
              tanulói jogviszonyban tanulók esetén.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              A mutató az intézmény házirendjében szabályozott fegyelmezési
              intézkedések formáira vonatkozóan kell számítani (pl. szakmai
              fegyelmezetés, igazgatói intés, ...).
            </Typography>

            <Box
              sx={{ mt: 2, p: 2, backgroundColor: "#f0f8ff", borderRadius: 1 }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Példa:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Fegyelmi esetek száma: 186 db/tanév (A mutató megcsináló
                típusokként is: igazgatói figyelmeztetés 21 db/tanév, igazgatói
                megrovás 2 db/tanév stb.)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Dicséretek száma: 253 db/tanév
              </Typography>
              <Typography variant="body2">
                Igazgatói mulasztások: 10984 óra/tanév
              </Typography>
            </Box>

            <Box
              sx={{ mt: 2, p: 2, backgroundColor: "#fff8f0", borderRadius: 1 }}
            >
              <Typography variant="body2">
                <strong>Megjegyzés:</strong> A mutató olyan bontásban számítandó,
                amelynek felhasználása segítséget jelent a pedagógiai munka
                fejlesztése során (osztályonként, szakmánként, jogviszonyonként).
                <br />A hiányzások a 26. HSZC indikátornál található meg
              </Typography>
            </Box>
    </Box>
  );
};

export default InfoIntezmenyiNevelesiMutatok;
