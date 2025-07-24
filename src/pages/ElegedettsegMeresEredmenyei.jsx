import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";

export default function ElegedettsegMeresEredmenyei() {
  const schoolYears = ["2020/2021", "2021/2022", "2022/2023", "2023/2024"];

  const stakeholderCategories = [
    {
      key: "szulo",
      label: "Szülő",
      description: "Szülői elégedettség az intézmény működésével",
      color: "#e8f5e8",
    },
    {
      key: "oktato",
      label: "Oktató",
      description: "Pedagógusok elégedettsége a munkakörülményekkel",
      color: "#fff8e8",
    },
    {
      key: "tanulo",
      label: "Tanuló",
      description: "Tanulók elégedettsége az oktatással és környezettel",
      color: "#e8f2ff",
    },
    {
      key: "dualis_kepzohely",
      label: "Duális képzőhely",
      description: "Gyakorlati képzési helyek elégedettsége",
      color: "#f8e8ff",
    },
    {
      key: "munkaeropiaci",
      label: "Munkaerőpiac",
      description: "Munkaerőpiaci partnerek elégedettsége",
      color: "#e8fff8",
    },
  ];

  // Initialize data structure
  const [satisfactionData, setSatisfactionData] = useState(() => {
    const initialData = {};

    stakeholderCategories.forEach((category) => {
      initialData[category.key] = {};
      schoolYears.forEach((year) => {
        initialData[category.key][year] = "0";
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (stakeholder, year, value) => {
    setSatisfactionData((prev) => ({
      ...prev,
      [stakeholder]: {
        ...prev[stakeholder],
        [year]: value,
      },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(satisfactionData)));
    setIsModified(false);
    console.log("Saving satisfaction data:", satisfactionData);
  };

  const handleReset = () => {
    if (savedData) {
      setSatisfactionData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        16. Elégedettség mérés eredményei
      </Typography>

      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ mb: 3, fontStyle: "italic" }}
      >
        (szülő, oktató, tanuló, duális képzőhely, munkaerőpiac)
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Az adott partner százalékos elégedettsége az elégedettségi kérdőívben
        felmerülő témákra vonatkozóan.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Kérzel...
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            Az indikátor kiszámítása: Az adott partner elégedettségének egyedi
            és átlagos százalékos értéke, amely megmutatja, hogy mennyire
            elégedett az adott témában az intézmény működésével, folyamataival.
          </Typography>

          <Box
            sx={{
              p: 2,
              backgroundColor: "#f0f8ff",
              borderRadius: 1,
              border: "1px solid #90caf9",
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              <strong>Megjegyzés:</strong> Az indikátor értelmezhető az
              intézmény egészére, ágazatonként, szakmánként.
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "#e8f5e8",
              borderRadius: 1,
              border: "1px solid #4caf50",
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              <strong>Adatforrás:</strong> Partneri elégedettségi kérdőív
              eredménye.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Végzetteket foglalkoztató munkáadók elégedettsége (%)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    Érintett fél
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 120,
                        backgroundColor: "#e8f4fd",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stakeholderCategories.map((stakeholder, index) => (
                  <TableRow
                    key={stakeholder.key}
                    sx={{
                      backgroundColor: stakeholder.color,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "medium",
                        textAlign: "left",
                        pl: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {stakeholder.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stakeholder.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    {schoolYears.map((year) => (
                      <TableCell key={year} align="center">
                        <TextField
                          type="number"
                          value={
                            satisfactionData[stakeholder.key]?.[year] || "0"
                          }
                          onChange={(e) =>
                            handleDataChange(
                              stakeholder.key,
                              year,
                              e.target.value
                            )
                          }
                          size="small"
                          inputProps={{
                            min: 0,
                            max: 100,
                            step: 0.1,
                            style: { textAlign: "center" },
                          }}
                          sx={{ width: "80px" }}
                          placeholder="0-100"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isModified}
            >
              Mentés
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              disabled={!isModified || !savedData}
            >
              Visszaállítás
            </Button>
          </Stack>

          {/* Status Messages */}
          {isModified && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Mentetlen módosítások vannak. Ne felejtsd el menteni a
              változtatásokat!
            </Alert>
          )}

          {savedData && !isModified && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Az adatok sikeresen mentve!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stakeholder Details */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Érintett felek részletesen
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 2,
              mb: 2,
            }}
          >
            {stakeholderCategories.map((stakeholder) => (
              <Card
                key={stakeholder.key}
                sx={{
                  backgroundColor: stakeholder.color,
                  border: "1px solid #ddd",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {stakeholder.label}
                  </Typography>
                  <Typography variant="body2">
                    {stakeholder.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Measurement Guidelines */}
      <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Mérési irányelvek
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Szülői elégedettség:</strong> Kommunikáció,
                tájékoztatás, oktatás minősége, tanulói fejlődés
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Oktatói elégedettség:</strong> Munkakörülmények, vezetői
                támogatás, fejlődési lehetőségek, eszközellátottság
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Tanulói elégedettség:</strong> Oktatás színvonala,
                tanár-diák kapcsolat, iskolai környezet, felszereltség
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Duális képzőhely:</strong> Tanulók felkészültsége,
                együttműködés színvonala, kommunikáció hatékonysága
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Munkaerőpiac:</strong> Végzettek kompetenciái,
                munkahelyi alkalmasság, szakmai felkészültség
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Data Collection Methods */}
      <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Adatgyűjtési módszerek
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip label="Online kérdőívek" color="primary" variant="outlined" />
            <Chip
              label="Papír alapú felmérések"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label="Személyes interjúk"
              color="success"
              variant="outlined"
            />
            <Chip
              label="Telefonos megkeresés"
              color="info"
              variant="outlined"
            />
            <Chip
              label="Fókuszcsoportos beszélgetések"
              color="warning"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2">
            Az elégedettségi mérések rendszeres időközönként (évente)
            végrehajtandók, reprezentatív mintavétellel, validált kérdőívekkel.
          </Typography>
        </CardContent>
      </Card>

      {/* Quality Indicators */}
      <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Minőségi mutatók
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Az elégedettségi mutatók az intézmény teljesítményének átfogó
            értékelését teszik lehetővé különböző szemszögekből.
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Trendanalízis:</strong> Évenkénti változások nyomon
                követése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Összehasonlító elemzés:</strong> Különböző érintettek
                véleményének összevetése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Fejlesztési területek:</strong> Alacsony elégedettségi
                mutatók elemzése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Benchmarking:</strong> Más intézményekkel való
                összehasonlítás lehetősége
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Jelmagyarázat
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip
              label="0-100% skála"
              variant="outlined"
              sx={{ backgroundColor: "#e8f4fd" }}
            />
            <Chip
              label="Tizedesjegyek használhatók"
              variant="outlined"
              sx={{ backgroundColor: "#f0f8ff" }}
            />
          </Stack>
          <Typography variant="body2">
            Az értékek 0-100% közötti százalékos formában adandók meg. A
            magasabb értékek nagyobb elégedettséget jelentenek.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
