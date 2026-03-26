import React, { useState, useEffect, useMemo } from "react";
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
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoNszfhMeresek from "./info_nszfh_meresek";
import TitleNszfhMeresek from "./title_nszfh_meresek";
import { generateSchoolYears, getCurrentSchoolYear } from "../../../utils/schoolYears";
import {
  useGetNSZFHBySchoolAndYearQuery,
  useAddNSZFHMutation,
  useUpdateNSZFHMutation,
  useGetAlapadatokQuery,
} from "../../../store/api/apiSlice";
import { selectSelectedSchool } from "../../../store/slices/authSlice";

export default function NszfhMeresek() {
  const selectedSchool = useSelector(selectSelectedSchool);

  const [selectedYear, setSelectedYear] = useState(getCurrentSchoolYear());
  const currentSchoolYearStart = Number.parseInt(
    selectedYear.split("/")[0],
    10,
  );
  const schoolYears = generateSchoolYears();

  // Load school basic data (to get professions/szakmák)
  const { data: alapadatokData, isLoading: isAlapadatokLoading } = useGetAlapadatokQuery(
    { id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  // Extract separated professions
  const { technikumSzakmak, szakkepzoSzakmak } = useMemo(() => {
    const tech = [];
    const szak = [];
    if (alapadatokData?.alapadatok_szakirany) {
      alapadatokData.alapadatok_szakirany.forEach(szakiranyData => {
        if (szakiranyData.szakirany?.szakma) {
          szakiranyData.szakirany.szakma.forEach(szakmaData => {
            const sz = szakmaData.szakma;
            if (sz) {
              const item = { id: sz.id, nev: sz.nev, tipus: sz.tipus };
              if (sz.tipus === "Technikum") {
                if (!tech.some(s => s.id === item.id)) tech.push(item);
              } else if (sz.tipus === "Szakképző" || sz.tipus === "Szakkepzo" || sz.tipus === "Szakközép") {
                if (!szak.some(s => s.id === item.id)) szak.push(item);
              }
            }
          });
        }
      });
    }
    return { technikumSzakmak: tech, szakkepzoSzakmak: szak };
  }, [alapadatokData]);

  // Build the logical row keys
  const layoutStructure = useMemo(() => {
    let rows = [];

    if (technikumSzakmak.length > 0) {
      rows.push({ key: "Technikum_összesen", label: "technikum összesen", kepzes_forma: "Technikum", szakma_id: "osszesen", isParent: true });
      technikumSzakmak.forEach(s => {
        rows.push({ key: `Technikum_${s.id}`, label: s.nev, kepzes_forma: "Technikum", szakma_id: s.id, isParent: false });
      });
      rows.push({ key: "Technikum_nincs", label: "Nincs meghatározva / Csak szakirány", kepzes_forma: "Technikum", szakma_id: null, isParent: false });
    }

    if (szakkepzoSzakmak.length > 0) {
      rows.push({ key: "Szakképző_összesen", label: "szakképző iskola összesen", kepzes_forma: "Szakképző", szakma_id: "osszesen", isParent: true });
      szakkepzoSzakmak.forEach(s => {
        rows.push({ key: `Szakképző_${s.id}`, label: s.nev, kepzes_forma: "Szakképző", szakma_id: s.id, isParent: false });
      });
      rows.push({ key: "Szakképző_nincs", label: "Nincs meghatározva / Csak szakirány", kepzes_forma: "Szakképző", szakma_id: null, isParent: false });
    }

    return rows;
  }, [technikumSzakmak, szakkepzoSzakmak]);

  // API hooks for NSZFH measurements
  const {
    data: apiData,
    isLoading: isNSZFHLoading,
    error,
  } = useGetNSZFHBySchoolAndYearQuery(
    { alapadatokId: selectedSchool?.id, tanev: currentSchoolYearStart },
    { skip: !selectedSchool?.id }
  );

  const [addNSZFH, { isLoading: isAdding }] = useAddNSZFHMutation();
  const [updateNSZFH, { isLoading: isUpdating }] = useUpdateNSZFHMutation();
  const isSaving = isAdding || isUpdating;

  const performanceBands = [
    { key: "1", label: "25 % alatt" },
    { key: "2", label: "25-40" },
    { key: "3", label: "40-60" },
    { key: "4", label: "60-80" },
    { key: "5", label: "80 % fölött" },
  ];

  const competencyAreas = ["mat", "szoveg"];
  const measurementTypes = ["bemeneti", "kimeneti"];

  // Local state for the form data
  const [tableData, setTableData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize empty data structure based on the current layoutStructure
  const getEmptyData = () => {
    const data = {};
    layoutStructure.forEach(rowInfo => {
        data[rowInfo.key] = { id: null };
        performanceBands.forEach(band => {
          competencyAreas.forEach(comp => {
            measurementTypes.forEach(meas => {
              const mk = `kat_${band.key}_${comp.key}_${meas.key}`;
              data[rowInfo.key][mk] = "";
            });
          });
        });
    });
    return data;
  };

  // Initialize data from API
  useEffect(() => {
    if (apiData && Array.isArray(apiData) && layoutStructure.length > 0) {
      const initialData = getEmptyData();

      apiData.forEach(record => {
          if (record.tanev_kezdete !== currentSchoolYearStart) return;

          // Figure out which key this record corresponds to
          let formKey = null;
          if (record.kepzes_forma) {
            if (record.szakma_id) {
               formKey = `${record.kepzes_forma}_${record.szakma_id}`;
            } else {
               formKey = `${record.kepzes_forma}_nincs`;
            }
          }

          if (formKey && initialData[formKey]) {
              initialData[formKey].id = record.id;
              performanceBands.forEach(band => {
                competencyAreas.forEach(comp => {
                  measurementTypes.forEach(meas => {
                    const mk = `kat_${band.key}_${comp.key}_${meas.key}`;
                    initialData[formKey][mk] = record[mk] ?? "";
                  });
                });
              });
          }
      });

      setTableData(initialData);
    } else if (!isNSZFHLoading && layoutStructure.length > 0) {
      setTableData(getEmptyData());
    }
    setIsModified(false);
  }, [apiData, isNSZFHLoading, layoutStructure, currentSchoolYearStart]);

  // Handle data changes
  const handleDataChange = (rowKey, bandKey, compKey, measKey, value) => {
    if (value < 0) return;

    const mk = `kat_${bandKey}_${compKey}_${measKey}`;
    setTableData(prev => ({
      ...prev,
      [rowKey]: {
          ...prev[rowKey],
          [mk]: value
      }
    }));
    setIsModified(true);
    setSaveSuccess(false);
  };

  // Get value from tableData or compute if parent
  const getValue = (rowInfo, bandKey, compKey, measKey) => {
    const mk = `kat_${bandKey}_${compKey}_${measKey}`;
    
    if (rowInfo.isParent) {
      // Auto-calculate average of the children
      const children = layoutStructure.filter(r => !r.isParent && r.kepzes_forma === rowInfo.kepzes_forma);
      let sum = 0;
      let count = 0;
      children.forEach(child => {
         const val = tableData[child.key]?.[mk];
         if (val !== "" && val !== null && val !== undefined) {
           sum += parseFloat(val);
           count++;
         }
      });
      return count > 0 ? (sum / count).toFixed(1) : "";
    }

    if (!tableData || !tableData[rowInfo.key]) return "";
    return tableData[rowInfo.key][mk] ?? "";
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedSchool?.id) return;

    try {
      const promises = [];

      layoutStructure.forEach(rowInfo => {
          if (rowInfo.isParent) return; // Do not save the computed összesen rows

          const record = tableData[rowInfo.key];
          if (!record) return;

          let hasData = false;
          
          const payload = {
            alapadatok_id: selectedSchool.id,
            tanev_kezdete: currentSchoolYearStart,
            kepzes_forma: rowInfo.kepzes_forma,
            szakma_id: rowInfo.szakma_id,
          };

          performanceBands.forEach(band => {
            competencyAreas.forEach(comp => {
              measurementTypes.forEach(meas => {
                const mk = `kat_${band.key}_${comp.key}_${meas.key}`;
                const value = record[mk];
                if (value !== "" && value !== null && value !== undefined) hasData = true;
                payload[mk] = value === "" ? null : parseFloat(value);
              });
            });
          });

          if (record.id) {
            promises.push(updateNSZFH({ id: record.id, ...payload }).unwrap());
          } else if (hasData) {
            promises.push(addNSZFH(payload).unwrap());
          }
      });

      await Promise.all(promises);
      
      setSaveSuccess(true);
      setIsModified(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save NSZFH data:", err);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (apiData && Array.isArray(apiData)) {
      const initialData = getEmptyData();

      apiData.forEach(record => {
          if (record.tanev_kezdete !== currentSchoolYearStart) return;

          let formKey = null;
          if (record.kepzes_forma) {
            if (record.szakma_id) {
               formKey = `${record.kepzes_forma}_${record.szakma_id}`;
            } else {
               formKey = `${record.kepzes_forma}_nincs`;
            }
          }

          if (formKey && initialData[formKey]) {
              initialData[formKey].id = record.id;
              performanceBands.forEach(band => {
                competencyAreas.forEach(comp => {
                  measurementTypes.forEach(meas => {
                    const mk = `kat_${band.key}_${comp.key}_${meas.key}`;
                    initialData[formKey][mk] = record[mk] ?? "";
                  });
                });
              });
          }
      });

      setTableData(initialData);
    } else {
      setTableData(getEmptyData());
    }
    setIsModified(false);
  };

  if (isNSZFHLoading || isAlapadatokLoading) {
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

            <Box display="flex" alignItems="center" justifyContent="center" sx={{ position: "relative", mb: 2 }}>
              <Box sx={{ position: "absolute", left: 0 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setIsModified(false);
                      setSaveSuccess(false);
                    }}
                    displayEmpty
                    sx={{ backgroundColor: "#fff" }}
                  >
                    {schoolYears.slice(0, 4).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="h6" component="h2">
                NSZFH kompetenciamérés eredményei
              </Typography>
            </Box>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ overflowX: "auto" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                     <TableCell colSpan={2} sx={{ borderRight: "2px solid #e0e0e0" }} />
                     <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", color: "#d32f2f", borderRight: "1px solid #e0e0e0" }}>matematika</TableCell>
                     <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", color: "#d32f2f" }}>anyanyelv</TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                     <TableCell colSpan={2} sx={{ borderRight: "2px solid #e0e0e0" }} />
                     <TableCell colSpan={4} align="center" sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>összetétszámhoz viszonyítva (%)</TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell align="center" sx={{ fontWeight: "bold", width: 220 }}>Képzési forma / Szakma</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold", width: 100, borderRight: "2px solid #e0e0e0" }}>Sáv</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold", color: "#d32f2f" }}>bemeneti mérés</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold", color: "#d32f2f", borderRight: "1px solid #e0e0e0" }}>kimeneti mérés</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold", color: "#d32f2f" }}>bemeneti mérés</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold", color: "#d32f2f" }}>kimeneti mérés</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {layoutStructure.map((rowInfo, rowIndex) => (
                    <React.Fragment key={rowInfo.key}>
                      {performanceBands.map((band, bandIndex) => {
                        const isLastBand = bandIndex === 4;
                        const isLastLogicalRow = rowIndex === layoutStructure.length - 1;
                        
                        // Decide on colors
                        // Parents: #fff2cc for Technikum, #e8f4fd for Szakképző
                        // Children variables: #fffaf0 for Tech szakma, #f4f9fd for Szak szakma
                        let bgColor = "#ffffff";
                        let hoverColor = "#f5f5f5";
                        if (rowInfo.kepzes_forma === "Technikum") {
                           bgColor = rowInfo.isParent ? "#fff2cc" : "#fffaf0";
                           hoverColor = rowInfo.isParent ? "#ffe6b3" : "#fbf2e3";
                        } else {
                           bgColor = rowInfo.isParent ? "#e8f4fd" : "#f4f9fd";
                           hoverColor = rowInfo.isParent ? "#d4e6f1" : "#e5f0f9";
                        }

                        return (
                          <TableRow
                            key={`${rowInfo.key}-${band.key}`}
                            sx={{
                              backgroundColor: bgColor,
                              "&:hover": { backgroundColor: hoverColor },
                            }}
                          >
                            {bandIndex === 0 && (
                              <TableCell
                                rowSpan={5}
                                sx={{
                                  fontWeight: rowInfo.isParent ? "bold" : "normal",
                                  textAlign: "center",
                                  borderRight: "1px solid #e0e0e0",
                                  borderBottom: isLastLogicalRow ? "none" : "2px solid #e0e0e0",
                                  verticalAlign: "top",
                                  pt: 3,
                                  fontStyle: rowInfo.isParent ? "normal" : "italic",
                                  fontSize: rowInfo.isParent ? "1rem" : "0.85rem",
                                }}
                              >
                                {rowInfo.label}
                              </TableCell>
                            )}
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "center",
                                borderRight: "2px solid #e0e0e0",
                                borderBottom: isLastBand && !isLastLogicalRow ? "2px solid #e0e0e0" : "1px solid rgba(224, 224, 224, 1)"
                              }}
                            >
                              {band.label}
                            </TableCell>
                            
                            {/* Mathematics */}
                            <TableCell align="center" sx={{ borderBottom: isLastBand && !isLastLogicalRow ? "2px solid #e0e0e0" : "1px solid rgba(224, 224, 224, 1)", backgroundColor: rowInfo.isParent ? "rgba(0,0,0,0.03)" : "inherit" }}>
                              <TextField
                                type={rowInfo.isParent ? "text" : "number"}
                                value={getValue(rowInfo, band.key, 'mat', 'bemeneti')}
                                onChange={(e) => handleDataChange(rowInfo.key, band.key, 'mat', 'bemeneti', e.target.value)}
                                size="small"
                                disabled={rowInfo.isParent}
                                inputProps={{ min: 0, max: 100, step: 0.01, style: { textAlign: "center", fontWeight: rowInfo.isParent ? "bold" : "normal", color: rowInfo.isParent ? "#555" : "inherit" } }}
                                sx={{ width: "80px", backgroundColor: rowInfo.isParent ? "transparent" : "rgba(255,255,255,0.7)" }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0", borderBottom: isLastBand && !isLastLogicalRow ? "2px solid #e0e0e0" : "1px solid rgba(224, 224, 224, 1)", backgroundColor: rowInfo.isParent ? "rgba(0,0,0,0.03)" : "inherit" }}>
                              <TextField
                                type={rowInfo.isParent ? "text" : "number"}
                                value={getValue(rowInfo, band.key, 'mat', 'kimeneti')}
                                onChange={(e) => handleDataChange(rowInfo.key, band.key, 'mat', 'kimeneti', e.target.value)}
                                size="small"
                                disabled={rowInfo.isParent}
                                inputProps={{ min: 0, max: 100, step: 0.01, style: { textAlign: "center", fontWeight: rowInfo.isParent ? "bold" : "normal", color: rowInfo.isParent ? "#555" : "inherit" } }}
                                sx={{ width: "80px", backgroundColor: rowInfo.isParent ? "transparent" : "rgba(255,255,255,0.7)" }}
                              />
                            </TableCell>

                            {/* Text/Anyanyelv */}
                            <TableCell align="center" sx={{ borderBottom: isLastBand && !isLastLogicalRow ? "2px solid #e0e0e0" : "1px solid rgba(224, 224, 224, 1)", backgroundColor: rowInfo.isParent ? "rgba(0,0,0,0.03)" : "inherit" }}>
                              <TextField
                                type={rowInfo.isParent ? "text" : "number"}
                                value={getValue(rowInfo, band.key, 'szoveg', 'bemeneti')}
                                onChange={(e) => handleDataChange(rowInfo.key, band.key, 'szoveg', 'bemeneti', e.target.value)}
                                size="small"
                                disabled={rowInfo.isParent}
                                inputProps={{ min: 0, max: 100, step: 0.01, style: { textAlign: "center", fontWeight: rowInfo.isParent ? "bold" : "normal", color: rowInfo.isParent ? "#555" : "inherit" } }}
                                sx={{ width: "80px", backgroundColor: rowInfo.isParent ? "transparent" : "rgba(255,255,255,0.7)" }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: isLastBand && !isLastLogicalRow ? "2px solid #e0e0e0" : "1px solid rgba(224, 224, 224, 1)", backgroundColor: rowInfo.isParent ? "rgba(0,0,0,0.03)" : "inherit" }}>
                              <TextField
                                type={rowInfo.isParent ? "text" : "number"}
                                value={getValue(rowInfo, band.key, 'szoveg', 'kimeneti')}
                                onChange={(e) => handleDataChange(rowInfo.key, band.key, 'szoveg', 'kimeneti', e.target.value)}
                                size="small"
                                disabled={rowInfo.isParent}
                                inputProps={{ min: 0, max: 100, step: 0.01, style: { textAlign: "center", fontWeight: rowInfo.isParent ? "bold" : "normal", color: rowInfo.isParent ? "#555" : "inherit" } }}
                                sx={{ width: "80px", backgroundColor: rowInfo.isParent ? "transparent" : "rgba(255,255,255,0.7)" }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {isModified && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Mentetlen módosítások vannak. Ne felejtsd el menteni a változtatásokat!
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
}
