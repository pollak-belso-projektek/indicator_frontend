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
  Tabs,
  Tab,
  Container,
  Fade,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import {
  useGetAllIntezmenyiNeveltsegQuery,
  useAddIntezmenyiNeveltsegMutation,
  useUpdateIntezmenyiNeveltsegMutation,
  useDeleteIntezmenyiNeveltsegMutation,
  useGetAllAlapadatokQuery,
} from "../store/api/apiSlice";
import GenericYearlyChart from "../components/GenericYearlyChart";

export default function IntezmenyiNeveltseg() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiEducationData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllIntezmenyiNeveltsegQuery();

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addEducationData, { isLoading: isAdding }] =
    useAddIntezmenyiNeveltsegMutation();
  const [updateEducationData, { isLoading: isUpdating }] =
    useUpdateIntezmenyiNeveltsegMutation();
  const [deleteEducationData, { isLoading: isDeleting }] =
    useDeleteIntezmenyiNeveltsegMutation();

  const [educationData, setEducationData] = useState([]);
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
      selectedSchool: null,
      tanev_kezdete: "",
      altalanos_iskolai_vegzettseg: 0,
      kozepfoku_vegzettseg: 0,
      emelt_szintu_erettsegizenusz: 0,
      felsofoku_vegzettseg: 0,
      ogy_fokozat: 0,
      msc_fokozat: 0,
      phd_fokozat: 0,
      egyeb_szakmai_kepesites: 0,
    },
  });

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  // Transform and organize API data
  const organizedData = useMemo(() => {
    if (!educationData || !Array.isArray(educationData)) {
      return {};
    }

    const organized = {};

    educationData.forEach((item) => {
      const schoolName = item.alapadatok?.iskola_neve || "Ismeretlen iskola";
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;

      if (!organized[schoolName]) {
        organized[schoolName] = {};
      }

      // Calculate total and percentages
      const total =
        (parseInt(item.altalanos_iskolai_vegzettseg) || 0) +
        (parseInt(item.kozepfoku_vegzettseg) || 0) +
        (parseInt(item.emelt_szintu_erettsegizenusz) || 0) +
        (parseInt(item.felsofoku_vegzettseg) || 0) +
        (parseInt(item.ogy_fokozat) || 0) +
        (parseInt(item.msc_fokozat) || 0) +
        (parseInt(item.phd_fokozat) || 0) +
        (parseInt(item.egyeb_szakmai_kepesites) || 0);

      organized[schoolName][year] = {
        ...item,
        total_employees: total,
        percentages: {
          altalanos:
            total > 0
              ? (
                  ((parseInt(item.altalanos_iskolai_vegzettseg) || 0) / total) *
                  100
                ).toFixed(2)
              : 0,
          kozepfoku:
            total > 0
              ? (
                  ((parseInt(item.kozepfoku_vegzettseg) || 0) / total) *
                  100
                ).toFixed(2)
              : 0,
          emelt_szintu:
            total > 0
              ? (
                  ((parseInt(item.emelt_szintu_erettsegizenusz) || 0) / total) *
                  100
                ).toFixed(2)
              : 0,
          felsofoku:
            total > 0
              ? (
                  ((parseInt(item.felsofoku_vegzettseg) || 0) / total) *
                  100
                ).toFixed(2)
              : 0,
          ogy:
            total > 0
              ? (((parseInt(item.ogy_fokozat) || 0) / total) * 100).toFixed(2)
              : 0,
          msc:
            total > 0
              ? (((parseInt(item.msc_fokozat) || 0) / total) * 100).toFixed(2)
              : 0,
          phd:
            total > 0
              ? (((parseInt(item.phd_fokozat) || 0) / total) * 100).toFixed(2)
              : 0,
          egyeb:
            total > 0
              ? (
                  ((parseInt(item.egyeb_szakmai_kepesites) || 0) / total) *
                  100
                ).toFixed(2)
              : 0,
        },
      };
    });

    return organized;
  }, [educationData]);

  // Load data from API
  useEffect(() => {
    if (apiEducationData && Array.isArray(apiEducationData)) {
      setEducationData(apiEducationData);
    }
  }, [apiEducationData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    setEducationData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
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
      const itemsToUpdate = educationData.filter((item) =>
        modifiedIds.has(item.id)
      );

      for (const item of itemsToUpdate) {
        await updateEducationData({
          id: item.id,
          altalanos_iskolai_vegzettseg:
            parseInt(item.altalanos_iskolai_vegzettseg) || 0,
          kozepfoku_vegzettseg: parseInt(item.kozepfoku_vegzettseg) || 0,
          emelt_szintu_erettsegizenusz:
            parseInt(item.emelt_szintu_erettsegizenusz) || 0,
          felsofoku_vegzettseg: parseInt(item.felsofoku_vegzettseg) || 0,
          ogy_fokozat: parseInt(item.ogy_fokozat) || 0,
          msc_fokozat: parseInt(item.msc_fokozat) || 0,
          phd_fokozat: parseInt(item.phd_fokozat) || 0,
          egyeb_szakmai_kepesites: parseInt(item.egyeb_szakmai_kepesites) || 0,
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
      console.error("Error saving education data:", error);
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
    if (apiEducationData) {
      setEducationData([...apiEducationData]);
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEducationData(id).unwrap();

      setEducationData((prev) => prev.filter((item) => item.id !== id));

      setNotification({
        open: true,
        message: `Sikeresen törölve: ${deleteDialog.schoolName} - ${deleteDialog.year}`,
        severity: "success",
      });

      setDeleteDialog({ open: false, id: null, schoolName: "", year: "" });
    } catch (error) {
      console.error("Error deleting education data:", error);
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
        altalanos_iskolai_vegzettseg: 0,
        kozepfoku_vegzettseg: 0,
        emelt_szintu_erettsegizenusz: 0,
        felsofoku_vegzettseg: 0,
        ogy_fokozat: 0,
        msc_fokozat: 0,
        phd_fokozat: 0,
        egyeb_szakmai_kepesites: 0,
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
        altalanos_iskolai_vegzettseg: 0,
        kozepfoku_vegzettseg: 0,
        emelt_szintu_erettsegizenusz: 0,
        felsofoku_vegzettseg: 0,
        ogy_fokozat: 0,
        msc_fokozat: 0,
        phd_fokozat: 0,
        egyeb_szakmai_kepesites: 0,
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
        altalanos_iskolai_vegzettseg:
          parseInt(addDialog.newRecord.altalanos_iskolai_vegzettseg) || 0,
        kozepfoku_vegzettseg:
          parseInt(addDialog.newRecord.kozepfoku_vegzettseg) || 0,
        emelt_szintu_erettsegizenusz:
          parseInt(addDialog.newRecord.emelt_szintu_erettsegizenusz) || 0,
        felsofoku_vegzettseg:
          parseInt(addDialog.newRecord.felsofoku_vegzettseg) || 0,
        ogy_fokozat: parseInt(addDialog.newRecord.ogy_fokozat) || 0,
        msc_fokozat: parseInt(addDialog.newRecord.msc_fokozat) || 0,
        phd_fokozat: parseInt(addDialog.newRecord.phd_fokozat) || 0,
        egyeb_szakmai_kepesites:
          parseInt(addDialog.newRecord.egyeb_szakmai_kepesites) || 0,
      };

      await addEducationData(newRecord).unwrap();

      setNotification({
        open: true,
        message: `Új intézményi neveltsitég rekord sikeresen hozzáadva: ${
          addDialog.newRecord.selectedSchool?.iskola_neve || "Ismeretlen iskola"
        } - ${newRecord.tanev_kezdete}/${newRecord.tanev_kezdete + 1}`,
        severity: "success",
      });

      closeAddDialog();
    } catch (error) {
      console.error("Error adding new education data:", error);
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

    educationData.forEach((item) => {
      const year = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
      if (!stats[year]) {
        stats[year] = {
          totalAltalanos: 0,
          totalKozepfoku: 0,
          totalEmeltSzintu: 0,
          totalFelsofoku: 0,
          totalOgy: 0,
          totalMsc: 0,
          totalPhd: 0,
          totalEgyeb: 0,
          totalEmployees: 0,
          count: 0,
        };
      }

      stats[year].totalAltalanos +=
        parseInt(item.altalanos_iskolai_vegzettseg) || 0;
      stats[year].totalKozepfoku += parseInt(item.kozepfoku_vegzettseg) || 0;
      stats[year].totalEmeltSzintu +=
        parseInt(item.emelt_szintu_erettsegizenusz) || 0;
      stats[year].totalFelsofoku += parseInt(item.felsofoku_vegzettseg) || 0;
      stats[year].totalOgy += parseInt(item.ogy_fokozat) || 0;
      stats[year].totalMsc += parseInt(item.msc_fokozat) || 0;
      stats[year].totalPhd += parseInt(item.phd_fokozat) || 0;
      stats[year].totalEgyeb += parseInt(item.egyeb_szakmai_kepesites) || 0;
      stats[year].count += 1;
    });

    // Calculate totals and percentages
    Object.keys(stats).forEach((year) => {
      const yearStats = stats[year];
      yearStats.totalEmployees =
        yearStats.totalAltalanos +
        yearStats.totalKozepfoku +
        yearStats.totalEmeltSzintu +
        yearStats.totalFelsofoku +
        yearStats.totalOgy +
        yearStats.totalMsc +
        yearStats.totalPhd +
        yearStats.totalEgyeb;

      if (yearStats.totalEmployees > 0) {
        yearStats.percentages = {
          altalanos: (
            (yearStats.totalAltalanos / yearStats.totalEmployees) *
            100
          ).toFixed(2),
          kozepfoku: (
            (yearStats.totalKozepfoku / yearStats.totalEmployees) *
            100
          ).toFixed(2),
          emeltSzintu: (
            (yearStats.totalEmeltSzintu / yearStats.totalEmployees) *
            100
          ).toFixed(2),
          felsofoku: (
            (yearStats.totalFelsofoku / yearStats.totalEmployees) *
            100
          ).toFixed(2),
          ogy: ((yearStats.totalOgy / yearStats.totalEmployees) * 100).toFixed(
            2
          ),
          msc: ((yearStats.totalMsc / yearStats.totalEmployees) * 100).toFixed(
            2
          ),
          phd: ((yearStats.totalPhd / yearStats.totalEmployees) * 100).toFixed(
            2
          ),
          egyeb: (
            (yearStats.totalEgyeb / yearStats.totalEmployees) *
            100
          ).toFixed(2),
        };
      } else {
        yearStats.percentages = {
          altalanos: 0,
          kozepfoku: 0,
          emeltSzintu: 0,
          felsofoku: 0,
          ogy: 0,
          msc: 0,
          phd: 0,
          egyeb: 0,
        };
      }
    });

    return stats;
  }, [educationData]);

  // Education level fields for dynamic rendering
  const educationFields = [
    {
      key: "altalanos_iskolai_vegzettseg",
      label: "Általános iskolai",
      color: "#ffcccc",
    },
    { key: "kozepfoku_vegzettseg", label: "Középfokú", color: "#ffe6cc" },
    {
      key: "emelt_szintu_erettsegizenusz",
      label: "Emelt szintű érettségi",
      color: "#fff3cd",
    },
    { key: "felsofoku_vegzettseg", label: "Felsőfokú", color: "#d4edda" },
    { key: "ogy_fokozat", label: "OGY fokozat", color: "#cce5ff" },
    { key: "msc_fokozat", label: "MSc fokozat", color: "#e6ccff" },
    { key: "phd_fokozat", label: "PhD fokozat", color: "#ffccff" },
    {
      key: "egyeb_szakmai_kepesites",
      label: "Egyéb szakmai",
      color: "#e6f3ff",
    },
  ];

  const calculateNewRecordTotal = () => {
    return Object.values(addDialog.newRecord)
      .filter((_, index, array) => {
        const keys = Object.keys(addDialog.newRecord);
        const key = keys[index];
        return educationFields.some((field) => field.key === key);
      })
      .reduce((sum, value) => sum + (parseInt(value) || 0), 0);
  };

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
        Intézményi nevelettségi mutatók
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Az intézmény alkalmazottainak végzettségi szintjének nyomon követése
        iskolánként és tanévenként.
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
                      sx={{ fontWeight: "bold", backgroundColor: "#ffcccc" }}
                    >
                      Általános (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#ffe6cc" }}
                    >
                      Középfokú (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#d4edda" }}
                    >
                      Felsőfokú (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#cce5ff" }}
                    >
                      OGY (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#e6ccff" }}
                    >
                      MSc (fő)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", backgroundColor: "#ffccff" }}
                    >
                      PhD (fő)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Összesen (fő)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Intézmények
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
                        sx={{ backgroundColor: "#ffcccc40" }}
                      >
                        {stats.totalAltalanos} ({stats.percentages.altalanos}%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#ffe6cc40" }}
                      >
                        {stats.totalKozepfoku} ({stats.percentages.kozepfoku}%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#d4edda40" }}
                      >
                        {stats.totalFelsofoku} ({stats.percentages.felsofoku}%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#cce5ff40" }}
                      >
                        {stats.totalOgy} ({stats.percentages.ogy}%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#e6ccff40" }}
                      >
                        {stats.totalMsc} ({stats.percentages.msc}%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "#ffccff40" }}
                      >
                        {stats.totalPhd} ({stats.percentages.phd}%)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        {stats.totalEmployees}
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

      {/* Tab Navigation */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Intézményi nevelettség tabs"
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
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Végzettségi szintek kategóriái
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Általános iskolai végzettség:</strong> 8 általános
                befejezése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Középfokú végzettség:</strong> Érettségi bizonyítvány
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Emelt szintű érettségi:</strong> Legalább egy
                tantárgyból emelt szinten tett érettségi
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Felsőfokú végzettség:</strong> Főiskolai vagy egyetemi
                diploma
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>OGY fokozat:</strong> Okleveles Gimnáziumi Tanár fokozat
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>MSc fokozat:</strong> Mesterszintű egyetemi végzettség
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>PhD fokozat:</strong> Doktori fokozat
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Data by School */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Részletes nevelettségi adatok iskolák szerint
          </Typography>

          {/* Show empty state if no data */}
          {!educationData || educationData.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📊 Nincs megjeleníthető adat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isFetching
                  ? "Adatok betöltése folyamatban..."
                  : "Nincsenek intézményi nevelettségi adatok a kiválasztott időszakra."}
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
                          {educationFields.map((field) => (
                            <TableCell
                              key={field.key}
                              align="center"
                              sx={{
                                fontWeight: "bold",
                                backgroundColor: field.color,
                              }}
                            >
                              {field.label}
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Összesen
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
                            {educationFields.map((field) => (
                              <TableCell
                                key={field.key}
                                align="center"
                                sx={{ backgroundColor: field.color + "40" }}
                              >
                                <TextField
                                  type="number"
                                  value={data[field.key] || 0}
                                  onChange={(e) =>
                                    handleDataChange(
                                      data.id,
                                      field.key,
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                  inputProps={{
                                    min: 0,
                                    style: { textAlign: "center" },
                                  }}
                                  sx={{ width: "70px" }}
                                />
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ mt: 0.5 }}
                                >
                                  (
                                  {data.percentages[field.key.split("_")[0]] ||
                                    data.percentages[
                                      field.key.replace(/_.*/, "")
                                    ] ||
                                    "0"}
                                  %)
                                </Typography>
                              </TableCell>
                            ))}
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", color: "primary.main" }}
                            >
                              {data.total_employees}
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
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
            {educationFields.map((field) => (
              <Chip
                key={field.key}
                label={field.label}
                variant="outlined"
                sx={{ backgroundColor: field.color }}
              />
            ))}
          </Stack>
          <Typography variant="body2">
            A táblázat az intézményi alkalmazottak végzettségi szintjeit
            jeleníti meg iskolák és tanévek szerint. A zárójelben szereplő
            százalékos értékek az adott végzettségű alkalmazottak arányát
            mutatják.
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
            Biztosan törölni szeretnéd a következő nevelettségi adatokat?
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
        </Box>
      )}

      {/* Chart Tab Content */}
      {activeTab === 1 && (
        <Box>
          {(() => {
            // Prepare chart data - aggregate by year and category
            const chartData = schoolYears.map((year) => {
              let altalanos = 0;
              let kozepfoku = 0;
              let felsofoku = 0;
              let ogy = 0;
              let msc = 0;
              let phd = 0;

              // Aggregate data across all schools for this year
              Object.values(organizedData).forEach((schoolData) => {
                if (schoolData[year]) {
                  altalanos += schoolData[year].altalanos_iskolai_vegzettseg || 0;
                  kozepfoku += schoolData[year].kozepfoku_vegzettseg || 0;
                  felsofoku += schoolData[year].felsofoku_vegzettseg || 0;
                  ogy += schoolData[year].ogy_fokozat || 0;
                  msc += schoolData[year].msc_fokozat || 0;
                  phd += schoolData[year].phd_fokozat || 0;
                }
              });

              return {
                year: year,
                altalanos: altalanos,
                kozepfoku: kozepfoku,
                felsofoku: felsofoku,
                ogy: ogy,
                msc: msc,
                phd: phd,
              };
            });

            const chartDataKeys = ["altalanos", "kozepfoku", "felsofoku", "ogy", "msc", "phd"];
            const chartKeyLabels = {
              altalanos: "Általános iskola",
              kozepfoku: "Középfokú",
              felsofoku: "Felsőfokú",
              ogy: "OGY fokozat",
              msc: "MSc fokozat",
              phd: "PhD fokozat",
            };

            return (
              <GenericYearlyChart
                data={chartData}
                dataKeys={chartDataKeys}
                keyLabels={chartKeyLabels}
                yAxisLabel="Alkalmazottak száma (fő)"
                height={450}
                title="Intézményi nevelettségi mutatók alakulása"
              />
            );
          })()}
        </Box>
      )}

      {/* Add New Record Dialog */}
      <Dialog
        open={addDialog.open}
        onClose={closeAddDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Új intézményi nevelettségi rekord hozzáadása</DialogTitle>
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

            {educationFields.map((field) => (
              <Grid item xs={12} md={6} key={field.key}>
                <TextField
                  fullWidth
                  label={`${field.label} (fő)`}
                  type="number"
                  value={addDialog.newRecord[field.key]}
                  onChange={(e) =>
                    handleNewRecordChange(field.key, e.target.value)
                  }
                  inputProps={{ min: 0 }}
                  helperText={`${field.label} végzettségű alkalmazottak száma`}
                />
              </Grid>
            ))}

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
                <strong>Összesen alkalmazottak száma:</strong>{" "}
                {calculateNewRecordTotal()} fő
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
