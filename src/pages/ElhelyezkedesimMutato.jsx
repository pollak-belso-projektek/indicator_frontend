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
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import {
  useGetAllElhelyezkedesQuery,
  useAddElhelyezkedesMutation,
  useUpdateElhelyezkedesMutation,
} from "../store/api/apiSlice";

export default function ElhelyezkedesimMutato() {
  const schoolYears = generateSchoolYears();

  // API hooks
  const {
    data: apiEmploymentData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllElhelyezkedesQuery();

  console.log("API Employment Data:", apiEmploymentData);
  console.log("Fetch Error:", fetchError);
  console.log("Is Fetching:", isFetching);

  const [addElhelyezkedes, { isLoading: isAdding }] =
    useAddElhelyezkedesMutation();
  const [updateElhelyezkedes, { isLoading: isUpdating }] =
    useUpdateElhelyezkedesMutation();

  const [employmentData, setEmploymentData] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [modifiedIds, setModifiedIds] = useState(new Set());

  // Transform and organize API data
  const organizedData = useMemo(() => {
    if (!apiEmploymentData || !Array.isArray(apiEmploymentData)) {
      return {};
    }

    const organized = {};

    apiEmploymentData.forEach((item) => {
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
  }, [apiEmploymentData]);

  // Load data from API when component mounts or data changes
  useEffect(() => {
    console.log("Loading employment data from API...");
    console.log("API Employment Data:", apiEmploymentData);
    if (apiEmploymentData && Array.isArray(apiEmploymentData)) {
      setEmploymentData(apiEmploymentData);
    }
  }, [apiEmploymentData]);

  // Handle data changes
  const handleDataChange = (id, field, value) => {
    setEmploymentData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
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
      console.log("Successfully saved employment data");
    } catch (error) {
      console.error("Error saving employment data:", error);
    }
  };

  const handleReset = () => {
    if (apiEmploymentData) {
      setEmploymentData([...apiEmploymentData]);
      setIsModified(false);
      setModifiedIds(new Set());
    }
  };

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
          Hiba történt az adatok betöltése során:{" "}
          {fetchError.message || "Ismeretlen hiba"}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        9. Elhelyezkedési mutató
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A szakmai oktatásban tanulói jogviszonyban sikeresen végzettek
        elhelyezkedési aránya.
      </Typography>

      {/* Debug Information */}
      <Card sx={{ mb: 3, backgroundColor: "#fff3cd", borderColor: "#ffeaa7" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            🔍 Debug információ
          </Typography>
          <Typography variant="body2">
            <strong>API adatok:</strong>{" "}
            {apiEmploymentData
              ? `${apiEmploymentData.length} rekord`
              : "Nincs adat"}
          </Typography>
          <Typography variant="body2">
            <strong>Betöltés folyamatban:</strong> {isFetching ? "Igen" : "Nem"}
          </Typography>
          <Typography variant="body2">
            <strong>Hiba:</strong>{" "}
            {fetchError
              ? fetchError.message || "Ismeretlen hiba"
              : "Nincs hiba"}
          </Typography>
          <Typography variant="body2">
            <strong>Várható évek:</strong> 2024, 2023, 2022, 2021
          </Typography>
          {apiEmploymentData && apiEmploymentData.length > 0 && (
            <Typography variant="body2">
              <strong>Talált évek:</strong>{" "}
              {[...new Set(apiEmploymentData.map((item) => item.tanev_kezdete))]
                .sort()
                .reverse()
                .join(", ")}
            </Typography>
          )}
        </CardContent>
      </Card>

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
          {!apiEmploymentData || apiEmploymentData.length === 0 ? (
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
              disabled={!isModified || isAdding || isUpdating}
            >
              {isAdding || isUpdating ? "Mentés..." : "Mentés"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              disabled={!isModified || isAdding || isUpdating}
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
    </Box>
  );
}
