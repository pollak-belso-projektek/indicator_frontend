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

export default function DobbantoProgramAránya() {
  const schoolYears = ["2021/2022.", "2022/2023.", "2023/2024.", "2024/2025."];

  // Data structure for the three main sections
  const [dobbantoData, setDobbantoData] = useState(() => {
    const initialData = {
      percentage_overall: {},
      dobbanto_students: {},
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
    setDobbantoData((prev) => ({
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
    const dobbantoStudents = parseFloat(
      dobbantoData.dobbanto_students[year] || 0
    );
    const total = parseFloat(dobbantoData.total_students[year] || 0);

    if (total > 0) {
      const percentage = ((dobbantoStudents / total) * 100).toFixed(1);
      handleDataChange("percentage_overall", year, percentage);
    }
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(dobbantoData)));
    setIsModified(false);
    console.log("Saving Dobbantó program data:", dobbantoData);
  };

  const handleReset = () => {
    if (savedData) {
      setDobbantoData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dobbantó programban tanulók aránya a teljes létszámhoz viszonyítva [%]
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adott tanévben a tanulói jogviszonnyal rendelkező tanulók létszáma
        (tanulói összlétszám) 562 fő.
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
            Adott tanévben a tanulói jogviszonnyal rendelkező tanulók létszáma
            (tanulói összlétszám) 562 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            A Dobbantó programban tanulói és felnőttképzési jogviszonyú tanulók
            száma ugyanebben a tanévben 32 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A mutató számítása tehát: (32 fő / 562 fő) * 100 = 5,69%.
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
              (Dobbantó programban tanulói és felnőttképzési jogviszonyú tanulók
              száma / tanulói és felnőttképzési jogviszonyú tanulók
              összlétszáma) × 100
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
            Dobbantó programban tanulók aránya
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Tanulói és felnőttképzési jogviszony (%)
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
                        value={dobbantoData.percentage_overall[year] || "0"}
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

      {/* Dobbantó Students Count Table */}
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
            Dobbantó programban tanulók száma
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
                        value={dobbantoData.dobbanto_students[year] || "0"}
                        onChange={(e) =>
                          handleDataChange(
                            "dobbanto_students",
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
            tanulói összlétszám
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
                        value={dobbantoData.total_students[year] || "0"}
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

      {/* Dobbantó Program Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Dobbantó program jellemzői
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip label="Felzárkóztatás" color="primary" variant="outlined" />
            <Chip
              label="Alapkészségek fejlesztése"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label="Tanulási nehézségek kezelése"
              color="success"
              variant="outlined"
            />
            <Chip label="Egyéni fejlesztés" color="info" variant="outlined" />
            <Chip label="Mentorálás" color="warning" variant="outlined" />
            <Chip label="Támogatott tanulás" color="error" variant="outlined" />
          </Box>
          <Typography variant="body2">
            A Dobbantó program célja a tanulási nehézségekkel küzdő tanulók
            felzárkóztatása, alapkészségeik fejlesztése és iskolai sikerességük
            támogatása.
          </Typography>
        </CardContent>
      </Card>

      {/* Program Goals */}
      <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Program célkitűzései
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Alapkészségek fejlesztése:</strong> Olvasás, írás,
                számolás készségeinek erősítése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Lemorzsolódás csökkentése:</strong> Tanulók iskolában
                tartása és motiválása
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Egyéni támogatás:</strong> Személyre szabott fejlesztési
                tervek készítése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Szociális kompetenciák:</strong> Társas készségek és
                önbizalom fejlesztése
              </Typography>
            </li>
          </Box>
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
                <strong>Dobbantó programban résztvevők:</strong> Csak az aktívan
                részt vevő tanulók számítanak bele
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Összlétszám:</strong> Az adott tanévben nyilvántartott
                összes tanuló (tanulói és felnőttképzési jogviszony)
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
            A Dobbantó program hatékonyságának értékelési szempontjai:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Részvételi arány:</strong> A program iránti igény és
                elérhetőség mértéke
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
                <strong>Célcsoport lefedettség:</strong> Rászoruló tanulók
                arányának értékelése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Hatékonyság mérése:</strong> Program eredményességének
                nyomon követése
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
