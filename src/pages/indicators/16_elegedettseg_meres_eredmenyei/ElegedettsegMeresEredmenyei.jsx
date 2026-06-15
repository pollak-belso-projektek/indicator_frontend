import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
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
  Snackbar,
  Container,
  Fade,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import { generateSchoolYears } from "../../../utils/schoolYears";
import {
  useGetAllElegedettsegMeresQuery,
  useAddElegedettsegMeresMutation,
  useUpdateElegedettsegMeresMutation,
} from "../../../store/api/apiSlice";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoElegedettsegMeres from "./info_elegedettseg_meres";
import TitleElegedettsegMeres from "./title_elegedettseg_meres";

const evszamok = generateSchoolYears();

// Mapping for the exact JSON properties the backend expects
const categoryTypes = [
  { key: "szulo", label: "Szülők", color: "#e3f2fd" },
  { key: "oktato", label: "Oktatók", color: "#fff9c4" },
  { key: "tanulo", label: "Tanulók", color: "#e8f5e9" },
  { key: "dualis_kepzohely", label: "Duális képzőhelyek", color: "#f3e5f5" },
  { key: "munkaeropiaci", label: "Munkaerőpiaci szereplők", color: "#fff3e0" },
];

export default function ElegedettsegMeresEredmenyei() {
  const selectedSchool = useSelector(selectSelectedSchool);

  // API Hooks
  const { data: apiData, error: fetchError, isLoading: isFetching, refetch } = useGetAllElegedettsegMeresQuery();
  const [addData, { isLoading: isAdding }] = useAddElegedettsegMeresMutation();
  const [updateData, { isLoading: isUpdating }] = useUpdateElegedettsegMeresMutation();

  // Component State
  const [tableData, setTableData] = useState({});
  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Load API data into tableData state
  useEffect(() => {
    if (apiData) {
      const initialData = {};

      const relevantData = selectedSchool
        ? apiData.filter(item => item.alapadatok_id === selectedSchool.id)
        : apiData;

      // Initialize empty structure for all years
      evszamok.forEach(yearStr => {
        const year = parseInt(yearStr.split("/")[0], 10);
        initialData[year] = {
          id: null,
          alapadatok_id: selectedSchool ? selectedSchool.id : null,
          szulo: "",
          oktato: "",
          tanulo: "",
          dualis_kepzohely: "",
          munkaeropiaci: "",
        };
      });

      // Overlay with real data
      relevantData.forEach(item => {
        const year = item.tanev_kezdete;
        if (initialData[year]) {
          initialData[year] = {
            id: item.id,
            alapadatok_id: item.alapadatok_id,
            szulo: parseFloat(item.szulok_elegedettsege) || 0,
            oktato: parseFloat(item.oktatok_elegedettsege) || 0,
            tanulo: parseFloat(item.tanulok_elegedettsege) || 0,
            dualis_kepzohely: parseFloat(item.dualis_kepzohely_elegedettsege) || 0,
            munkaeropiaci: parseFloat(item.munkaero_piac_elegedettsege) || 0,
          };
        }
      });

      setTableData(initialData);
      setSavedData(JSON.parse(JSON.stringify(initialData)));
      setIsModified(false);
    }
  }, [apiData, selectedSchool]);

  const handleDataChange = useCallback((year, categoryKey, value) => {
    // Validate value to be between 0 and 5
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      numValue = "";
    } else if (numValue < 0) {
      numValue = 0;
    } else if (numValue > 5) {
      numValue = 5;
    }

    setTableData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [categoryKey]: numValue === "" ? "" : numValue
      }
    }));
    setIsModified(true);
  }, []);

  const handleResetData = useCallback(() => {
    if (savedData) {
      setTableData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  }, [savedData]);

  const handleSaveData = async () => {
    if (!selectedSchool) {
      setSnackbarMessage("Válasszon intézményt a mentéshez!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      let savedCount = 0;
      let updatedCount = 0;

      for (const yearStr of evszamok) {
        const year = parseInt(yearStr.split("/")[0], 10);
        const currentYearData = tableData[year];
        const savedYearData = savedData[year] || {};

        const isAllEmptyOrZero = categoryTypes.every(
          cat => !currentYearData[cat.key] || parseFloat(currentYearData[cat.key]) === 0
        );

        if (!currentYearData.id && isAllEmptyOrZero) {
          continue; // Don't create new records if everything is empty/0
        }

        const payload = {
          alapadatok_id: selectedSchool.id,
          tanev_kezdete: year,
          szulo: parseFloat(currentYearData.szulo) || 0,
          oktato: parseFloat(currentYearData.oktato) || 0,
          tanulo: parseFloat(currentYearData.tanulo) || 0,
          dualis_kepzohely: parseFloat(currentYearData.dualis_kepzohely) || 0,
          munkaeropiaci: parseFloat(currentYearData.munkaeropiaci) || 0,
        };

        const hasChanged = categoryTypes.some(
          cat => payload[cat.key] !== (parseFloat(savedYearData[cat.key]) || 0)
        );

        if (hasChanged) {
          if (currentYearData.id) {
            await updateData({ id: currentYearData.id, ...payload }).unwrap();
            updatedCount++;
          } else {
            await addData(payload).unwrap();
            savedCount++;
          }
        }
      }

      setSavedData(JSON.parse(JSON.stringify(tableData)));
      setIsModified(false);
      refetch();

      setSnackbarMessage(`Sikeresen mentve: ${savedCount} új rekord és ${updatedCount} frissített rekord`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      setSnackbarMessage(error.data?.message || "Hiba történt a mentés során");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const calculateTotalAverages = useMemo(() => {
    const totals = {};
    evszamok.forEach(yearStr => {
      const year = parseInt(yearStr.split("/")[0], 10);
      let sum = 0;
      let count = 0;
      
      categoryTypes.forEach(cat => {
        const val = parseFloat(tableData[year]?.[cat.key]);
        if (!isNaN(val) && val > 0) {
          sum += val;
          count++;
        }
      });
      
      totals[year] = count > 0 ? (sum / count).toFixed(2) : "0.00";
    });
    return totals;
  }, [tableData]);

  if (isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageWrapper
        titleContent={<TitleElegedettsegMeres />}
        infoContent={<InfoElegedettsegMeres />}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ minHeight: "calc(100vh - 120px)" }}>

            <LockStatusIndicator tableName="elegedettseg_meres" />

            {fetchError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Hiba történt az adatok betöltése során: {fetchError.message || "Ismeretlen hiba"}
              </Alert>
            )}

            {!selectedSchool && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Nincs intézmény kiválasztva - az összes iskola adatait összegzi a rendszer.
              </Alert>
            )}

            {isModified && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                Mentetlen módosítások vannak. Ne felejtsd el menteni a változtatásokat!
              </Alert>
            )}

            <Stack direction="row" spacing={2} sx={{ mb: 3, ml: 2 }}>
              <LockedTableWrapper tableName="elegedettseg_meres">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveData}
                  disabled={!isModified || isSaving || isAdding || isUpdating || !selectedSchool}
                >
                  {isSaving || isAdding || isUpdating ? "Mentés..." : "Mentés"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetData}
                  disabled={!isModified || !savedData || isSaving || isAdding || isUpdating}
                >
                  Visszaállítás
                </Button>
              </LockedTableWrapper>
            </Stack>

            <Typography variant="h6" component="h2" gutterBottom sx={{ ml: 2 }}>
              Célcsoportok elégedettségének mérése (1-5 skála)
            </Typography>

            <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table size="medium" sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        minWidth: 200,
                        borderRight: "2px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 3,
                        verticalAlign: "middle",
                      }}
                    >
                      Célcsoport
                    </TableCell>
                    {evszamok.map((yearStr, i) => (
                      <TableCell
                        key={`${yearStr}-header`}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#fff2cc",
                          borderBottom: "1px solid #ddd",
                          borderRight: i === evszamok.length - 1 ? "none" : "1px solid #ddd",
                          minWidth: 120,
                        }}
                      >
                        {yearStr}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Data Rows */}
                  {categoryTypes.map((category) => (
                    <TableRow key={category.key} hover>
                      <TableCell
                        sx={{
                          borderRight: "2px solid #ddd",
                          position: "sticky",
                          left: 0,
                          backgroundColor: category.color,
                          zIndex: 1,
                          fontWeight: "bold"
                        }}
                      >
                        {category.label}
                      </TableCell>
                      {evszamok.map((yearStr, i) => {
                        const year = parseInt(yearStr.split("/")[0], 10);
                        return (
                          <TableCell
                            key={`${category.key}-${year}`}
                            align="center"
                            sx={{
                              borderRight: i === evszamok.length - 1 ? "none" : "1px solid #ddd",
                            }}
                          >
                            <TextField
                              type="number"
                              size="small"
                              value={tableData[year]?.[category.key] ?? ""}
                              onChange={(e) => handleDataChange(year, category.key, e.target.value)}
                              inputProps={{
                                min: 0,
                                max: 5,
                                step: 0.1,
                                style: { textAlign: "center", padding: "8px" },
                              }}
                              sx={{ width: "80px", backgroundColor: "#fff" }}
                              placeholder="0.0"
                              disabled={!selectedSchool}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {/* Average Row */}
                  <TableRow sx={{ backgroundColor: "#fffde7" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        borderRight: "2px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fffde7",
                        zIndex: 1,
                      }}
                    >
                      Átlagérték
                    </TableCell>
                    {evszamok.map((yearStr, i) => {
                      const year = parseInt(yearStr.split("/")[0], 10);
                      return (
                        <TableCell 
                          key={`avg-${year}`} 
                          align="center" 
                          sx={{ 
                            fontWeight: "bold",
                            borderRight: i === evszamok.length - 1 ? "none" : "1px solid #ddd",
                            fontSize: "1.1rem"
                          }}
                        >
                          {calculateTotalAverages[year] || "0.00"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled">
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Fade>
      </PageWrapper>
    </Container>
  );
}
