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
  Container,
  Fade,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { generateSchoolYears } from "../../../utils/schoolYears";
import {
  useGetAllSajatosNevelesuTanulokQuery,
  useAddSajatosNevelesuTanulokMutation,
  useUpdateSajatosNevelesuTanulokMutation,
  useDeleteSajatosNevelesuTanulokMutation,
  useGetAllAlapadatokQuery,
  useGetTanuloLetszamQuery,
} from "../../../store/api/apiSlice";
import GenericYearlyChart from "../../../components/GenericYearlyChart";
import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoSajatosNevelesiIgenyu from "./info_sajatos_nevelesi_igenyu_tanulok_aranya";
import TitleSajatosNevelesiIgenyu from "./title_sajatos_nevelesi_igenyu_tanulok_aranya";

export default function SajatosNevelesiIgenyuTanulokAranya() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiSniData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllSajatosNevelesuTanulokQuery();
  const selectedSchool = useSelector(selectSelectedSchool);
  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const { data: tanuloLetszamData } = useGetTanuloLetszamQuery(
    { alapadatok_id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  const [addSajatosNevelesuTanulok, { isLoading: isAdding }] =
    useAddSajatosNevelesuTanulokMutation();
  const [updateSajatosNevelesuTanulok, { isLoading: isUpdating }] =
    useUpdateSajatosNevelesuTanulokMutation();
  const [deleteSajatosNevelesuTanulok, { isLoading: isDeleting }] =
    useDeleteSajatosNevelesuTanulokMutation();

  const [sniData, setSniData] = useState([]);
  const [originalSniData, setOriginalSniData] = useState([]); // Store original data for reset
  const [isModified, setIsModified] = useState(false);
  const [modifiedIds, setModifiedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0);

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
      tanev_kezdete: "",
      sni_tanulok_szama: 0,
      tanulok_osszesen: 0,
    },
  });

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate total students for a given year from tanuloLetszamData
  const getTotalStudentsForYear = (year) => {
    if (!tanuloLetszamData || !Array.isArray(tanuloLetszamData)) {
      return 0;
    }

    const yearStart = parseInt(year.split("/")[0]);

    // Sum all students with jogv_tipus === 0 for this year
    return tanuloLetszamData
      .filter(
        (item) => item.tanev_kezdete === yearStart && item.jogv_tipus === 0
      )
      .reduce((sum, item) => sum + (parseInt(item.letszam) || 0), 0);
  };

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
      // Enrich data with total students from tanuloLetszamData
      const enrichedData = apiSniData.map((item) => {
        const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
        const totalStudents = getTotalStudentsForYear(year);

        return {
          ...item,
          tanulok_osszesen:
            totalStudents > 0 ? totalStudents : item.tanulok_osszesen,
        };
      });

      setSniData(enrichedData);
      setOriginalSniData(JSON.parse(JSON.stringify(enrichedData))); // Deep clone for reset
    }
  }, [apiSniData, tanuloLetszamData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    // Prevent editing of tanulok_osszesen - it's auto-calculated
    if (field === "tanulok_osszesen") {
      return;
    }

    setSniData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate percentage when SNI students count changes
          if (field === "sni_tanulok_szama") {
            const sniTanulok = parseInt(value) || 0;
            const osszesCanulok = parseInt(item.tanulok_osszesen) || 0;

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
          alapadatok_id: item.alapadatok_id,
          sni_tanulok_szama: (parseInt(item.sni_tanulok_szama) || 0).toString(),
          tanulok_osszesen: (parseInt(item.tanulok_osszesen) || 0).toString(),
          tanev_kezdete: parseInt(item.tanev_kezdete),
        }).unwrap();
      }

      setIsModified(false);
      setModifiedIds(new Set());
      setOriginalSniData(JSON.parse(JSON.stringify(sniData))); // Update original data after successful save

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
    if (originalSniData) {
      setSniData(JSON.parse(JSON.stringify(originalSniData))); // Deep clone to avoid reference issues
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSajatosNevelesuTanulok(id).unwrap();

      const updatedData = sniData.filter((item) => item.id !== id);
      setSniData(updatedData);
      setOriginalSniData(JSON.parse(JSON.stringify(updatedData))); // Update original data after delete

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

    const yearString = `${currentSchoolYear}/${currentSchoolYear + 1}`;
    const totalStudents = getTotalStudentsForYear(yearString);

    setAddDialog({
      open: true,
      newRecord: {
        alapadatok_id: "",
        tanev_kezdete: currentSchoolYear,
        sni_tanulok_szama: 0,
        tanulok_osszesen: totalStudents,
      },
    });
  };

  const closeAddDialog = () => {
    setAddDialog({
      open: false,
      newRecord: {
        alapadatok_id: "",
        tanev_kezdete: "",
        sni_tanulok_szama: 0,
        tanulok_osszesen: 0,
      },
    });
  };

  const handleNewRecordChange = (field, value) => {
    setAddDialog((prev) => {
      const updatedRecord = { ...prev.newRecord, [field]: value };

      // If year changes, update total students automatically
      if (field === "tanev_kezdete") {
        const yearString = `${value}/${parseInt(value) + 1}`;
        const totalStudents = getTotalStudentsForYear(yearString);
        updatedRecord.tanulok_osszesen = totalStudents;
      }

      return {
        ...prev,
        newRecord: updatedRecord,
      };
    });
  };

  const handleAddNewRecord = async () => {
    try {
      const newRecord = {
        alapadatok_id:
          selectedSchool?.id || parseInt(addDialog.newRecord.alapadatok_id),
        tanev_kezdete: parseInt(addDialog.newRecord.tanev_kezdete),
        sni_tanulok_szama: parseInt(addDialog.newRecord.sni_tanulok_szama) || 0,
        tanulok_osszesen: parseInt(addDialog.newRecord.tanulok_osszesen) || 0,
      };

      await addSajatosNevelesuTanulok(newRecord).unwrap();

      setNotification({
        open: true,
        message: `Új SNI tanuló arány rekord sikeresen hozzáadva: ${
          selectedSchool?.iskola_neve || "Ismeretlen iskola"
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
    <Container maxWidth="xl">
      <PageWrapper
        titleContent={<TitleSajatosNevelesiIgenyu />}
        infoContent={<InfoSajatosNevelesiIgenyu />}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ minHeight: "calc(100vh - 120px)" }}>
            <LockStatusIndicator tableName="sajatos_nevelesi_igenyu" />

            {/* Loading State */}
            {isFetching && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "200px",
                }}
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
            <LockStatusIndicator tableName="sajatos_nevelesu_tanulok" />
            {/* Content - only show when not loading */}
            {!isFetching && (
              <>
                {/* Tab Navigation */}
                <Card>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      aria-label="SNI tanulók tabs"
                      variant="fullWidth"
                    >
                      <Tab
                        icon={<AssessmentIcon />}
                        label="Adatok és táblázatok"
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      />
                      <Tab
                        icon={<BarChartIcon />}
                        label="Grafikon nézet"
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      />
                    </Tabs>
                  </Box>
                </Card>

                {/* Tab Content */}
                {activeTab === 0 && (
                  <Box>
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
                            <Typography
                              variant="h6"
                              color="text.secondary"
                              gutterBottom
                            >
                              📊 Nincs megjeleníthető adat
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {isFetching
                                ? "Adatok betöltése folyamatban..."
                                : "Nincsenek SNI tanuló arány adatok a kiválasztott időszakra."}
                            </Typography>
                          </Box>
                        ) : (
                          Object.entries(organizedData).map(
                            ([schoolName, schoolData]) => (
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow
                                      sx={{ backgroundColor: "#f5f5f5" }}
                                    >
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
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {Object.entries(schoolData).map(
                                      ([year, data]) => (
                                        <TableRow key={year}>
                                          <TableCell
                                            sx={{ fontWeight: "medium" }}
                                          >
                                            {year}
                                          </TableCell>
                                          <TableCell
                                            align="center"
                                            sx={{
                                              backgroundColor: "#fff3cd40",
                                            }}
                                          >
                                            <TextField
                                              type="number"
                                              value={
                                                data.sni_tanulok_szama || 0
                                              }
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
                                            sx={{
                                              backgroundColor: "#d4edda40",
                                            }}
                                          >
                                            <TextField
                                              type="number"
                                              value={data.tanulok_osszesen || 0}
                                              size="small"
                                              inputProps={{
                                                min: 0,
                                                style: { textAlign: "center" },
                                                readOnly: true,
                                              }}
                                              sx={{
                                                width: "80px",
                                                "& .MuiInputBase-input": {
                                                  backgroundColor: "#f5f5f5",
                                                  cursor: "not-allowed",
                                                },
                                              }}
                                              disabled
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
                                          {/* <TableCell align="center">
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
                            </TableCell> */}
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )
                          )
                        )}

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                          <LockedTableWrapper tableName="sajatos_nevelesu_tanulok">
                            <Button
                              variant="contained"
                              startIcon={<SaveIcon />}
                              onClick={handleSave}
                              disabled={
                                !isModified ||
                                isAdding ||
                                isUpdating ||
                                isDeleting
                              }
                            >
                              {isAdding || isUpdating ? "Mentés..." : "Mentés"}
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<RefreshIcon />}
                              onClick={handleReset}
                              disabled={
                                !isModified ||
                                isAdding ||
                                isUpdating ||
                                isDeleting
                              }
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
                          </LockedTableWrapper>
                        </Stack>

                        {/* Status Messages */}
                        {isModified && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            Mentetlen módosítások vannak. Ne felejtsd el menteni
                            a változtatásokat!
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* Chart Tab Content */}
                {activeTab === 1 && (
                  <Box>
                    {(() => {
                      // Prepare chart data - aggregate by year
                      const chartData = schoolYears.map((year) => {
                        let totalSniStudents = 0;
                        let totalStudents = 0;

                        // Aggregate data across all schools for this year
                        Object.values(organizedData).forEach((schoolData) => {
                          if (schoolData[year]) {
                            totalSniStudents +=
                              schoolData[year].sni_tanulok_szama || 0;
                            totalStudents +=
                              schoolData[year].tanulok_osszesen || 0;
                          }
                        });

                        const sniRatio =
                          totalStudents > 0
                            ? (totalSniStudents / totalStudents) * 100
                            : 0;

                        return {
                          year: year,
                          sniRatio: parseFloat(sniRatio.toFixed(2)),
                          sniStudents: totalSniStudents,
                          totalStudents: totalStudents,
                        };
                      });

                      const chartDataKeys = ["sniRatio"];
                      const chartKeyLabels = {
                        sniRatio: "SNI tanulók aránya (%)",
                      };

                      return (
                        <GenericYearlyChart
                          data={chartData}
                          dataKeys={chartDataKeys}
                          keyLabels={chartKeyLabels}
                          hideSmallDataPoints={true}
                          yAxisLabel="SNI arány (%)"
                          height={450}
                          title="SNI tanulók arányának alakulása"
                        />
                      );
                    })()}
                  </Box>
                )}

                <Card sx={{ mt: 2, backgroundColor: "#f8f9fa" }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      SNI tanulók kategóriái és jellemzői
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                      <li>
                        <Typography variant="body2">
                          <strong>Érzékszervi fogyatékosság:</strong> Látás-
                          vagy halláskárosodás
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          <strong>Értelmi fogyatékosság:</strong> Enyhe,
                          középsúlyos vagy súlyos
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          <strong>Beszédfogyatékosság:</strong> Kommunikációs
                          nehézségek
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          <strong>Mozgásfogyatékosság:</strong> Fizikai
                          korlátozottság
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          <strong>Tanulási nehézség:</strong> Diszlexia,
                          diszgráfia, diszkalkúlia
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          <strong>Autizmus spektrum zavar:</strong> Társas
                          kommunikációs nehézségek
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
                      Biztosan törölni szeretnéd a következő SNI tanuló arány
                      adatokat?
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
                  <DialogTitle>
                    Új SNI tanuló arány rekord hozzáadása
                  </DialogTitle>
                  <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Tanév kezdete</InputLabel>
                          <Select
                            value={addDialog.newRecord.tanev_kezdete}
                            label="Tanév kezdete"
                            onChange={(e) =>
                              handleNewRecordChange(
                                "tanev_kezdete",
                                e.target.value
                              )
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
                            handleNewRecordChange(
                              "sni_tanulok_szama",
                              e.target.value
                            )
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
                          inputProps={{
                            min: 0,
                            readOnly: true,
                          }}
                          disabled
                          helperText="Az intézmény teljes tanulói létszáma (automatikusan számítva)"
                          sx={{
                            "& .MuiInputBase-input": {
                              backgroundColor: "#f5f5f5",
                              cursor: "not-allowed",
                            },
                          }}
                        />
                      </Grid>

                      <div className="flex w-full items-center justify-center">
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
                      </div>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={closeAddDialog}>Mégse</Button>
                    <Button
                      onClick={handleAddNewRecord}
                      variant="contained"
                      color="success"
                      disabled={
                        selectedSchool?.id === undefined ||
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
              </>
            )}
          </Box>
        </Fade>
      </PageWrapper>
    </Container>
  );
}
