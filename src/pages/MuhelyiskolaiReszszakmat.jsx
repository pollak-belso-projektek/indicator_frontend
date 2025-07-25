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
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";

export default function MuhelyiskolaiReszszakmat() {
  const schoolYears = ["2021/2022.", "2022/2023.", "2023/2024.", "2024/2025."];

  // Data structure for the three main sections
  const [workshopData, setWorkshopData] = useState(() => {
    const initialData = {
      percentage_overall: {},
      participants_count: {},
      total_students: {},
    };

    // Initialize all sections with school years
    Object.keys(initialData).forEach((section) => {
      schoolYears.forEach((year) => {
        initialData[section][year] = "0";
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (section, year, value) => {
    setWorkshopData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [year]: value,
      },
    }));
    setIsModified(true);
  };

  // Calculate percentage automatically
  const calculatePercentage = (year) => {
    const participants = parseFloat(workshopData.participants_count[year] || 0);
    const total = parseFloat(workshopData.total_students[year] || 0);

    if (total > 0) {
      const percentage = ((participants / total) * 100).toFixed(1);
      handleDataChange("percentage_overall", year, percentage);
    }
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(workshopData)));
    setIsModified(false);
    console.log("Saving workshop school data:", workshopData);
  };

  const handleReset = () => {
    if (savedData) {
      setWorkshopData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        21. Műhelyiskolában részszakmát szerzők aránya a képzésben résztvevők
        összlétszámához viszonyítva
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adott tanévben a műhelyiskolában tanulói és felnőttképzési jogviszonyú
        tanulók összlétszáma 11 fő.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            ?
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            <strong>Példa:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Adott tanévben a műhelyiskolában tanulói és felnőttképzési
            jogviszonyú tanulók összlétszáma 11 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            A műhelyiskolai képzést részszakma szerzésével befejezők száma 7 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A mutató számítása tehát: (7 fő / 11 fő) * 100 = 63,6%.
          </Typography>

          <Box
            sx={{
              p: 2,
              backgroundColor: "#f0f8ff",
              borderRadius: 1,
              border: "1px solid #90caf9",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic", flex: 1 }}>
              <strong>Számítási képlet:</strong>
              <br />
              (Részszakmát szerző tanulók és felnőttképzési jogviszonyú tanulók
              száma / Műhelyiskolai tanulói és felnőttképzési jogviszonyú
              tanulók összlétszáma) × 100
            </Typography>
            <Box
              sx={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#1976d2",
                textAlign: "center",
                minWidth: "100px",
              }}
            >
              = %
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Data Tables */}

      {/* Percentage Overview Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: "#d32f2f",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Műhelyiskolában részszakmát szerzők aránya (%)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#ffebee" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 200,
                      textAlign: "center",
                      backgroundColor: "#ffcdd2",
                    }}
                  >
                    összesen
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
                <TableRow sx={{ backgroundColor: "#fff3e0" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#ffcc02",
                      color: "#000",
                    }}
                  >
                    összesen
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell key={year} align="center">
                      <TextField
                        type="number"
                        value={workshopData.percentage_overall[year] || "0"}
                        onChange={(e) =>
                          handleDataChange(
                            "percentage_overall",
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
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Participant Count Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: "#1976d2",
              fontWeight: "bold",
            }}
          >
            részszakmát szerző tanulók száma
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tanulói és felnőttképzési jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
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
                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                  {schoolYears.map((year) => (
                    <TableCell key={year} align="center">
                      <TextField
                        type="number"
                        value={workshopData.participants_count[year] || "0"}
                        onChange={(e) =>
                          handleDataChange(
                            "participants_count",
                            year,
                            e.target.value
                          )
                        }
                        size="small"
                        inputProps={{
                          min: 0,
                          step: 1,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "80px" }}
                        placeholder="0"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Total Students Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: "#1976d2",
              fontWeight: "bold",
            }}
          >
            Műhelyiskolai tanulói összlétszám
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tanulói és felnőttképzési jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8f5e8" }}>
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
                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                  {schoolYears.map((year) => (
                    <TableCell key={year} align="center">
                      <TextField
                        type="number"
                        value={workshopData.total_students[year] || "0"}
                        onChange={(e) =>
                          handleDataChange(
                            "total_students",
                            year,
                            e.target.value
                          )
                        }
                        size="small"
                        inputProps={{
                          min: 0,
                          step: 1,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "80px" }}
                        placeholder="0"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Calculation Helper */}
      <Card sx={{ mb: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Automatikus számítás
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Kattintson a számítás gombra az automatikus százalékszámításhoz:
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
            {schoolYears.map((year) => (
              <Button
                key={year}
                variant="outlined"
                startIcon={<CalculateIcon />}
                onClick={() => calculatePercentage(year)}
                size="small"
              >
                {year}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>

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

      {/* Workshop School Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Műhelyiskola képzés jellemzői
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip
              label="Gyakorlati képzés"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Részszakma szerzés"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label="Tanulói jogviszony"
              color="success"
              variant="outlined"
            />
            <Chip
              label="Felnőttképzési jogviszony"
              color="info"
              variant="outlined"
            />
            <Chip
              label="Szakmai kompetenciák"
              color="warning"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2">
            A műhelyiskolai képzés célja a tanulók gyakorlati készségeinek
            fejlesztése és részszakmák megszerzésének támogatása munkahelyi
            környezetben.
          </Typography>
        </CardContent>
      </Card>

      {/* Data Quality Guidelines */}
      <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Adatminőség irányelvek
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Részszakma szerzők:</strong> Csak a képzést sikeresen
                befejező és részszakmát szerző tanulók számítanak bele
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Összlétszám:</strong> Az adott tanévben műhelyiskolai
                képzésben résztvevő összes tanuló
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Jogviszonyok:</strong> Tanulói és felnőttképzési
                jogviszonyú tanulók együttesen
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Időszak:</strong> Tanévenként kell számítani az arányt
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Teljesítmény mutatók
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A műhelyiskolai képzés hatékonyságának értékelési szempontjai:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Befejezési arány:</strong> Magasabb százalék jobb
                teljesítményt jelez
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Trendanalízis:</strong> Évenkénti változások nyomon
                követése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Célérték:</strong> 80% feletti arány tekinthető
                kiválónak
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Benchmarking:</strong> Más intézményekkel való
                összehasonlítás
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
