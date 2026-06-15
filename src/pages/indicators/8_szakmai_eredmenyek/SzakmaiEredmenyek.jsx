import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
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
  CircularProgress,
  Snackbar,
  Container,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import { generateSchoolYears } from "../../../utils/schoolYears";
import {
  useGetAllVersenyekQuery,
  useAddVersenyekMutation,
  useUpdateVersenyekMutation,
  useDeleteVersenyekMutation,
} from "../../../store/api/apiSlice";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoSzakmaiEredmenyek from "./info_szakmai_eredmenyek";
import TitleSzakmaiEredmenyek from "./title_szakmai_eredmenyek";

const evszamok = generateSchoolYears();

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

const placementTypes = [
  { key: "helyezes_1", label: "1. helyezés", color: "#fff9c4" },
  { key: "helyezes_1_3", label: "1-3. helyezés", color: "#f5f5f5" },
  { key: "helyezes_1_10", label: "1-10. helyezés/döntőbe", color: "#ffe0b2" },
  { key: "versenyre_nevezettek", label: "Nevezettek száma", color: "#e3f2fd" },
];

export default function SzakmaiEredmenyek() {
  const selectedSchool = useSelector(selectSelectedSchool);

  // API Hooks
  const { data: apiData, error: fetchError, isLoading: isFetching, refetch } = useGetAllVersenyekQuery();
  const [addData, { isLoading: isAdding }] = useAddVersenyekMutation();
  const [updateData, { isLoading: isUpdating }] = useUpdateVersenyekMutation();
  const [deleteData] = useDeleteVersenyekMutation();

  // Component State
  const [tableData, setTableData] = useState({});
  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCompetition, setNewCompetition] = useState({ category: "", name: "" });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Load API data into tableData state
  useEffect(() => {
    if (apiData) {
      const initialData = {};

      const relevantData = selectedSchool
        ? apiData.filter(item => item.alapadatok_id === selectedSchool.id)
        : apiData;

      // Populate initial framework with predefined competitions
      Object.keys(competitionCategories).forEach((category) => {
        initialData[category] = {};
        competitionCategories[category].forEach((competition) => {
          initialData[category][competition] = {};
        });
      });

      // Overlay with real data
      relevantData.forEach(item => {
        const cat = item.versenyNev?.versenyKategoria?.nev || item.versenyKategoria || "Egyéb kategória";
        const comp = item.versenyNev?.nev || item.versenyNev || "Egyéb verseny";
        const year = item.tanev_kezdete;

        if (!initialData[cat]) initialData[cat] = {};
        if (!initialData[cat][comp]) initialData[cat][comp] = {};

        initialData[cat][comp][year] = {
          id: item.id,
          alapadatok_id: item.alapadatok_id,
          helyezes_1: item.helyezett_1 || 0,
          helyezes_1_3: item.helyezett_1_3 || 0,
          helyezes_1_10: item.dontobeJutott || 0,
          versenyre_nevezettek: item.nevezettekSzama || 0,
        };
      });

      setTableData(initialData);
      setSavedData(JSON.parse(JSON.stringify(initialData)));
      setIsModified(false);
    }
  }, [apiData, selectedSchool]);

  const handleDataChange = useCallback((category, competition, yearStr, field, value) => {
    const year = parseInt(yearStr, 10);
    const parsed = parseInt(value, 10);
    const numValue = isNaN(parsed) ? "" : Math.max(0, parsed);

    setTableData(prev => {
      const newData = { ...prev };
      if (!newData[category]) newData[category] = {};
      if (!newData[category][competition]) newData[category][competition] = {};
      if (!newData[category][competition][year]) {
        newData[category][competition][year] = {
          helyezes_1: 0,
          helyezes_1_3: 0,
          helyezes_1_10: 0,
          versenyre_nevezettek: 0,
        };
      }
      newData[category][competition][year][field] = numValue;
      return newData;
    });
    setIsModified(true);
  }, []);

  const handleResetData = useCallback(() => {
    if (savedData) {
      setTableData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  }, [savedData]);

  const handleAddCompetition = () => {
    if (newCompetition.category && newCompetition.name) {
      setTableData(prev => {
        const newData = { ...prev };
        if (!newData[newCompetition.category]) newData[newCompetition.category] = {};
        if (!newData[newCompetition.category][newCompetition.name]) {
          newData[newCompetition.category][newCompetition.name] = {};
        }
        return newData;
      });
      setIsModified(true);
      setOpenAddDialog(false);
      setNewCompetition({ category: "", name: "" });
    }
  };

  const handleRemoveCompetition = async (category, competition) => {
    // If the competition has saved IDs in the backend, we need to delete them.
    const compData = tableData[category][competition];
    let hasSavedData = false;

    if (compData) {
      for (const year of Object.values(compData)) {
        if (year.id) {
          hasSavedData = true;
          try {
            await deleteData(year.id).unwrap();
          } catch (e) {
            console.error("Error deleting competition:", e);
            setSnackbarMessage("Hiba történt a törlés során!");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
          }
        }
      }
    }

    setTableData(prev => {
      const newData = { ...prev };
      if (newData[category]) {
        delete newData[category][competition];
      }
      return newData;
    });
    setIsModified(true);
    
    if (hasSavedData) {
      refetch();
      setSnackbarMessage("Sikeresen törölve a szerverről!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleSaveData = async () => {
    if (!selectedSchool) {
      setSnackbarMessage("Válasszon intézményt a mentéshez!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      let savedCount = 0;
      let updatedCount = 0;

      for (const [category, competitions] of Object.entries(tableData)) {
        for (const [competition, yearData] of Object.entries(competitions)) {
          for (const [yearStr, fields] of Object.entries(yearData)) {
            const year = parseInt(yearStr, 10);
            
            const isAllZeroOrEmpty = 
              !fields.helyezes_1 && 
              !fields.helyezes_1_3 && 
              !fields.helyezes_1_10 && 
              !fields.versenyre_nevezettek;

            // Only save if there's actually data or it was an existing record being zeroed
            if (!fields.id && isAllZeroOrEmpty) continue;

            const payload = {
              alapadatok_id: selectedSchool.id,
              kategoria: category,
              verseny_neve: competition,
              tanev_kezdete: year,
              helyezes_1: parseInt(fields.helyezes_1) || 0,
              helyezes_1_3: parseInt(fields.helyezes_1_3) || 0,
              helyezes_1_10: parseInt(fields.helyezes_1_10) || 0,
              versenyre_nevezettek: parseInt(fields.versenyre_nevezettek) || 0,
            };

            const savedFields = savedData?.[category]?.[competition]?.[yearStr] || {};
            
            const hasChanged = 
              payload.helyezes_1 !== (savedFields.helyezes_1 || 0) ||
              payload.helyezes_1_3 !== (savedFields.helyezes_1_3 || 0) ||
              payload.helyezes_1_10 !== (savedFields.helyezes_1_10 || 0) ||
              payload.versenyre_nevezettek !== (savedFields.versenyre_nevezettek || 0);

            if (hasChanged) {
              if (fields.id) {
                await updateData({ id: fields.id, ...payload }).unwrap();
                updatedCount++;
              } else {
                await addData(payload).unwrap();
                savedCount++;
              }
            }
          }
        }
      }

      setSavedData(JSON.parse(JSON.stringify(tableData)));
      setIsModified(false);
      refetch();

      setSnackbarMessage(`Sikeresen mentve: ${savedCount} új rekord és ${updatedCount} frissített rekord`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      setSnackbarMessage(error.data?.message || "Hiba történt a mentés során");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const getNumericValue = useCallback((category, competition, year, field) => {
    const rawValue = tableData[category]?.[competition]?.[year]?.[field];
    const parsed = parseInt(rawValue, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [tableData]);

  const totals = useMemo(() => {
    const calculatedTotals = {};
    evszamok.forEach((year) => {
      const startYear = parseInt(year.split("/")[0], 10);
      calculatedTotals[startYear] = {};
      placementTypes.forEach((placement) => {
        let sum = 0;
        Object.keys(tableData).forEach((category) => {
          Object.keys(tableData[category]).forEach((competition) => {
            sum += getNumericValue(category, competition, startYear, placement.key);
          });
        });
        calculatedTotals[startYear][placement.key] = sum;
      });
    });
    return calculatedTotals;
  }, [tableData, getNumericValue]);

  if (isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageWrapper
        titleContent={<TitleSzakmaiEredmenyek />}
        infoContent={<InfoSzakmaiEredmenyek />}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ minHeight: "calc(100vh - 120px)" }}>

            <LockStatusIndicator tableName="versenyek" />

            {fetchError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Hiba történt az adatok betöltése során: {fetchError.message || "Ismeretlen hiba"}
              </Alert>
            )}

            {!selectedSchool && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Nincs intézmény kiválasztva - az összes iskola adatait összegzi a rendszer.
              </Alert>
            )}

            {isModified && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                Mentetlen módosítások vannak. Ne felejtsd el menteni a változtatásokat!
              </Alert>
            )}

            <Stack direction="row" spacing={2} sx={{ mb: 3, ml: 2 }}>
              <LockedTableWrapper tableName="versenyek">
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddDialog(true)}
                >
                  Új verseny
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveData}
                  disabled={!isModified || isSaving || isAdding || isUpdating || !selectedSchool}
                >
                  {isSaving || isAdding || isUpdating ? "Mentés..." : "Mentés"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetData}
                  disabled={!isModified || !savedData || isSaving || isAdding || isUpdating}
                >
                  Visszaállítás
                </Button>
              </LockedTableWrapper>
            </Stack>

            <Typography variant="h6" component="h2" gutterBottom sx={{ ml: 2 }}>
              Szakmai és Közismereti Versenyek Eredményei
            </Typography>

            <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: "bold",
                        minWidth: 250,
                        borderRight: "2px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 3,
                        verticalAlign: "middle",
                      }}
                    >
                      Verseny megnevezése
                    </TableCell>
                    {evszamok.map((year, i) => (
                      <TableCell
                        key={`${year}-header`}
                        align="center"
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#fff2cc",
                          borderBottom: "1px solid #ddd",
                          borderRight: i === evszamok.length - 1 ? "none" : "2px solid #ddd",
                        }}
                      >
                        {year}
                      </TableCell>
                    ))}
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: "bold",
                        minWidth: 80,
                        backgroundColor: "#ffffff",
                        zIndex: 3,
                        verticalAlign: "middle",
                        textAlign: "center"
                      }}
                    >
                      Törlés
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {evszamok.map((year, i) => (
                      <React.Fragment key={`${year}-metric-head`}>
                        {placementTypes.map((placement, j) => (
                          <TableCell
                            key={`head-${year}-${placement.key}`}
                            align="center"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: placement.color,
                              borderBottom: "2px solid #ddd",
                              borderRight: (j === placementTypes.length - 1 && i !== evszamok.length - 1) ? "2px solid #ddd" : "1px solid #ddd",
                              minWidth: 90,
                              fontSize: "0.75rem",
                              lineHeight: 1.2
                            }}
                          >
                            {placement.label}
                          </TableCell>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Totals Row */}
                  <TableRow sx={{ backgroundColor: "#fffde7" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        borderRight: "2px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fffde7",
                        zIndex: 1,
                      }}
                    >
                      Összesen
                    </TableCell>
                    {evszamok.map((year, i) => {
                      const startYear = parseInt(year.split("/")[0], 10);
                      return (
                        <React.Fragment key={`total-${year}-metrics`}>
                          {placementTypes.map((placement, j) => (
                            <TableCell 
                              key={`tot-${year}-${placement.key}`} 
                              align="center" 
                              sx={{ 
                                fontWeight: "bold",
                                borderRight: (j === placementTypes.length - 1 && i !== evszamok.length - 1) ? "2px solid #ddd" : "1px solid #ddd",
                              }}
                            >
                              {totals[startYear]?.[placement.key] || 0}
                            </TableCell>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    <TableCell></TableCell>
                  </TableRow>

                  {/* Data Rows */}
                  {Object.keys(tableData).map((category) => {
                    const competitions = Object.keys(tableData[category]);
                    return competitions.map((competition, index) => (
                      <TableRow
                        key={`${category}-${competition}`}
                        hover
                      >
                        <TableCell
                          sx={{
                            borderRight: "2px solid #ddd",
                            position: "sticky",
                            left: 0,
                            backgroundColor: "#fff",
                            zIndex: 1,
                          }}
                        >
                          {index === 0 && (
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold", mb: 0.5 }}>
                              {category}
                            </Typography>
                          )}
                          <Box sx={{ pl: 2, fontSize: "0.875rem" }}>{competition}</Box>
                        </TableCell>
                        {evszamok.map((yearStr, i) => {
                          const year = parseInt(yearStr.split("/")[0], 10);
                          return (
                            <React.Fragment key={`${category}-${competition}-${year}`}>
                              {placementTypes.map((placement, j) => (
                                <TableCell
                                  key={`cell-${year}-${placement.key}`}
                                  align="center"
                                  sx={{
                                    borderRight: (j === placementTypes.length - 1 && i !== evszamok.length - 1) ? "2px solid #ddd" : "1px solid #ddd",
                                  }}
                                >
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={tableData[category][competition][year]?.[placement.key] ?? ""}
                                    onChange={(e) => handleDataChange(category, competition, year, placement.key, e.target.value)}
                                    inputProps={{
                                      min: 0,
                                      step: 1,
                                      style: { textAlign: "center", padding: "4px" },
                                    }}
                                    sx={{ width: "60px", backgroundColor: "#fff" }}
                                    placeholder=""
                                    disabled={!selectedSchool}
                                  />
                                </TableCell>
                              ))}
                            </React.Fragment>
                          );
                        })}
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveCompetition(category, competition)}
                            disabled={!selectedSchool}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </TableContainer>

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
                      onChange={(e) => setNewCompetition({ ...newCompetition, category: e.target.value })}
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
                    onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
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

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled">
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Fade>
      </PageWrapper>
    </Container>
  );
}
