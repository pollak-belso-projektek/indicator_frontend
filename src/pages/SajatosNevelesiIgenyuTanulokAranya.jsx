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
  useGetAllSajatosNevelesuTanulokQuery,
  useAddSajatosNevelesuTanulokMutation,
  useUpdateSajatosNevelesuTanulokMutation,
  useDeleteSajatosNevelesuTanulokMutation,
  useGetAllAlapadatokQuery,
} from "../store/api/apiSlice";
import SNIJelmagy from "../components/infos/SNIJelmagy";

export default function SajatosNevelesiIgenyuTanulokAranya() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiSniData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllSajatosNevelesuTanulokQuery();

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addSajatosNevelesuTanulok, { isLoading: isAdding }] =
    useAddSajatosNevelesuTanulokMutation();
  const [updateSajatosNevelesuTanulok, { isLoading: isUpdating }] =
    useUpdateSajatosNevelesuTanulokMutation();
  const [deleteSajatosNevelesuTanulok, { isLoading: isDeleting }] =
    useDeleteSajatosNevelesuTanulokMutation();

  const [sniData, setSniData] = useState([]);
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
      sni_tanulok_szama: 0,
      tanulok_osszesen: 0,
    },
  });

  // Transform and organize API data
  const organizedData = useMemo(() => {
    if (!sniData || !Array.isArray(sniData)) {
      return {};
    }

    const organized = {};

    sniData.forEach((item) => {
      const schoolName = item.alapadatok?.iskola_neve || "Ismeretlen iskola";
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;

      if (!organized[schoolName]) {
        organized[schoolName] = {};
      }

      organized[schoolName][year] = {
        ...item,
        sni_arany:
          item.sni_tanulok_szama && item.tanulok_osszesen
            ? ((item.sni_tanulok_szama / item.tanulok_osszesen) * 100).toFixed(
                2
              )
            : 0,
      };
    });

    return organized;
  }, [sniData]);

  // Load data from API
  useEffect(() => {
    if (apiSniData && Array.isArray(apiSniData)) {
      setSniData(apiSniData);
    }
  }, [apiSniData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    setSniData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate percentage when either field changes
          if (field === "sni_tanulok_szama" || field === "tanulok_osszesen") {
            const sniTanulok =
              field === "sni_tanulok_szama"
                ? parseInt(value) || 0
                : parseInt(item.sni_tanulok_szama) || 0;
            const osszesCanulok =
              field === "tanulok_osszesen"
                ? parseInt(value) || 0
                : parseInt(item.tanulok_osszesen) || 0;

            updatedItem.sni_arany =
              osszesCanulok > 0
                ? ((sniTanulok / osszesCanulok) * 100).toFixed(2)
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
      const itemsToUpdate = sniData.filter((item) => modifiedIds.has(item.id));

      for (const item of itemsToUpdate) {
        await updateSajatosNevelesuTanulok({
          id: item.id,
          sni_tanulok_szama: parseInt(item.sni_tanulok_szama) || 0,
          tanulok_osszesen: parseInt(item.tanulok_osszesen) || 0,
          tanev_kezdete: parseInt(item.tanev_kezdete),
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
      console.error("Error saving SNI data:", error);
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
    if (apiSniData) {
      setSniData([...apiSniData]);
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSajatosNevelesuTanulok(id).unwrap();

      setSniData((prev) => prev.filter((item) => item.id !== id));

      setNotification({
        open: true,
        message: `Sikeresen törölve: ${deleteDialog.schoolName} - ${deleteDialog.year}`,
        severity: "success",
      });

      setDeleteDialog({ open: false, id: null, schoolName: "", year: "" });
    } catch (error) {
      console.error("Error deleting SNI data:", error);
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
        sni_tanulok_szama: 0,
        tanulok_osszesen: 0,
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
        sni_tanulok_szama: 0,
        tanulok_osszesen: 0,
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
        sni_tanulok_szama: parseInt(addDialog.newRecord.sni_tanulok_szama) || 0,
        tanulok_osszesen: parseInt(addDialog.newRecord.tanulok_osszesen) || 0,
      };

      await addSajatosNevelesuTanulok(newRecord).unwrap();

      setNotification({
        open: true,
        message: `Új SNI tanuló arány rekord sikeresen hozzáadva: ${
          addDialog.newRecord.selectedSchool?.iskola_neve || "Ismeretlen iskola"
        } - ${newRecord.tanev_kezdete}/${newRecord.tanev_kezdete + 1}`,
        severity: "success",
      });

      closeAddDialog();
    } catch (error) {
      console.error("Error adding new SNI data:", error);
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

    sniData.forEach((item) => {
      console.log("Processing item:", item);
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      if (!stats[year]) {
        stats[year] = {
          totalSniTanulok: 0,
          totalOsszesTanulok: 0,
          count: 0,
        };
      }
      stats[year].totalSniTanulok += parseInt(item.sni_tanulok_szama) || 0;
      stats[year].totalOsszesTanulok += parseInt(item.tanulok_osszesen) || 0;
      stats[year].count += 1;
    });

    // Calculate average percentage
    Object.keys(stats).forEach((year) => {
      const yearStats = stats[year];
      yearStats.atlagArany =
        yearStats.totalOsszesTanulok > 0
          ? (
              (yearStats.totalSniTanulok / yearStats.totalOsszesTanulok) *
              100
            ).toFixed(2)
          : 0;
    });

    console.log("Summary Statistics:", stats);
    return stats;
  }, [sniData]);

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

      <Typography variant="h5" component="h1" gutterBottom>
        Sajátos nevelési igényű tanulók aránya
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        A sajátos nevelési igényű (SNI) tanulók arányának nyomon követése
        intézményenként és tanévenként. Ez az indikátor az inkluzív oktatás
        hatékonyságának és az egyenlő esélyű hozzáférés biztosításának fontos
        mutatója.
      </Typography>

      {/* Summary Statistics */}

      <Card sx={{ mb: 2, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <SNIJelmagy />
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
                      sx={{ fontWeight: "bold", backgroundColor: "#fff3cd" }}
                    >
                      SNI tanulók (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#d4edda" }}
                    >
                      Összes tanuló (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#cce5ff" }}
                    >
                      SNI arány (%)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Intézmények száma
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
                        sx={{ backgroundColor: "#fff3cd40" }}
                      >
                        {stats.totalSniTanulok}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#d4edda40" }}
                      >
                        {stats.totalOsszesTanulok}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: "#cce5ff40",
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        {stats.atlagArany}%
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

      {/* Detailed Data by School */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Részletes SNI tanuló arány adatok
          </Typography>

          {/* Show empty state if no data */}
          {!sniData || sniData.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📊 Nincs megjeleníthető adat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isFetching
                  ? "Adatok betöltése folyamatban..."
                  : "Nincsenek SNI tanuló arány adatok a kiválasztott időszakra."}
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
                              backgroundColor: "#fff3cd",
                            }}
                          >
                            SNI tanulók száma (fő)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#d4edda",
                            }}
                          >
                            Összes tanuló (fő)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#cce5ff",
                            }}
                          >
                            SNI arány (%)
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
                              sx={{ backgroundColor: "#fff3cd40" }}
                            >
                              <TextField
                                type="number"
                                value={data.sni_tanulok_szama || 0}
                                onChange={(e) =>
                                  handleDataChange(
                                    data.id,
                                    "sni_tanulok_szama",
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
                              sx={{ backgroundColor: "#d4edda40" }}
                            >
                              <TextField
                                type="number"
                                value={data.tanulok_osszesen || 0}
                                onChange={(e) =>
                                  handleDataChange(
                                    data.id,
                                    "tanulok_osszesen",
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
                                backgroundColor: "#cce5ff40",
                                fontWeight: "bold",
                                color: "primary.main",
                              }}
                            >
                              {data.sni_arany}%
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
      <Card sx={{ mt: 2, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            SNI tanulók kategóriái és jellemzői
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Érzékszervi fogyatékosság:</strong> Látás- vagy
                halláskárosodás
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Értelmi fogyatékosság:</strong> Enyhe, középsúlyos vagy
                súlyos
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Beszédfogyatékosság:</strong> Kommunikációs nehézségek
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Mozgásfogyatékosság:</strong> Fizikai korlátozottság
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Tanulási nehézség:</strong> Diszlexia, diszgráfia,
                diszkalkúlia
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Autizmus spektrum zavar:</strong> Társas kommunikációs
                nehézségek
              </Typography>
            </li>
          </Box>
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
          })
        }
      >
        <DialogTitle>Törlés megerősítése</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Biztosan törölni szeretnéd a következő SNI tanuló arány adatokat?
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
        <DialogTitle>Új SNI tanuló arány rekord hozzáadása</DialogTitle>
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
              <TextField
                fullWidth
                label="SNI tanulók száma (fő)"
                type="number"
                value={addDialog.newRecord.sni_tanulok_szama}
                onChange={(e) =>
                  handleNewRecordChange("sni_tanulok_szama", e.target.value)
                }
                inputProps={{ min: 0 }}
                helperText="Sajátos nevelési igényű tanulók száma"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Összes tanuló száma (fő)"
                type="number"
                value={addDialog.newRecord.tanulok_osszesen}
                onChange={(e) =>
                  handleNewRecordChange("tanulok_osszesen", e.target.value)
                }
                inputProps={{ min: 0 }}
                helperText="Az intézmény teljes tanulói létszáma"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#cce5ff",
                  borderRadius: 1,
                }}
              >
                <strong>Számított SNI arány:</strong>{" "}
                {addDialog.newRecord.tanulok_osszesen > 0
                  ? (
                      (addDialog.newRecord.sni_tanulok_szama /
                        addDialog.newRecord.tanulok_osszesen) *
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
