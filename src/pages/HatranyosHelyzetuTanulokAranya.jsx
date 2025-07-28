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
  useGetAllHHesHHHNevelesuTanulokQuery,
  useAddHHesHHHNevelesuTanulokMutation,
  useUpdateHHesHHHNevelesuTanulokMutation,
  useDeleteHHesHHHNevelesuTanulokMutation,
  useGetAllAlapadatokQuery,
} from "../store/api/apiSlice";

export default function HatranyosHelyzetuTanulokAranya() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiHHData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllHHesHHHNevelesuTanulokQuery();

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addHHData, { isLoading: isAdding }] =
    useAddHHesHHHNevelesuTanulokMutation();
  const [updateHHData, { isLoading: isUpdating }] =
    useUpdateHHesHHHNevelesuTanulokMutation();
  const [deleteHHData, { isLoading: isDeleting }] =
    useDeleteHHesHHHNevelesuTanulokMutation();

  const [hhData, setHHData] = useState([]);
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
  });
  const [addDialog, setAddDialog] = useState({
    open: false,
    newRecord: {
      alapadatok_id: "",
      selectedSchool: null,
      tanev_kezdete: "",
      hh_tanulok_szama: 0,
      hhh_tanulok_szama: 0,
      osszes_tanulo_szama: 0,
    },
  });

  // Transform and organize API data
  const organizedData = useMemo(() => {
    if (!hhData || !Array.isArray(hhData)) {
      return {};
    }

    const organized = {};

    hhData.forEach((item) => {
      const schoolName = item.alapadatok?.iskola_neve || "Ismeretlen iskola";
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;

      if (!organized[schoolName]) {
        organized[schoolName] = {};
      }

      organized[schoolName][year] = {
        ...item,
        hh_arany:
          item.hh_tanulok_szama && item.osszes_tanulo_szama
            ? (
                (item.hh_tanulok_szama / item.osszes_tanulo_szama) *
                100
              ).toFixed(2)
            : 0,
        hhh_arany:
          item.hhh_tanulok_szama && item.osszes_tanulo_szama
            ? (
                (item.hhh_tanulok_szama / item.osszes_tanulo_szama) *
                100
              ).toFixed(2)
            : 0,
        osszes_hh_hhh_arany:
          (item.hh_tanulok_szama || 0) + (item.hhh_tanulok_szama || 0) &&
          item.osszes_tanulo_szama
            ? (
                (((item.hh_tanulok_szama || 0) +
                  (item.hhh_tanulok_szama || 0)) /
                  item.osszes_tanulo_szama) *
                100
              ).toFixed(2)
            : 0,
      };
    });

    return organized;
  }, [hhData]);

  // Load data from API
  useEffect(() => {
    if (apiHHData && Array.isArray(apiHHData)) {
      setHHData(apiHHData);
    }
  }, [apiHHData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    setHHData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate percentages when any field changes
          if (
            field === "hh_tanulok_szama" ||
            field === "hhh_tanulok_szama" ||
            field === "osszes_tanulo_szama"
          ) {
            const hhTanulok =
              field === "hh_tanulok_szama"
                ? parseInt(value) || 0
                : parseInt(item.hh_tanulok_szama) || 0;
            const hhhTanulok =
              field === "hhh_tanulok_szama"
                ? parseInt(value) || 0
                : parseInt(item.hhh_tanulok_szama) || 0;
            const osszesTanulo =
              field === "osszes_tanulo_szama"
                ? parseInt(value) || 0
                : parseInt(item.osszes_tanulo_szama) || 0;

            updatedItem.hh_arany =
              osszesTanulo > 0
                ? ((hhTanulok / osszesTanulo) * 100).toFixed(2)
                : 0;
            updatedItem.hhh_arany =
              osszesTanulo > 0
                ? ((hhhTanulok / osszesTanulo) * 100).toFixed(2)
                : 0;
            updatedItem.osszes_hh_hhh_arany =
              osszesTanulo > 0
                ? (((hhTanulok + hhhTanulok) / osszesTanulo) * 100).toFixed(2)
                : 0;
          }

          return updatedItem;
        }
        return item;
      })
    );
    setIsModified(true);
    setModifiedIds((prev) => new Set([...prev, id]));
  };

  const handleSave = async () => {
    try {
      const itemsToUpdate = hhData.filter((item) => modifiedIds.has(item.id));

      for (const item of itemsToUpdate) {
        await updateHHData({
          id: item.id,
          hh_tanulok_szama: parseInt(item.hh_tanulok_szama) || 0,
          hhh_tanulok_szama: parseInt(item.hhh_tanulok_szama) || 0,
          osszes_tanulo_szama: parseInt(item.osszes_tanulo_szama) || 0,
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
      console.error("Error saving HH data:", error);
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
    if (apiHHData) {
      setHHData([...apiHHData]);
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHHData(id).unwrap();

      setHHData((prev) => prev.filter((item) => item.id !== id));

      setNotification({
        open: true,
        message: `Sikeresen törölve: ${deleteDialog.schoolName} - ${deleteDialog.year}`,
        severity: "success",
      });

      setDeleteDialog({ open: false, id: null, schoolName: "", year: "" });
    } catch (error) {
      console.error("Error deleting HH data:", error);
      setNotification({
        open: true,
        message: `Hiba történt a törlés során: ${
          error.data?.message || error.message
        }`,
        severity: "error",
      });
    }
  };

  const openDeleteDialog = (id, schoolName, year) => {
    setDeleteDialog({ open: true, id, schoolName, year });
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
        hh_tanulok_szama: 0,
        hhh_tanulok_szama: 0,
        osszes_tanulo_szama: 0,
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
        hh_tanulok_szama: 0,
        hhh_tanulok_szama: 0,
        osszes_tanulo_szama: 0,
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
        hh_tanulok_szama: parseInt(addDialog.newRecord.hh_tanulok_szama) || 0,
        hhh_tanulok_szama: parseInt(addDialog.newRecord.hhh_tanulok_szama) || 0,
        osszes_tanulo_szama:
          parseInt(addDialog.newRecord.osszes_tanulo_szama) || 0,
      };

      await addHHData(newRecord).unwrap();

      setNotification({
        open: true,
        message: `Új HH/HHH rekord sikeresen hozzáadva: ${
          addDialog.newRecord.selectedSchool?.iskola_neve || "Ismeretlen iskola"
        } - ${newRecord.tanev_kezdete}/${newRecord.tanev_kezdete + 1}`,
        severity: "success",
      });

      closeAddDialog();
    } catch (error) {
      console.error("Error adding new HH data:", error);
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

    hhData.forEach((item) => {
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      if (!stats[year]) {
        stats[year] = {
          totalHH: 0,
          totalHHH: 0,
          totalStudents: 0,
          count: 0,
        };
      }
      stats[year].totalHH += parseInt(item.hh_tanulok_szama) || 0;
      stats[year].totalHHH += parseInt(item.hhh_tanulok_szama) || 0;
      stats[year].totalStudents += parseInt(item.osszes_tanulo_szama) || 0;
      stats[year].count += 1;
    });

    // Calculate percentages
    Object.keys(stats).forEach((year) => {
      const yearStats = stats[year];
      yearStats.hhArany =
        yearStats.totalStudents > 0
          ? ((yearStats.totalHH / yearStats.totalStudents) * 100).toFixed(2)
          : 0;
      yearStats.hhhArany =
        yearStats.totalStudents > 0
          ? ((yearStats.totalHHH / yearStats.totalStudents) * 100).toFixed(2)
          : 0;
      yearStats.osszesArany =
        yearStats.totalStudents > 0
          ? (
              ((yearStats.totalHH + yearStats.totalHHH) /
                yearStats.totalStudents) *
              100
            ).toFixed(2)
          : 0;
    });

    return stats;
  }, [hhData]);

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
        Hátrányos helyzetű és halmozottan hátrányos helyzetű tanulók aránya
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A hátrányos helyzetű (HH) és halmozottan hátrányos helyzetű (HHH)
        tanulók arányának nyomon követése iskolánként és tanévenként.
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
                      sx={{ fontWeight: "bold", backgroundColor: "#ffe6cc" }}
                    >
                      HH tanulók (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#ffcccc" }}
                    >
                      HHH tanulók (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#e6f3ff" }}
                    >
                      Összes tanuló (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#d4edda" }}
                    >
                      HH arány (%)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#f8d7da" }}
                    >
                      HHH arány (%)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#fff3cd" }}
                    >
                      Összes arány (%)
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
                        sx={{ backgroundColor: "#ffe6cc40" }}
                      >
                        {stats.totalHH}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#ffcccc40" }}
                      >
                        {stats.totalHHH}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#e6f3ff40" }}
                      >
                        {stats.totalStudents}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: "#d4edda40",
                          fontWeight: "bold",
                        }}
                      >
                        {stats.hhArany}%
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: "#f8d7da40",
                          fontWeight: "bold",
                        }}
                      >
                        {stats.hhhArany}%
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: "#fff3cd40",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        {stats.osszesArany}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detailed Data by School */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Részletes adatok iskolák szerint
          </Typography>

          {/* Show empty state if no data */}
          {!hhData || hhData.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📊 Nincs megjeleníthető adat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isFetching
                  ? "Adatok betöltése folyamatban..."
                  : "Nincsenek HH/HHH adatok a kiválasztott időszakra."}
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
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Tanév
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#ffe6cc",
                            }}
                          >
                            HH tanulók (fő)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#ffcccc",
                            }}
                          >
                            HHH tanulók (fő)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#e6f3ff",
                            }}
                          >
                            Összes tanuló (fő)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#d4edda",
                            }}
                          >
                            HH arány (%)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#f8d7da",
                            }}
                          >
                            HHH arány (%)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#fff3cd",
                            }}
                          >
                            Összes arány (%)
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Műveletek
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(schoolData).map(([year, data]) => (
                          <TableRow key={year}>
                            <TableCell sx={{ fontWeight: "medium" }}>
                              {year}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ backgroundColor: "#ffe6cc40" }}
                            >
                              <TextField
                                type="number"
                                value={data.hh_tanulok_szama || 0}
                                onChange={(e) =>
                                  handleDataChange(
                                    data.id,
                                    "hh_tanulok_szama",
                                    e.target.value
                                  )
                                }
                                size="small"
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: "80px" }}
                              />
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ backgroundColor: "#ffcccc40" }}
                            >
                              <TextField
                                type="number"
                                value={data.hhh_tanulok_szama || 0}
                                onChange={(e) =>
                                  handleDataChange(
                                    data.id,
                                    "hhh_tanulok_szama",
                                    e.target.value
                                  )
                                }
                                size="small"
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: "80px" }}
                              />
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ backgroundColor: "#e6f3ff40" }}
                            >
                              <TextField
                                type="number"
                                value={data.osszes_tanulo_szama || 0}
                                onChange={(e) =>
                                  handleDataChange(
                                    data.id,
                                    "osszes_tanulo_szama",
                                    e.target.value
                                  )
                                }
                                size="small"
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: "80px" }}
                              />
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                backgroundColor: "#d4edda40",
                                fontWeight: "bold",
                              }}
                            >
                              {data.hh_arany}%
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                backgroundColor: "#f8d7da40",
                                fontWeight: "bold",
                              }}
                            >
                              {data.hhh_arany}%
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                backgroundColor: "#fff3cd40",
                                fontWeight: "bold",
                                color: "primary.main",
                              }}
                            >
                              {data.osszes_hh_hhh_arany}%
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  openDeleteDialog(data.id, schoolName, year)
                                }
                                title={`Törlés: ${schoolName} - ${year}`}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
              Új rekord hozzáadása
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
              label="HH tanulók"
              variant="outlined"
              sx={{ backgroundColor: "#ffe6cc" }}
            />
            <Chip
              label="HHH tanulók"
              variant="outlined"
              sx={{ backgroundColor: "#ffcccc" }}
            />
            <Chip
              label="Összes tanuló"
              variant="outlined"
              sx={{ backgroundColor: "#e6f3ff" }}
            />
            <Chip
              label="Számított arányok (%)"
              variant="outlined"
              sx={{ backgroundColor: "#fff3cd" }}
            />
          </Stack>
          <Typography variant="body2">
            <strong>HH:</strong> Hátrányos helyzetű tanulók
            <br />
            <strong>HHH:</strong> Halmozottan hátrányos helyzetű tanulók
            <br />
            Az arányok automatikusan számítódnak az adott kategória tanulóinak
            száma és az összes tanuló száma alapján.
          </Typography>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, id: null, schoolName: "", year: "" })
        }
      >
        <DialogTitle>Törlés megerősítése</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Biztosan törölni szeretnéd a következő HH/HHH adatokat?
            <br />
            <strong>Iskola:</strong> {deleteDialog.schoolName}
            <br />
            <strong>Tanév:</strong> {deleteDialog.year}
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
        <DialogTitle>Új HH/HHH rekord hozzáadása</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
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
              <TextField
                fullWidth
                label="HH tanulók száma (fő)"
                type="number"
                value={addDialog.newRecord.hh_tanulok_szama}
                onChange={(e) =>
                  handleNewRecordChange("hh_tanulok_szama", e.target.value)
                }
                inputProps={{ min: 0 }}
                helperText="Hátrányos helyzetű tanulók száma"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="HHH tanulók száma (fő)"
                type="number"
                value={addDialog.newRecord.hhh_tanulok_szama}
                onChange={(e) =>
                  handleNewRecordChange("hhh_tanulok_szama", e.target.value)
                }
                inputProps={{ min: 0 }}
                helperText="Halmozottan hátrányos helyzetű tanulók száma"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Összes tanuló száma (fő)"
                type="number"
                value={addDialog.newRecord.osszes_tanulo_szama}
                onChange={(e) =>
                  handleNewRecordChange("osszes_tanulo_szama", e.target.value)
                }
                inputProps={{ min: 0 }}
                helperText="Az iskola összes tanulójának száma"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#fff2cc",
                  borderRadius: 1,
                }}
              >
                <strong>Számított arányok:</strong>
                <br />
                HH arány:{" "}
                {addDialog.newRecord.osszes_tanulo_szama > 0
                  ? (
                      (addDialog.newRecord.hh_tanulok_szama /
                        addDialog.newRecord.osszes_tanulo_szama) *
                      100
                    ).toFixed(2)
                  : 0}
                %<br />
                HHH arány:{" "}
                {addDialog.newRecord.osszes_tanulo_szama > 0
                  ? (
                      (addDialog.newRecord.hhh_tanulok_szama /
                        addDialog.newRecord.osszes_tanulo_szama) *
                      100
                    ).toFixed(2)
                  : 0}
                %<br />
                Összes arány:{" "}
                {addDialog.newRecord.osszes_tanulo_szama > 0
                  ? (
                      (((parseInt(addDialog.newRecord.hh_tanulok_szama) || 0) +
                        (parseInt(addDialog.newRecord.hhh_tanulok_szama) ||
                          0)) /
                        addDialog.newRecord.osszes_tanulo_szama) *
                      100
                    ).toFixed(2)
                  : 0}
                %
              </Typography>
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
