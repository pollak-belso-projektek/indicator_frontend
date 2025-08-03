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
  Chip,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import { selectSelectedSchool } from "../store/slices/authSlice";
import {
  useGetTanuloLetszamQuery,
  useAddMuhelyiskolaMutation,
  useUpdateMuhelyiskolaMutation,
  useGetMuhelyiskolaQuery,
} from "../store/api/apiSlice";
import {
  TableLoadingOverlay,
  NotificationSnackbar,
} from "../components/shared";

export default function MuhelyiskolaiReszszakmat() {
  const schoolYears = generateSchoolYears();
  const selectedSchool = useSelector(selectSelectedSchool);

  // Fetch student data from API
  const { data: apiStudentData, isLoading: isFetching } =
    useGetTanuloLetszamQuery(
      { alapadatok_id: selectedSchool?.id },
      { skip: !selectedSchool?.id } // Skip the query if no school is selected
    );

  // Fetch existing workshop school data from API for all years
  const workshopQueries = schoolYears.map((yearRange) => {
    const startYear = parseInt(yearRange.split("/")[0]);
    return useGetMuhelyiskolaQuery(
      {
        alapadatok_id: selectedSchool?.id,
        tanev: startYear,
      },
      { skip: !selectedSchool?.id }
    );
  });

  // Memoize combined workshop data and loading states to prevent infinite loops
  const existingWorkshopData = useMemo(() => {
    return workshopQueries.flatMap((query) => query.data || []);
  }, [
    workshopQueries.map((q) => q.data?.length).join(","),
    selectedSchool?.id,
  ]);

  const isWorkshopFetching = useMemo(() => {
    return workshopQueries.some((query) => query.isLoading);
  }, [workshopQueries.map((q) => q.isLoading).join(",")]);

  // Mutations for saving workshop data
  const [addWorkshop, { isLoading: isAdding, error: addError }] =
    useAddMuhelyiskolaMutation();
  const [updateWorkshop, { isLoading: isUpdating, error: updateError }] =
    useUpdateMuhelyiskolaMutation();

  const isSaving = isAdding || isUpdating;
  const saveError = addError || updateError;

  // Data structure for the three main sections
  const [workshopData, setWorkshopData] = useState(() => {
    const initialData = {
      percentage_overall: {},
      participants_count: {},
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
        "Loading student data from API for Workshop School:",
        apiStudentData
      );

      // Extract total student data (all jogv_tipus combined)
      const totalStudentData = extractTotalStudentData(apiStudentData);

      // Update the total_students in workshopData
      setWorkshopData((prev) => ({
        ...prev,
        total_students: totalStudentData,
      }));

      console.log("Total student data for Workshop School:", totalStudentData);
    }
  }, [apiStudentData]);

  // Load existing workshop data from API when available
  useEffect(() => {
    if (existingWorkshopData && existingWorkshopData.length > 0) {
      console.log("Loading existing workshop data:", existingWorkshopData);

      const participantsCountData = {};

      // Process existing workshop data
      existingWorkshopData.forEach((record) => {
        const yearRange = `${record.tanev_kezdete}/${record.tanev_kezdete + 1}`;
        participantsCountData[yearRange] = record.resztvevok_szama || 0;
      });

      // Update participants_count with existing data
      setWorkshopData((prev) => ({
        ...prev,
        participants_count: participantsCountData,
      }));

      // Set as saved data since this is loaded from server
      setSavedData((prev) => ({
        ...prev,
        participants_count: participantsCountData,
      }));

      console.log("Loaded workshop participants data:", participantsCountData);
    }
  }, [existingWorkshopData.length, selectedSchool?.id]);

  // Handle data changes - only participants_count is editable
  const handleDataChange = (section, year, value) => {
    // Only participants_count is editable
    if (section !== "participants_count") return;

    setWorkshopData((prev) => ({
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
    const participants = parseFloat(workshopData.participants_count[year] || 0);
    const total = parseFloat(workshopData.total_students[year] || 0);

    if (total > 0) {
      const percentage = ((participants / total) * 100).toFixed(1);
      return percentage;
    }
    return "0.0";
  };

  // Auto-calculate percentages when participants_count or total_students change
  useEffect(() => {
    const newPercentages = {};
    schoolYears.forEach((year) => {
      newPercentages[year] = calculatePercentage(year);
    });

    setWorkshopData((prev) => ({
      ...prev,
      percentage_overall: newPercentages,
    }));
  }, [
    JSON.stringify(workshopData.participants_count),
    JSON.stringify(workshopData.total_students),
  ]);

  const handleSave = async () => {
    if (!selectedSchool?.id) {
      setSnackbarMessage("Kérjük, válasszon ki egy iskolát a mentés előtt!");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Save for each school year separately
      const savePromises = schoolYears.map(async (yearRange) => {
        const startYear = parseInt(yearRange.split("/")[0]);
        const participants = parseInt(
          workshopData.participants_count[yearRange] || 0
        );
        const totalStudents = parseInt(
          workshopData.total_students[yearRange] || 0
        );

        // Ensure we're sending valid numbers, not NaN
        const validParticipants = isNaN(participants) ? 0 : participants;
        const validTotalStudents = isNaN(totalStudents) ? 0 : totalStudents;

        console.log(
          `Mentés ${yearRange}: participants=${validParticipants}, total=${validTotalStudents}`
        );

        // Check if data already exists for this year
        const existingRecord = existingWorkshopData?.find(
          (record) => record.tanev_kezdete === startYear
        );

        const payload = {
          alapadatok_id: selectedSchool.id,
          tanev_kezdete: startYear,
          resztvevok_szama: validParticipants,
          tanulok_osszesen: validTotalStudents,
        };

        if (existingRecord) {
          // Update existing record (PUT)
          console.log(
            `Updating existing record for ${yearRange}, ID: ${existingRecord.id}`
          );
          return await updateWorkshop({
            id: existingRecord.id,
            ...payload,
          }).unwrap();
        } else {
          // Create new record (POST)
          console.log(`Creating new record for ${yearRange}`);
          return await addWorkshop(payload).unwrap();
        }
      });

      await Promise.all(savePromises);

      setSavedData(JSON.parse(JSON.stringify(workshopData)));
      setIsModified(false);
      console.log("Műhelyiskolai adatok sikeresen mentve!");

      // Show success notification
      setSnackbarMessage("Műhelyiskolai adatok sikeresen mentve!");
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
      setWorkshopData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Loading overlay */}
      {(isFetching || isWorkshopFetching || isSaving) && (
        <TableLoadingOverlay />
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        21. Műhelyiskolában részszakmát szerzők aránya a képzésben résztvevők
        összlétszámához viszonyítva
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adott tanévben a műhelyiskolában tanulói és felnőttképzési jogviszonyú
        tanulók összlétszáma 11 fő.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            ?
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            <strong>Példa:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Adott tanévben a műhelyiskolában tanulói és felnőttképzési
            jogviszonyú tanulók összlétszáma 11 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            A műhelyiskolai képzést részszakma szerzésével befejezők száma 7 fő.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A mutató számítása tehát: (7 fő / 11 fő) * 100 = 63,6%.
          </Typography>

          <Box
            sx={{
              p: 2,
              backgroundColor: "#f0f8ff",
              borderRadius: 1,
              border: "1px solid #90caf9",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic", flex: 1 }}>
              <strong>Számítási képlet:</strong>
              <br />
              (Részszakmát szerző tanulók és felnőttképzési jogviszonyú tanulók
              száma / Műhelyiskolai tanulói és felnőttképzési jogviszonyú
              tanulók összlétszáma) × 100
            </Typography>
            <Box
              sx={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#1976d2",
                textAlign: "center",
                minWidth: "100px",
              }}
            >
              = %
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Data Tables */}

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
            Műhelyiskolában részszakmát szerzők aránya (%)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#ffebee" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 200,
                      textAlign: "center",
                      backgroundColor: "#ffcdd2",
                    }}
                  >
                    összesen
                  </TableCell>
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
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#ffcc02",
                      color: "#000",
                    }}
                  >
                    összesen
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell key={year} align="center">
                      <TextField
                        type="number"
                        value={workshopData.percentage_overall[year] || "0"}
                        size="small"
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: 0.1,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "80px" }}
                        placeholder="0-100"
                        disabled // Auto-calculated field
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Participant Count Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: "#1976d2",
              fontWeight: "bold",
            }}
          >
            részszakmát szerző tanulók száma
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tanulói és felnőttképzési jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
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
                        value={workshopData.participants_count[year] || "0"}
                        onChange={(e) =>
                          handleDataChange(
                            "participants_count",
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
            }}
          >
            Műhelyiskolai tanulói összlétszám
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tanulói és felnőttképzési jogviszony (fő)
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
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
                    <TableCell key={year} align="center">
                      <TextField
                        type="number"
                        value={workshopData.total_students[year] || "0"}
                        size="small"
                        inputProps={{
                          min: 0,
                          step: 1,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: "80px" }}
                        placeholder="0"
                        disabled // Read-only field from API
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Calculation Helper */}
      <Card sx={{ mb: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Automatikus számítás
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A százalékos értékek automatikusan kiszámításra kerülnek a résztvevő
            tanulók és az összlétszám alapján. Az összlétszám adatok az API-ból
            automatikusan betöltődnek.
          </Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Csak a "részszakmát szerző tanulók száma" mezők szerkeszthetők. A
            százalékos értékek és az összlétszám automatikusan
            számítódik/töltődik be.
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isModified || isSaving}
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
      {!selectedSchool && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Kérjük, válasszon ki egy iskolát az adatok betöltéséhez és mentéséhez.
        </Alert>
      )}

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

      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Hiba történt a mentés során:{" "}
          {saveError?.data?.message || saveError.message}
        </Alert>
      )}

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />

      {/* Workshop School Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Műhelyiskola képzés jellemzői
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip
              label="Gyakorlati képzés"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Részszakma szerzés"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label="Tanulói jogviszony"
              color="success"
              variant="outlined"
            />
            <Chip
              label="Felnőttképzési jogviszony"
              color="info"
              variant="outlined"
            />
            <Chip
              label="Szakmai kompetenciák"
              color="warning"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2">
            A műhelyiskolai képzés célja a tanulók gyakorlati készségeinek
            fejlesztése és részszakmák megszerzésének támogatása munkahelyi
            környezetben.
          </Typography>
        </CardContent>
      </Card>

      {/* Data Quality Guidelines */}
      <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Adatminőség irányelvek
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Részszakma szerzők:</strong> Csak a képzést sikeresen
                befejező és részszakmát szerző tanulók számítanak bele
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Összlétszám:</strong> Az adott tanévben műhelyiskolai
                képzésben résztvevő összes tanuló
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Jogviszonyok:</strong> Tanulói és felnőttképzési
                jogviszonyú tanulók együttesen
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Időszak:</strong> Tanévenként kell számítani az arányt
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Teljesítmény mutatók
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A műhelyiskolai képzés hatékonyságának értékelési szempontjai:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Befejezési arány:</strong> Magasabb százalék jobb
                teljesítményt jelez
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Trendanalízis:</strong> Évenkénti változások nyomon
                követése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Célérték:</strong> 80% feletti arány tekinthető
                kiválónak
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Benchmarking:</strong> Más intézményekkel való
                összehasonlítás
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
