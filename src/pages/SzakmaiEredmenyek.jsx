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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";

export default function SzakmaiEredmenyek() {
  // Predefined competition categories and names
  const competitionCategories = {
    "Nemzetközi szakmai verseny": ["WorldSkills", "Euroskills"],
    "Nemzetközi közismereti verseny": [],
    "Nemzetközi sportverseny": [],
    "Hazai országos szakmai tanulmányi versenyek": [
      "SZKTV",
      "SZÉTV",
      "OSZTV",
      "egyéb országos szakmai versenyek",
    ],
    "Regionális, vármegyei szakmai tanulmányi verseny": ["OKTV", "OSZKTV"],
    "Országos Közismereti Tanulmányi Verseny": [
      "Implom József helyesírási verseny",
      "Nemzetközi Kenguru Matematika Verseny",
      "Zrínyi Ilona Matematikaverseny",
      "egyéb országos közismereti tanulmányi verseny",
    ],
    "Regionális, vármegyei közismereti tanulmányi verseny": [],
    "Emlékévhez kapcsolódó országos műveltségi versenyek": [
      "(jogszabályban megfogalmazott emlékév-pl. Petőfi 200)",
    ],
    "Hazai országos sportversenyek": ["Diákolimpia", "Országos sportverseny"],
    "Hazai, vármegyei sportversenyek": [],
  };

  const schoolYears = generateSchoolYears();
  const placementTypes = [
    { key: "1_helyezes", label: "1. helyezés", color: "#FFD700" },
    { key: "1-3_helyezes", label: "1-3. helyezés", color: "#C0C0C0" },
    {
      key: "1-10_helyezes",
      label: "1-10. helyezés/döntőbe jutás",
      color: "#CD7F32",
    },
    {
      key: "versenyre_nevezettek",
      label: "Versenyre nevezettek száma",
      color: "#E8E8E8",
    },
  ];

  // Initialize competition data
  const [competitionData, setCompetitionData] = useState(() => {
    const initialData = {};

    Object.keys(competitionCategories).forEach((category) => {
      initialData[category] = {};

      competitionCategories[category].forEach((competition) => {
        initialData[category][competition] = {};
        schoolYears.forEach((year) => {
          initialData[category][competition][year] = {};
          placementTypes.forEach((placement) => {
            initialData[category][competition][year][placement.key] = "0";
          });
        });
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    category: "",
    name: "",
  });

  // Handle data changes
  const handleDataChange = (category, competition, year, placement, value) => {
    setCompetitionData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [competition]: {
          ...prev[category][competition],
          [year]: {
            ...prev[category][competition][year],
            [placement]: value,
          },
        },
      },
    }));
    setIsModified(true);
  };

  // Add new competition
  const handleAddCompetition = () => {
    if (newCompetition.category && newCompetition.name) {
      const updatedData = { ...competitionData };

      if (!updatedData[newCompetition.category]) {
        updatedData[newCompetition.category] = {};
      }

      updatedData[newCompetition.category][newCompetition.name] = {};
      schoolYears.forEach((year) => {
        updatedData[newCompetition.category][newCompetition.name][year] = {};
        placementTypes.forEach((placement) => {
          updatedData[newCompetition.category][newCompetition.name][year][
            placement.key
          ] = "0";
        });
      });

      setCompetitionData(updatedData);
      setOpenAddDialog(false);
      setNewCompetition({ category: "", name: "" });
      setIsModified(true);
    }
  };

  // Remove competition
  const handleRemoveCompetition = (category, competition) => {
    const updatedData = { ...competitionData };
    delete updatedData[category][competition];
    setCompetitionData(updatedData);
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(competitionData)));
    setIsModified(false);
    console.log("Saving competition data:", competitionData);
  };

  const handleReset = () => {
    if (savedData) {
      setCompetitionData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = {};
    schoolYears.forEach((year) => {
      totals[year] = {};
      placementTypes.forEach((placement) => {
        let sum = 0;
        Object.keys(competitionData).forEach((category) => {
          Object.keys(competitionData[category]).forEach((competition) => {
            const value = parseInt(
              competitionData[category][competition][year]?.[placement.key] || 0
            );
            sum += value;
          });
        });
        totals[year][placement.key] = sum;
      });
    });
    return totals;
  };

  const totals = calculateTotals();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Szakmai, közismereti, kulturális és sporteredmények
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        (nemzetközi, országos, regionális, megyei és település szinten)
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Az eredmények tanévenkénti bemutatása és a tanévenkénti eredmények
        összehasonlítása nemzetközi, országos, regionális, megyei és település
        szinten.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Megjegyzés
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Az indikátor számításánál figyelembe vehetők a tanulói és a
            felnőttképzési jogviszonyban elért eredmények egyaránt.
          </Typography>
          <Typography variant="body2">
            <strong>Kérdés:</strong> Itt szóba jöhet az, hogy új versenyt visz
            majd fel valaki, vagy az egyébhez írja be mindenki?
          </Typography>
        </CardContent>
      </Card>

      {/* Add Competition Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Új verseny hozzáadása
        </Button>
      </Box>

      {/* Main Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Versenyek eredményei
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
                      minWidth: 300,
                      textAlign: "center",
                    }}
                  >
                    Verseny megnevezése
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      colSpan={placementTypes.length}
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 300 }}
                    >
                      {year}
                    </TableCell>
                  ))}
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 60,
                      textAlign: "center",
                    }}
                  >
                    Műveletek
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {schoolYears.map((year) =>
                    placementTypes.map((placement) => (
                      <TableCell
                        key={`${year}-${placement.key}`}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          minWidth: 70,
                          backgroundColor: placement.color,
                          fontSize: "0.75rem",
                        }}
                      >
                        {placement.label}
                        <br />
                        (fő)
                      </TableCell>
                    ))
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(competitionData).map((category) => {
                  const competitions = Object.keys(competitionData[category]);
                  return competitions.map((competition, competitionIndex) => (
                    <TableRow key={`${category}-${competition}`}>
                      <TableCell sx={{ fontWeight: "medium", pl: 2 }}>
                        {competitionIndex === 0 && (
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "bold", mb: 1 }}
                          >
                            {category}
                          </Typography>
                        )}
                        <Box sx={{ pl: competitionIndex === 0 ? 2 : 4 }}>
                          {competition}
                        </Box>
                      </TableCell>
                      {schoolYears.map((year) =>
                        placementTypes.map((placement) => (
                          <TableCell
                            key={`${year}-${placement.key}`}
                            align="center"
                          >
                            <TextField
                              type="number"
                              value={
                                competitionData[category][competition][year]?.[
                                  placement.key
                                ] || "0"
                              }
                              onChange={(e) =>
                                handleDataChange(
                                  category,
                                  competition,
                                  year,
                                  placement.key,
                                  e.target.value
                                )
                              }
                              size="small"
                              inputProps={{
                                min: 0,
                                style: { textAlign: "center" },
                              }}
                              sx={{ width: "60px" }}
                            />
                          </TableCell>
                        ))
                      )}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleRemoveCompetition(category, competition)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ));
                })}

                {/* Totals Row */}
                <TableRow
                  sx={{ backgroundColor: "#fff2cc", fontWeight: "bold" }}
                >
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                    Összesen
                  </TableCell>
                  {schoolYears.map((year) =>
                    placementTypes.map((placement) => (
                      <TableCell
                        key={`total-${year}-${placement.key}`}
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        {totals[year]?.[placement.key] || 0}
                      </TableCell>
                    ))
                  )}
                  <TableCell></TableCell>
                </TableRow>

                {/* Summary Row */}
                <TableRow sx={{ backgroundColor: "#e8f4fd" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Tanulói jogviszonyban álló tanulók száma (fő)
                  </TableCell>
                  {schoolYears.map((year) =>
                    placementTypes.map((placement) => (
                      <TableCell
                        key={`summary-${year}-${placement.key}`}
                        align="center"
                      >
                        <TextField
                          type="number"
                          size="small"
                          inputProps={{
                            min: 0,
                            style: { textAlign: "center" },
                          }}
                          sx={{ width: "60px" }}
                          placeholder="0"
                        />
                      </TableCell>
                    ))
                  )}
                  <TableCell></TableCell>
                </TableRow>
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

      {/* Add Competition Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Új verseny hozzáadása</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Kategória</InputLabel>
              <Select
                value={newCompetition.category}
                onChange={(e) =>
                  setNewCompetition({
                    ...newCompetition,
                    category: e.target.value,
                  })
                }
                label="Kategória"
              >
                {Object.keys(competitionCategories).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Verseny neve"
              value={newCompetition.name}
              onChange={(e) =>
                setNewCompetition({ ...newCompetition, name: e.target.value })
              }
              placeholder="pl. Új verseny neve"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Mégse</Button>
          <Button
            onClick={handleAddCompetition}
            variant="contained"
            disabled={!newCompetition.category || !newCompetition.name}
          >
            Hozzáadás
          </Button>
        </DialogActions>
      </Dialog>

      {/* Legend */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Jelmagyarázat
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
            {placementTypes.map((placement) => (
              <Chip
                key={placement.key}
                label={placement.label}
                variant="outlined"
                sx={{ backgroundColor: placement.color }}
              />
            ))}
          </Stack>
          <Typography variant="body2">
            A táblázat a különböző szintű versenyeken elért eredményeket mutatja
            be tanévenként. Új versenyek hozzáadhatók a "Új verseny hozzáadása"
            gombbal.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
