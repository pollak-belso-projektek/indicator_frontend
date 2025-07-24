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

export default function VegzettekElegedettsege() {
  const schoolYears = ["2020/2021", "2021/2022", "2022/2023", "2023/2024"];

  const skillCategories = [
    { key: "magasepito_technikus", label: "magasépítő technikus (A)" },
    { key: "melyepito_technikus", label: "mélyépítő technikus (B)" },
    { key: "komuves", label: "kőműves (a)" },
    { key: "burkolo", label: "burkoló (b)" },
    { key: "festo_mazo", label: "festő, mázoló, tapétázó (c)" },
  ];

  // Initialize data structure
  const [satisfactionData, setSatisfactionData] = useState(() => {
    const initialData = {};

    skillCategories.forEach((category) => {
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
  const handleDataChange = (category, year, value) => {
    setSatisfactionData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
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
        10. A végzett tanulók és a munkáadók elégedettsége a megszerzett
        képességekkel / kompetenciákkal
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A szakmai oktatást 12–36 hónappal korábban sikeresen befejezett
        munkavállalókat foglalkoztató munkáltatók elégedettségének egyedi és
        átlagos százalékos értéke.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Indikátor kiszámítása:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A szakmai oktatást 12–36 hónappal korábban sikeresen befejezett
            munkavállalókat foglalkoztató munkáltatók elégedettségének egyedi és
            átlagos százalékos értéke, amely megmutatja, hogy mennyire
            elégedettek a szakmai oktatást sikeresen befejezett munkavállalók
            általános munkavállaló kompetenciáival.
          </Typography>

          <Box
            sx={{ mt: 3, p: 2, backgroundColor: "#fff2cc", borderRadius: 1 }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              <strong>Megjegyzés:</strong> A mérés 12-36 hónappal a végzés után
              történik, hogy megfelelő időt biztosítson a munkavállalók
              beilleszkedésére és a kompetenciák gyakorlati alkalmazására.
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
                      minWidth: 250,
                      textAlign: "center",
                    }}
                  >
                    Képzési terület / Szakma
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
                {skillCategories.map((category, index) => (
                  <TableRow
                    key={category.key}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
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
                      {category.label}
                    </TableCell>
                    {schoolYears.map((year) => (
                      <TableCell key={year} align="center">
                        <TextField
                          type="number"
                          value={satisfactionData[category.key]?.[year] || "0"}
                          onChange={(e) =>
                            handleDataChange(category.key, year, e.target.value)
                          }
                          size="small"
                          inputProps={{
                            min: 0,
                            max: 100,
                            step: 0.1,
                            style: { textAlign: "center" },
                          }}
                          sx={{ width: "80px" }}
                          placeholder=""
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

      {/* Additional Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Értékelési szempontok
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A munkáltatói elégedettség mérése a következő kompetenciák alapján
            történik:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                Szakmai tudás és készségek alkalmazása
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Munkavégzési attitűd és megbízhatóság
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Kommunikációs és együttműködési képességek
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Problémamegoldó képesség és kezdeményezőkészség
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Tanulási képesség és fejlődési potenciál
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
              label="Elégedettségi százalék"
              variant="outlined"
              sx={{ backgroundColor: "#e8f4fd" }}
            />
          </Stack>
          <Typography variant="body2">
            Az értékek 0-100% közötti százalékos formában adandók meg. A mérés a
            végzés utáni 12-36 hónapos időszakban foglalkoztatott végzettek
            munkáltatói visszajelzései alapján készül.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
