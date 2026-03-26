import React, { useState, useEffect } from "react";
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
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoNszfhMeresek from "./info_nszfh_meresek";
import TitleNszfhMeresek from "./title_nszfh_meresek";
import {
  useGetNSZFHBySchoolAndYearQuery,
  useAddNSZFHMutation,
  useUpdateNSZFHMutation,
} from "../../../store/api/apiSlice";
import { selectSelectedSchool } from "../../../store/slices/authSlice";

export default function NszfhMeresek() {
  const selectedSchool = useSelector(selectSelectedSchool);

  // Get current school year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentSchoolYearStart = currentMonth >= 9 ? currentYear : currentYear - 1;

  // API hooks
  const {
    data: apiData,
    isLoading,
    error,
  } = useGetNSZFHBySchoolAndYearQuery(
    { alapadatokId: selectedSchool?.id, tanev: currentSchoolYearStart },
    { skip: !selectedSchool?.id }
  );

  const [addNSZFH, { isLoading: isAdding }] = useAddNSZFHMutation();
  const [updateNSZFH, { isLoading: isUpdating }] = useUpdateNSZFHMutation();
  const isSaving = isAdding || isUpdating;

  // Performance bands (categories 1-5)
  const performanceBands = [
    { key: "1", label: "25 % alatt" },
    { key: "2", label: "25-40" },
    { key: "3", label: "40-60" },
    { key: "4", label: "60-80" },
    { key: "5", label: "80 % fölött" },
  ];

  // Competency areas
  const competencyAreas = [
    { key: "mat", label: "matematika" },
    { key: "szoveg", label: "anyanyelv" },
  ];

  // Measurement types
  const measurementTypes = [
    { key: "bemeneti", label: "bemeneti mérés" },
    { key: "kimeneti", label: "kimeneti mérés" },
  ];

  // Local state for the form data
  // Structure: { id: null, kat_1_mat_bemeneti: "", kat_1_mat_kimeneti: "", ... }
  const [tableData, setTableData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize empty data structure
  const getEmptyData = () => {
    const data = { id: null };
    performanceBands.forEach(band => {
      competencyAreas.forEach(comp => {
        measurementTypes.forEach(meas => {
          const key = `kat_${band.key}_${comp.key}_${meas.key}`;
          data[key] = "";
        });
      });
    });
    return data;
  };

  // Initialize data from API
  useEffect(() => {
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      // Use the first record (there should be one per school per year)
      const record = apiData[0];
      const initialData = { id: record.id };

      performanceBands.forEach(band => {
        competencyAreas.forEach(comp => {
          measurementTypes.forEach(meas => {
            const key = `kat_${band.key}_${comp.key}_${meas.key}`;
            initialData[key] = record[key] ?? "";
          });
        });
      });

      setTableData(initialData);
    } else if (!isLoading) {
      // Initialize empty if no data yet
      setTableData(getEmptyData());
    }
    setIsModified(false);
  }, [apiData, isLoading]);

  // Handle data changes
  const handleDataChange = (bandKey, compKey, measKey, value) => {
    // Prevent negative numbers
    if (value < 0) return;

    const key = `kat_${bandKey}_${compKey}_${measKey}`;
    setTableData(prev => ({
      ...prev,
      [key]: value
    }));
    setIsModified(true);
    setSaveSuccess(false);
  };

  // Get value from tableData
  const getValue = (bandKey, compKey, measKey) => {
    const key = `kat_${bandKey}_${compKey}_${measKey}`;
    return tableData[key] ?? "";
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedSchool?.id) return;

    try {
      const payload = {
        alapadatok_id: selectedSchool.id,
        tanev_kezdete: currentSchoolYearStart,
      };

      // Add all the measurement values
      performanceBands.forEach(band => {
        competencyAreas.forEach(comp => {
          measurementTypes.forEach(meas => {
            const key = `kat_${band.key}_${comp.key}_${meas.key}`;
            const value = tableData[key];
            payload[key] = value === "" ? null : parseFloat(value);
          });
        });
      });

      if (tableData.id) {
        // Update existing record
        await updateNSZFH({ id: tableData.id, ...payload }).unwrap();
      } else {
        // Create new record
        await addNSZFH(payload).unwrap();
      }

      setSaveSuccess(true);
      setIsModified(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save NSZFH data:", err);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      const record = apiData[0];
      const initialData = { id: record.id };

      performanceBands.forEach(band => {
        competencyAreas.forEach(comp => {
          measurementTypes.forEach(meas => {
            const key = `kat_${band.key}_${comp.key}_${meas.key}`;
            initialData[key] = record[key] ?? "";
          });
        });
      });

      setTableData(initialData);
    } else {
      setTableData(getEmptyData());
    }
    setIsModified(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <PageWrapper titleContent={<TitleNszfhMeresek />} infoContent={<InfoNszfhMeresek />}>
        <Alert severity="error">Hiba történt az adatok betöltésekor: {JSON.stringify(error)}</Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      titleContent={<TitleNszfhMeresek />}
      infoContent={<InfoNszfhMeresek />}
    >
      <Box>
        <LockStatusIndicator tableName="nszfh" />

        {/* Main Data Table */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <LockedTableWrapper tableName="nszfh">
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
                  disabled={!isModified || isSaving}
                >
                  Visszaállítás
                </Button>
              </LockedTableWrapper>
            </Stack>

            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Sikeres mentés!
              </Alert>
            )}

            <Typography variant="h6" component="h2" gutterBottom>
              NSZFH kompetenciamérés eredményei - Összetétszámhoz viszonyítva (%)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentSchoolYearStart}/{currentSchoolYearStart + 1}
            </Typography>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ overflowX: "auto" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: "bold",
                        verticalAlign: "middle",
                        minWidth: 120,
                        textAlign: "center",
                      }}
                    >
                      Kompetenciaterület
                    </TableCell>
                    {performanceBands.map((band) => (
                      <TableCell
                        key={band.key}
                        colSpan={2}
                        align="center"
                        sx={{ fontWeight: "bold", minWidth: 140 }}
                      >
                        {band.label}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {performanceBands.map((band) => (
                      <React.Fragment key={`header-${band.key}`}>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", minWidth: 70 }}
                        >
                          bemeneti mérés
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", minWidth: 70 }}
                        >
                          kimeneti mérés
                        </TableCell>
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {competencyAreas.map((competency, compIndex) => (
                    <TableRow
                      key={competency.key}
                      sx={{
                        backgroundColor: compIndex % 2 === 0 ? "#fff2cc" : "#e8f4fd",
                        "&:hover": {
                          backgroundColor: compIndex % 2 === 0 ? "#ffe6b3" : "#d4e6f1",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          borderRight: "1px solid #e0e0e0",
                        }}
                      >
                        {competency.label}
                      </TableCell>
                      {performanceBands.map((band) => (
                        <React.Fragment key={`${band.key}-${competency.key}`}>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              value={getValue(band.key, competency.key, "bemeneti")}
                              onChange={(e) =>
                                handleDataChange(
                                  band.key,
                                  competency.key,
                                  "bemeneti",
                                  e.target.value
                                )
                              }
                              size="small"
                              inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.01,
                                style: { textAlign: "center" },
                              }}
                              sx={{ width: "70px" }}
                              placeholder=""
                            />
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              value={getValue(band.key, competency.key, "kimeneti")}
                              onChange={(e) =>
                                handleDataChange(
                                  band.key,
                                  competency.key,
                                  "kimeneti",
                                  e.target.value
                                )
                              }
                              size="small"
                              inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.01,
                                style: { textAlign: "center" },
                              }}
                              sx={{ width: "70px" }}
                              placeholder=""
                            />
                          </TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Status Messages */}
            {isModified && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Mentetlen módosítások vannak. Ne felejtsd el menteni a
                változtatásokat!
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
}
