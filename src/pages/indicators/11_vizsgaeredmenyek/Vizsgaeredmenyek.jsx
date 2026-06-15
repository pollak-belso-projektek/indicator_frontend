import React, { useState, useEffect, useMemo, Fragment } from "react";
import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Backdrop,
  Snackbar,
  Container,
  Fade,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../../../utils/schoolYears";
import {
  useGetAllVizsgaeredmenyekQuery,
  useAddVizsgaeredmenyekMutation,
  useUpdateVizsgaeredmenyekMutation,
  useGetAllAlapadatokQuery,
} from "../../../store/api/apiSlice";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoVizsgaeredmenyek from "./info_vizsgaeredmenyek";
import TitleVizsgaeredmenyek from "./title_vizsgaeredmenyek";

export default function Vizsgaeredmenyek() {
  // API hooks
  const { data: apiData, isLoading, error } = useGetAllVizsgaeredmenyekQuery();
  const [addVizsgaeredmenyek] = useAddVizsgaeredmenyekMutation();
  const [updateVizsgaeredmenyek] = useUpdateVizsgaeredmenyekMutation();

  const schoolYears = useMemo(() => generateSchoolYears(), []);

  const selectedSchool = useSelector(selectSelectedSchool);
  const { data: schoolsData } = useGetAllAlapadatokQuery();

  const dynamicCategories = useMemo(() => {
    if (!schoolsData || !Array.isArray(schoolsData) || !selectedSchool) return [];

    let relevantSchool = schoolsData.find(
      (school) => school.id === selectedSchool.id
    );
    if (!relevantSchool) return [];

    const subjects = [];

    if (
      relevantSchool.alapadatok_szakirany &&
      Array.isArray(relevantSchool.alapadatok_szakirany)
    ) {
      relevantSchool.alapadatok_szakirany.forEach((szakiranyData) => {
        const szakirany = szakiranyData.szakirany;
        if (szakirany && szakirany.nev) {
          if (szakirany.szakma && Array.isArray(szakirany.szakma)) {
            szakirany.szakma.forEach((szakmaData) => {
              if (szakmaData.szakma?.nev) {
                // Check if already added
                if (!subjects.some(s => s.key === szakmaData.szakma.id)) {
                  subjects.push({
                    key: szakmaData.szakma.id,
                    label: szakmaData.szakma.nev,
                    szakirany_id: szakirany.id,
                    szakma_id: szakmaData.szakma.id,
                    szakirany_nev: szakirany.nev
                  });
                }
              }
            });
          }
        }
      });
    }

    return [
      {
        category: "szakmai_vizsga_eredmeny",
        title: "szakmai vizsgaeredmények",
        subjects: subjects,
        color: "#e8f5e8",
      },
      {
        category: "agazati_alapvizsga_eredmeny",
        title: "ágazati alapvizsga",
        subjects: subjects,
        color: "#fff2e8",
      },
      {
        category: "magyar_nyelv_eretsegi_eredmeny",
        title: "magyar nyelv és irodalom érettségi vizsgaeredmény",
        subjects: subjects,
        color: "#e8f2ff",
      },
      {
        category: "matematika_eretsegi_eredmeny",
        title: "matematika érettségi vizsgaeredmény",
        subjects: subjects,
        color: "#fff8e8",
      },
      {
        category: "tortenelem_eretsegi_eredmeny",
        title: "történelem érettségi vizsgaeredmény",
        subjects: subjects,
        color: "#f8e8ff",
      },
      {
        category: "angol_nyelv_eretsegi_eredmeny",
        title: "angol nyelv érettségi vizsgaeredmény",
        subjects: subjects,
        color: "#e8fff8",
      },
      {
        category: "agazati_szakmai_eretsegi_eredmeny",
        title: "ágazati szakmai érettségi vizsgaeredmény",
        subjects: subjects,
        color: "#ffe8f8",
      },
    ];
  }, [schoolsData, selectedSchool]);

  // Initialize data structure
  const [examData, setExamData] = useState({});

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Load data from API when component mounts or API data changes
  useEffect(() => {
    if (dynamicCategories.length > 0 && apiData && Array.isArray(apiData)) {
      const transformedData = {};

      // Initialize structure
      dynamicCategories.forEach((category) => {
        transformedData[category.category] = {};
        category.subjects.forEach((subject) => {
          transformedData[category.category][subject.key] = {};
          schoolYears.forEach((year) => {
            transformedData[category.category][subject.key][year] = "0";
          });
        });
      });

      // Transform API data to match frontend structure
      apiData.forEach((item) => {
        const year = item.tanev_kezdete?.toString();
        if (year) {
          const subjectKey = item.szakma_id;
          
          dynamicCategories.forEach((category) => {
            const categoryKey = category.category;
            if (
              transformedData[categoryKey] &&
              transformedData[categoryKey][subjectKey]
            ) {
              transformedData[categoryKey][subjectKey][year] =
                item[categoryKey]?.toString() || "0";
            }
          });
        }
      });

      setExamData(transformedData);
      setSavedData(JSON.parse(JSON.stringify(transformedData)));
      setIsModified(false);
    }
  }, [apiData, dynamicCategories, schoolYears]);

  // Handle data changes
  const handleDataChange = (category, subject, year, value) => {
    setExamData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subject]: {
          ...prev[category][subject],
          [year]: value,
        },
      },
    }));
    setIsModified(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!selectedSchool || !selectedSchool.id) {
        throw new Error("Nincs kiválasztva intézmény.");
      }

      // Transform frontend data to API format
      const recordsToSave = {};

      Object.keys(examData).forEach((examType) => {
        Object.keys(examData[examType]).forEach((szakmaId) => {
          Object.keys(examData[examType][szakmaId]).forEach((year) => {
            const value = examData[examType][szakmaId][year];
            if (value !== "" && value !== null && value !== undefined) {
              const parsedValue = parseFloat(value);
              const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
              
              const recordKey = `${year}_${szakmaId}`;
              if (!recordsToSave[recordKey]) {
                let subject = null;
                dynamicCategories[0].subjects.forEach(s => {
                  if (s.key === szakmaId) subject = s;
                });

                recordsToSave[recordKey] = {
                  alapadatok_id: selectedSchool.id,
                  tanev_kezdete: parseInt(year),
                  szakma_id: szakmaId,
                  szakirany_id: subject ? subject.szakirany_id : null,
                  szakmai_vizsga_eredmeny: 0,
                  agazati_alapvizsga_eredmeny: 0,
                  magyar_nyelv_eretsegi_eredmeny: 0,
                  matematika_eretsegi_eredmeny: 0,
                  tortenelem_eretsegi_eredmeny: 0,
                  angol_nyelv_eretsegi_eredmeny: 0,
                  agazati_szakmai_eretsegi_eredmeny: 0,
                };
              }
              recordsToSave[recordKey][examType] = numericValue;
            }
          });
        });
      });

      const dataToSave = Object.values(recordsToSave);

      // Update or create operations
      for (const item of dataToSave) {
        if (!item.szakirany_id) continue;

        const existingRecord = apiData?.find(
          (record) =>
            record.tanev_kezdete === item.tanev_kezdete &&
            record.szakma_id === item.szakma_id
        );

        if (existingRecord && existingRecord.id) {
          // Update existing record
          await updateVizsgaeredmenyek({
            id: existingRecord.id,
            ...item,
          }).unwrap();
        } else {
          // Create new record
          await addVizsgaeredmenyek(item).unwrap();
        }
      }

      setSavedData(JSON.parse(JSON.stringify(examData)));
      setIsModified(false);

      // Show success snackbar
      setSnackbarMessage("Az adatok sikeresen mentve!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving exam data:", error);
      const errorMessage =
        error.data?.message || error.message || "Hiba történt a mentés során";

      // Show error snackbar
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (savedData) {
      setExamData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Backdrop
        sx={{
          position: "fixed",
          zIndex: 1300,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          color: "primary.main",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        open={isLoading}
      >
        <CircularProgress size={50} />
        <Box sx={{ textAlign: "center", fontWeight: "medium" }}>
          Adatok betöltése folyamatban, kérjük várjon...
        </Box>
      </Backdrop>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageWrapper
        titleContent={<TitleVizsgaeredmenyek />}
        infoContent={<InfoVizsgaeredmenyek />}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ minHeight: "calc(100vh - 120px)" }}>
            <LockStatusIndicator tableName="vizsgaeredmenyek" />

            {/* Error State */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Hiba történt az adatok betöltése során: {error.message}
              </Alert>
            )}

            {/* Status Messages */}
            {isModified && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Mentetlen módosítások vannak. Ne felejtsd el menteni a
                változtatásokat!
              </Alert>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 3, ml: 2 }}>
              <LockedTableWrapper tableName="vizsgaeredmenyek">
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
              </LockedTableWrapper>
            </Stack>

            {/* Main Data Table */}
            <TableContainer
              component={Paper}
              sx={{ maxWidth: "100%", overflowX: "auto" }}
            >
              <Table size="small" sx={{ minWidth: 1400 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: "bold",
                        minWidth: 250,
                        maxWidth: 350,
                        borderRight: "2px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 3,
                        verticalAlign: "middle",
                        boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                      }}
                    ></TableCell>
                    <TableCell
                      colSpan={schoolYears.length}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#ffcdd2",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Vizsgaeredmények (átlag)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {schoolYears.map((year) => (
                      <TableCell
                        key={year}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#ffcdd240",
                          fontSize: "0.75rem",
                        }}
                      >
                        {year}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dynamicCategories.map((categoryData, categoryIndex) => (
                    <React.Fragment key={`category-${categoryData.category}-${categoryIndex}`}>
                      {/* Category header row */}
                      <TableRow key={`header-${categoryData.category}`}>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: categoryData.color,
                            borderBottom: "2px solid #ddd",
                            borderRight: "2px solid #ddd",
                            position: "sticky",
                            left: 0,
                            zIndex: 2,
                            textTransform: "capitalize",
                            boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                          }}
                        >
                          {categoryData.title}
                        </TableCell>
                        {schoolYears.map((year) => (
                          <TableCell
                            key={year}
                            sx={{
                              backgroundColor: categoryData.color,
                              borderBottom: "2px solid #ddd",
                            }}
                          />
                        ))}
                      </TableRow>

                      {/* Subject rows */}
                      {categoryData.subjects.map((subject) => (
                        <TableRow key={`${categoryData.category}-${subject.key}`}>
                          <TableCell
                            sx={{
                              fontWeight: "normal",
                              pl: 4,
                              borderRight: "1px solid #ddd",
                              position: "sticky",
                              left: 0,
                              backgroundColor: "#ffffff",
                              zIndex: 1,
                              fontSize: "0.85rem",
                              boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
                            }}
                          >
                            {subject.label}
                          </TableCell>

                          {schoolYears.map((year) => (
                            <TableCell
                              key={year}
                              align="center"
                              sx={{ backgroundColor: "#ffcdd220" }}
                            >
                              <TextField
                                type="number"
                                value={
                                  examData[categoryData.category]?.[
                                    subject.key
                                  ]?.[year] || "0"
                                }
                                onChange={(e) =>
                                  handleDataChange(
                                    categoryData.category,
                                    subject.key,
                                    year,
                                    e.target.value
                                  )
                                }
                                size="small"
                                inputProps={{
                                  min: 0,
                                  max: 5,
                                  step: 0.1,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: "70px" }}
                                placeholder="1-5"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Loading Overlay */}
            {isSaving && (
              <Backdrop
                sx={{
                  position: "fixed",
                  zIndex: 1300,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  color: "primary.main",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
                open={isSaving}
              >
                <CircularProgress size={50} />
                <Box sx={{ textAlign: "center", fontWeight: "medium" }}>
                  Adatok mentése folyamatban, kérjük várjon...
                </Box>
              </Backdrop>
            )}

            {/* Snackbar for save notifications */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbarSeverity}
                variant="filled"
                sx={{ width: "100%" }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Fade>
      </PageWrapper>
    </Container>
  );
}
