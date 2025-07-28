import { useState, useEffect, useMemo } from "react";
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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import {
  useGetAllFelvettekSzamaQuery,
  useAddFelvettekSzamaMutation,
  useUpdateFelvettekSzamaMutation,
  useDeleteFelvettekSzamaMutation,
  useGetAllAlapadatokQuery,
} from "../store/api/apiSlice";

export default function FelvettekSzama() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiAdmissionData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllFelvettekSzamaQuery();

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addAdmissionData, { isLoading: isAdding }] =
    useAddFelvettekSzamaMutation();
  const [updateAdmissionData, { isLoading: isUpdating }] =
    useUpdateFelvettekSzamaMutation();
  const [deleteAdmissionData, { isLoading: isDeleting }] =
    useDeleteFelvettekSzamaMutation();

  const [admissionData, setAdmissionData] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [modifiedIds, setModifiedIds] = useState(new Set());

  // UI state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    schoolName: "",
    year: "",
    programType: "",
  });
  const [addDialog, setAddDialog] = useState({
    open: false,
    newRecord: {
      alapadatok_id: "",
      selectedSchool: null,
      tanev_kezdete: "",
      program_tipus: "",
      felvettek_szama: 0,
      kepzesi_forma: "",
    },
  });

  // Transform and organize API data
  const organizedData = useMemo(() => {
    if (!admissionData || !Array.isArray(admissionData)) {
      return {};
    }

    const organized = {};

    admissionData.forEach((item) => {
      const schoolName = item.alapadatok?.iskola_neve || "Ismeretlen iskola";
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      const programType = item.program_tipus || "Ismeretlen program";

      if (!organized[schoolName]) {
        organized[schoolName] = {};
      }
      if (!organized[schoolName][year]) {
        organized[schoolName][year] = {};
      }

      organized[schoolName][year][programType] = {
        ...item,
      };
    });

    return organized;
  }, [admissionData]);

  // Load data from API
  useEffect(() => {
    if (apiAdmissionData && Array.isArray(apiAdmissionData)) {
      setAdmissionData(apiAdmissionData);
    }
  }, [apiAdmissionData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    setAdmissionData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
    setIsModified(true);
    setModifiedIds((prev) => new Set([...prev, id]));
  };

  const handleSave = async () => {
    try {
      const itemsToUpdate = admissionData.filter((item) =>
        modifiedIds.has(item.id)
      );

      for (const item of itemsToUpdate) {
        await updateAdmissionData({
          id: item.id,
          felvettek_szama: parseInt(item.felvettek_szama) || 0,
          kepzesi_forma: item.kepzesi_forma,
        }).unwrap();
      }

      setIsModified(false);
      setModifiedIds(new Set());

      setNotification({
        open: true,
        message: `Sikeresen mentve: ${itemsToUpdate.length} rekord frissítve`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving admission data:", error);
      setNotification({
        open: true,
        message: `Hiba történt a mentés során: ${
          error.data?.message || error.message
        }`,
        severity: "error",
      });
    }
  };

  const handleReset = () => {
    if (apiAdmissionData) {
      setAdmissionData([...apiAdmissionData]);
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdmissionData(id).unwrap();

      setAdmissionData((prev) => prev.filter((item) => item.id !== id));

      setNotification({
        open: true,
        message: `Sikeresen törölve: ${deleteDialog.schoolName} - ${deleteDialog.year} - ${deleteDialog.programType}`,
        severity: "success",
      });

      setDeleteDialog({
        open: false,
        id: null,
        schoolName: "",
        year: "",
        programType: "",
      });
    } catch (error) {
      console.error("Error deleting admission data:", error);
      setNotification({
        open: true,
        message: `Hiba történt a törlés során: ${
          error.data?.message || error.message
        }`,
        severity: "error",
      });
    }
  };

  const openDeleteDialog = (id, schoolName, year, programType) => {
    setDeleteDialog({ open: true, id, schoolName, year, programType });
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const openAddDialog = () => {
    const currentYear = new Date().getFullYear();
    const currentSchoolYear =
      new Date().getMonth() >= 8 ? currentYear : currentYear - 1;

    setAddDialog({
      open: true,
      newRecord: {
        alapadatok_id: "",
        selectedSchool: null,
        tanev_kezdete: currentSchoolYear,
        program_tipus: "",
        felvettek_szama: 0,
        kepzesi_forma: "",
      },
    });
  };

  const closeAddDialog = () => {
    setAddDialog({
      open: false,
      newRecord: {
        alapadatok_id: "",
        selectedSchool: null,
        tanev_kezdete: "",
        program_tipus: "",
        felvettek_szama: 0,
        kepzesi_forma: "",
      },
    });
  };

  const handleNewRecordChange = (field, value) => {
    setAddDialog((prev) => ({
      ...prev,
      newRecord: { ...prev.newRecord, [field]: value },
    }));
  };

  const handleAddNewRecord = async () => {
    try {
      const newRecord = {
        alapadatok_id:
          addDialog.newRecord.selectedSchool?.id ||
          parseInt(addDialog.newRecord.alapadatok_id),
        tanev_kezdete: parseInt(addDialog.newRecord.tanev_kezdete),
        program_tipus: addDialog.newRecord.program_tipus,
        felvettek_szama: parseInt(addDialog.newRecord.felvettek_szama) || 0,
        kepzesi_forma: addDialog.newRecord.kepzesi_forma,
      };

      await addAdmissionData(newRecord).unwrap();

      setNotification({
        open: true,
        message: `Új felvételi rekord sikeresen hozzáadva: ${
          addDialog.newRecord.selectedSchool?.iskola_neve || "Ismeretlen iskola"
        } - ${newRecord.tanev_kezdete}/${newRecord.tanev_kezdete + 1} - ${
          newRecord.program_tipus
        }`,
        severity: "success",
      });

      closeAddDialog();
    } catch (error) {
      console.error("Error adding new admission data:", error);
      setNotification({
        open: true,
        message: `Hiba történt az új rekord hozzáadása során: ${
          error.data?.message || error.message
        }`,
        severity: "error",
      });
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {};

    admissionData.forEach((item) => {
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      if (!stats[year]) {
        stats[year] = {
          totalFelvettek: 0,
          count: 0,
          programTypes: new Set(),
          kepzesiForms: new Set(),
        };
      }
      stats[year].totalFelvettek += parseInt(item.felvettek_szama) || 0;
      stats[year].count += 1;
      stats[year].programTypes.add(item.program_tipus);
      stats[year].kepzesiForms.add(item.kepzesi_forma);
    });

    // Convert sets to counts
    Object.keys(stats).forEach((year) => {
      const yearStats = stats[year];
      yearStats.programTypesCount = yearStats.programTypes.size;
      yearStats.kepzesiFormsCount = yearStats.kepzesiForms.size;
    });

    return stats;
  }, [admissionData]);

  // Common program types and training forms for dropdowns
  const commonProgramTypes = [
    "Technikum",
    "Szakképző iskola",
    "Szakgimnázium",
    "Gimnázium",
    "Felnőttoktatás",
    "Esti tagozat",
    "Levelező tagozat",
    "Egyéb program",
  ];

  const commonKepzesiFormak = [
    "Nappali",
    "Esti",
    "Levelező",
    "Távoktatás",
    "Kombinált",
    "Gyakorlati képzés",
    "Duális képzés",
    "Egyéb forma",
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Loading State */}
      {isFetching && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Hiba történt az adatok betöltése során: {fetchError.message}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Felvettek száma
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A különböző képzési programokra felvett tanulók számának nyomon követése
        iskolánként, tanévenként és program típusonként.
      </Typography>

      {/* Summary Statistics */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Összesített statisztikák
          </Typography>
          {Object.keys(summaryStats).length === 0 ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nincs statisztikai adat megjelenítésre
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Tanév</TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#d4edda" }}
                    >
                      Összes felvett (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#e6f3ff" }}
                    >
                      Program típusok
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#fff3cd" }}
                    >
                      Képzési formák
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Rekordok száma
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(summaryStats).map(([year, stats]) => (
                    <TableRow key={year}>
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {year}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: "#d4edda40",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        {stats.totalFelvettek}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#e6f3ff40" }}
                      >
                        {stats.programTypesCount}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#fff3cd40" }}
                      >
                        {stats.kepzesiFormsCount}
                      </TableCell>
                      <TableCell align="center">{stats.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Felvételi adatok kategóriái
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Technikum:</strong> Érettségi + szakmai képzés együttes
                megszerzését biztosító képzés
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Szakképző iskola:</strong> Szakmai végzettséget adó
                középfokú intézmény
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Duális képzés:</strong> Elméleti és gyakorlati képzés
                kombinációja
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Felnőttoktatás:</strong> Felnőttek számára szervezett
                képzési forma
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Data by School */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Részletes felvételi adatok iskolák szerint
          </Typography>

          {/* Show empty state if no data */}
          {!admissionData || admissionData.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📊 Nincs megjeleníthető adat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isFetching
                  ? "Adatok betöltése folyamatban..."
                  : "Nincsenek felvételi adatok a kiválasztott időszakra."}
              </Typography>
            </Box>
          ) : (
            Object.entries(organizedData).map(([schoolName, schoolData]) => (
              <Accordion key={schoolName} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {schoolName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {Object.entries(schoolData).map(([year, yearData]) => (
                    <Box key={year} sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          mb: 2,
                          color: "primary.main",
                        }}
                      >
                        📅 {year}
                      </Typography>

                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Program típus
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#d4edda",
                                }}
                              >
                                Felvettek száma (fő)
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#e6f3ff",
                                }}
                              >
                                Képzési forma
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: "bold" }}
                              >
                                Műveletek
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(yearData).map(
                              ([programType, data]) => (
                                <TableRow key={programType}>
                                  <TableCell sx={{ fontWeight: "medium" }}>
                                    {programType}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{ backgroundColor: "#d4edda40" }}
                                  >
                                    <TextField
                                      type="number"
                                      value={data.felvettek_szama || 0}
                                      onChange={(e) =>
                                        handleDataChange(
                                          data.id,
                                          "felvettek_szama",
                                          e.target.value
                                        )
                                      }
                                      size="small"
                                      inputProps={{
                                        min: 0,
                                        style: { textAlign: "center" },
                                      }}
                                      sx={{ width: "100px" }}
                                    />
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{ backgroundColor: "#e6f3ff40" }}
                                  >
                                    <TextField
                                      value={data.kepzesi_forma || ""}
                                      onChange={(e) =>
                                        handleDataChange(
                                          data.id,
                                          "kepzesi_forma",
                                          e.target.value
                                        )
                                      }
                                      size="small"
                                      sx={{ width: "120px" }}
                                      placeholder="Képzési forma"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        openDeleteDialog(
                                          data.id,
                                          schoolName,
                                          year,
                                          programType
                                        )
                                      }
                                      title={`Törlés: ${schoolName} - ${year} - ${programType}`}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isModified || isAdding || isUpdating || isDeleting}
            >
              {isAdding || isUpdating ? "Mentés..." : "Mentés"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              disabled={!isModified || isAdding || isUpdating || isDeleting}
            >
              Visszaállítás
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              disabled={isAdding || isUpdating || isDeleting}
            >
              Új felvételi rekord hozzáadása
            </Button>
          </Stack>

          {/* Status Messages */}
          {isModified && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Mentetlen módosítások vannak. Ne felejtsd el menteni a
              változtatásokat!
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
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
            <Chip
              label="Felvettek száma"
              variant="outlined"
              sx={{ backgroundColor: "#d4edda" }}
            />
            <Chip
              label="Képzési forma"
              variant="outlined"
              sx={{ backgroundColor: "#e6f3ff" }}
            />
            <Chip
              label="Program típus"
              variant="outlined"
              sx={{ backgroundColor: "#fff3cd" }}
            />
          </Stack>
          <Typography variant="body2">
            A táblázat a felvételi adatokat jeleníti meg iskolák, tanévek és
            program típusok szerint csoportosítva. Minden program típushoz
            tartozik a felvettek száma és a képzési forma megjelölése.
          </Typography>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({
            open: false,
            id: null,
            schoolName: "",
            year: "",
            programType: "",
          })
        }
      >
        <DialogTitle>Törlés megerősítése</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Biztosan törölni szeretnéd a következő felvételi adatokat?
            <br />
            <strong>Iskola:</strong> {deleteDialog.schoolName}
            <br />
            <strong>Tanév:</strong> {deleteDialog.year}
            <br />
            <strong>Program típus:</strong> {deleteDialog.programType}
            <br />
            <br />
            Ez a művelet nem vonható vissza!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({
                open: false,
                id: null,
                schoolName: "",
                year: "",
                programType: "",
              })
            }
          >
            Mégse
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.id)}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Törlés..." : "Törlés"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Record Dialog */}
      <Dialog
        open={addDialog.open}
        onClose={closeAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Új felvételi rekord hozzáadása</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Iskola *</InputLabel>
                <Select
                  value={addDialog.newRecord.selectedSchool?.id || ""}
                  label="Iskola *"
                  onChange={(e) => {
                    const selectedSchool = schoolsData?.find(
                      (school) => school.id === e.target.value
                    );
                    handleNewRecordChange("selectedSchool", selectedSchool);
                    handleNewRecordChange("alapadatok_id", e.target.value);
                  }}
                  disabled={isLoadingSchools}
                  required
                >
                  {schoolsData?.map((school) => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.iskola_neve}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tanév kezdete</InputLabel>
                <Select
                  value={addDialog.newRecord.tanev_kezdete}
                  label="Tanév kezdete"
                  onChange={(e) =>
                    handleNewRecordChange("tanev_kezdete", e.target.value)
                  }
                  required
                >
                  {schoolYears.map((year) => {
                    const startYear = parseInt(year.split("/")[0]);
                    return (
                      <MenuItem key={startYear} value={startYear}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Program típus *</InputLabel>
                <Select
                  value={addDialog.newRecord.program_tipus}
                  label="Program típus *"
                  onChange={(e) =>
                    handleNewRecordChange("program_tipus", e.target.value)
                  }
                  required
                >
                  {commonProgramTypes.map((programType) => (
                    <MenuItem key={programType} value={programType}>
                      {programType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Képzési forma</InputLabel>
                <Select
                  value={addDialog.newRecord.kepzesi_forma}
                  label="Képzési forma"
                  onChange={(e) =>
                    handleNewRecordChange("kepzesi_forma", e.target.value)
                  }
                >
                  {commonKepzesiFormak.map((forma) => (
                    <MenuItem key={forma} value={forma}>
                      {forma}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Felvettek száma (fő)"
                type="number"
                value={addDialog.newRecord.felvettek_szama}
                onChange={(e) =>
                  handleNewRecordChange("felvettek_szama", e.target.value)
                }
                inputProps={{ min: 0 }}
                helperText="A kiválasztott programra felvett tanulók száma"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Mégse</Button>
          <Button
            onClick={handleAddNewRecord}
            variant="contained"
            color="success"
            disabled={
              !addDialog.newRecord.selectedSchool ||
              !addDialog.newRecord.tanev_kezdete ||
              !addDialog.newRecord.program_tipus ||
              isAdding
            }
          >
            {isAdding ? "Hozzáadás..." : "Hozzáadás"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: "100%" }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleNotificationClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
