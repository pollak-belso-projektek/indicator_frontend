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

export default function HatanyosHelyzetuTanulokAranya() {
  const schoolYears = ["2021/2022.", "2022/2023.", "2023/2024.", "2024/2025."];
  const schoolTypes = ["összesen", "technikum+szakképző iskola"];
  const legalStatuses = [
    "tanulói + felnőttképzési jogviszony",
    "Tanulói jogviszony",
    "Felnőttképzési jogviszony",
  ];

  // Data structure for the main sections
  const [hhData, setHhData] = useState(() => {
    const initialData = {
      hh_percentage: {},
      hh_students: {},
      total_students: {},
    };

    // Initialize all sections
    Object.keys(initialData).forEach((section) => {
      schoolTypes.forEach((type) => {
        initialData[section][type] = {};
        legalStatuses.forEach((status) => {
          initialData[section][type][status] = {};
          schoolYears.forEach((year) => {
            initialData[section][type][status][year] = "0";
          });
        });
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (section, type, status, year, value) => {
    setHhData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: {
          ...prev[section][type],
          [status]: {
            ...prev[section][type][status],
            [year]: value,
          },
        },
      },
    }));
    setIsModified(true);
  };

  // Calculate percentage automatically
  const calculatePercentage = (type, status, year) => {
    const hhStudents = parseFloat(hhData.hh_students[type][status][year] || 0);
    const total = parseFloat(hhData.total_students[type][status][year] || 0);

    if (total > 0) {
      const percentage = ((hhStudents / total) * 100).toFixed(2);
      handleDataChange("hh_percentage", type, status, year, percentage);
    }
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(hhData)));
    setIsModified(false);
    console.log("Saving HH students data:", hhData);
  };

  const handleReset = () => {
    if (savedData) {
      setHhData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  // Render a complex table section
  const renderTableSection = (
    sectionKey,
    title,
    subtitle,
    unit,
    bgColor = "#f5f5f5"
  ) => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: sectionKey === "hh_percentage" ? "#d32f2f" : "#1976d2",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: "center" }}
          >
            {subtitle}
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: bgColor }}>
                  <TableCell
                    rowSpan={2}
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
                  <TableCell
                    rowSpan={2}
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
                        minWidth: 100,
                        backgroundColor: "#e8f4fd",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {schoolTypes.map((type) =>
                  legalStatuses.map((status, statusIndex) => (
                    <TableRow
                      key={`${type}-${status}`}
                      sx={{
                        backgroundColor:
                          type === "összesen" && statusIndex === 0
                            ? "#ffcc02"
                            : "#f9f9f9",
                      }}
                    >
                      {statusIndex === 0 && (
                        <TableCell
                          rowSpan={legalStatuses.length}
                          sx={{
                            fontWeight: "bold",
                            textAlign: "center",
                            backgroundColor:
                              type === "összesen" ? "#ffcc02" : "#f5f5f5",
                            color: "#000",
                            verticalAlign: "middle",
                          }}
                        >
                          {type}
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "left",
                          backgroundColor: "#f5f5f5",
                          fontSize: "0.8rem",
                        }}
                      >
                        {status}
                      </TableCell>
                      {schoolYears.map((year) => (
                        <TableCell key={year} align="center">
                          <TextField
                            type="number"
                            value={
                              hhData[sectionKey][type]?.[status]?.[year] || "0"
                            }
                            onChange={(e) =>
                              handleDataChange(
                                sectionKey,
                                type,
                                status,
                                year,
                                e.target.value
                              )
                            }
                            size="small"
                            inputProps={{
                              min: 0,
                              max:
                                sectionKey === "hh_percentage"
                                  ? 100
                                  : undefined,
                              step: sectionKey === "hh_percentage" ? 0.01 : 1,
                              style: { textAlign: "center" },
                            }}
                            sx={{ width: "80px" }}
                            placeholder={
                              sectionKey === "hh_percentage" ? "0-100" : "0"
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hátrányos helyzetű tanulók aránya a teljes tanulói létszámhoz
        viszonyítva
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adott tanévben a jogviszonnyal rendelkező tanulói jogviszonyú tanulók
        létszáma (tanulói összlétszám) 1024 fő.
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
            Adott tanévben a jogviszonnyal rendelkező tanulói jogviszonyú
            tanulók létszáma (tanulói összlétszám) 1024 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            A hátrányos helyzetű tanulók száma ugyanebben a tanévben 77 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            A mutató számítása tehát: (77 fő / 1024 fő) * 100 = 7,52%.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Megjegyzés:</strong> Elágendő lenne a H-K oszlopokban lévő
            érték ehhez az indikátorral, azonban a Centrum vizsgálja a
            felnőttképzési jogviszonyú is
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
              (HH tanulói jogviszonyú tanulók száma / tanulói jogviszonyú
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

      {/* HH Students Percentage Tables */}
      {renderTableSection(
        "hh_percentage",
        "HH tanulók aránya",
        "Tanulói jogviszony (%)",
        "%",
        "#ffebee"
      )}

      {/* HH Students Count Tables */}
      {renderTableSection(
        "hh_students",
        "HH tanulók száma",
        "Tanulói jogviszony (fő)",
        "fő",
        "#e3f2fd"
      )}

      {/* Total Students Tables */}
      {renderTableSection(
        "total_students",
        "tanulói összlétszám",
        "Tanulói jogviszony (fő)",
        "fő",
        "#e8f5e8"
      )}

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
            <Box key={type} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                {type}:
              </Typography>
              {legalStatuses.map((status) => (
                <Box key={status} sx={{ mb: 2, ml: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontSize: "0.9rem" }}
                  >
                    {status}:
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", ml: 2 }}
                  >
                    {schoolYears.map((year) => (
                      <Button
                        key={year}
                        variant="outlined"
                        startIcon={<CalculateIcon />}
                        onClick={() => calculatePercentage(type, status, year)}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {year}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              ))}
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

      {/* HH/HHH Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Hátrányos és halmozottan hátrányos helyzet kategóriák
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip
              label="HH - Hátrányos helyzetű"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="HHH - Halmozottan hátrányos helyzetű"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label="Alacsony jövedelem"
              color="success"
              variant="outlined"
            />
            <Chip
              label="Alacsony iskolázottság"
              color="info"
              variant="outlined"
            />
            <Chip label="Munkanélküliség" color="warning" variant="outlined" />
            <Chip
              label="Lakhatási problémák"
              color="error"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Hátrányos helyzetű (HH):</strong> A tanuló olyan családban
            él, ahol legalább az egyik feltétel teljesül a jogszabályban
            meghatározottak szerint.
          </Typography>
          <Typography variant="body2">
            <strong>Halmozottan hátrányos helyzetű (HHH):</strong> A tanuló
            olyan családban él, ahol több hátrányos feltétel együttesen van
            jelen.
          </Typography>
        </CardContent>
      </Card>

      {/* Legal Framework */}
      <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Jogszabályi háttér
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Hátrányos helyzet megállapítása:</strong> A jegyző
                hatáskörébe tartozó eljárás alapján
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Feltételek:</strong> Alacsony jövedelem, alacsony
                iskolázottság, kedvezőtlen lakókörnyezet
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Támogatások:</strong> Különböző szociális és oktatási
                támogatási formák
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Nyilvántartás:</strong> Kötelező a hátrányos helyzet
                nyilvántartása és dokumentálása
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Support Programs */}
      <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Támogatási programok
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Tankönyv- és tanszertámogatás:</strong> Ingyenes vagy
                kedvezményes taneszközök biztosítása
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Étkezési támogatás:</strong> Ingyenes vagy kedvezményes
                étkezés biztosítása
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Felzárkóztató programok:</strong> Speciális fejlesztő és
                támogató foglalkozások
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Mentorálás:</strong> Egyéni támogatás és útmutatás
                biztosítása
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Data Quality Guidelines */}
      <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Adatminőség irányelvek
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>HH/HHH státusz:</strong> Csak hivatalosan megállapított
                státusz alapján lehet számítani
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Jogviszony típusok:</strong> Tanulói és felnőttképzési
                jogviszony külön kezelendő
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
                <strong>Adatvédelem:</strong> Különös figyelmet kell fordítani a
                személyes adatok védelmére
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
