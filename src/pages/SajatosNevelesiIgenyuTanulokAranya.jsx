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

export default function SajatosNevelesiIgenyuTanulokAranya() {
  const schoolYears = ["2021/2022.", "2022/2023.", "2023/2024.", "2024/2025."];
  const schoolTypes = ["összesen", "technikum+szakképző iskola"];

  // Data structure for the three main sections
  const [sniData, setSniData] = useState(() => {
    const initialData = {
      percentage_overall: {},
      sni_students: {},
      total_students: {},
    };

    // Initialize all sections with school years and types
    Object.keys(initialData).forEach((section) => {
      schoolTypes.forEach((type) => {
        initialData[section][type] = {};
        schoolYears.forEach((year) => {
          initialData[section][type][year] = "0";
        });
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (section, type, year, value) => {
    setSniData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: {
          ...prev[section][type],
          [year]: value,
        },
      },
    }));
    setIsModified(true);
  };

  // Calculate percentage automatically
  const calculatePercentage = (type, year) => {
    const sniStudents = parseFloat(sniData.sni_students[type][year] || 0);
    const total = parseFloat(sniData.total_students[type][year] || 0);

    if (total > 0) {
      const percentage = ((sniStudents / total) * 100).toFixed(2);
      handleDataChange("percentage_overall", type, year, percentage);
    }
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(sniData)));
    setIsModified(false);
    console.log("Saving SNI students data:", sniData);
  };

  const handleReset = () => {
    if (savedData) {
      setSniData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sajátos nevelési igényű tanulók aránya a teljes tanulói létszámhoz
        viszonyítva
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adott tanévben a tanulói jogviszonnyal rendelkező tanulók létszáma
        (tanulói összlétszám) 938 fő.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            ? Esetleg tanuló export
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            <strong>Példa:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Adott tanévben a tanulói jogviszonnyal rendelkező tanulók létszáma
            (tanulói összlétszám) 938 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            A sajátos nevelési igényű tanulók száma ugyanebben a tanévben 102
            fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A mutató számítása tehát: (102 fő / 938 fő) * 100 = 10,87%.
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
              (SNI tanulói jogviszonyú tanulók száma / tanulói jogviszonyú
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

      {/* SNI Students Percentage Table */}
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
            SNI tanulók aránya
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Tanulói jogviszony (%)
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
                    {/* Empty header cell */}
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
                {schoolTypes.map((type) => (
                  <TableRow
                    key={type}
                    sx={{
                      backgroundColor:
                        type === "összesen" ? "#ffcc02" : "#fff3e0",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "left",
                        backgroundColor:
                          type === "összesen" ? "#ffcc02" : "#f5f5f5",
                        color: "#000",
                      }}
                    >
                      {type}
                    </TableCell>
                    {schoolYears.map((year) => (
                      <TableCell key={year} align="center">
                        <TextField
                          type="number"
                          value={
                            sniData.percentage_overall[type]?.[year] || "0"
                          }
                          onChange={(e) =>
                            handleDataChange(
                              "percentage_overall",
                              type,
                              year,
                              e.target.value
                            )
                          }
                          size="small"
                          inputProps={{
                            min: 0,
                            max: 100,
                            step: 0.01,
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
        </CardContent>
      </Card>

      {/* SNI Students Count Table */}
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
            SNI tanulók száma
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tanulói jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 200,
                      textAlign: "center",
                      backgroundColor: "#bbdefb",
                    }}
                  >
                    {/* Empty header cell */}
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
                {schoolTypes.map((type) => (
                  <TableRow key={type} sx={{ backgroundColor: "#f9f9f9" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "left",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      {type}
                    </TableCell>
                    {schoolYears.map((year) => (
                      <TableCell key={year} align="center">
                        <TextField
                          type="number"
                          value={sniData.sni_students[type]?.[year] || "0"}
                          onChange={(e) =>
                            handleDataChange(
                              "sni_students",
                              type,
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
                ))}
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
            Tanulói jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8f5e8" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 200,
                      textAlign: "center",
                      backgroundColor: "#c8e6c8",
                    }}
                  >
                    {/* Empty header cell */}
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
                {schoolTypes.map((type) => (
                  <TableRow key={type} sx={{ backgroundColor: "#f9f9f9" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "left",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      {type}
                    </TableCell>
                    {schoolYears.map((year) => (
                      <TableCell key={year} align="center">
                        <TextField
                          type="number"
                          value={sniData.total_students[type]?.[year] || "0"}
                          onChange={(e) =>
                            handleDataChange(
                              "total_students",
                              type,
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
                ))}
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
          {schoolTypes.map((type) => (
            <Box key={type} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                {type}:
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                {schoolYears.map((year) => (
                  <Button
                    key={year}
                    variant="outlined"
                    startIcon={<CalculateIcon />}
                    onClick={() => calculatePercentage(type, year)}
                    size="small"
                  >
                    {year}
                  </Button>
                ))}
              </Stack>
            </Box>
          ))}
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

      {/* SNI Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Sajátos nevelési igény (SNI) kategóriák
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip
              label="Értelmi fogyatékosság"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Mozgásfogyatékosság"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label="Érzékszervi fogyatékosság"
              color="success"
              variant="outlined"
            />
            <Chip label="Beszédfogyatékosság" color="info" variant="outlined" />
            <Chip
              label="Autizmus spektrum zavar"
              color="warning"
              variant="outlined"
            />
            <Chip
              label="Egyéb pszichés fejlődési zavar"
              color="error"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2">
            A sajátos nevelési igényű tanulók olyan tanulók, akiknek testi,
            érzékszervi, értelmi vagy beszédfogyatékosságuk, több fogyatékosság
            együttes előfordulása, autizmus spektrum zavaruk, vagy egyéb
            pszichés fejlődési zavaruk van.
          </Typography>
        </CardContent>
      </Card>

      {/* Support Services */}
      <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Támogatási szolgáltatások
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Egyéni fejlesztés:</strong> Személyre szabott
                fejlesztési tervek és foglalkozások
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Segédeszközök:</strong> Speciális tanulási és
                kommunikációs eszközök biztosítása
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Habilitációs-rehabilitációs foglalkozások:</strong>{" "}
                Szakspecifikus terápiás tevékenységek
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Integrált oktatás:</strong> Befogadó környezet
                kialakítása és fenntartása
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
                <strong>SNI megállapítás:</strong> Csak szakértői bizottság
                által megállapított SNI tanulók számítanak
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Jogviszony típusa:</strong> Tanulói jogviszony (nem
                felnőttképzés)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Iskola típusok:</strong> Összesen és technikum+szakképző
                iskola külön kategóriában
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Időszak:</strong> Tanévi átlagos létszám alapján
                számítva
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Inclusion Metrics */}
      <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Inklúziós mutatók
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Az SNI tanulók arányának értékelési szempontjai:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Befogadó kapacitás:</strong> Az intézmény inklúziós
                képességének mértéke
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Szakmai felkészültség:</strong> SNI pedagógusok és
                szakemberek aránya
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Infrastrukturális feltételek:</strong> Akadálymentesítés
                és speciális eszközök
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Egyéni haladás:</strong> SNI tanulók fejlődésének nyomon
                követése
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
