import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
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
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { selectSelectedSchool } from "../store/slices/authSlice";
import {
  useGetTanuloLetszamQuery,
  useAddTanuloLetszamMutation,
  useGetAllAlapadatokQuery,
} from "../store/api/apiSlice";
import { generateSchoolYears } from "../utils/schoolYears";
import TanuloLetszamChart from "../components/TanuloLetszamChart";

const evszamok = generateSchoolYears();

export default function TanuloLetszam() {
  const selectedSchool = useSelector(selectSelectedSchool);

  // API hooks
  const {
    data: apiStudentData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetTanuloLetszamQuery(
    { alapadatok_id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addStudentData, { isLoading: isUpdating }] =
    useAddTanuloLetszamMutation();

  // State for the integrated table data
  const [tableData, setTableData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editableData, setEditableData] = useState([]);

  // Program types based on the selected school's actual data
  const programTypes = useMemo(() => {
    if (!schoolsData || !Array.isArray(schoolsData)) return [];

    let relevantSchools = schoolsData;
    if (selectedSchool) {
      relevantSchools = schoolsData.filter(
        (school) => school.id === selectedSchool.id
      );
    }

    const categories = [];

    // Add "Összesen" category with institution types
    const institutionTypes = [
      ...new Set(relevantSchools.map((school) => school.intezmeny_tipus)),
    ];
    if (institutionTypes.length > 0) {
      categories.push({
        category: "Összesen",
        subTypes: institutionTypes,
        isTotal: true,
      });

      // Add individual institution types
      institutionTypes.forEach((instType) => {
        categories.push({
          category: `Intézménytípusonként`,
          subTypes: [`ebből: ${instType}`],
          isInstitutionType: true,
        });
      });
    }

    // Extract szakirányok and szakmák from the schools
    relevantSchools.forEach((school) => {
      if (
        school.alapadatok_szakirany &&
        Array.isArray(school.alapadatok_szakirany)
      ) {
        school.alapadatok_szakirany.forEach((szakiranyData) => {
          const szakirany = szakiranyData.szakirany;
          if (szakirany) {
            // Add szakmák under this szakirány
            if (szakirany.szakma && Array.isArray(szakirany.szakma)) {
              const szakmaNevek = szakirany.szakma
                .map((szakmaData) => szakmaData.szakma?.nev)
                .filter(Boolean);
              if (szakmaNevek.length > 0) {
                categories.push({
                  category: `Szakmánként`,
                  subTypes: szakmaNevek,
                  isSpecialty: true,
                });
              }
            }
          }
        });
      }
    });

    return categories;
  }, [schoolsData, selectedSchool]);

  // Process API data into chart-compatible format
  const { chartData, years } = useMemo(() => {
    // Generate the last 4 academic years based on current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based, so September is 8

    // If it's September or later, we're in the new academic year
    const academicYearStart = currentMonth >= 8 ? currentYear : currentYear - 1;

    // Generate last 4 academic years
    const last4Years = Array.from(
      { length: 4 },
      (_, i) => academicYearStart - 3 + i
    );

    if (apiStudentData && Array.isArray(apiStudentData)) {
      const groupedByAgazat = {};

      apiStudentData.forEach((item) => {
        const agazatType = item.szakirany?.nev || "Nincs megadva";
        const year = item.tanev_kezdete;
        const jogviszonyType =
          item.jogv_tipus === 0
            ? "Tanulói jogviszony"
            : "Felnőttképzési jogviszony";

        if (!groupedByAgazat[agazatType]) {
          groupedByAgazat[agazatType] = {
            name: agazatType,
            yearCounts: {},
          };
        }

        if (!groupedByAgazat[agazatType].yearCounts[year]) {
          groupedByAgazat[agazatType].yearCounts[year] = {
            "Tanulói jogviszony": 0,
            "Felnőttképzési jogviszony": 0,
            Egyéb: 0,
          };
        }

        groupedByAgazat[agazatType].yearCounts[year][jogviszonyType] =
          item.letszam;
      });

      // Ensure all agazat types have entries for all 4 years
      Object.values(groupedByAgazat).forEach((agazat) => {
        last4Years.forEach((year) => {
          if (!agazat.yearCounts[year]) {
            agazat.yearCounts[year] = {
              "Tanulói jogviszony": 0,
              "Felnőttképzési jogviszony": 0,
              Egyéb: 0,
            };
          }
        });
      });

      const chartCompatibleData = Object.values(groupedByAgazat);
      setEditableData(chartCompatibleData); // Set for table use too

      return {
        chartData: chartCompatibleData,
        years: last4Years,
      };
    }

    // Empty fallback
    return {
      chartData: [],
      years: last4Years,
    };
  }, [apiStudentData]);

  // Handle data changes
  const handleDataChange = (programType, year, field, value) => {
    setTableData((prev) => ({
      ...prev,
      [programType]: {
        ...(prev[programType] || {}),
        [year]: {
          ...(prev[programType]?.[year] || {}),
          [field]: parseFloat(value) || 0,
        },
      },
    }));
    setIsModified(true);
  };

  // Calculate totals automatically
  const calculateTotal = (programType, year) => {
    const data = tableData[programType]?.[year];
    if (!data) return 0;

    const tanuloi = data.tanuloi_jogviszony || 0;
    const felnottkepzesi = data.felnottkepzesi_jogviszony || 0;
    return tanuloi + felnottkepzesi;
  };

  const handleSaveData = async () => {
    try {
      // Convert tableData to API format and save
      for (const [programType, yearData] of Object.entries(tableData)) {
        for (const [year, fields] of Object.entries(yearData)) {
          if (fields.tanuloi_jogviszony > 0) {
            await addStudentData({
              alapadatok_id: selectedSchool?.id,
              letszam: fields.tanuloi_jogviszony,
              jogv_tipus: 0, // 0 for tanulói jogviszony
              szakirany: programType,
              tanev_kezdete: parseInt(year),
            });
          }
          if (fields.felnottkepzesi_jogviszony > 0) {
            await addStudentData({
              alapadatok_id: selectedSchool?.id,
              letszam: fields.felnottkepzesi_jogviszony,
              jogv_tipus: 1, // 1 for felnőttképzési jogviszony
              szakirany: programType,
              tanev_kezdete: parseInt(year),
            });
          }
        }
      }
      setIsModified(false);
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Error saving student data:", error);
    }
  };

  const handleResetData = () => {
    setIsModified(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    console.log("Program types:", programTypes);
    console.log("Chart data:", chartData);
    console.log("Chart years:", years);
    console.log("Editable data:", editableData);
  }, [programTypes, chartData, years, editableData]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Info Card */}
      <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            📊 Tanulólétszám
          </Typography>
          <Typography variant="body2">
            A szakképző intézményben adott tanév október 1-jén szakmai
            oktatásban (tanulói jogviszonyban és felnőttképzési jogviszonyban)
            tanulók száma.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            A trendvizsgálathoz a szakképző intézmény évente gyűjti az október
            1-jei létszámadatát azonos bontásban/kategóriában (intézménytípus,
            ágazat, szakma).
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            A második adatgyűjtési évtől kezdődően vizsgálja kategóriánként az
            időbeli változást. A változás mértékének számításánál a viszonyítás
            alapja lehet az előző tanév adata vagy az első adatgyűjtés évének
            adata. [%]
          </Typography>

          <Box
            sx={{ mt: 2, p: 2, backgroundColor: "#ffeb3b", borderRadius: 1 }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              A kék tanulók tanügyi adatai exportból szerintöm össze lehet
              számolni, ha október 1-jén feltöltjük az iskolákkal. Az ágazatok
              mindenképpen szerepelnek, az 11-ig a szakmák is. Minden iskolának
              annyit sor lesz, ahány szakma, illetve szakirány (mint ebben a
              táblázatban).
            </Typography>
          </Box>
        </CardContent>
      </Card>

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

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Tanulólétszám nézetek"
        >
          <Tab label="📊 Grafikon nézet" />
          <Tab label="📋 Táblázat nézet" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <TanuloLetszamChart data={chartData} years={years} />
        </Box>
      )}

      {activeTab === 1 && (
        <>
          <TableContainer
            component={Paper}
            sx={{ maxWidth: "100%", overflowX: "auto" }}
          >
            <Table size="small" sx={{ minWidth: 1400 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    rowSpan={3}
                    sx={{
                      fontWeight: "bold",
                      minWidth: 250,
                      borderRight: "2px solid #ddd",
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#ffffff",
                      zIndex: 3,
                      verticalAlign: "middle",
                    }}
                  >
                    Létszámváltozás az előző év adatához viszonyítva
                  </TableCell>
                  <TableCell
                    colSpan={evszamok.length * 3}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#ffcdd2",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Létszám (Október 1.)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={evszamok.length}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#ffcdd2",
                      borderRight: "1px solid #ddd",
                    }}
                  >
                    (tanulói + felnőttképzési jogviszony) (fő)
                  </TableCell>
                  <TableCell
                    colSpan={evszamok.length}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#e1f5fe",
                      borderRight: "1px solid #ddd",
                    }}
                  >
                    tanulói jogviszony (fő)
                  </TableCell>
                  <TableCell
                    colSpan={evszamok.length}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f3e5f5",
                    }}
                  >
                    felnőttképzési jogviszony (fő)
                  </TableCell>
                </TableRow>
                <TableRow>
                  {/* Összesen oszlopok */}
                  {evszamok.map((year) => (
                    <TableCell
                      key={`total-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#ffcdd240",
                        fontSize: "0.75rem",
                        borderRight:
                          year === evszamok[evszamok.length - 1]
                            ? "1px solid #ddd"
                            : "none",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                  {/* Tanulói jogviszony oszlopok */}
                  {evszamok.map((year) => (
                    <TableCell
                      key={`student-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#e1f5fe40",
                        fontSize: "0.75rem",
                        borderRight:
                          year === evszamok[evszamok.length - 1]
                            ? "1px solid #ddd"
                            : "none",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                  {/* Felnőttképzési jogviszony oszlopok */}
                  {evszamok.map((year) => (
                    <TableCell
                      key={`adult-${year}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f3e5f540",
                        fontSize: "0.75rem",
                      }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {programTypes.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    {/* Category header row */}
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: category.isTotal
                            ? "#e8f5e8"
                            : category.isInstitutionType
                            ? "#fff3e0"
                            : "#f0f8ff",
                          borderBottom: "2px solid #ddd",
                          borderRight: "2px solid #ddd",
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                        }}
                      >
                        {category.category}
                      </TableCell>
                      {/* Empty cells for years */}
                      {Array(evszamok.length * 3)
                        .fill(0)
                        .map((_, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              backgroundColor: category.isTotal
                                ? "#e8f5e8"
                                : category.isInstitutionType
                                ? "#fff3e0"
                                : "#f0f8ff",
                            }}
                          />
                        ))}
                    </TableRow>

                    {/* Sub-type rows */}
                    {category.subTypes.map((subType) => (
                      <TableRow key={subType}>
                        <TableCell
                          sx={{
                            fontWeight: "medium",
                            pl: category.isSpecialty ? 4 : 2,
                            borderRight: "1px solid #ddd",
                            position: "sticky",
                            left: 0,
                            backgroundColor: "#ffffff",
                            zIndex: 1,
                          }}
                        >
                          {subType}
                        </TableCell>

                        {/* Összesen (tanulói + felnőttképzési) */}
                        {evszamok.map((schoolYear) => {
                          const startYear = parseInt(schoolYear.split("/")[0]);
                          const total = calculateTotal(subType, startYear);
                          const hasData = total > 0;

                          return (
                            <TableCell
                              key={`total-${subType}-${startYear}`}
                              align="center"
                              sx={{
                                backgroundColor: "#ffcdd220",
                                fontWeight: "bold",
                                color: hasData
                                  ? "primary.main"
                                  : "text.disabled",
                              }}
                            >
                              {total}
                            </TableCell>
                          );
                        })}

                        {/* Tanulói jogviszony */}
                        {evszamok.map((schoolYear) => {
                          const startYear = parseInt(schoolYear.split("/")[0]);
                          const data = tableData[subType]?.[startYear];
                          return (
                            <TableCell
                              key={`student-${subType}-${startYear}`}
                              align="center"
                              sx={{ backgroundColor: "#e1f5fe20" }}
                            >
                              <TextField
                                type="number"
                                value={data?.tanuloi_jogviszony || 0}
                                onChange={(e) =>
                                  handleDataChange(
                                    subType,
                                    startYear,
                                    "tanuloi_jogviszony",
                                    e.target.value
                                  )
                                }
                                size="small"
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: "70px" }}
                              />
                            </TableCell>
                          );
                        })}

                        {/* Felnőttképzési jogviszony */}
                        {evszamok.map((schoolYear) => {
                          const startYear = parseInt(schoolYear.split("/")[0]);
                          const data = tableData[subType]?.[startYear];
                          return (
                            <TableCell
                              key={`adult-${subType}-${startYear}`}
                              align="center"
                              sx={{ backgroundColor: "#f3e5f520" }}
                            >
                              <TextField
                                type="number"
                                value={data?.felnottkepzesi_jogviszony || 0}
                                onChange={(e) =>
                                  handleDataChange(
                                    subType,
                                    startYear,
                                    "felnottkepzesi_jogviszony",
                                    e.target.value
                                  )
                                }
                                size="small"
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: "70px" }}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveData}
              disabled={!isModified || isUpdating}
            >
              {isUpdating ? "Mentés..." : "Mentés"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetData}
              disabled={!isModified || isUpdating}
            >
              Visszaállítás
            </Button>
          </Stack>
        </>
      )}

      {/* Status Messages */}
      {isModified && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Mentetlen módosítások vannak. Ne felejtsd el menteni a
          változtatásokat!
        </Alert>
      )}
    </Box>
  );
}
