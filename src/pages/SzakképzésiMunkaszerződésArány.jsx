import { useState } from "react";
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
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";

export default function SzakképzésiMunkaszerződésArány() {
  const schoolYears = generateSchoolYears();

  // Define the institution types and specializations based on the attachment
  const institutionStructure = [
    {
      category: "összesen",
      subcategory: "technikum+szakképző iskola",
      specializations: [],
    },
    {
      category: "intézménytípusonként",
      subcategory: "ebből: technikum",
      specializations: ["magasépítő technikus (A)", "mélyépítő technikus (B)"],
    },
    {
      category: "intézménytípusonként",
      subcategory: "ebből: szakképző iskola",
      specializations: [
        "kőműves (a)",
        "burkkoló (b)",
        "festő, mázóló, tapétázó (c)",
      ],
    },
  ];

  // Initialize data structure for the three main sections
  const [szakképzésiData, setSzakképzésiData] = useState(() => {
    const initialData = {
      percentage: {},
      contract_students: {},
      total_students: {},
    };

    // Initialize all sections
    Object.keys(initialData).forEach((section) => {
      institutionStructure.forEach((institution, institutionIndex) => {
        const key = `${institution.category}_${institutionIndex}`;
        initialData[section][key] = {};

        // Add subcategory
        initialData[section][key][institution.subcategory] = {};
        schoolYears.forEach((year) => {
          initialData[section][key][institution.subcategory][year] = "0";
        });

        // Add specializations
        institution.specializations.forEach((spec) => {
          initialData[section][key][spec] = {};
          schoolYears.forEach((year) => {
            initialData[section][key][spec][year] = "0";
          });
        });
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (
    section,
    institutionKey,
    subcategory,
    year,
    value
  ) => {
    setSzakképzésiData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [institutionKey]: {
          ...prev[section][institutionKey],
          [subcategory]: {
            ...prev[section][institutionKey][subcategory],
            [year]: value,
          },
        },
      },
    }));
    setIsModified(true);
  };

  // Calculate percentage automatically
  const calculatePercentage = (institutionKey, subcategory, year) => {
    const contractStudents = parseFloat(
      szakképzésiData.contract_students[institutionKey]?.[subcategory]?.[
        year
      ] || 0
    );
    const totalStudents = parseFloat(
      szakképzésiData.total_students[institutionKey]?.[subcategory]?.[year] || 0
    );

    if (totalStudents > 0) {
      const percentage = ((contractStudents / totalStudents) * 100).toFixed(2);
      handleDataChange(
        "percentage",
        institutionKey,
        subcategory,
        year,
        percentage
      );
    }
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(szakképzésiData)));
    setIsModified(false);
    console.log("Saving vocational contract data:", szakképzésiData);
  };

  const handleReset = () => {
    if (savedData) {
      setSzakképzésiData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  // Render table section
  const renderTableSection = (dataKey, title, unit, bgColor) => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              color: dataKey === "percentage" ? "#d32f2f" : "#1976d2",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {title}
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: bgColor }}>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      minWidth: 200,
                      textAlign: "center",
                      backgroundColor: "#ffcdd2",
                      verticalAlign: "middle",
                    }}
                  >
                    {/* Empty header cell */}
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      minWidth: 200,
                      textAlign: "center",
                      backgroundColor: "#ffcdd2",
                      verticalAlign: "middle",
                    }}
                  >
                    {/* Empty header cell */}
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 100,
                        backgroundColor: "#e8f4fd",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {institutionStructure.map((institution, institutionIndex) => {
                  const institutionKey = `${institution.category}_${institutionIndex}`;
                  const allItems = [
                    institution.subcategory,
                    ...institution.specializations,
                  ];

                  return allItems.map((item, itemIndex) => (
                    <TableRow
                      key={`${institutionKey}-${item}`}
                      sx={{
                        backgroundColor:
                          institution.subcategory === item
                            ? "#fff3e0"
                            : "#f9f9f9",
                      }}
                    >
                      {itemIndex === 0 && (
                        <TableCell
                          rowSpan={allItems.length}
                          sx={{
                            fontWeight: "bold",
                            textAlign: "left",
                            backgroundColor: "#f5f5f5",
                            verticalAlign: "middle",
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                          }}
                        >
                          {institution.category}
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          fontWeight:
                            institution.subcategory === item
                              ? "bold"
                              : "normal",
                          textAlign: "left",
                          backgroundColor:
                            institution.subcategory === item
                              ? "#fff3e0"
                              : "#f9f9f9",
                          fontSize:
                            institution.subcategory === item
                              ? "0.9rem"
                              : "0.8rem",
                        }}
                      >
                        {item}
                      </TableCell>
                      {schoolYears.map((year) => (
                        <TableCell key={year} align="center">
                          <TextField
                            type="number"
                            value={
                              szakképzésiData[dataKey][institutionKey]?.[
                                item
                              ]?.[year] || "0"
                            }
                            onChange={(e) =>
                              handleDataChange(
                                dataKey,
                                institutionKey,
                                item,
                                year,
                                e.target.value
                              )
                            }
                            size="small"
                            inputProps={{
                              min: 0,
                              max: dataKey === "percentage" ? 100 : undefined,
                              step: dataKey === "percentage" ? 0.01 : 1,
                              style: { textAlign: "center" },
                            }}
                            sx={{ width: "80px" }}
                            placeholder={
                              dataKey === "percentage" ? "0-100" : "0"
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        4. A szakképző intézményben szakképzési munkaszerződéssel rendelkezők
        aránya az intézmény szakirányú oktatásában résztvevő
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Szerintem ezt is számíthatjuk az 1. indikátorhoz feltöltött tanulók
            exportból (tartalmazza a szakmai munkszerződéssel mezőt, abból
            megszámolhatjuk).
          </Typography>

          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            <strong>Megjegyzés:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Az érettségi utáni képzések első évfolyamán tanulók szakképzési
            munkaszerződésének száma az október 1-jei adatban még nem jelenik
            meg, mert csak az első félvét lezáró időszaki alapvizsgát követően
            tudnak munkaszerződést kötni. Az adatok értékelésénél, elemzésénél
            ezt az időbeli eltérést érdemes figyelembe venni.
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
              (Szakképzési munkaszerződéssel rendelkezők száma / szakirányú
              oktatásban részt vevő tanulók összlétszáma) × 100
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

      {/* Percentage Table */}
      {renderTableSection(
        "percentage",
        "szakképzési munkaszerződéssel rendelkezők aránya (%)",
        "%",
        "#ffebee"
      )}

      {/* Contract Students Count Table */}
      {renderTableSection(
        "contract_students",
        "szakképzési munkaszerződéssel rendelkező tanulók száma (tanulói jogviszony) (fő)",
        "fő",
        "#e3f2fd"
      )}

      {/* Total Students Table */}
      {renderTableSection(
        "total_students",
        "szakirányú oktatásban részt vevő tanulók összlétszáma (tanulói jogviszony) (fő)",
        "fő",
        "#e8f5e8"
      )}

      {/* Calculation Helper */}
      <Card sx={{ mb: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Automatikus számítás
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Kattintson a számítás gombra az automatikus százalékszámításhoz:
          </Typography>
          {institutionStructure.map((institution, institutionIndex) => {
            const institutionKey = `${institution.category}_${institutionIndex}`;
            const allItems = [
              institution.subcategory,
              ...institution.specializations,
            ];

            return (
              <Box key={institutionKey} sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                  {institution.category}:
                </Typography>
                {allItems.map((item) => (
                  <Box key={item} sx={{ mb: 2, ml: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontSize: "0.9rem" }}
                    >
                      {item}:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", ml: 2 }}
                    >
                      {schoolYears.map((year) => (
                        <Button
                          key={year}
                          variant="outlined"
                          startIcon={<CalculateIcon />}
                          onClick={() =>
                            calculatePercentage(institutionKey, item, year)
                          }
                          size="small"
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {year}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isModified}
        >
          Mentés
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={!isModified || !savedData}
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

      {/* Vocational Training Information */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Szakképzési munkaszerződés jellemzői
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Chip label="Duális képzés" color="primary" variant="outlined" />
            <Chip
              label="Munkahelyi gyakorlat"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label="Szakmai kompetenciák"
              color="success"
              variant="outlined"
            />
            <Chip label="Mentorálás" color="info" variant="outlined" />
            <Chip
              label="Gyakorlati oktatás"
              color="warning"
              variant="outlined"
            />
            <Chip
              label="Munkavállalói jogok"
              color="error"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2">
            A szakképzési munkaszerződés a tanuló és a fogadó szervezet között
            létrejövő megállapodás, amely biztosítja a gyakorlati képzés
            kereteit.
          </Typography>
        </CardContent>
      </Card>

      {/* Institution Types */}
      <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Intézménytípusok és szakirányok
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Technikum:</strong> Magasépítő technikus, Mélyépítő
                technikus
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Szakképző iskola:</strong> Kőműves, Burkkoló,
                Festő-mázóló-tapétázó
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Duális képzés:</strong> Elméleti és gyakorlati oktatás
                kombinációja
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Szakmai gyakorlat:</strong> Valós munkahelyi
                környezetben történő képzés
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Legal Framework */}
      <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Jogszabályi háttér
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Szerződéskötés:</strong> A tanuló, az iskola és a fogadó
                szervezet háromoldalú megállapodása
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Időtartam:</strong> A képzési idő alatt érvényes,
                meghatározott gyakorlati óraszámmal
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Díjazás:</strong> A tanuló jogosult gyakorlati képzési
                díjra
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Mentorálás:</strong> Munkahelyi mentor kijelölése
                kötelező
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* Data Quality Guidelines */}
      <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Adatminőség irányelvek
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography variant="body2">
                <strong>Szerződés típusa:</strong> Csak érvényes szakképzési
                munkaszerződésekkel rendelkező tanulók számítanak
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Jogviszony:</strong> Tanulói jogviszonyban lévő tanulók
                adatait kell figyelembe venni
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Időzítés:</strong> Az október 1-jei állapot szerint kell
                jelenteni az adatokat
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Szakirányok:</strong> Intézménytípusonként és
                szakirányanként részletezett bontásban
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
