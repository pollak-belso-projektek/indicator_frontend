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

export default function OrszagosKompetenciameres() {
  // Data structure based on the image
  const [competencyData, setCompetencyData] = useState({
    matematika: {
      technikum: {
        2019: { orszagos: "", intezmenyi: "" },
        2020: { orszagos: "", intezmenyi: "" },
        2021: { orszagos: "", intezmenyi: "" },
        2022: { orszagos: "", intezmenyi: "" },
        2023: { orszagos: "", intezmenyi: "" },
      },
      szakkepzo: {
        2019: { orszagos: "", intezmenyi: "" },
        2020: { orszagos: "", intezmenyi: "" },
        2021: { orszagos: "", intezmenyi: "" },
        2022: { orszagos: "", intezmenyi: "" },
        2023: { orszagos: "", intezmenyi: "" },
      },
    },
    szovegertes: {
      technikum: {
        2019: { orszagos: "", intezmenyi: "" },
        2020: { orszagos: "", intezmenyi: "" },
        2021: { orszagos: "", intezmenyi: "" },
        2022: { orszagos: "", intezmenyi: "" },
        2023: { orszagos: "", intezmenyi: "" },
      },
      szakkepzo: {
        2019: { orszagos: "", intezmenyi: "" },
        2020: { orszagos: "", intezmenyi: "" },
        2021: { orszagos: "", intezmenyi: "" },
        2022: { orszagos: "", intezmenyi: "" },
        2023: { orszagos: "", intezmenyi: "" },
      },
    },
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  const years = [2019, 2020, 2021, 2022, 2023];
  const subjects = [
    { key: "matematika", label: "matematika" },
    { key: "szovegertes", label: "szövegértés" },
  ];
  const formTypes = [
    { key: "technikum", label: "Technikum" },
    { key: "szakkepzo", label: "Szakképző" },
  ];

  // Handle data changes
  const handleDataChange = (subject, formType, year, type, value) => {
    setCompetencyData((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [formType]: {
          ...prev[subject][formType],
          [year]: {
            ...prev[subject][formType][year],
            [type]: value,
          },
        },
      },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(competencyData)));
    setIsModified(false);
    console.log("Saving competency data:", competencyData);
  };

  const handleReset = () => {
    if (savedData) {
      setCompetencyData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Országos kompetenciamérés eredményei
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A vizsgált tanévben megvalósított országos kompetenciamérés
        eredményeinek átlageredményét kell intézménytípus és vizsgált terület
        szerinti bontásban megadni.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Kitöltési útmutató
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Megjegyzés:</strong> A mutató esetén külön kell kimutatni a
            kompetenciamérések vizsgálati területei szerinti eredményt is (pl.
            matematika, olvasás-szövegértés).
          </Typography>
          <Typography variant="body2">
            Az indikátor kitöltésénél az intézménytípusok adatai nem
            összegezhetők (pl. szakképző iskola és technikum).
          </Typography>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Kompetenciamérés eredmények
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
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 120,
                    }}
                  >
                    Mérési terület
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 100,
                    }}
                  >
                    Képzési forma
                  </TableCell>
                  {years.map((year) => (
                    <TableCell
                      key={year}
                      colSpan={2}
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 160 }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {years.map((year) => (
                    <>
                      <TableCell
                        key={`${year}-orszagos`}
                        align="center"
                        sx={{ fontWeight: "bold", minWidth: 80 }}
                      >
                        országos
                      </TableCell>
                      <TableCell
                        key={`${year}-intezmenyi`}
                        align="center"
                        sx={{ fontWeight: "bold", minWidth: 80, color: "red" }}
                      >
                        intézményi
                      </TableCell>
                    </>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject, subjectIndex) =>
                  formTypes.map((formType, formTypeIndex) => (
                    <TableRow key={`${subject.key}-${formType.key}`}>
                      {formTypeIndex === 0 && (
                        <TableCell
                          rowSpan={formTypes.length}
                          sx={{
                            fontWeight: "bold",
                            verticalAlign: "middle",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {subject.label}
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {formType.label}
                      </TableCell>
                      {years.map((year) => (
                        <>
                          <TableCell key={`${year}-orszagos`} align="center">
                            <TextField
                              type="number"
                              value={
                                competencyData[subject.key][formType.key][year]
                                  .orszagos
                              }
                              onChange={(e) =>
                                handleDataChange(
                                  subject.key,
                                  formType.key,
                                  year,
                                  "orszagos",
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
                              sx={{ width: "70px" }}
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell key={`${year}-intezmenyi`} align="center">
                            <TextField
                              type="number"
                              value={
                                competencyData[subject.key][formType.key][year]
                                  .intezmenyi
                              }
                              onChange={(e) =>
                                handleDataChange(
                                  subject.key,
                                  formType.key,
                                  year,
                                  "intezmenyi",
                                  e.target.value
                                )
                              }
                              size="small"
                              inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.1,
                                style: { textAlign: "center", color: "red" },
                              }}
                              sx={{
                                width: "70px",
                                "& .MuiInputBase-input": {
                                  color: "red",
                                },
                              }}
                              placeholder="0"
                            />
                          </TableCell>
                        </>
                      ))}
                    </TableRow>
                  ))
                )}
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

      {/* Legend */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Jelmagyarázat
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip label="országos" variant="outlined" />
            <Chip
              label="intézményi"
              variant="outlined"
              sx={{ color: "red", borderColor: "red" }}
            />
          </Stack>
          <Typography variant="body2">
            Az <strong>országos</strong> oszlopokba az országos
            átlageredményeket, az{" "}
            <strong style={{ color: "red" }}>intézményi</strong> oszlopokba az
            intézmény saját eredményeit kell beírni.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
