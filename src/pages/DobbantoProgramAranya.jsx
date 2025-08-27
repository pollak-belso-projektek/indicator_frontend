import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
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
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import { selectSelectedSchool } from "../store/slices/authSlice";
import {
  useGetTanuloLetszamQuery,
  useAddDobbantoMutation,
  useUpdateDobbantoMutation,
  useGetDobbantoQuery,
} from "../store/api/apiSlice";
import {
  TableLoadingOverlay,
  NotificationSnackbar,
} from "../components/shared";

export default function DobbantoProgramAránya() {
  const schoolYears = generateSchoolYears();
  const selectedSchool = useSelector(selectSelectedSchool);

  // Fetch student data from API
  const { data: apiStudentData, isLoading: isFetching } =
    useGetTanuloLetszamQuery(
      { alapadatok_id: selectedSchool?.id },
      { skip: !selectedSchool?.id } // Skip the query if no school is selected
    );

  // Fetch existing dobbanto data from API for all years
  const dobbantoQueries = schoolYears.map((yearRange) => {
    const startYear = parseInt(yearRange.split("/")[0]);
    return useGetDobbantoQuery(
      {
        alapadatok_id: selectedSchool?.id,
        tanev: startYear,
      },
      { skip: !selectedSchool?.id }
    );
  });

  // Memoize combined dobbanto data and loading states to prevent infinite loops
  const existingDobbantoData = useMemo(() => {
    return dobbantoQueries.flatMap((query) => query.data || []);
  }, [
    dobbantoQueries.map((q) => q.data?.length).join(","),
    selectedSchool?.id,
  ]);

  const isDobbantoFetching = useMemo(() => {
    return dobbantoQueries.some((query) => query.isLoading);
  }, [dobbantoQueries.map((q) => q.isLoading).join(",")]);

  // Mutations for saving dobbanto data
  const [addDobbanto, { isLoading: isAdding, error: addError }] =
    useAddDobbantoMutation();
  const [updateDobbanto, { isLoading: isUpdating, error: updateError }] =
    useUpdateDobbantoMutation();

  const isSaving = isAdding || isUpdating;
  const saveError = addError || updateError;

  // Data structure for the three main sections
  const [dobbantoData, setDobbantoData] = useState(() => {
    const initialData = {
      percentage_overall: {},
      dobbanto_students: {},
      total_students: {},
    };

    // Initialize all sections with school years
    Object.keys(initialData).forEach((section) => {
      schoolYears.forEach((year) => {
        initialData[section][year] = "0";
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Snackbar state for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Extract total student data (all jogv_tipus) from API response
  const extractTotalStudentData = (apiData) => {
    const totalStudentData = {};
    schoolYears.forEach((yearRange) => {
      const startYear = parseInt(yearRange.split("/")[0]);
      totalStudentData[yearRange] = 0;

      if (apiData && Array.isArray(apiData)) {
        // Find all records for this year (all jogv_tipus)
        const yearRecords = apiData.filter(
          (record) => record.tanev_kezdete === startYear
        );

        // Sum up all the student counts
        const totalCount = yearRecords.reduce((sum, record) => {
          return sum + (record.letszam || 0);
        }, 0);

        totalStudentData[yearRange] = totalCount;
      }
    });
    return totalStudentData;
  };

  // Load total student data from API when available
  useEffect(() => {
    if (apiStudentData && Array.isArray(apiStudentData)) {
      console.log(
        "Loading student data from API for Dobbantó:",
        apiStudentData
      );

      // Extract total student data (all jogv_tipus combined)
      const totalStudentData = extractTotalStudentData(apiStudentData);

      // Update the total_students in dobbantoData
      setDobbantoData((prev) => ({
        ...prev,
        total_students: totalStudentData,
      }));

      console.log("Total student data for Dobbantó:", totalStudentData);
    }
  }, [apiStudentData]);

  // Load existing dobbanto data from API when available
  useEffect(() => {
    if (existingDobbantoData && existingDobbantoData.length > 0) {
      console.log("Loading existing dobbanto data:", existingDobbantoData);

      const dobbantoStudentsData = {};

      // Process existing dobbanto data
      existingDobbantoData.forEach((record) => {
        const yearRange = `${record.tanev_kezdete}/${record.tanev_kezdete + 1}`;
        dobbantoStudentsData[yearRange] = record.dobbanto_szama || 0;
      });

      // Update dobbanto_students with existing data
      setDobbantoData((prev) => ({
        ...prev,
        dobbanto_students: dobbantoStudentsData,
      }));

      // Set as saved data since this is loaded from server
      setSavedData((prev) => ({
        ...prev,
        dobbanto_students: dobbantoStudentsData,
      }));

      console.log("Loaded dobbanto students data:", dobbantoStudentsData);
    }
  }, [existingDobbantoData.length, selectedSchool?.id]);

  // Handle data changes - csak a dobbanto_students módosítható
  const handleDataChange = (section, year, value) => {
    // Csak a dobbanto_students szerkeszthető
    if (section !== "dobbanto_students") return;

    setDobbantoData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [year]: value,
      },
    }));
    setIsModified(true);
  };

  // Calculate percentage automatically
  const calculatePercentage = (year) => {
    const dobbantoStudents = parseFloat(
      dobbantoData.dobbanto_students[year] || 0
    );
    const total = parseFloat(dobbantoData.total_students[year] || 0);

    if (total > 0) {
      const percentage = ((dobbantoStudents / total) * 100).toFixed(1);
      return percentage;
    }
    return "0.0";
  };

  // Auto-calculate percentages when dobbanto_students or total_students change
  useEffect(() => {
    const newPercentages = {};
    schoolYears.forEach((year) => {
      newPercentages[year] = calculatePercentage(year);
    });

    setDobbantoData((prev) => ({
      ...prev,
      percentage_overall: newPercentages,
    }));
  }, [
    JSON.stringify(dobbantoData.dobbanto_students),
    JSON.stringify(dobbantoData.total_students),
  ]);

  const handleSave = async () => {
    if (!selectedSchool?.id) {
      setSnackbarMessage("Kérjük, válasszon ki egy iskolát a mentés előtt!");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Mentés minden tanévre külön-külön
      const savePromises = schoolYears.map(async (yearRange) => {
        const startYear = parseInt(yearRange.split("/")[0]);
        const dobbantoStudents = parseInt(
          dobbantoData.dobbanto_students[yearRange] || 0
        );
        const totalStudents = parseInt(
          dobbantoData.total_students[yearRange] || 0
        );

        // Ensure we're sending valid numbers, not NaN
        const validDobbantoStudents = isNaN(dobbantoStudents)
          ? 0
          : dobbantoStudents;
        const validTotalStudents = isNaN(totalStudents) ? 0 : totalStudents;

        console.log(
          `Mentés ${yearRange}: dobbanto=${validDobbantoStudents}, total=${validTotalStudents}`
        );

        // Check if data already exists for this year
        const existingRecord = existingDobbantoData?.find(
          (record) => record.tanev_kezdete === startYear
        );

        const payload = {
          alapadatok_id: selectedSchool.id,
          tanev_kezdete: startYear,
          dobbanto_szama: validDobbantoStudents,
          tanulok_osszesen: validTotalStudents,
        };

        if (existingRecord) {
          // Update existing record (PUT)
          console.log(
            `Updating existing record for ${yearRange}, ID: ${existingRecord.id}`
          );
          return await updateDobbanto({
            id: existingRecord.id,
            ...payload,
          }).unwrap();
        } else {
          // Create new record (POST)
          console.log(`Creating new record for ${yearRange}`);
          return await addDobbanto(payload).unwrap();
        }
      });

      await Promise.all(savePromises);

      setSavedData(JSON.parse(JSON.stringify(dobbantoData)));
      setIsModified(false);
      console.log("Dobbantó program adatok sikeresen mentve!");

      // Show success notification
      setSnackbarMessage("Dobbantó program adatok sikeresen mentve!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      const errorMessage =
        error?.data?.message || error.message || "Hiba történt a mentés során";

      // Show error notification
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleReset = () => {
    if (savedData) {
      setDobbantoData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dobbantó programban tanulók aránya a teljes létszámhoz viszonyítva [%]
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adott tanévben a tanulói jogviszonnyal rendelkező tanulók létszáma
        (tanulói összlétszám) és a Dobbantó programban résztvevők aránya.
      </Typography>

      {/* Selected School Alert */}
      {!selectedSchool && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Nincs iskola kiválasztva - válasszon ki egy iskolát a mentéshez!
        </Alert>
      )}

      {selectedSchool && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Kiválasztott iskola: <strong>{selectedSchool.iskola_neve}</strong>
        </Alert>
      )}

      {/* Loading State */}
      {(isFetching || isDobbantoFetching) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          {isFetching && isDobbantoFetching
            ? "Tanulói létszám és Dobbantó adatok betöltése..."
            : isFetching
            ? "Tanulói létszám adatok betöltése..."
            : "Dobbantó program adatok betöltése..."}
        </Alert>
      )}

      {/* Main Data Tables */}
      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isModified || !selectedSchool?.id || isSaving}
        >
          {isSaving ? "Mentés..." : "Mentés"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={!isModified || !savedData || isSaving}
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
      {/* Percentage Overview Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: "#d32f2f",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Dobbantó programban tanulók aránya
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Tanulói és felnőttképzési jogviszony (%) - Automatikusan kalkulált
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto", position: "relative" }}
          >
            <TableLoadingOverlay
              isLoading={isSaving}
              message="Dobbantó program adatok mentése folyamatban..."
            />
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#ffebee" }}>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 120,
                        backgroundColor: "#e8f4fd",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ backgroundColor: "#fff3e0" }}>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        backgroundColor: "#f8fdf8",
                        fontWeight: "medium",
                        fontSize: "1.1rem",
                      }}
                    >
                      {dobbantoData.percentage_overall[year] || "0.0"}%
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dobbantó Students Count Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: "#1976d2",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Dobbantó programban tanulók száma
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Tanulói és felnőttképzési jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto", position: "relative" }}
          >
            <TableLoadingOverlay
              isLoading={isSaving}
              message="Dobbantó program adatok mentése folyamatban..."
            />
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 120,
                        backgroundColor: "#e8f4fd",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                  {schoolYears.map((year) => (
                    <TableCell key={year} align="center">
                      <TextField
                        type="number"
                        value={dobbantoData.dobbanto_students[year] || "0"}
                        onChange={(e) =>
                          handleDataChange(
                            "dobbanto_students",
                            year,
                            e.target.value
                          )
                        }
                        size="small"
                        inputProps={{
                          min: 0,
                          step: 1,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "80px" }}
                        placeholder="0"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Total Students Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: "#1976d2",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Tanulói összlétszám
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Tanulói és felnőttképzési jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto", position: "relative" }}
          >
            <TableLoadingOverlay
              isLoading={isSaving}
              message="Dobbantó program adatok mentése folyamatban..."
            />
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8f5e8" }}>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 120,
                        backgroundColor: "#e8f4fd",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        backgroundColor: "#fafafa",
                        fontWeight: "medium",
                        fontSize: "1.1rem",
                      }}
                    >
                      {dobbantoData.total_students[year] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
}
