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
import { generateSchoolYears } from "../utils/schoolYears";
import {
  useGetAllSzakmaiVizsgaEredmenyekQuery,
  useAddSzakmaiVizsgaEredmenyekMutation,
  useUpdateSzakmaiVizsgaEredmenyekMutation,
  useDeleteSzakmaiVizsgaEredmenyekMutation,
  useGetAllAlapadatokQuery,
} from "../store/api/apiSlice";
import PageWrapper from "./PageWrapper";
import LockStatusIndicator from "../components/LockStatusIndicator";
import LockedTableWrapper from "../components/LockedTableWrapper";
import InfoSzakmaiVizsga from "./indicators/12_szakmai_vizsga/info_szakmai_vizsga";
import TitleSzakmaiVizsga from "./indicators/12_szakmai_vizsga/title_szakmai_vizsga";


export default function SzakmaiVizsgaEredmenyek() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiExamData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllSzakmaiVizsgaEredmenyekQuery();

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addExamData, { isLoading: isAdding }] =
    useAddSzakmaiVizsgaEredmenyekMutation();
  const [updateExamData, { isLoading: isUpdating }] =
    useUpdateSzakmaiVizsgaEredmenyekMutation();
  const [deleteExamData, { isLoading: isDeleting }] =
    useDeleteSzakmaiVizsgaEredmenyekMutation();

  const [examData, setExamData] = useState([]);
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
    examType: "",
  });
  const [addDialog, setAddDialog] = useState({
    open: false,
    newRecord: {
      alapadatok_id: "",
      selectedSchool: null,
      tanev_kezdete: "",
      vizsga_tipus: "",
      vizsgara_jelentkezettek_szama: 0,
      sikeres_vizsgak_szama: 0,
      sikertelen_vizsgak_szama: 0,
    },
  });

  // Transform and organize API data
  const organizedData = useMemo(() => {
    if (!examData || !Array.isArray(examData)) {
      return {};
    }

    const organized = {};

    examData.forEach((item) => {
      const schoolName = item.alapadatok?.iskola_neve || "Ismeretlen iskola";
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      const examType = item.vizsga_tipus || "Ismeretlen vizsga";

      if (!organized[schoolName]) {
        organized[schoolName] = {};
      }
      if (!organized[schoolName][year]) {
        organized[schoolName][year] = {};
      }

      organized[schoolName][year][examType] = {
        ...item,
        sikeressegi_arany:
          item.vizsgara_jelentkezettek_szama > 0
            ? (
              (item.sikeres_vizsgak_szama /
                item.vizsgara_jelentkezettek_szama) *
              100
            ).toFixed(2)
            : 0,
        megjelenesi_arany:
          item.vizsgara_jelentkezettek_szama > 0
            ? (
              ((item.sikeres_vizsgak_szama + item.sikertelen_vizsgak_szama) /
                item.vizsgara_jelentkezettek_szama) *
              100
            ).toFixed(2)
            : 0,
      };
    });

    return organized;
  }, [examData]);

  // Load data from API
  useEffect(() => {
    if (apiExamData && Array.isArray(apiExamData)) {
      setExamData(apiExamData);
    }
  }, [apiExamData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    setExamData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate percentages when any field changes
          if (
            field === "vizsgara_jelentkezettek_szama" ||
            field === "sikeres_vizsgak_szama" ||
            field === "sikertelen_vizsgak_szama"
          ) {
            const jelentkezettek =
              field === "vizsgara_jelentkezettek_szama"
                ? parseInt(value) || 0
                : parseInt(item.vizsgara_jelentkezettek_szama) || 0;
            const sikeresek =
              field === "sikeres_vizsgak_szama"
                ? parseInt(value) || 0
                : parseInt(item.sikeres_vizsgak_szama) || 0;
            const sikertelenek =
              field === "sikertelen_vizsgak_szama"
                ? parseInt(value) || 0
                : parseInt(item.sikertelen_vizsgak_szama) || 0;

            updatedItem.sikeressegi_arany =
              jelentkezettek > 0
                ? ((sikeresek / jelentkezettek) * 100).toFixed(2)
                : 0;
            updatedItem.megjelenesi_arany =
              jelentkezettek > 0
                ? (((sikeresek + sikertelenek) / jelentkezettek) * 100).toFixed(
                  2
                )
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
      const itemsToUpdate = examData.filter((item) => modifiedIds.has(item.id));

      for (const item of itemsToUpdate) {
        await updateExamData({
          id: item.id,
          vizsgara_jelentkezettek_szama:
            parseInt(item.vizsgara_jelentkezettek_szama) || 0,
          sikeres_vizsgak_szama: parseInt(item.sikeres_vizsgak_szama) || 0,
          sikertelen_vizsgak_szama:
            parseInt(item.sikertelen_vizsgak_szama) || 0,
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
      console.error("Error saving exam data:", error);
      setNotification({
        open: true,
        message: `Hiba történt a mentés során: ${error.data?.message || error.message
          }`,
        severity: "error",
      });
    }
  };

  const handleReset = () => {
    if (apiExamData) {
      setExamData([...apiExamData]);
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExamData(id).unwrap();

      setExamData((prev) => prev.filter((item) => item.id !== id));

      setNotification({
        open: true,
        message: `Sikeresen törölve: ${deleteDialog.schoolName} - ${deleteDialog.year} - ${deleteDialog.examType}`,
        severity: "success",
      });

      setDeleteDialog({
        open: false,
        id: null,
        schoolName: "",
        year: "",
        examType: "",
      });
    } catch (error) {
      console.error("Error deleting exam data:", error);
      setNotification({
        open: true,
        message: `Hiba történt a törlés során: ${error.data?.message || error.message
          }`,
        severity: "error",
      });
    }
  };

  const openDeleteDialog = (id, schoolName, year, examType) => {
    setDeleteDialog({ open: true, id, schoolName, year, examType });
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
        vizsga_tipus: "",
        vizsgara_jelentkezettek_szama: 0,
        sikeres_vizsgak_szama: 0,
        sikertelen_vizsgak_szama: 0,
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
        vizsga_tipus: "",
        vizsgara_jelentkezettek_szama: 0,
        sikeres_vizsgak_szama: 0,
        sikertelen_vizsgak_szama: 0,
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
        vizsga_tipus: addDialog.newRecord.vizsga_tipus,
        vizsgara_jelentkezettek_szama:
          parseInt(addDialog.newRecord.vizsgara_jelentkezettek_szama) || 0,
        sikeres_vizsgak_szama:
          parseInt(addDialog.newRecord.sikeres_vizsgak_szama) || 0,
        sikertelen_vizsgak_szama:
          parseInt(addDialog.newRecord.sikertelen_vizsgak_szama) || 0,
      };

      await addExamData(newRecord).unwrap();

      setNotification({
        open: true,
        message: `Új szakmai vizsga rekord sikeresen hozzáadva: ${addDialog.newRecord.selectedSchool?.iskola_neve || "Ismeretlen iskola"
          } - ${newRecord.tanev_kezdete}/${newRecord.tanev_kezdete + 1} - ${newRecord.vizsga_tipus
          }`,
        severity: "success",
      });

      closeAddDialog();
    } catch (error) {
      console.error("Error adding new exam data:", error);
      setNotification({
        open: true,
        message: `Hiba történt az új rekord hozzáadása során: ${error.data?.message || error.message
          }`,
        severity: "error",
      });
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {};

    examData.forEach((item) => {
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      if (!stats[year]) {
        stats[year] = {
          totalJelentkezettek: 0,
          totalSikeresek: 0,
          totalSikertelenek: 0,
          count: 0,
          examTypes: new Set(),
        };
      }
      stats[year].totalJelentkezettek +=
        parseInt(item.vizsgara_jelentkezettek_szama) || 0;
      stats[year].totalSikeresek += parseInt(item.sikeres_vizsgak_szama) || 0;
      stats[year].totalSikertelenek +=
        parseInt(item.sikertelen_vizsgak_szama) || 0;
      stats[year].count += 1;
      stats[year].examTypes.add(item.vizsga_tipus);
    });

    // Calculate percentages
    Object.keys(stats).forEach((year) => {
      const yearStats = stats[year];
      yearStats.sikerességiArany =
        yearStats.totalJelentkezettek > 0
          ? (
            (yearStats.totalSikeresek / yearStats.totalJelentkezettek) *
            100
          ).toFixed(2)
          : 0;
      yearStats.megjelenesiArany =
        yearStats.totalJelentkezettek > 0
          ? (
            ((yearStats.totalSikeresek + yearStats.totalSikertelenek) /
              yearStats.totalJelentkezettek) *
            100
          ).toFixed(2)
          : 0;
      yearStats.examTypesCount = yearStats.examTypes.size;
    });

    return stats;
  }, [examData]);

  // Common exam types for dropdown
  const commonExamTypes = [
    "Szakmai vizsga",
    "Komplex szakmai vizsga",
    "Részvizsga",
    "Pótvizsga",
    "Javítóvizsga",
    "Szakképesítő vizsga",
    "Modulzáró vizsga",
    "Egyéb szakmai vizsga",
  ];

  return (
    <PageWrapper
      titleContent={<TitleSzakmaiVizsga />}
      infoContent={<InfoSzakmaiVizsga />}
    >
      <Box sx={{ p: 3 }}>
        <LockStatusIndicator tableName="szakmai_vizsga_eredmenyek" />

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
                        sx={{ fontWeight: "bold", backgroundColor: "#e6f3ff" }}
                      >
                        Jelentkezettek (fő)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", backgroundColor: "#d4edda" }}
                      >
                        Sikeresek (fő)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", backgroundColor: "#f8d7da" }}
                      >
                        Sikertelenek (fő)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", backgroundColor: "#fff3cd" }}
                      >
                        Sikerességi arány (%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", backgroundColor: "#e2e3e5" }}
                      >
                        Megjelenési arány (%)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Vizsgatípusok
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Rekordok
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
                          sx={{ backgroundColor: "#e6f3ff40" }}
                        >
                          {stats.totalJelentkezettek}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: "#d4edda40" }}
                        >
                          {stats.totalSikeresek}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: "#f8d7da40" }}
                        >
                          {stats.totalSikertelenek}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            backgroundColor: "#fff3cd40",
                            fontWeight: "bold",
                            color: "primary.main",
                          }}
                        >
                          {stats.sikerességiArany}%
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            backgroundColor: "#e2e3e540",
                            fontWeight: "bold",
                          }}
                        >
                          {stats.megjelenesiArany}%
                        </TableCell>
                        <TableCell align="center">
                          {stats.examTypesCount}
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
              Szakmai vizsga típusok és értékelési szempontok
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Szakmai vizsga:</strong> Hagyományos szakmai vizsgák,
                  ahol a tanuló demonstrálja szakmai tudását
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Komplex szakmai vizsga:</strong> Több területet átfogó,
                  komplex szakmai vizsga
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Modulzáró vizsga:</strong> Egy adott szakmai modul
                  lezárását szolgáló vizsga
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Pótvizsga/Javítóvizsga:</strong> Korábban sikertelen
                  vagy elmulasztott vizsgák megismétlése
                </Typography>
              </li>
            </Box>

            <Box
              sx={{ mt: 3, p: 2, backgroundColor: "#fff2cc", borderRadius: 1 }}
            >
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                <strong>Számítási módszerek:</strong>
                <br />
                <strong>Sikerességi arány:</strong> Sikeres vizsgák száma /
                Vizsgára jelentkezettek száma × 100
                <br />
                <strong>Megjelenési arány:</strong> (Sikeres + Sikertelen vizsgák)
                / Jelentkezettek száma × 100
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Detailed Data by School */}
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Részletes szakmai vizsga eredmények iskolák szerint
            </Typography>

            {/* Show empty state if no data */}
            {!examData || examData.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  📊 Nincs megjeleníthető adat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isFetching
                    ? "Adatok betöltése folyamatban..."
                    : "Nincsenek szakmai vizsga adatok a kiválasztott időszakra."}
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
                                  Vizsga típus
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#e6f3ff",
                                  }}
                                >
                                  Jelentkezettek (fő)
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#d4edda",
                                  }}
                                >
                                  Sikeresek (fő)
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#f8d7da",
                                  }}
                                >
                                  Sikertelenek (fő)
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#fff3cd",
                                  }}
                                >
                                  Sikerességi arány (%)
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "#e2e3e5",
                                  }}
                                >
                                  Megjelenési arány (%)
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
                                ([examType, data]) => (
                                  <TableRow key={examType}>
                                    <TableCell sx={{ fontWeight: "medium" }}>
                                      {examType}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{ backgroundColor: "#e6f3ff40" }}
                                    >
                                      <TextField
                                        type="number"
                                        value={
                                          data.vizsgara_jelentkezettek_szama || 0
                                        }
                                        onChange={(e) =>
                                          handleDataChange(
                                            data.id,
                                            "vizsgara_jelentkezettek_szama",
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
                                        value={data.sikeres_vizsgak_szama || 0}
                                        onChange={(e) =>
                                          handleDataChange(
                                            data.id,
                                            "sikeres_vizsgak_szama",
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
                                      sx={{ backgroundColor: "#f8d7da40" }}
                                    >
                                      <TextField
                                        type="number"
                                        value={data.sikertelen_vizsgak_szama || 0}
                                        onChange={(e) =>
                                          handleDataChange(
                                            data.id,
                                            "sikertelen_vizsgak_szama",
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
                                        backgroundColor: "#fff3cd40",
                                        fontWeight: "bold",
                                        color: "primary.main",
                                      }}
                                    >
                                      {data.sikeressegi_arany}%
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{
                                        backgroundColor: "#e2e3e540",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data.megjelenesi_arany}%
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
                                            examType
                                          )
                                        }
                                        title={`Törlés: ${schoolName} - ${year} - ${examType}`}
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

                        {Object.keys(yearData).length > 1 && (
                          <Divider sx={{ my: 2 }} />
                        )}
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
                Új vizsga rekord hozzáadása
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
                label="Jelentkezettek száma"
                variant="outlined"
                sx={{ backgroundColor: "#e6f3ff" }}
              />
              <Chip
                label="Sikeres vizsgák"
                variant="outlined"
                sx={{ backgroundColor: "#d4edda" }}
              />
              <Chip
                label="Sikertelen vizsgák"
                variant="outlined"
                sx={{ backgroundColor: "#f8d7da" }}
              />
              <Chip
                label="Sikerességi arány (%)"
                variant="outlined"
                sx={{ backgroundColor: "#fff3cd" }}
              />
              <Chip
                label="Megjelenési arány (%)"
                variant="outlined"
                sx={{ backgroundColor: "#e2e3e5" }}
              />
            </Stack>
            <Typography variant="body2">
              A táblázat a szakmai vizsgák eredményeit jeleníti meg iskolák,
              tanévek és vizsgatípusok szerint csoportosítva. Az arányok
              automatikusan számítódnak a megadott értékek alapján.
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
              examType: "",
            })
          }
        >
          <DialogTitle>Törlés megerősítése</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Biztosan törölni szeretnéd a következő szakmai vizsga adatokat?
              <br />
              <strong>Iskola:</strong> {deleteDialog.schoolName}
              <br />
              <strong>Tanév:</strong> {deleteDialog.year}
              <br />
              <strong>Vizsga típus:</strong> {deleteDialog.examType}
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
                  examType: "",
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
          <DialogTitle>Új szakmai vizsga rekord hozzáadása</DialogTitle>
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

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vizsga típus *</InputLabel>
                  <Select
                    value={addDialog.newRecord.vizsga_tipus}
                    label="Vizsga típus *"
                    onChange={(e) =>
                      handleNewRecordChange("vizsga_tipus", e.target.value)
                    }
                    required
                  >
                    {commonExamTypes.map((examType) => (
                      <MenuItem key={examType} value={examType}>
                        {examType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Jelentkezettek száma (fő)"
                  type="number"
                  value={addDialog.newRecord.vizsgara_jelentkezettek_szama}
                  onChange={(e) =>
                    handleNewRecordChange(
                      "vizsgara_jelentkezettek_szama",
                      e.target.value
                    )
                  }
                  inputProps={{ min: 0 }}
                  helperText="Vizsgára jelentkezett tanulók száma"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sikeres vizsgák (fő)"
                  type="number"
                  value={addDialog.newRecord.sikeres_vizsgak_szama}
                  onChange={(e) =>
                    handleNewRecordChange("sikeres_vizsgak_szama", e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  helperText="Sikeresen teljesített vizsgák száma"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sikertelen vizsgák (fő)"
                  type="number"
                  value={addDialog.newRecord.sikertelen_vizsgak_szama}
                  onChange={(e) =>
                    handleNewRecordChange(
                      "sikertelen_vizsgak_szama",
                      e.target.value
                    )
                  }
                  inputProps={{ min: 0 }}
                  helperText="Sikertelenül teljesített vizsgák száma"
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
                  Sikerességi arány:{" "}
                  {addDialog.newRecord.vizsgara_jelentkezettek_szama > 0
                    ? (
                      (addDialog.newRecord.sikeres_vizsgak_szama /
                        addDialog.newRecord.vizsgara_jelentkezettek_szama) *
                      100
                    ).toFixed(2)
                    : 0}
                  %<br />
                  Megjelenési arány:{" "}
                  {addDialog.newRecord.vizsgara_jelentkezettek_szama > 0
                    ? (
                      (((parseInt(addDialog.newRecord.sikeres_vizsgak_szama) ||
                        0) +
                        (parseInt(
                          addDialog.newRecord.sikertelen_vizsgak_szama
                        ) || 0)) /
                        addDialog.newRecord.vizsgara_jelentkezettek_szama) *
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
                !addDialog.newRecord.vizsga_tipus ||
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
    </PageWrapper>
  );
}
