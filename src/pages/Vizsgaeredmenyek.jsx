import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import ExportButton from "../components/ExportButton";
import { exportYearlyDataToXLS } from "../utils/xlsExport";
import { generateSchoolYears } from "../utils/schoolYears";
import {
  useGetAllVizsgaeredmenyekQuery,
  useAddVizsgaeredmenyekMutation,
  useUpdateVizsgaeredmenyekMutation,
} from "../store/api/apiSlice";

export default function Vizsgaeredmenyek() {
  // API hooks
  const { data: apiData, isLoading, error } = useGetAllVizsgaeredmenyekQuery();
  const [addVizsgaeredmenyek] = useAddVizsgaeredmenyekMutation();
  const [updateVizsgaeredmenyek] = useUpdateVizsgaeredmenyekMutation();

  const schoolYears = generateSchoolYears();

  const examCategories = [
    {
      category: "szakmai_vizsgaeredmenyek",
      title: "szakmai vizsgaeredmények",
      subjects: [
        { key: "magasepito_technikus_a", label: "magasépítő technikus (A)" },
        { key: "melyepito_technikus_b", label: "mélyépítő technikus (B)" },
        { key: "komuves_a", label: "kőműves (a)" },
        { key: "burkolo_b", label: "burkoló (b)" },
        { key: "festo_mazo_tapetazo_c", label: "festő, mázoló, tapétázó (c)" },
      ],
      color: "#e8f5e8",
    },
    {
      category: "agazati_alapvizsga",
      title: "ágazati alapvizsga",
      subjects: [{ key: "epitoipar_agazat", label: "építőipar ágazat" }],
      color: "#fff2e8",
    },
    {
      category: "magyar_nyelv_irodalom",
      title: "magyar nyelv és irodalom érettségi vizsgaeredmény",
      subjects: [
        {
          key: "magasepito_technikus_a_magyar",
          label: "magasépítő technikus (A)",
        },
        {
          key: "melyepito_technikus_b_magyar",
          label: "mélyépítő technikus (B)",
        },
      ],
      color: "#e8f2ff",
    },
    {
      category: "matematika_erettsegi",
      title: "matematika érettségi vizsgaeredmény",
      subjects: [
        {
          key: "magasepito_technikus_a_matek",
          label: "magasépítő technikus (A)",
        },
        {
          key: "melyepito_technikus_b_matek",
          label: "mélyépítő technikus (B)",
        },
      ],
      color: "#fff8e8",
    },
    {
      category: "tortenelem_erettsegi",
      title: "történelem érettségi vizsgaeredmény",
      subjects: [
        {
          key: "magasepito_technikus_a_tortenelem",
          label: "magasépítő technikus (A)",
        },
        {
          key: "melyepito_technikus_b_tortenelem",
          label: "mélyépítő technikus (B)",
        },
      ],
      color: "#f8e8ff",
    },
    {
      category: "angol_nyelv_erettsegi",
      title: "angol nyelv érettségi vizsgaeredmény",
      subjects: [
        {
          key: "magasepito_technikus_a_angol",
          label: "magasépítő technikus (A)",
        },
        {
          key: "melyepito_technikus_b_angol",
          label: "mélyépítő technikus (B)",
        },
      ],
      color: "#e8fff8",
    },
    {
      category: "agazati_szakmai_erettsegi",
      title: "ágazati szakmai érettségi vizsgaeredmény",
      subjects: [
        {
          key: "magasepito_technikus_a_agazati",
          label: "magasépítő technikus (A)",
        },
        {
          key: "melyepito_technikus_b_agazati",
          label: "mélyépítő technikus (B)",
        },
      ],
      color: "#ffe8f8",
    },
  ];

  // Initialize data structure
  const [examData, setExamData] = useState(() => {
    const initialData = {};

    examCategories.forEach((category) => {
      initialData[category.category] = {};
      category.subjects.forEach((subject) => {
        initialData[category.category][subject.key] = {};
        schoolYears.forEach((year) => {
          initialData[category.category][subject.key][year] = "0";
        });
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load data from API when component mounts or API data changes
  useEffect(() => {
    if (apiData && Array.isArray(apiData)) {
      const transformedData = {};

      // Initialize structure
      examCategories.forEach((category) => {
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
        if (year && transformedData[item.category_type]) {
          const categoryKey = item.category_type;
          const subjectKey = item.subject_key;
          if (
            transformedData[categoryKey] &&
            transformedData[categoryKey][subjectKey]
          ) {
            transformedData[categoryKey][subjectKey][year] =
              item.result_value?.toString() || "0";
          }
        }
      });

      setExamData(transformedData);
      setSavedData(JSON.parse(JSON.stringify(transformedData)));
      setIsModified(false);
    }
  }, [apiData]);

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
      // Transform frontend data to API format
      const dataToSave = [];

      Object.keys(examData).forEach((categoryKey) => {
        Object.keys(examData[categoryKey]).forEach((subjectKey) => {
          Object.keys(examData[categoryKey][subjectKey]).forEach((year) => {
            const value = examData[categoryKey][subjectKey][year];
            // Allow zero values, only filter out empty/null/undefined
            if (value !== "" && value !== null && value !== undefined) {
              dataToSave.push({
                tanev_kezdete: parseInt(year),
                category_type: categoryKey,
                subject_key: subjectKey,
                result_value: parseFloat(value) || 0,
              });
            }
          });
        });
      });

      // Check if this is an update or create operation
      if (apiData && apiData.length > 0) {
        // Update operation - send all data as update
        for (const item of dataToSave) {
          await updateVizsgaeredmenyek({
            id: item.tanev_kezdete, // Use year as ID for now
            ...item,
          }).unwrap();
        }
      } else {
        // Create operation - send all data as new entries
        for (const item of dataToSave) {
          await addVizsgaeredmenyek(item).unwrap();
        }
      }

      setSavedData(JSON.parse(JSON.stringify(examData)));
      setIsModified(false);
      console.log("Exam data saved successfully");
    } catch (error) {
      console.error("Error saving exam data:", error);
      // You might want to show an error message to the user here
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

  // Handle export to XLS
  const handleExport = () => {
    if (!examData || Object.keys(examData).length === 0) {
      return;
    }

    exportYearlyDataToXLS(examData, schoolYears, "vizsgaeredmenyek");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        11. Vizsgaeredmények
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A szakképző intézményben a tanulmányokat lezáró eredmények,
        tantárgyankénti / szakmánkénti / ágazatonkénti átlaga tanulói és
        felnőttképzési jogviszonyban.
      </Typography>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Hiba történt az adatok betöltése során: {error.message}
        </Alert>
      )}

      {/* Content - only show when not loading */}
      {!isLoading && (
        <>
          {/* Instructions Card */}
          <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Figyelem!
              </Typography>
              <Typography variant="body2">
                Az adatokat százalékos formátumban adja meg (pl. 85.5 a
                85,5%-hoz). A táblázat automatikusan kiszámolja az átlagokat a
                megadott értékek alapján.
              </Typography>
            </CardContent>
          </Card>

          {/* Examples Card */}
          <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Példa értékek:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <li>
                  <Typography variant="body2">
                    <strong>Matematika érettségi tantárgyi átlaga:</strong> 3,5
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>
                      Szakács szakmában végzettek eredményeinek átlaga:
                    </strong>{" "}
                    3,8
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>
                      Turizmus-vendéglátás ágazatban ágazati alapvizsgát tett
                      tanulók eredményének átlaga:
                    </strong>{" "}
                    4,2
                  </Typography>
                </li>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                <strong>Megjegyzés:</strong> Egy adott tanév vizsgájának
                átlageredményei nem elegendőek az intézmény folyó tevékenység
                értékeléséhez, ezért ajánlott az átlagok trendvizsgálata.
              </Typography>
            </CardContent>
          </Card>

          {/* Main Data Tables */}
          {examCategories.map((categoryData, categoryIndex) => (
            <Card key={categoryData.category} sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  sx={{
                    textTransform: "capitalize",
                    color: "#1976d2",
                    fontWeight: "bold",
                  }}
                >
                  {categoryData.title}
                </Typography>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ overflowX: "auto" }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: categoryData.color }}>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            verticalAlign: "middle",
                            minWidth: 250,
                            textAlign: "center",
                          }}
                        >
                          Szakma / Ágazat
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            minWidth: 100,
                            backgroundColor: "#ffebee",
                            color: "#d32f2f",
                          }}
                        >
                          Átlag
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
                      {categoryData.subjects.map((subject, index) => (
                        <TableRow
                          key={subject.key}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#f9f9f9" : "white",
                            "&:hover": {
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "medium",
                              textAlign: "left",
                              pl: 2,
                            }}
                          >
                            {subject.label}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              backgroundColor: "#ffebee",
                              fontWeight: "bold",
                              color: "#d32f2f",
                            }}
                          >
                            <Chip
                              label="Átlag"
                              size="small"
                              variant="outlined"
                              sx={{
                                backgroundColor: "white",
                                borderColor: "#d32f2f",
                                color: "#d32f2f",
                                fontSize: "0.75rem",
                              }}
                            />
                          </TableCell>
                          {schoolYears.map((year) => (
                            <TableCell key={year} align="center">
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
                                sx={{ width: "80px" }}
                                placeholder="1-5"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={!isModified || isSaving}
        >
          {isSaving ? "Mentés..." : "Mentés"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={!isModified || !savedData}
        >
          Visszaállítás
        </Button>
        <ExportButton
          onExport={handleExport}
          label="Export XLS"
          disabled={!examData || Object.keys(examData).length === 0}
          tooltip="Vizsgaeredmények exportálása XLS fájlba"
        />
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

      {/* Additional Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Értékelési rendszer
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip label="1 - Elégtelen" color="error" />
            <Chip label="2 - Elégséges" color="warning" />
            <Chip label="3 - Közepes" color="info" />
            <Chip label="4 - Jó" color="primary" />
            <Chip label="5 - Jeles" color="success" />
          </Box>
          <Typography variant="body2">
            Az eredmények 1-5 skálán értendők, ahol az 1 az elégtelen, az 5 a
            jeles osztályzatot jelenti. A tizedesjegyek használata megengedett a
            pontosabb átlagszámítás érdekében.
          </Typography>
        </CardContent>
      </Card>

      {/* Data Analysis Card */}
      <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Adatelemzési szempontok
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Trendanalízis:</strong> Évenkénti változások nyomon
                követése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Szakmacsoportok összevetése:</strong> Különböző
                területek teljesítményének összehasonlítása
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Érettségi vs szakmai vizsgák:</strong> Általános és
                szakmai kompetenciák értékelése
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Minőségbiztosítás:</strong> Oktatási folyamatok
                hatékonyságának mérése
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
