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
  Divider,
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
import { generateSchoolYears } from "../../../utils/schoolYears";
import {
  useGetAllElhelyezkedesQuery,
  useAddElhelyezkedesMutation,
  useUpdateElhelyezkedesMutation,
  useDeleteElhelyezkedesBySchoolAndYearMutation,
  useGetAllAlapadatokQuery,
} from "../../../store/api/apiSlice";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoElhelyezkedesiMutato from "./info_elhelyezkedesi_mutato";
import TitleElhelyezkedesiMutato from "./title_elhelyezkedesi_mutato";


export default function ElhelyezkedesimMutato() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiEmploymentData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllElhelyezkedesQuery();

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addElhelyezkedes, { isLoading: isAdding }] =
    useAddElhelyezkedesMutation();
  const [updateElhelyezkedes, { isLoading: isUpdating }] =
    useUpdateElhelyezkedesMutation();
  const [deleteElhelyezkedesBySchoolAndYear, { isLoading: isDeleting }] =
    useDeleteElhelyezkedesBySchoolAndYearMutation();

  const [employmentData, setEmploymentData] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [modifiedIds, setModifiedIds] = useState(new Set());

  // UI state for notifications and dialogs
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    schoolId: null,
    schoolName: "",
    year: "",
  });
  const [addDialog, setAddDialog] = useState({
    open: false,
    newRecord: {
      alapadatok_id: "",
      selectedSchool: null, // {id, iskola_neve}
      szakirany_id: "",
      selectedSzakirany: null, // {id, nev}
      szakma_id: "",
      selectedSzakma: null, // {id, nev}
      tanev_kezdete: "",
      elhelyezkedok_szama: 0,
      szakmai_okatatasban_sikeresen_vegzettek_szama: 0,
    },
  });

  // Transform and organize API data
  const organizedData = useMemo(() => {
    if (!employmentData || !Array.isArray(employmentData)) {
      return {};
    }

    const organized = {};

    employmentData.forEach((item) => {
      const schoolName = item.alapadatok?.iskola_neve || "Ismeretlen iskola";
      const szakiranyName = item.szakirany?.nev || "Ismeretlen szakirány";
      const szakmaName = item.szakma?.nev || "Ismeretlen szakma";
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;

      if (!organized[schoolName]) {
        organized[schoolName] = {};
      }
      if (!organized[schoolName][szakiranyName]) {
        organized[schoolName][szakiranyName] = {};
      }
      if (!organized[schoolName][szakiranyName][szakmaName]) {
        organized[schoolName][szakiranyName][szakmaName] = {};
      }

      organized[schoolName][szakiranyName][szakmaName][year] = {
        ...item,
        elhelyezkedesi_arany:
          item.elhelyezkedok_szama &&
            item.szakmai_okatatasban_sikeresen_vegzettek_szama
            ? (
              (item.elhelyezkedok_szama /
                item.szakmai_okatatasban_sikeresen_vegzettek_szama) *
              100
            ).toFixed(2)
            : 0,
      };
    });

    return organized;
  }, [employmentData]);

  // Load data from API when component mounts or data changes
  useEffect(() => {
    if (apiEmploymentData && Array.isArray(apiEmploymentData)) {
      setEmploymentData(apiEmploymentData);
    }
  }, [apiEmploymentData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    setEmploymentData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate percentage when either field changes
          if (
            field === "elhelyezkedok_szama" ||
            field === "szakmai_okatatasban_sikeresen_vegzettek_szama"
          ) {
            const elhelyezkedok =
              field === "elhelyezkedok_szama"
                ? parseInt(value) || 0
                : parseInt(item.elhelyezkedok_szama) || 0;
            const vegzettek =
              field === "szakmai_okatatasban_sikeresen_vegzettek_szama"
                ? parseInt(value) || 0
                : parseInt(
                  item.szakmai_okatatasban_sikeresen_vegzettek_szama
                ) || 0;

            updatedItem.elhelyezkedesi_arany =
              vegzettek > 0
                ? ((elhelyezkedok / vegzettek) * 100).toFixed(2)
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
      const itemsToUpdate = employmentData.filter((item) =>
        modifiedIds.has(item.id)
      );

      for (const item of itemsToUpdate) {
        await updateElhelyezkedes({
          id: item.id,
          elhelyezkedok_szama: parseInt(item.elhelyezkedok_szama) || 0,
          szakmai_okatatasban_sikeresen_vegzettek_szama:
            parseInt(item.szakmai_okatatasban_sikeresen_vegzettek_szama) || 0,
        }).unwrap();
      }

      setIsModified(false);
      setModifiedIds(new Set());

      // Show success notification
      setNotification({
        open: true,
        message: `Sikeresen mentve: ${itemsToUpdate.length} rekord frissítve`,
        severity: "success",
      });

      console.log("Successfully saved employment data");
    } catch (error) {
      console.error("Error saving employment data:", error);

      // Show error notification
      setNotification({
        open: true,
        message: `Hiba történt a mentés során: ${error.data?.message || error.message || "Ismeretlen hiba"
          }`,
        severity: "error",
      });
    }
  };

  const handleReset = () => {
    if (apiEmploymentData) {
      setEmploymentData([...apiEmploymentData]);
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

  // Delete data for a specific school and year
  const handleDeleteBySchoolAndYear = async (alapadatokId, tanev) => {
    try {
      // Convert tanev format from "2024/2025" to start year (2024)
      const startYear = parseInt(tanev.split("/")[0]);

      await deleteElhelyezkedesBySchoolAndYear({
        alapadatokId,
        tanev: startYear,
      }).unwrap();

      console.log(
        `Successfully deleted employment data for school ${alapadatokId} and year ${tanev}`
      );

      // Remove the deleted items from local state
      setEmploymentData((prev) =>
        prev.filter(
          (item) =>
            !(
              item.alapadatok?.id === alapadatokId &&
              item.tanev_kezdete === startYear
            )
        )
      );

      // Show success notification
      setNotification({
        open: true,
        message: `Sikeresen törölve: ${deleteDialog.schoolName} - ${tanev}`,
        severity: "success",
      });

      // Close delete dialog
      setDeleteDialog({
        open: false,
        schoolId: null,
        schoolName: "",
        year: "",
      });
    } catch (error) {
      console.error("Error deleting employment data:", error);

      // Show error notification
      setNotification({
        open: true,
        message: `Hiba történt a törlés során: ${error.data?.message || error.message || "Ismeretlen hiba"
          }`,
        severity: "error",
      });

      // Close delete dialog
      setDeleteDialog({
        open: false,
        schoolId: null,
        schoolName: "",
        year: "",
      });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (schoolId, schoolName, year) => {
    setDeleteDialog({
      open: true,
      schoolId,
      schoolName,
      year,
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Open add new record dialog
  const openAddDialog = () => {
    const currentYear = new Date().getFullYear();
    const currentSchoolYear =
      new Date().getMonth() >= 8 ? currentYear : currentYear - 1;

    setAddDialog({
      open: true,
      newRecord: {
        alapadatok_id: "",
        selectedSchool: null,
        szakirany_id: "",
        selectedSzakirany: null,
        szakma_id: "",
        selectedSzakma: null,
        tanev_kezdete: currentSchoolYear,
        elhelyezkedok_szama: 0,
        szakmai_okatatasban_sikeresen_vegzettek_szama: 0,
      },
    });
  };

  // Close add dialog
  const closeAddDialog = () => {
    setAddDialog({
      open: false,
      newRecord: {
        alapadatok_id: "",
        selectedSchool: null,
        szakirany_id: "",
        selectedSzakirany: null,
        szakma_id: "",
        selectedSzakma: null,
        tanev_kezdete: "",
        elhelyezkedok_szama: 0,
        szakmai_okatatasban_sikeresen_vegzettek_szama: 0,
      },
    });
  };

  // Handle new record field changes
  const handleNewRecordChange = (field, value) => {
    setAddDialog((prev) => ({
      ...prev,
      newRecord: {
        ...prev.newRecord,
        [field]: value,
      },
    }));
  };

  // Handle adding new record
  const handleAddNewRecord = async () => {
    try {
      const newRecord = {
        alapadatok_id:
          addDialog.newRecord.selectedSchool?.id ||
          parseInt(addDialog.newRecord.alapadatok_id),
        szakirany_id:
          addDialog.newRecord.selectedSzakirany?.id ||
          parseInt(addDialog.newRecord.szakirany_id),
        szakma_id:
          addDialog.newRecord.selectedSzakma?.id ||
          parseInt(addDialog.newRecord.szakma_id),
        tanev_kezdete: parseInt(addDialog.newRecord.tanev_kezdete),
        elhelyezkedok_szama:
          parseInt(addDialog.newRecord.elhelyezkedok_szama) || 0,
        szakmai_okatatasban_sikeresen_vegzettek_szama:
          parseInt(
            addDialog.newRecord.szakmai_okatatasban_sikeresen_vegzettek_szama
          ) || 0,
      };

      await addElhelyezkedes(newRecord).unwrap();

      // Show success notification
      setNotification({
        open: true,
        message: `Új elhelyezkedési rekord sikeresen hozzáadva: ${addDialog.newRecord.selectedSchool?.iskola_neve || "Ismeretlen iskola"
          } - ${newRecord.tanev_kezdete}/${newRecord.tanev_kezdete + 1}`,
        severity: "success",
      });

      // Close dialog
      closeAddDialog();

      console.log("Successfully added new employment record");
    } catch (error) {
      console.error("Error adding new employment record:", error);

      // Show error notification
      setNotification({
        open: true,
        message: `Hiba történt az új rekord hozzáadása során: ${error.data?.message || error.message || "Ismeretlen hiba"
          }`,
        severity: "error",
      });
    }
  };

  // Extract unique szakirányok and szakmák from existing data
  const uniqueSzakiranyok = useMemo(() => {
    if (!employmentData || !Array.isArray(employmentData)) return [];

    const szakiranyMap = new Map();
    employmentData.forEach((item) => {
      if (item.szakirany && item.szakirany.id && item.szakirany.nev) {
        szakiranyMap.set(item.szakirany.id, {
          id: item.szakirany.id,
          nev: item.szakirany.nev,
        });
      }
    });

    return Array.from(szakiranyMap.values()).sort((a, b) =>
      a.nev.localeCompare(b.nev)
    );
  }, [employmentData]);

  const uniqueSzakmak = useMemo(() => {
    if (!employmentData || !Array.isArray(employmentData)) return [];

    const szakmaMap = new Map();
    employmentData.forEach((item) => {
      if (item.szakma && item.szakma.id && item.szakma.nev) {
        szakmaMap.set(item.szakma.id, {
          id: item.szakma.id,
          nev: item.szakma.nev,
        });
      }
    });

    return Array.from(szakmaMap.values()).sort((a, b) =>
      a.nev.localeCompare(b.nev)
    );
  }, [employmentData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {};

    employmentData.forEach((item) => {
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      if (!stats[year]) {
        stats[year] = {
          totalElhelyezkedok: 0,
          totalVegzettek: 0,
          count: 0,
        };
      }
      stats[year].totalElhelyezkedok += parseInt(item.elhelyezkedok_szama) || 0;
      stats[year].totalVegzettek +=
        parseInt(item.szakmai_okatatasban_sikeresen_vegzettek_szama) || 0;
      stats[year].count += 1;
    });

    // Calculate percentages
    Object.keys(stats).forEach((year) => {
      const yearStats = stats[year];
      yearStats.elhelyezkedesiArany =
        yearStats.totalVegzettek > 0
          ? (
            (yearStats.totalElhelyezkedok / yearStats.totalVegzettek) *
            100
          ).toFixed(2)
          : 0;
    });

    return stats;
  }, [employmentData]);

  return (
    <PageWrapper
      titleContent={<TitleElhelyezkedesiMutato />}
      infoContent={<InfoElhelyezkedesiMutato />}
    >
      <Box sx={{ p: 3 }}>
        <LockStatusIndicator tableName="elhelyezkedes" />

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
            Hiba történt az adatok betöltése során:{" "}
            {fetchError.message || "Ismeretlen hiba"}
          </Alert>
        )}

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
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Elhelyezkedők száma (fő)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Végzettek száma (fő)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Elhelyezkedési arány (%)
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
                        <TableCell align="center">
                          {stats.totalElhelyezkedok}
                        </TableCell>
                        <TableCell align="center">
                          {stats.totalVegzettek}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", color: "primary.main" }}
                        >
                          {stats.elhelyezkedesiArany}%
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
              Elhelyezkedők kell tekinteni mindazokat, akik:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  szakképző iskolában végzettek és érettségire felkészítő
                  képzésben tanultak tovább,
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  technikumban végzettek és felsőoktatásban tanultak tovább,
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  szakképző iskolában vagy technikumban végzettek és másodiku vagy
                  további szakképesítés megszerzésért tanultak tovább,
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  szakképző iskolában vagy technikumban végzettek és a sikeresen
                  befejezett szakmai oktatásban sikeresen megszerzett szakmai
                  végzettségüknek megfelelő munkakörben helyezkedtek el,
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  szakképző iskolában vagy technikumban végzettek, akik egyéb
                  módon helyezkedtek el.
                </Typography>
              </li>
            </Box>

            <Box
              sx={{ mt: 3, p: 2, backgroundColor: "#fff2cc", borderRadius: 1 }}
            >
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                <strong>Számítási módszer:</strong>
                <br />
                Szakmai oktatásban tanulói jogviszonyban végzett elhelyezkedési
                száma / Szakmai oktatásban tanulói jogviszonyban sikeresen
                végzettek száma × 100
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Detailed Data by School, Specialty, and Profession */}
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Részletes elhelyezkedési adatok iskolák, szakirányok és szakmák
              szerint
            </Typography>

            {/* Show empty state if no data */}
            {!employmentData || employmentData.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  📊 Nincs megjeleníthető adat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isFetching
                    ? "Adatok betöltése folyamatban..."
                    : "Nincsenek elhelyezkedési adatok a kiválasztott időszakra."}
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
                    {Object.entries(schoolData).map(
                      ([szakiranyName, szakiranyData]) => (
                        <Box key={szakiranyName} sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: "bold",
                              mb: 2,
                              color: "primary.main",
                            }}
                          >
                            📚 {szakiranyName}
                          </Typography>

                          {Object.entries(szakiranyData).map(
                            ([szakmaName, szakmaData]) => (
                              <Box key={szakmaName} sx={{ mb: 2, pl: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: "medium", mb: 1 }}
                                >
                                  🔧 {szakmaName}
                                </Typography>

                                <TableContainer
                                  component={Paper}
                                  variant="outlined"
                                  sx={{ mb: 2 }}
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
                                            backgroundColor: "#d5e8d4",
                                          }}
                                        >
                                          Elhelyezkedők (fő)
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#e8f4fd",
                                          }}
                                        >
                                          Végzettek (fő)
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#fff2cc",
                                          }}
                                        >
                                          Arány (%)
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
                                      {Object.entries(szakmaData).map(
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
                                                backgroundColor: "#d5e8d4" + "40",
                                              }}
                                            >
                                              <TextField
                                                type="number"
                                                value={
                                                  data.elhelyezkedok_szama || 0
                                                }
                                                onChange={(e) =>
                                                  handleDataChange(
                                                    data.id,
                                                    "elhelyezkedok_szama",
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
                                                backgroundColor: "#e8f4fd" + "40",
                                              }}
                                            >
                                              <TextField
                                                type="number"
                                                value={
                                                  data.szakmai_okatatasban_sikeresen_vegzettek_szama ||
                                                  0
                                                }
                                                onChange={(e) =>
                                                  handleDataChange(
                                                    data.id,
                                                    "szakmai_okatatasban_sikeresen_vegzettek_szama",
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
                                                backgroundColor: "#fff2cc" + "40",
                                                fontWeight: "bold",
                                                color: "primary.main",
                                              }}
                                            >
                                              {data.elhelyezkedesi_arany}%
                                            </TableCell>
                                            <TableCell align="center">
                                              <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                  openDeleteDialog(
                                                    data.alapadatok?.id,
                                                    data.alapadatok
                                                      ?.iskola_neve || schoolName,
                                                    year
                                                  )
                                                }
                                                title={`Törlés: ${schoolName} - ${year}`}
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
                            )
                          )}

                          {Object.keys(szakiranyData).length > 1 && (
                            <Divider sx={{ my: 2 }} />
                          )}
                        </Box>
                      )
                    )}
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

            {!isModified && employmentData.length > 0 && (
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
            <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
              <Chip
                label="Elhelyezkedők száma (fő)"
                variant="outlined"
                sx={{ backgroundColor: "#d5e8d4" }}
              />
              <Chip
                label="Végzettek száma (fő)"
                variant="outlined"
                sx={{ backgroundColor: "#e8f4fd" }}
              />
              <Chip
                label="Elhelyezkedési arány (%)"
                variant="outlined"
                sx={{ backgroundColor: "#fff2cc" }}
              />
            </Stack>
            <Typography variant="body2">
              A táblázat az elhelyezkedési mutatókat jeleníti meg iskolák,
              szakirányok és szakmák szerint csoportosítva. Az arányok
              automatikusan számítódnak az elhelyezkedők és végzettek számából.
            </Typography>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() =>
            setDeleteDialog({
              open: false,
              schoolId: null,
              schoolName: "",
              year: "",
            })
          }
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Törlés megerősítése</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Biztosan törölni szeretnéd a következő elhelyezkedési adatokat?
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
                  schoolId: null,
                  schoolName: "",
                  year: "",
                })
              }
              color="primary"
            >
              Mégse
            </Button>
            <Button
              onClick={() =>
                handleDeleteBySchoolAndYear(
                  deleteDialog.schoolId,
                  deleteDialog.year
                )
              }
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
          aria-labelledby="add-dialog-title"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle id="add-dialog-title">
            Új elhelyezkedési rekord hozzáadása
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Válaszd ki az iskolát, szakirányt és szakmát a legördülő
                  menükből, majd add meg az elhelyezkedési adatokat:
                </Typography>
                {(!schoolsData || schoolsData.length === 0) &&
                  !isLoadingSchools && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Nincsenek elérhető iskolák. Ellenőrizd az API kapcsolatot.
                    </Alert>
                  )}
                {(uniqueSzakiranyok.length === 0 || uniqueSzakmak.length === 0) &&
                  employmentData.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      A szakirányok és szakmák listája a meglévő adatok alapján
                      töltődik fel. Ha ez az első rekord, lehet, hogy üres lesz a
                      lista.
                    </Alert>
                  )}
              </Grid>

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
                  {isLoadingSchools && (
                    <Typography variant="caption" color="text.secondary">
                      Iskolák betöltése...
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Szakirány *</InputLabel>
                  <Select
                    value={addDialog.newRecord.selectedSzakirany?.id || ""}
                    label="Szakirány *"
                    onChange={(e) => {
                      const selectedSzakirany = uniqueSzakiranyok.find(
                        (sz) => sz.id === e.target.value
                      );
                      handleNewRecordChange(
                        "selectedSzakirany",
                        selectedSzakirany
                      );
                      handleNewRecordChange("szakirany_id", e.target.value);
                    }}
                    required
                  >
                    {uniqueSzakiranyok.map((szakirany) => (
                      <MenuItem key={szakirany.id} value={szakirany.id}>
                        {szakirany.nev}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary">
                    {uniqueSzakiranyok.length === 0
                      ? "Nincs elérhető szakirány"
                      : `${uniqueSzakiranyok.length} szakirány érhető el`}
                  </Typography>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Szakma *</InputLabel>
                  <Select
                    value={addDialog.newRecord.selectedSzakma?.id || ""}
                    label="Szakma *"
                    onChange={(e) => {
                      const selectedSzakma = uniqueSzakmak.find(
                        (sz) => sz.id === e.target.value
                      );
                      handleNewRecordChange("selectedSzakma", selectedSzakma);
                      handleNewRecordChange("szakma_id", e.target.value);
                    }}
                    required
                  >
                    {uniqueSzakmak.map((szakma) => (
                      <MenuItem key={szakma.id} value={szakma.id}>
                        {szakma.nev}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary">
                    {uniqueSzakmak.length === 0
                      ? "Nincs elérhető szakma"
                      : `${uniqueSzakmak.length} szakma érhető el`}
                  </Typography>
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
                  label="Elhelyezkedők száma (fő)"
                  type="number"
                  value={addDialog.newRecord.elhelyezkedok_szama}
                  onChange={(e) =>
                    handleNewRecordChange("elhelyezkedok_szama", e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  helperText="A sikeresen elhelyezkedett végzettek száma"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Végzettek száma (fő)"
                  type="number"
                  value={
                    addDialog.newRecord
                      .szakmai_okatatasban_sikeresen_vegzettek_szama
                  }
                  onChange={(e) =>
                    handleNewRecordChange(
                      "szakmai_okatatasban_sikeresen_vegzettek_szama",
                      e.target.value
                    )
                  }
                  inputProps={{ min: 0 }}
                  helperText="A szakmai oktatásban sikeresen végzettek száma"
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
                  <strong>Számított elhelyezkedési arány:</strong>{" "}
                  {addDialog.newRecord
                    .szakmai_okatatasban_sikeresen_vegzettek_szama > 0
                    ? (
                      (addDialog.newRecord.elhelyezkedok_szama /
                        addDialog.newRecord
                          .szakmai_okatatasban_sikeresen_vegzettek_szama) *
                      100
                    ).toFixed(2)
                    : 0}
                  %
                </Typography>
              </Grid>

              {/* Fallback manual ID input - only show if no selections made */}
              {!addDialog.newRecord.selectedSchool &&
                !addDialog.newRecord.selectedSzakirany &&
                !addDialog.newRecord.selectedSzakma && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Fejlett felhasználóknak:</strong> Ha új
                        iskola/szakirány/szakma hozzáadására van szükség, használd
                        az alábbi ID mezőket:
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Iskola ID"
                            type="number"
                            value={addDialog.newRecord.alapadatok_id}
                            onChange={(e) =>
                              handleNewRecordChange(
                                "alapadatok_id",
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Szakirány ID"
                            type="number"
                            value={addDialog.newRecord.szakirany_id}
                            onChange={(e) =>
                              handleNewRecordChange(
                                "szakirany_id",
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Szakma ID"
                            type="number"
                            value={addDialog.newRecord.szakma_id}
                            onChange={(e) =>
                              handleNewRecordChange("szakma_id", e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                    </Alert>
                  </Grid>
                )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAddDialog} color="primary">
              Mégse
            </Button>
            <Button
              onClick={handleAddNewRecord}
              variant="contained"
              color="success"
              disabled={
                !(
                  addDialog.newRecord.selectedSchool ||
                  addDialog.newRecord.alapadatok_id
                ) ||
                !(
                  addDialog.newRecord.selectedSzakirany ||
                  addDialog.newRecord.szakirany_id
                ) ||
                !(
                  addDialog.newRecord.selectedSzakma ||
                  addDialog.newRecord.szakma_id
                ) ||
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
                aria-label="close"
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
    </PageWrapper>
  );
}

