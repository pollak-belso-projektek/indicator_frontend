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
  Tabs,
  Tab,
  Grid,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
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
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  // Statistics calculations
  const getStatistics = () => {
    const stats = {
      yearlyData: [],
      trends: {
        combined: { increasing: 0, decreasing: 0, stable: 0 },
        daytime: { increasing: 0, decreasing: 0, stable: 0 },
        adult: { increasing: 0, decreasing: 0, stable: 0 },
      },
      totals: {
        totalHhStudents: 0,
        totalAllStudents: 0,
        overallPercentage: 0,
      },
      highest: {
        year: null,
        percentage: 0,
        category: null,
      },
      lowest: {
        year: null,
        percentage: 100,
        category: null,
      },
    };

    // Calculate yearly data and trends
    schoolYears.forEach((year, index) => {
      const combinedPerc = parseFloat(getCombinedPercentage(year));
      const daytimePerc = parseFloat(calculatePercentage("daytime", year));
      const adultPerc = parseFloat(calculatePercentage("adult", year));

      const combinedHh = getCombinedHhStudents(year);
      const combinedTotal = getCombinedTotalStudents(year);

      // Add to yearly data
      stats.yearlyData.push({
        year,
        combined: combinedPerc,
        daytime: daytimePerc,
        adult: adultPerc,
        hhStudents: combinedHh,
        totalStudents: combinedTotal,
      });

      // Update totals
      stats.totals.totalHhStudents += combinedHh;
      stats.totals.totalAllStudents += combinedTotal;

      // Check for highest/lowest
      [
        { value: combinedPerc, category: "Összesen" },
        { value: daytimePerc, category: "Tanulói jogviszony" },
        { value: adultPerc, category: "Felnőttképzési jogviszony" },
      ].forEach(({ value, category }) => {
        if (value > 0) {
          if (value > stats.highest.percentage) {
            stats.highest = { year, percentage: value, category };
          }
          if (value < stats.lowest.percentage) {
            stats.lowest = { year, percentage: value, category };
          }
        }
      });

      // Calculate trends (compare with previous year)
      if (index > 0) {
        const prevYear = schoolYears[index - 1];
        const prevCombined = parseFloat(getCombinedPercentage(prevYear));
        const prevDaytime = parseFloat(
          calculatePercentage("daytime", prevYear)
        );
        const prevAdult = parseFloat(calculatePercentage("adult", prevYear));

        // Combined trend
        if (combinedPerc > prevCombined) stats.trends.combined.increasing++;
        else if (combinedPerc < prevCombined)
          stats.trends.combined.decreasing++;
        else stats.trends.combined.stable++;

        // Daytime trend
        if (daytimePerc > prevDaytime) stats.trends.daytime.increasing++;
        else if (daytimePerc < prevDaytime) stats.trends.daytime.decreasing++;
        else stats.trends.daytime.stable++;

        // Adult trend
        if (adultPerc > prevAdult) stats.trends.adult.increasing++;
        else if (adultPerc < prevAdult) stats.trends.adult.decreasing++;
        else stats.trends.adult.stable++;
      }
    });

    // Calculate overall percentage
    if (stats.totals.totalAllStudents > 0) {
      stats.totals.overallPercentage = (
        (stats.totals.totalHhStudents / stats.totals.totalAllStudents) *
        100
      ).toFixed(2);
    }

    return stats;
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
            jogviszony_tipus: 0, // 0 = tanulói jogviszony (daytime)
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
            jogviszony_tipus: 1, // 1 = felnőttképzési jogviszony (adult)
          });
        }
      });

      if (dataToSave.length > 0) {
        // Check if records already exist and use PUT or POST accordingly
        for (const record of dataToSave) {
          // Find existing record with matching alapadatok_id, tanev_kezdete
          // If jogviszony_tipus exists in the database, also match on that
          const existingRecord = hhApiData?.find(
            (existing) => {
              const basicMatch = existing.alapadatok_id === record.alapadatok_id &&
                               existing.tanev_kezdete === record.tanev_kezdete;
              
              // If database has jogviszony_tipus, match on that too
              if (existing.jogviszony_tipus !== undefined && existing.jogviszony_tipus !== null) {
                return basicMatch && existing.jogviszony_tipus === record.jogviszony_tipus;
              }
              
              // If database doesn't have jogviszony_tipus, only match basic fields
              // and assume it's daytime (0) data if we're saving daytime
              return basicMatch && record.jogviszony_tipus === 0;
            }
          );

          if (existingRecord) {
            // Record exists, use PUT (update)
            console.log("Updating existing record:", existingRecord.id);
            await updateHHData({
              id: existingRecord.id,
              ...record,
            }).unwrap();
          } else {
            // Record doesn't exist, use POST (create)
            console.log("Creating new record");
            await addHHData(record).unwrap();
          }
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
            const count = record.hh_tanulo_letszam || 0;

            // Check if jogviszony_tipus exists, otherwise default to daytime (tanulói jogviszony)
            if (record.jogviszony_tipus === 0 || record.jogviszony_tipus === undefined || record.jogviszony_tipus === null) {
              // Tanulói jogviszony (daytime) - ez az alapértelmezett, ha nincs megadva
              loadedHhData.daytime[yearKey] = count.toString();
            } else if (record.jogviszony_tipus === 1) {
              // Felnőttképzési jogviszony (adult education)
              loadedHhData.adult[yearKey] = count.toString();
            }
          }
        }
      });

      setHhStudentsCount(loadedHhData);
      setSavedData(JSON.parse(JSON.stringify(loadedHhData)));
      setIsModified(false);
      
      // Debug log to check what was loaded
      console.log("Final loaded HH data:", loadedHhData);
    }
  }, [hhApiData, selectedSchool, schoolYears]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        18. Hátrányos helyzetű tanulók aránya
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A hátrányos és halmozottan hátrányos helyzetű tanulók arányának nyomon követése
      </Typography>

      {/* Loading State */}
      {(isFetching || isHhFetching) && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content - only show when not loading */}
      {!isFetching && !isHhFetching && (
        <>
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

          {/* Error State */}
          {(fetchError || hhFetchError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Hiba történt az adatok betöltésekor:
              {fetchError && " Tanulólétszám adatok"}
              {fetchError && hhFetchError && ","}
              {hhFetchError && " HH adatok"}
            </Alert>
          )}

          {/* Tab Navigation */}
          <Card sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="HH tanulók tabs"
                variant="fullWidth"
              >
                <Tab
                  icon={<AssessmentIcon />}
                  label="Adatok és táblázatok"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                />
                <Tab
                  icon={<BarChartIcon />}
                  label="Statisztikák és elemzés"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                />
              </Tabs>
        </Box>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* DATA TABLES TAB CONTENT */}
          {/* 1. HH tanulók aránya - AUTO CALCULATED PERCENTAGES */}
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "#d32f2f",
                  textAlign: "center",
                  fontWeight: "bold",
                  mb: 3,
                  pb: 1,
                  borderBottom: "2px solid #ffcdd2",
                }}
              >
                1. HH tanulók aránya
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxWidth: "100%",
                  overflowX: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#ffcdd2",
                          color: "#d32f2f",
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #ffb3ba",
                          width: "33%",
                        }}
                      >
                        Összesen (tanulói + felnőttképzési) (%)
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #b3d9ff",
                          width: "33%",
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
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #d1c4e9",
                          width: "33%",
                        }}
                      >
                        Felnőttképzési jogviszony (%)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {/* Combined percentages headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`combined-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#ffebee",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #ffcdd2",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                      {/* Daytime percentages headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`daytime-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f0f8ff",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #e3f2fd",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                      {/* Adult education percentages headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`adult-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#fafafa",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #f3e5f5",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {/* Combined percentages */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`combined-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#d32f2f",
                              backgroundColor: "#ffebee",
                              padding: "12px 8px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              border: "1px solid #ffcdd2",
                            }}
                          >
                            {getCombinedPercentage(year)}%
                          </Typography>
                        </TableCell>
                      ))}
                      {/* Daytime percentages */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`daytime-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#1976d2",
                              backgroundColor: "#f0f8ff",
                              padding: "12px 8px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              border: "1px solid #e3f2fd",
                            }}
                          >
                            {calculatePercentage("daytime", year)}%
                          </Typography>
                        </TableCell>
                      ))}
                      {/* Adult education percentages */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`adult-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#7b1fa2",
                              backgroundColor: "#fafafa",
                              padding: "12px 8px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              border: "1px solid #f3e5f5",
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
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "#1976d2",
                  textAlign: "center",
                  fontWeight: "bold",
                  mb: 3,
                  pb: 1,
                  borderBottom: "2px solid #e3f2fd",
                }}
              >
                2. HH tanulók száma
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxWidth: "100%",
                  overflowX: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#ffcdd2",
                          color: "#d32f2f",
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #ffb3ba",
                          width: "33%",
                        }}
                      >
                        Összesen (tanulói + felnőttképzési) (fő)
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #b3d9ff",
                          width: "33%",
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
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #d1c4e9",
                          width: "33%",
                        }}
                      >
                        Felnőttképzési jogviszony (fő)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {/* Combined count headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`combined-count-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#ffebee",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #ffcdd2",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                      {/* Daytime count headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`daytime-count-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f0f8ff",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #e3f2fd",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                      {/* Adult education count headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`adult-count-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#fafafa",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #f3e5f5",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {/* Combined counts - auto calculated */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`combined-count-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#d32f2f",
                              backgroundColor: "#ffebee",
                              padding: "12px 8px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              border: "1px solid #ffcdd2",
                            }}
                          >
                            {getCombinedHhStudents(year)}
                          </Typography>
                        </TableCell>
                      ))}
                      {/* Daytime counts - editable */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`daytime-input-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
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
                              style: { textAlign: "center", fontSize: "1rem" },
                            }}
                            sx={{
                              width: "100px",
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f0f8ff",
                                "&:hover": {
                                  backgroundColor: "#e3f2fd",
                                },
                                "&.Mui-focused": {
                                  backgroundColor: "#e3f2fd",
                                },
                              },
                            }}
                            placeholder="0"
                          />
                        </TableCell>
                      ))}
                      {/* Adult education counts - editable */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`adult-input-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <TextField
                            type="number"
                            value={hhStudentsCount.adult[year] || ""}
                            onChange={(e) =>
                              handleHhStudentsChange(
                                "adult",
                                year,
                                e.target.value
                              )
                            }
                            size="small"
                            inputProps={{
                              min: 0,
                              step: 1,
                              style: { textAlign: "center", fontSize: "1rem" },
                            }}
                            sx={{
                              width: "100px",
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#fafafa",
                                "&:hover": {
                                  backgroundColor: "#f3e5f5",
                                },
                                "&.Mui-focused": {
                                  backgroundColor: "#f3e5f5",
                                },
                              },
                            }}
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
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "#2e7d32",
                  textAlign: "center",
                  fontWeight: "bold",
                  mb: 3,
                  pb: 1,
                  borderBottom: "2px solid #c8e6c9",
                }}
              >
                3. Tanulói összlétszám (Alapadatokból)
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxWidth: "100%",
                  overflowX: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#ffcdd2",
                          color: "#d32f2f",
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #ffb3ba",
                        }}
                      >
                        Összesen (tanulói + felnőttképzési) (fő)
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #b3d9ff",
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
                          fontSize: "0.9rem",
                          py: 2,
                          border: "1px solid #d1c4e9",
                        }}
                      >
                        Felnőttképzési jogviszony (fő)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {/* Combined total headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`combined-total-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#ffebee",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #ffcdd2",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                      {/* Daytime total headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`daytime-total-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f0f8ff",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #e3f2fd",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                      {/* Adult education total headers */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`adult-total-header-${year}`}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#fafafa",
                            fontSize: "0.8rem",
                            py: 1.5,
                            minWidth: "90px",
                            border: "1px solid #f3e5f5",
                          }}
                        >
                          {year.replace("/", "/")}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {/* Combined totals */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`combined-total-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#d32f2f",
                              backgroundColor: "#ffebee",
                              padding: "12px 8px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              border: "1px solid #ffcdd2",
                            }}
                          >
                            {getCombinedTotalStudents(year)}
                          </Typography>
                        </TableCell>
                      ))}
                      {/* Daytime totals */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`daytime-total-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#1976d2",
                              backgroundColor: "#f0f8ff",
                              padding: "12px 8px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              border: "1px solid #e3f2fd",
                            }}
                          >
                            {totalStudents.daytime[year] || 0}
                          </Typography>
                        </TableCell>
                      ))}
                      {/* Adult education totals */}
                      {schoolYears.map((year) => (
                        <TableCell
                          key={`adult-total-${year}`}
                          align="center"
                          sx={{ py: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#7b1fa2",
                              backgroundColor: "#fafafa",
                              padding: "12px 8px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              border: "1px solid #f3e5f5",
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
      )}

      {/* STATISTICS TAB CONTENT */}
      {activeTab === 1 && (
        <Box>
          {(() => {
            const stats = getStatistics();
            return (
              <>
                {/* Overview Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{ textAlign: "center", p: 2, bgcolor: "#ffebee" }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ color: "#d32f2f", fontWeight: "bold" }}
                      >
                        {stats.totals.overallPercentage}%
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#666" }}>
                        Összesített HH arány
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{ textAlign: "center", p: 2, bgcolor: "#e3f2fd" }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ color: "#1976d2", fontWeight: "bold" }}
                      >
                        {stats.totals.totalHhStudents}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#666" }}>
                        Összes HH tanuló
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{ textAlign: "center", p: 2, bgcolor: "#e8f5e8" }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ color: "#2e7d32", fontWeight: "bold" }}
                      >
                        {stats.totals.totalAllStudents}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#666" }}>
                        Összes tanuló
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{ textAlign: "center", p: 2, bgcolor: "#f3e5f5" }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ color: "#7b1fa2", fontWeight: "bold" }}
                      >
                        {schoolYears.length}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#666" }}>
                        Vizsgált tanév
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Highest/Lowest Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, bgcolor: "#fff3e0" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <TrendingUpIcon sx={{ color: "#f57c00", mr: 1 }} />
                        <Typography
                          variant="h6"
                          sx={{ color: "#f57c00", fontWeight: "bold" }}
                        >
                          Legmagasabb HH arány
                        </Typography>
                      </Box>
                      {stats.highest.year ? (
                        <>
                          <Typography
                            variant="h4"
                            sx={{ color: "#f57c00", fontWeight: "bold", mb: 1 }}
                          >
                            {stats.highest.percentage}%
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#666" }}>
                            {stats.highest.year} - {stats.highest.category}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1" sx={{ color: "#666" }}>
                          Nincs adat
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, bgcolor: "#e8f5e8" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <TrendingUpIcon
                          sx={{
                            color: "#388e3c",
                            mr: 1,
                            transform: "rotate(180deg)",
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ color: "#388e3c", fontWeight: "bold" }}
                        >
                          Legalacsonyabb HH arány
                        </Typography>
                      </Box>
                      {stats.lowest.year && stats.lowest.percentage < 100 ? (
                        <>
                          <Typography
                            variant="h4"
                            sx={{ color: "#388e3c", fontWeight: "bold", mb: 1 }}
                          >
                            {stats.lowest.percentage}%
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#666" }}>
                            {stats.lowest.year} - {stats.lowest.category}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1" sx={{ color: "#666" }}>
                          Nincs adat
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                </Grid>

                {/* Yearly Data Table */}
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography
                      variant="h5"
                      sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
                    >
                      Éves adatok összehasonlítása
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Tanév
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", color: "#d32f2f" }}
                            >
                              Összesen (%)
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", color: "#1976d2" }}
                            >
                              Tanulói jogv. (%)
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", color: "#7b1fa2" }}
                            >
                              Felnőttképz. (%)
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold" }}
                            >
                              HH tanulók (fő)
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold" }}
                            >
                              Összes tanuló (fő)
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.yearlyData.map((yearData, index) => (
                            <TableRow
                              key={yearData.year}
                              sx={{
                                "&:nth-of-type(odd)": { bgcolor: "#fafafa" },
                                "&:hover": { bgcolor: "#f0f0f0" },
                              }}
                            >
                              <TableCell sx={{ fontWeight: "bold" }}>
                                {yearData.year}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${yearData.combined}%`}
                                  size="small"
                                  sx={{
                                    bgcolor: "#ffebee",
                                    color: "#d32f2f",
                                    fontWeight: "bold",
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${yearData.daytime}%`}
                                  size="small"
                                  sx={{
                                    bgcolor: "#e3f2fd",
                                    color: "#1976d2",
                                    fontWeight: "bold",
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${yearData.adult}%`}
                                  size="small"
                                  sx={{
                                    bgcolor: "#f3e5f5",
                                    color: "#7b1fa2",
                                    fontWeight: "bold",
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: "bold" }}
                              >
                                {yearData.hhStudents}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: "bold" }}
                              >
                                {yearData.totalStudents}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Trends Analysis */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#d32f2f",
                        }}
                      >
                        Összesített trend
                      </Typography>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          📈 Növekedés:{" "}
                          <strong>{stats.trends.combined.increasing} év</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          📉 Csökkenés:{" "}
                          <strong>{stats.trends.combined.decreasing} év</strong>
                        </Typography>
                        <Typography variant="body2">
                          ➡️ Stagnálás:{" "}
                          <strong>{stats.trends.combined.stable} év</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#1976d2",
                        }}
                      >
                        Tanulói jogviszony trend
                      </Typography>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          📈 Növekedés:{" "}
                          <strong>{stats.trends.daytime.increasing} év</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          📉 Csökkenés:{" "}
                          <strong>{stats.trends.daytime.decreasing} év</strong>
                        </Typography>
                        <Typography variant="body2">
                          ➡️ Stagnálás:{" "}
                          <strong>{stats.trends.daytime.stable} év</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#7b1fa2",
                        }}
                      >
                        Felnőttképzési trend
                      </Typography>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          📈 Növekedés:{" "}
                          <strong>{stats.trends.adult.increasing} év</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          📉 Csökkenés:{" "}
                          <strong>{stats.trends.adult.decreasing} év</strong>
                        </Typography>
                        <Typography variant="body2">
                          ➡️ Stagnálás:{" "}
                          <strong>{stats.trends.adult.stable} év</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </>
            );
          })()}
        </Box>
      )}

      {/* Status Messages for all tabs */}
      {activeTab === 0 && (
        <>
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
        </>
      )}
        </>
      )}
    </Box>
  );
}
