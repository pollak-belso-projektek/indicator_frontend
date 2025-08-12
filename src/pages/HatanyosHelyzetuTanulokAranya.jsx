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
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import { selectSelectedSchool } from "../store/slices/authSlice";
import {
  useGetTanuloLetszamQuery,
  useGetHHesHHHNevelesuTanulokByYearQuery,
  useAddHHesHHHNevelesuTanulokMutation,
  useUpdateHHesHHHNevelesuTanulokMutation,
} from "../store/api/apiSlice";

export default function HatanyosHelyzetuTanulokAranya() {
  const schoolYears = useMemo(() => generateSchoolYears(), []);
  const selectedSchool = useSelector(selectSelectedSchool);

  // Get current school year for HH data fetching
  const currentSchoolYear = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return currentMonth >= 9 ? currentYear : currentYear - 1;
  }, []);

  // API hook to get student count data
  const {
    data: apiStudentData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetTanuloLetszamQuery(
    { alapadatok_id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  // API hook to get existing HH data
  const {
    data: hhApiData,
    error: hhFetchError,
    isLoading: isHhFetching,
  } = useGetHHesHHHNevelesuTanulokByYearQuery(currentSchoolYear, {
    skip: !selectedSchool?.id,
  });

  // API mutations for saving HH data
  const [addHHData, { isLoading: isAdding }] =
    useAddHHesHHHNevelesuTanulokMutation();
  const [updateHHData, { isLoading: isUpdating }] =
    useUpdateHHesHHHNevelesuTanulokMutation();

  // HH Students count - this is what users will input
  const [hhStudentsCount, setHhStudentsCount] = useState(() => {
    const initialData = {};

    // Initialize for daytime students (tanulói jogviszony)
    initialData.daytime = {};
    schoolYears.forEach((year) => {
      initialData.daytime[year] = "";
    });

    // Initialize for adult education (felnőttképzési jogviszony)
    initialData.adult = {};
    schoolYears.forEach((year) => {
      initialData.adult[year] = "";
    });

    return initialData;
  });

  // Total students data from API
  const [totalStudents, setTotalStudents] = useState(() => {
    const initialData = {};

    // Daytime students totals
    initialData.daytime = {};
    schoolYears.forEach((year) => {
      initialData.daytime[year] = 0;
    });

    // Adult education totals
    initialData.adult = {};
    schoolYears.forEach((year) => {
      initialData.adult[year] = 0;
    });

    // Combined totals (calculated automatically)
    initialData.combined = {};
    schoolYears.forEach((year) => {
      initialData.combined[year] = 0;
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle HH student count changes
  const handleHhStudentsChange = (category, year, value) => {
    setHhStudentsCount((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [year]: value,
      },
    }));
    setIsModified(true);
  };

  // Calculate percentage automatically from HH students count and total
  const calculatePercentage = (category, year) => {
    const hhCount = parseFloat(hhStudentsCount[category][year] || 0);
    const total = totalStudents[category][year] || 0;

    if (hhCount > 0 && total > 0) {
      return ((hhCount / total) * 100).toFixed(2);
    }
    return "0.00";
  };

  // Calculate combined values
  const getCombinedHhStudents = (year) => {
    const daytime = parseFloat(hhStudentsCount.daytime[year] || 0);
    const adult = parseFloat(hhStudentsCount.adult[year] || 0);
    return daytime + adult;
  };

  const getCombinedTotalStudents = (year) => {
    const daytime = totalStudents.daytime[year] || 0;
    const adult = totalStudents.adult[year] || 0;
    return daytime + adult;
  };

  const getCombinedPercentage = (year) => {
    const combinedHh = getCombinedHhStudents(year);
    const combinedTotal = getCombinedTotalStudents(year);

    if (combinedHh > 0 && combinedTotal > 0) {
      return ((combinedHh / combinedTotal) * 100).toFixed(2);
    }
    return "0.00";
  };

  const handleSave = async () => {
    if (!selectedSchool) {
      console.error("No school selected");
      return;
    }

    try {
      console.log("Saving HH students count data:", hhStudentsCount);

      // Prepare data for API based on the expected structure
      const dataToSave = [];

      schoolYears.forEach((year) => {
        const yearStart = parseInt(year.split("/")[0]);

        // Save daytime HH students if value exists
        const daytimeCount = parseInt(hhStudentsCount.daytime[year] || 0);
        if (daytimeCount > 0) {
          dataToSave.push({
            alapadatok_id: selectedSchool.id,
            tanev_kezdete: yearStart,
            hh_tanulo_letszam: daytimeCount,
            tanuloi_osszletszam: totalStudents.daytime[year] || 0,
            // Add other required fields based on API schema
          });
        }

        // Save adult education HH students if value exists
        const adultCount = parseInt(hhStudentsCount.adult[year] || 0);
        if (adultCount > 0) {
          dataToSave.push({
            alapadatok_id: selectedSchool.id,
            tanev_kezdete: yearStart,
            hh_tanulo_letszam: adultCount,
            tanuloi_osszletszam: totalStudents.adult[year] || 0,
            // Add a flag to distinguish adult education vs daytime
            // You may need to adjust this based on actual API requirements
          });
        }
      });

      if (dataToSave.length > 0) {
        // For now, we'll use the add mutation - you may need to implement update logic
        // based on whether the record already exists
        for (const record of dataToSave) {
          await addHHData(record).unwrap();
        }

        setSavedData(JSON.parse(JSON.stringify(hhStudentsCount)));
        setIsModified(false);

        // Show success message (you may want to add a snackbar for this)
        console.log("HH data saved successfully");
      }
    } catch (error) {
      console.error("Error saving HH data:", error);
      // Handle error (you may want to show an error message)
    }
  };

  const handleReset = () => {
    if (savedData) {
      setHhStudentsCount(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  // Process API data to populate totalStudents
  useEffect(() => {
    if (
      apiStudentData &&
      Array.isArray(apiStudentData) &&
      apiStudentData.length > 0
    ) {
      console.log("Processing API student data:", apiStudentData);

      const newTotalStudents = {
        daytime: {},
        adult: {},
        combined: {},
      };

      // Initialize all years to 0
      schoolYears.forEach((year) => {
        newTotalStudents.daytime[year] = 0;
        newTotalStudents.adult[year] = 0;
        newTotalStudents.combined[year] = 0;
      });

      // Process the API data to sum up student counts by year
      apiStudentData.forEach((record) => {
        const yearKey = `${record.tanev_kezdete}/${record.tanev_kezdete + 1}`;
        const letszam = parseInt(record.letszam) || 0;

        if (schoolYears.includes(yearKey)) {
          // jogv_tipus: 0 = nappali (daytime), 1 = felnőttképzési (adult education)
          if (record.jogv_tipus === 0) {
            // Daytime students (tanulói jogviszony)
            newTotalStudents.daytime[yearKey] += letszam;
          } else if (record.jogv_tipus === 1) {
            // Adult education students (felnőttképzési jogviszony)
            newTotalStudents.adult[yearKey] += letszam;
          }
        }
      });

      // Calculate combined totals
      schoolYears.forEach((year) => {
        newTotalStudents.combined[year] =
          newTotalStudents.daytime[year] + newTotalStudents.adult[year];
      });

      console.log("Processed total students:", newTotalStudents);

      // Only update if the data has actually changed
      setTotalStudents((prevTotalStudents) => {
        // Simple comparison - you could make this more sophisticated
        const hasChanged =
          JSON.stringify(prevTotalStudents) !==
          JSON.stringify(newTotalStudents);
        return hasChanged ? newTotalStudents : prevTotalStudents;
      });
    }
  }, [apiStudentData]); // Removed schoolYears from dependency array since it's memoized

  // Load existing HH data from API
  useEffect(() => {
    if (
      hhApiData &&
      Array.isArray(hhApiData) &&
      hhApiData.length > 0 &&
      selectedSchool
    ) {
      console.log("Loading existing HH data:", hhApiData);

      const loadedHhData = {
        daytime: {},
        adult: {},
      };

      // Initialize all years
      schoolYears.forEach((year) => {
        loadedHhData.daytime[year] = "";
        loadedHhData.adult[year] = "";
      });

      // Process existing HH data
      hhApiData.forEach((record) => {
        if (record.alapadatok_id === selectedSchool.id) {
          const yearKey = `${record.tanev_kezdete}/${record.tanev_kezdete + 1}`;

          if (schoolYears.includes(yearKey)) {
            // Separate by student type - assuming similar structure to student data
            const count =
              record.hh_tanulo_letszam || record.tanuloi_osszletszam || 0;

            // You may need to adjust this based on actual HH API data structure
            // For now, assuming all HH data goes to daytime category
            loadedHhData.daytime[yearKey] = count.toString();
          }
        }
      });

      setHhStudentsCount(loadedHhData);
      setSavedData(JSON.parse(JSON.stringify(loadedHhData)));
      setIsModified(false);
    }
  }, [hhApiData, selectedSchool, schoolYears]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hátrányos helyzetű tanulók aránya
      </Typography>

      {/* School Selection Info */}
      {selectedSchool && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Kiválasztott iskola: <strong>{selectedSchool.iskola_neve}</strong>
        </Alert>
      )}

      {!selectedSchool && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nincs iskola kiválasztva - az összes iskola adatait összegzi a
          rendszer.
        </Alert>
      )}

      {/* Loading State */}
      {(isFetching || isHhFetching) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {isFetching && isHhFetching
            ? "Tanulólétszám és HH adatok betöltése folyamatban..."
            : isFetching
            ? "Tanulólétszám adatok betöltése folyamatban..."
            : "HH adatok betöltése folyamatban..."}
        </Alert>
      )}

      {/* Error State */}
      {(fetchError || hhFetchError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Hiba történt az adatok betöltésekor:
          {fetchError && " Tanulólétszám adatok"}
          {fetchError && hhFetchError && ","}
          {hhFetchError && " HH adatok"}
        </Alert>
      )}

      {/* 1. HH tanulók aránya - AUTO CALCULATED PERCENTAGES */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#d32f2f", textAlign: "center", fontWeight: "bold" }}
          >
            1. HH tanulók aránya
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#ffebee" }}>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#ffcdd2",
                      color: "#d32f2f",
                    }}
                  >
                    (tanulói + felnőttképzési jogviszony) (%)
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                    }}
                  >
                    Tanulói jogviszony (%)
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f3e5f5",
                      color: "#7b1fa2",
                    }}
                  >
                    Felnőttképzési jogviszony (%)
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {/* Combined percentages headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`combined-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#ffcdd2",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                  {/* Daytime percentages headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`daytime-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#e3f2fd",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                  {/* Adult education percentages headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`adult-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f3e5f5",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* Combined percentages */}
                  {schoolYears.map((year) => (
                    <TableCell key={`combined-${year}`} align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#d32f2f",
                          backgroundColor: "#ffebee",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {getCombinedPercentage(year)}%
                      </Typography>
                    </TableCell>
                  ))}
                  {/* Daytime percentages */}
                  {schoolYears.map((year) => (
                    <TableCell key={`daytime-${year}`} align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {calculatePercentage("daytime", year)}%
                      </Typography>
                    </TableCell>
                  ))}
                  {/* Adult education percentages */}
                  {schoolYears.map((year) => (
                    <TableCell key={`adult-${year}`} align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#7b1fa2",
                          backgroundColor: "#f3e5f5",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {calculatePercentage("adult", year)}%
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 2. HH tanulók száma - EDITABLE INPUT */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#1976d2", textAlign: "center", fontWeight: "bold" }}
          >
            2. HH tanulók száma
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#ffcdd2",
                      color: "#d32f2f",
                    }}
                  >
                    (tanulói + felnőttképzési jogviszony) (fő)
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                    }}
                  >
                    Tanulói jogviszony (fő)
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f3e5f5",
                      color: "#7b1fa2",
                    }}
                  >
                    Felnőttképzési jogviszony (fő)
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {/* Combined count headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`combined-count-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#ffcdd2",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                  {/* Daytime count headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`daytime-count-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#e3f2fd",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                  {/* Adult education count headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`adult-count-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f3e5f5",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* Combined counts - auto calculated */}
                  {schoolYears.map((year) => (
                    <TableCell key={`combined-count-${year}`} align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#d32f2f",
                          backgroundColor: "#ffebee",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {getCombinedHhStudents(year)}
                      </Typography>
                    </TableCell>
                  ))}
                  {/* Daytime counts - editable */}
                  {schoolYears.map((year) => (
                    <TableCell key={`daytime-input-${year}`} align="center">
                      <TextField
                        type="number"
                        value={hhStudentsCount.daytime[year] || ""}
                        onChange={(e) =>
                          handleHhStudentsChange(
                            "daytime",
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
                  {/* Adult education counts - editable */}
                  {schoolYears.map((year) => (
                    <TableCell key={`adult-input-${year}`} align="center">
                      <TextField
                        type="number"
                        value={hhStudentsCount.adult[year] || ""}
                        onChange={(e) =>
                          handleHhStudentsChange("adult", year, e.target.value)
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

      {/* 3. Tanulói összlétszám - FROM API */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#2e7d32", textAlign: "center", fontWeight: "bold" }}
          >
            3. Tanulói összlétszám (Alapadatokból)
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8f5e8" }}>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#ffcdd2",
                      color: "#d32f2f",
                    }}
                  >
                    (tanulói + felnőttképzési jogviszony) (fő)
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                    }}
                  >
                    Tanulói jogviszony (fő)
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f3e5f5",
                      color: "#7b1fa2",
                    }}
                  >
                    Felnőttképzési jogviszony (fő)
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {/* Combined total headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`combined-total-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#ffcdd2",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                  {/* Daytime total headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`daytime-total-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#e3f2fd",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                  {/* Adult education total headers */}
                  {schoolYears.map((year) => (
                    <TableCell
                      key={`adult-total-header-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f3e5f5",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year.replace(".", "")}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* Combined totals */}
                  {schoolYears.map((year) => (
                    <TableCell key={`combined-total-${year}`} align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#d32f2f",
                          backgroundColor: "#ffebee",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {getCombinedTotalStudents(year)}
                      </Typography>
                    </TableCell>
                  ))}
                  {/* Daytime totals */}
                  {schoolYears.map((year) => (
                    <TableCell key={`daytime-total-${year}`} align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {totalStudents.daytime[year] || 0}
                      </Typography>
                    </TableCell>
                  ))}
                  {/* Adult education totals */}
                  {schoolYears.map((year) => (
                    <TableCell key={`adult-total-${year}`} align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#7b1fa2",
                          backgroundColor: "#f3e5f5",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {totalStudents.adult[year] || 0}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isModified || isAdding || isUpdating}
        >
          {isAdding || isUpdating ? "Mentés..." : "Mentés"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={!isModified || !savedData || isAdding || isUpdating}
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

      {savedData && !isModified && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Az adatok sikeresen mentve!
        </Alert>
      )}
    </Box>
  );
}
