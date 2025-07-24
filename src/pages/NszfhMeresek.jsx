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

export default function NszfhMeresek() {
  // Data structure based on the NSZFH measurements requirements
  const [measurementData, setMeasurementData] = useState({
    technikum_összesen: {
      matematika: {
        "25_alatt": { bemeneti: "0", kimeneti: "0" },
        "25-40": { bemeneti: "0", kimeneti: "0" },
        "40-60": { bemeneti: "0", kimeneti: "0" },
        "60-80": { bemeneti: "0", kimeneti: "0" },
        "80_folott": { bemeneti: "0", kimeneti: "0" },
      },
      anyanyelv: {
        "25_alatt": { bemeneti: "0", kimeneti: "0" },
        "25-40": { bemeneti: "0", kimeneti: "0" },
        "40-60": { bemeneti: "0", kimeneti: "0" },
        "60-80": { bemeneti: "0", kimeneti: "0" },
        "80_folott": { bemeneti: "0", kimeneti: "0" },
      },
    },
    szakma_megnevezése: {
      matematika: {
        "25_alatt": { bemeneti: "0", kimeneti: "0" },
        "25-40": { bemeneti: "0", kimeneti: "0" },
        "40-60": { bemeneti: "0", kimeneti: "0" },
        "60-80": { bemeneti: "0", kimeneti: "0" },
        "80_folott": { bemeneti: "0", kimeneti: "0" },
      },
      anyanyelv: {
        "25_alatt": { bemeneti: "0", kimeneti: "0" },
        "25-40": { bemeneti: "0", kimeneti: "0" },
        "40-60": { bemeneti: "0", kimeneti: "0" },
        "60-80": { bemeneti: "0", kimeneti: "0" },
        "80_folott": { bemeneti: "0", kimeneti: "0" },
      },
    },
    szakképző_iskola_összesen: {
      matematika: {
        "25_alatt": { bemeneti: "0", kimeneti: "0" },
        "25-40": { bemeneti: "0", kimeneti: "0" },
        "40-60": { bemeneti: "0", kimeneti: "0" },
        "60-80": { bemeneti: "0", kimeneti: "0" },
        "80_folott": { bemeneti: "0", kimeneti: "0" },
      },
      anyanyelv: {
        "25_alatt": { bemeneti: "0", kimeneti: "0" },
        "25-40": { bemeneti: "0", kimeneti: "0" },
        "40-60": { bemeneti: "0", kimeneti: "0" },
        "60-80": { bemeneti: "0", kimeneti: "0" },
        "80_folott": { bemeneti: "0", kimeneti: "0" },
      },
    },
  });

  const [totalStudents, setTotalStudents] = useState({
    technikum_összesen: { matematika: "0", anyanyelv: "0" },
    szakma_megnevezése: { matematika: "0", anyanyelv: "0" },
    szakképző_iskola_összesen: { matematika: "0", anyanyelv: "0" },
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  const institutionTypes = [
    { key: "technikum_összesen", label: "technikum összesen" },
    { key: "szakma_megnevezése", label: "szakma megnevezése" },
    { key: "szakképző_iskola_összesen", label: "szakképző iskola összesen" },
  ];

  const competencyAreas = [
    { key: "matematika", label: "matematika" },
    { key: "anyanyelv", label: "anyanyelv" },
  ];

  const performanceBands = [
    { key: "25_alatt", label: "25 % alatt" },
    { key: "25-40", label: "25-40" },
    { key: "40-60", label: "40-60" },
    { key: "60-80", label: "60-80" },
    { key: "80_folott", label: "80 % fölött" },
  ];

  const measurementTypes = [
    { key: "bemeneti", label: "bemeneti mérés" },
    { key: "kimeneti", label: "kimeneti mérés" },
  ];

  // Handle data changes
  const handleDataChange = (
    institutionType,
    competencyArea,
    band,
    measurementType,
    value
  ) => {
    setMeasurementData((prev) => ({
      ...prev,
      [institutionType]: {
        ...prev[institutionType],
        [competencyArea]: {
          ...prev[institutionType][competencyArea],
          [band]: {
            ...prev[institutionType][competencyArea][band],
            [measurementType]: value,
          },
        },
      },
    }));
    setIsModified(true);
  };

  // Handle total students data changes
  const handleTotalStudentsChange = (
    institutionType,
    competencyArea,
    value
  ) => {
    setTotalStudents((prev) => ({
      ...prev,
      [institutionType]: {
        ...prev[institutionType],
        [competencyArea]: value,
      },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    const dataToSave = {
      measurementData,
      totalStudents,
    };
    setSavedData(JSON.parse(JSON.stringify(dataToSave)));
    setIsModified(false);
    console.log("Saving NSZFH measurement data:", dataToSave);
  };

  const handleReset = () => {
    if (savedData) {
      setMeasurementData(JSON.parse(JSON.stringify(savedData.measurementData)));
      setTotalStudents(JSON.parse(JSON.stringify(savedData.totalStudents)));
      setIsModified(false);
    }
  };

  const getRowSpan = (institutionIndex, competencyIndex) => {
    if (competencyIndex === 0) {
      return competencyAreas.length;
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        NSZFH mérések eredményei
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A vizsgált tanévben megvalósított mérés eredményeinek
        intézménytípusonkénti összegzése.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Vizsgálati lehetőségek
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • 25% alatt teljesítő tanulók aránya az összes vizsgálatban részt
            vett tanulóhoz viszonyítva intézménytípusonként,
            kompetenciaterületenként (anyanyelv, matematika)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • 25 és 80% között teljesítő tanulók aránya az összes vizsgálatban
            részt vett tanulóhoz viszonyítva intézménytípusonként,
            kompetenciaterületenként (anyanyelv, matematika)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Példa:</strong> Az intézményben 25% alatt teljesítők száma
            12, a mérésben résztvevők száma 186. A mutató számítása: 12/186*100=
            6,45%
          </Typography>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Összetétszámhoz viszonyítva (%)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            2021/2022
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
                      minWidth: 150,
                      textAlign: "center",
                    }}
                  >
                    Intézménytípus
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 120,
                      textAlign: "center",
                    }}
                  >
                    Kompetenciaterület
                  </TableCell>
                  {performanceBands.map((band) => (
                    <TableCell
                      key={band.key}
                      colSpan={2}
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 140 }}
                    >
                      {band.label}
                    </TableCell>
                  ))}
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 100,
                      textAlign: "center",
                    }}
                  >
                    9. évfolyamos tanulói összetétszám (fő)
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {performanceBands.map((band) => (
                    <>
                      <TableCell
                        key={`${band.key}-bemeneti`}
                        align="center"
                        sx={{ fontWeight: "bold", minWidth: 70 }}
                      >
                        bemeneti mérés
                      </TableCell>
                      <TableCell
                        key={`${band.key}-kimeneti`}
                        align="center"
                        sx={{ fontWeight: "bold", minWidth: 70 }}
                      >
                        kimeneti mérés
                      </TableCell>
                    </>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {institutionTypes.map((institution, institutionIndex) =>
                  competencyAreas.map((competency, competencyIndex) => (
                    <TableRow
                      key={`${institution.key}-${competency.key}`}
                      sx={{
                        backgroundColor:
                          institutionIndex === 0
                            ? competencyIndex % 2 === 0
                              ? "#fff2cc"
                              : "#fff2cc" // light yellow for technikum
                            : institutionIndex === 1
                            ? competencyIndex % 2 === 0
                              ? "#d5e8d4"
                              : "#d5e8d4" // light green for szakma
                            : competencyIndex % 2 === 0
                            ? "#e8f4fd"
                            : "#e8f4fd", // light blue for szakképző
                        "&:hover": {
                          backgroundColor:
                            institutionIndex === 0
                              ? "#ffe6b3"
                              : institutionIndex === 1
                              ? "#c8dcc8"
                              : "#d4e6f1",
                        },
                      }}
                    >
                      {competencyIndex === 0 && (
                        <TableCell
                          rowSpan={competencyAreas.length}
                          sx={{
                            fontWeight: "bold",
                            verticalAlign: "middle",
                            borderRight: "1px solid #e0e0e0",
                            textAlign: "center",
                          }}
                        >
                          {institution.label}
                        </TableCell>
                      )}
                      <TableCell
                        sx={{ fontWeight: "medium", textAlign: "center" }}
                      >
                        {competency.label}
                      </TableCell>
                      {performanceBands.map((band) => (
                        <>
                          <TableCell
                            key={`${band.key}-bemeneti`}
                            align="center"
                          >
                            <TextField
                              type="number"
                              value={
                                measurementData[institution.key][
                                  competency.key
                                ][band.key].bemeneti
                              }
                              onChange={(e) =>
                                handleDataChange(
                                  institution.key,
                                  competency.key,
                                  band.key,
                                  "bemeneti",
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
                              sx={{ width: "60px" }}
                              placeholder=""
                            />
                          </TableCell>
                          <TableCell
                            key={`${band.key}-kimeneti`}
                            align="center"
                          >
                            <TextField
                              type="number"
                              value={
                                measurementData[institution.key][
                                  competency.key
                                ][band.key].kimeneti
                              }
                              onChange={(e) =>
                                handleDataChange(
                                  institution.key,
                                  competency.key,
                                  band.key,
                                  "kimeneti",
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
                              sx={{ width: "60px" }}
                              placeholder=""
                            />
                          </TableCell>
                        </>
                      ))}
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={totalStudents[institution.key][competency.key]}
                          onChange={(e) =>
                            handleTotalStudentsChange(
                              institution.key,
                              competency.key,
                              e.target.value
                            )
                          }
                          size="small"
                          inputProps={{
                            min: 0,
                            style: { textAlign: "center" },
                          }}
                          sx={{ width: "80px" }}
                          placeholder=""
                        />
                      </TableCell>
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
            <Chip label="bemeneti mérés" variant="outlined" />
            <Chip label="kimeneti mérés" variant="outlined" />
          </Stack>
          <Typography variant="body2">
            A táblázat a tanulók teljesítményét mutatja százalékos megoszlásban
            az egyes teljesítménysávokban, intézménytípus és kompetenciaterület
            szerint bontva.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
