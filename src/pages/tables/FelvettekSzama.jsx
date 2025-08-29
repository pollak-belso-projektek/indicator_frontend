import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Alert, TextField, Button, Stack } from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../../utils/schoolYears";
import { selectSelectedSchool } from "../../store/slices/authSlice";
import {
  useGetFelvettekSzamaByAlapadatokIdAndYearQuery,
  useAddFelvettekSzamaMutation,
  useUpdateFelvettekSzamaMutation,
  useGetAllAlapadatokQuery,
} from "../../store/api/apiSlice";
import FelvettekSzamaInfo from "../../components/infos/FelvettekSzamaInfo";
import {
  TableLoadingOverlay,
  NotificationSnackbar,
} from "../../components/shared";

const evszamok = generateSchoolYears();

const FelvettekSzama = () => {
  const selectedSchool = useSelector(selectSelectedSchool);

  // API hooks
  const { data: apiAdmissionData, isLoading: isFetching } =
    useGetFelvettekSzamaByAlapadatokIdAndYearQuery({
      alapadatokId: selectedSchool?.id,
      year: 2024,
    });

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [addAdmissionData, { isLoading: isAdding }] =
    useAddFelvettekSzamaMutation();
  const [updateAdmissionData, { isLoading: isUpdating }] =
    useUpdateFelvettekSzamaMutation();

  // State for the integrated table data
  const [tableData, setTableData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Track which specific cells have been modified by the user
  const [modifiedCells, setModifiedCells] = useState({});

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
            // Add szakirány as category
            categories.push({
              category: "Szakirány",
              subTypes: [szakirany.nev],
            });

            // Add szakmák under this szakirány
            if (szakirany.szakma && Array.isArray(szakirany.szakma)) {
              const szakmaNevek = szakirany.szakma
                .map((szakmaData) => szakmaData.szakma?.nev)
                .filter(Boolean);
              if (szakmaNevek.length > 0) {
                categories.push({
                  category: `${szakirany.nev} szakmái`,
                  subTypes: szakmaNevek,
                });
              }
            }
          }
        });
      }
    });

    return categories;
  }, [schoolsData, selectedSchool]);

  // Handle data changes
  const handleDataChange = (programType, year, field, value) => {
    const newValue = parseFloat(value) || 0;
    
    setTableData((prev) => {
      const prevData = prev[programType]?.[year]?.[field] || 0;
      
      // Only update if the value actually changed
      if (prevData === newValue) {
        return prev;
      }
      
      return {
        ...prev,
        [programType]: {
          ...(prev[programType] || {}),
          [year]: {
            ...(prev[programType]?.[year] || {}),
            [field]: newValue,
          },
        },
      };
    });

    // Track this specific cell as modified
    const cellKey = `${programType}-${year}-${field}`;
    setModifiedCells((prev) => ({
      ...prev,
      [cellKey]: true,
    }));

    setIsModified(true);
  };

  // Check if a program type is a summary row (read-only)
  const isSummaryRow = (programType) => {
    // Find the category this programType belongs to
    const category = programTypes.find((cat) =>
      cat.subTypes.includes(programType)
    );

    if (!category) return false;

    // Summary rows are "Összesen" and "Szakirány" categories
    return (
      category.category === "Összesen" || category.category === "Szakirány"
    );
  };

  // Calculate summary values for institution types (Összesen category)
  const calculateInstitutionSummary = (institutionType, year, field) => {
    if (!schoolsData) return 0;

    // Find all szakmák that belong to this institution type (collect unique szakma names)
    const szakmaNevek = new Set();

    schoolsData
      .filter((school) => school.intezmeny_tipus === institutionType)
      .forEach((school) => {
        if (
          school.alapadatok_szakirany &&
          Array.isArray(school.alapadatok_szakirany)
        ) {
          school.alapadatok_szakirany.forEach((szakiranyData) => {
            const szakirany = szakiranyData.szakirany;
            if (
              szakirany &&
              szakirany.szakma &&
              Array.isArray(szakirany.szakma)
            ) {
              szakirany.szakma.forEach((szakmaData) => {
                const szakmaNev = szakmaData.szakma?.nev;
                if (szakmaNev) {
                  szakmaNevek.add(szakmaNev);
                }
              });
            }
          });
        }
      });

    // Now sum up values from tableData for each unique szakma (only once per szakma)
    let totalValue = 0;
    szakmaNevek.forEach((szakmaNev) => {
      const currentValue = tableData[szakmaNev]?.[year]?.[field] || 0;
      totalValue += currentValue;
    });

    return totalValue;
  };

  // Calculate summary values for szakirány categories
  const calculateSzakiranySummary = (szakiranyNev, year, field) => {
    if (!schoolsData) return 0;

    // Find all szakmák that belong to this szakirány (collect unique szakma names)
    const szakmaNevek = new Set();
    
    schoolsData.forEach((school) => {
      if (
        school.alapadatok_szakirany &&
        Array.isArray(school.alapadatok_szakirany)
      ) {
        school.alapadatok_szakirany.forEach((szakiranyData) => {
          const szakirany = szakiranyData.szakirany;
          if (szakirany && szakirany.nev === szakiranyNev) {
            if (szakirany.szakma && Array.isArray(szakirany.szakma)) {
              szakirany.szakma.forEach((szakmaData) => {
                const szakmaNev = szakmaData.szakma?.nev;
                if (szakmaNev) {
                  szakmaNevek.add(szakmaNev);
                }
              });
            }
          }
        });
      }
    });

    // Now sum up values from tableData for each unique szakma (only once per szakma)
    let totalValue = 0;
    szakmaNevek.forEach((szakmaNev) => {
      const currentValue = tableData[szakmaNev]?.[year]?.[field] || 0;
      totalValue += currentValue;
    });

    return totalValue;
  };

  // Get calculated value for summary rows
  const getCalculatedValue = (programType, year, field) => {
    const category = programTypes.find((cat) =>
      cat.subTypes.includes(programType)
    );

    if (!category) return 0;

    if (category.category === "Összesen") {
      return calculateInstitutionSummary(programType, year, field);
    } else if (category.category === "Szakirány") {
      return calculateSzakiranySummary(programType, year, field);
    }

    return 0;
  };

  // Calculate percentage automatically (jelentkezők/felvettek arány)
  const calculatePercentage = (programType, year) => {
    let jelentkezokSzama, felvettekSzama;

    if (isSummaryRow(programType)) {
      // For summary rows, calculate from aggregated data
      jelentkezokSzama = getCalculatedValue(
        programType,
        year,
        "jelentkezok_szama_9"
      );
      felvettekSzama = getCalculatedValue(
        programType,
        year,
        "felvettek_szama_9"
      );
    } else {
      // For regular rows, use table data
      const programData = tableData[programType];
      if (!programData) return "0%";

      const data = programData[year];
      if (!data) return "0%";

      jelentkezokSzama = data.jelentkezok_szama_9 || 0;
      felvettekSzama = data.felvettek_szama_9 || 0;
    }

    // If no applicants, return 0%
    if (!jelentkezokSzama || jelentkezokSzama === 0) return "0%";
    
    // If no admitted students, return "∞" or a special indicator
    if (!felvettekSzama || felvettekSzama === 0) return "N/A";

    const ratio = jelentkezokSzama / felvettekSzama;
    const percentage = ratio * 100;

    // Handle special cases for display
    if (percentage === 0) return "0%";
    if (percentage < 100) return percentage.toFixed(1) + "%"; // Less than 100%
    if (percentage === 100) return "100%";

    return Math.round(percentage * 10) / 10 + "%"; // Round to 1 decimal place and add %
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      let savedCount = 0;
      let updatedCount = 0;

      // Recreate relevantSchools for institution type lookup
      let relevantSchools = schoolsData;
      if (selectedSchool) {
        relevantSchools = schoolsData.filter(
          (school) => school.id === selectedSchool.id
        );
      }

      // Convert tableData to API format and save/update
      for (const [programType, yearData] of Object.entries(tableData)) {
        for (const [year, fields] of Object.entries(yearData)) {
          // Only save if there's actual data
          if (
            fields.jelentkezok_szama_9 > 0 ||
            fields.felvettek_szama_9 > 0 ||
            fields.felvettek_letszam_9 > 0
          ) {
            // Determine szakmaNev and szakiranyNev from programType
            let szakmaNev = "";
            let szakiranyNev = "";

            // Find the program type in our categories to get proper names
            const category = programTypes.find((cat) =>
              cat.subTypes.includes(programType)
            );

            if (category) {
              if (category.category === "Szakirány") {
                szakiranyNev = programType;
                // For szakirány level, we need a default szakma or skip
                console.warn(
                  `Skipping szakirány level record: ${programType} - no szakma specified`
                );
                continue; // Skip this iteration as backend requires both szakma and szakirany
              } else if (category.category.includes("szakmái")) {
                // Extract szakirány name from category
                szakiranyNev = category.category.replace(" szakmái", "");
                szakmaNev = programType;
              } else if (category.category === "Összesen") {
                // For institution types like "Technikum", we need to find actual szakma/szakirany pairs
                // Let's find all szakma-szakirany combinations for this institution type
                const institutionSchools = relevantSchools.filter(
                  (school) => school.intezmeny_tipus === programType
                );

                if (institutionSchools.length > 0) {
                  // For now, let's use the first available szakma-szakirany pair
                  // You might want to create separate records for each pair later
                  const firstSchool = institutionSchools[0];
                  if (
                    firstSchool.alapadatok_szakirany &&
                    Array.isArray(firstSchool.alapadatok_szakirany) &&
                    firstSchool.alapadatok_szakirany.length > 0
                  ) {
                    const firstSzakirany =
                      firstSchool.alapadatok_szakirany[0].szakirany;
                    if (firstSzakirany) {
                      szakiranyNev = firstSzakirany.nev;

                      // Try to get the first szakma from this szakirany
                      if (
                        firstSzakirany.szakma &&
                        Array.isArray(firstSzakirany.szakma) &&
                        firstSzakirany.szakma.length > 0
                      ) {
                        const firstSzakma = firstSzakirany.szakma[0].szakma;
                        if (firstSzakma) {
                          szakmaNev = firstSzakma.nev;
                        }
                      }
                    }
                  }
                }

                if (!szakmaNev || !szakiranyNev) {
                  console.warn(
                    `Institution type record: ${programType} - could not find valid szakma/szakirany pair`
                  );
                  continue;
                } else {
                  console.log(
                    `Institution type record: ${programType} - using szakma: ${szakmaNev}, szakirany: ${szakiranyNev}`
                  );
                }
              }
            }

            // Skip if we don't have both szakma and szakirany names
            if (!szakmaNev || !szakiranyNev) {
              console.warn(
                `Skipping record - missing szakma (${szakmaNev}) or szakirany (${szakiranyNev})`
              );
              continue;
            }

            // Check if a record already exists for this combination
            const existingRecord = apiAdmissionData?.find(
              (record) =>
                record.szakma?.nev === szakmaNev &&
                record.szakirany?.nev === szakiranyNev &&
                record.tanev_kezdete === parseInt(year)
            );

            const recordData = {
              alapadatok_id: selectedSchool?.id,
              tanev_kezdete: parseInt(year),
              szakmaNev: szakmaNev,
              szakiranyNev: szakiranyNev,
              jelentkezo_letszam: fields.jelentkezok_szama_9 || 0,
              felveheto_letszam: fields.felvettek_letszam_9 || 0,
              felvett_letszam: fields.felvettek_szama_9 || 0,
            };

            try {
              if (existingRecord) {
                // Update existing record
                await updateAdmissionData({
                  id: existingRecord.id,
                  ...recordData,
                }).unwrap();
                updatedCount++;
                console.log(
                  `Updated record for ${szakmaNev} - ${szakiranyNev} - ${year}`
                );
              } else {
                // Create new record
                await addAdmissionData(recordData).unwrap();
                savedCount++;
                console.log(
                  `Created new record for ${szakmaNev} - ${szakiranyNev} - ${year}`
                );
              }
            } catch (recordError) {
              console.error(
                `Error saving record for ${szakmaNev} - ${szakiranyNev} - ${year}:`,
                recordError
              );
              throw recordError; // Re-throw to be caught by outer catch
            }
          }
        }
      }

      setIsModified(false);
      setModifiedCells({}); // Clear modified cells tracking after successful save
      setSaveSuccess(true);
      console.log(
        `Successfully saved ${savedCount} new records and updated ${updatedCount} existing records`
      );

      // Show success snackbar
      setSnackbarMessage(
        `Sikeresen mentve: ${savedCount} új rekord és ${updatedCount} frissített rekord`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving admission data:", error);
      const errorMessage =
        error.data?.message || error.message || "Hiba történt a mentés során";
      setSaveError(errorMessage);

      // Show error snackbar
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsModified(false);
    // Clear the modified cells tracking when resetting
    setModifiedCells({});
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    console.log(programTypes);
  }, [programTypes]);

  // Force re-render when tableData changes to update calculated summaries
  useEffect(() => {
    // This effect ensures that summary rows are recalculated when tableData changes
    // The component will re-render automatically due to state change
  }, [tableData]);

  // Load existing API data into tableData when component mounts or data changes
  useEffect(() => {
    if (
      apiAdmissionData &&
      Array.isArray(apiAdmissionData) &&
      apiAdmissionData.length > 0
    ) {
      console.log("Loading existing admission data:", apiAdmissionData);

      const newTableData = {};

      apiAdmissionData.forEach((record) => {
        const {
          tanev_kezdete,
          jelentkezo_letszam,
          felveheto_letszam,
          felvett_letszam,
          szakma,
          szakirany,
        } = record;

        if (szakma && szakirany) {
          // Use szakma name as the key for the table data
          const programKey = szakma.nev;

          if (!newTableData[programKey]) {
            newTableData[programKey] = {};
          }

          if (!newTableData[programKey][tanev_kezdete]) {
            newTableData[programKey][tanev_kezdete] = {};
          }

          // Map the API field names to our internal field names
          newTableData[programKey][tanev_kezdete] = {
            jelentkezok_szama_9: jelentkezo_letszam || 0,
            felvettek_letszam_9: felveheto_letszam || 0,
            felvettek_szama_9: felvett_letszam || 0,
          };
        }
      });

      console.log("Transformed table data:", newTableData);
      setTableData(newTableData);
    }
  }, [apiAdmissionData]);

  return (
    <Box sx={{ p: 3 }}>
      <FelvettekSzamaInfo />
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
      {isModified && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          Mentetlen módosítások vannak. Ne felejtsd el menteni a
          változtatásokat!
        </Alert>
      )}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isModified || isUpdating || isAdding || isSaving}
        >
          {isUpdating || isAdding || isSaving ? "Mentés..." : "Mentés"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={!isModified || isUpdating || isAdding || isSaving}
        >
          Visszaállítás
        </Button>
      </Stack>
      <TableContainer
        component={Paper}
        sx={{ maxWidth: "100%", overflowX: "auto", position: "relative" }}
      >
        {/* Loading Overlay */}
        <TableLoadingOverlay
          isLoading={isSaving}
          message="Adatok mentése folyamatban, kérjük várjon..."
        />

        <Table size="small" sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell
                rowSpan={2}
                sx={{
                  fontWeight: "bold",
                  minWidth: 200,
                  borderRight: "2px solid #ddd",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#ffffff",
                  zIndex: 3,
                }}
              >
                Intézménytípus/szakma
              </TableCell>
              <TableCell
                colSpan={evszamok.length}
                align="center"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e3f2fd",
                  borderRight: "1px solid #ddd",
                }}
              >
                Jelentkezések és felvettek aránya
              </TableCell>
              <TableCell
                colSpan={evszamok.length}
                align="center"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#f3e5f5",
                  borderRight: "1px solid #ddd",
                }}
              >
                9. évfolyamra jelentkezők száma
              </TableCell>
              <TableCell
                colSpan={evszamok.length}
                align="center"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e8f5e8",
                  borderRight: "1px solid #ddd",
                }}
              >
                9. évfolyamra felvettek száma
              </TableCell>
              <TableCell
                colSpan={evszamok.length}
                align="center"
                sx={{ fontWeight: "bold", backgroundColor: "#fff3e0" }}
              >
                9. évfolyamra felvehető létszám (fő)
              </TableCell>
            </TableRow>
            <TableRow>
              {/* Jelentkezések és felvettek aránya */}
              {evszamok.map((year) => (
                <TableCell
                  key={`jelentkezesek-${year}`}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd40",
                    fontSize: "0.75rem",
                  }}
                >
                  {year}
                </TableCell>
              ))}
              {/* 9. évfolyamra jelentkezők száma */}
              {evszamok.map((year) => (
                <TableCell
                  key={`jelentkezok-${year}`}
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
              {/* 9. évfolyamra felvettek száma */}
              {evszamok.map((year) => (
                <TableCell
                  key={`felvettek-${year}`}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#e8f5e840",
                    fontSize: "0.75rem",
                  }}
                >
                  {year}
                </TableCell>
              ))}
              {/* 9. évfolyamra felvettek létszáma */}
              {evszamok.map((year) => (
                <TableCell
                  key={`letszam-${year}`}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#fff3e040",
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
                      backgroundColor: "#f5f5f5",
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
                  {Array(evszamok.length * 4)
                    .fill(0)
                    .map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ backgroundColor: "#f5f5f5" }}
                      />
                    ))}
                </TableRow>

                {/* Sub-type rows */}
                {category.subTypes.map((subType) => (
                  <TableRow key={subType}>
                    <TableCell
                      sx={{
                        fontWeight: "medium",
                        pl: category.category.includes("szakmái") ? 4 : 2,
                        borderRight: "1px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 1,
                      }}
                    >
                      {subType}
                    </TableCell>

                    {/* Jelentkezések és felvettek aránya - calculated automatically */}
                    {evszamok.map((schoolYear) => {
                      const startYear = parseInt(schoolYear.split("/")[0]);
                      const percentage = calculatePercentage(
                        subType,
                        startYear
                      );
                      const isReadOnly = isSummaryRow(subType);

                      let hasData, displayValue;

                      if (isReadOnly) {
                        // For summary rows, check if calculated values have data
                        const jelentkezok = getCalculatedValue(
                          subType,
                          startYear,
                          "jelentkezok_szama_9"
                        );
                        const felvettek = getCalculatedValue(
                          subType,
                          startYear,
                          "felvettek_szama_9"
                        );
                        hasData = jelentkezok > 0 || felvettek > 0;
                        displayValue = hasData ? percentage : "0%";
                      } else {
                        // For regular rows, check tableData
                        const data = tableData[subType]?.[startYear];
                        hasData =
                          data &&
                          (data.jelentkezok_szama_9 > 0 ||
                            data.felvettek_szama_9 > 0);
                        displayValue = hasData ? percentage : "0";
                      }

                      return (
                        <TableCell
                          key={`jelentkezesek-${subType}-${startYear}`}
                          align="center"
                          sx={{
                            backgroundColor: isReadOnly
                              ? "#f5f5f5"
                              : "#e3f2fd20",
                            fontWeight: "bold",
                            color: hasData ? "primary.main" : "text.disabled",
                          }}
                        >
                          {displayValue}
                        </TableCell>
                      );
                    })}

                    {/* 9. évfolyamra jelentkezők száma */}
                    {evszamok.map((schoolYear) => {
                      const startYear = parseInt(schoolYear.split("/")[0]);
                      const data = tableData[subType]?.[startYear];
                      const isReadOnly = isSummaryRow(subType);
                      const displayValue = isReadOnly
                        ? getCalculatedValue(
                            subType,
                            startYear,
                            "jelentkezok_szama_9"
                          )
                        : data?.jelentkezok_szama_9 || 0;

                      // Check if this specific cell has been modified by the user
                      const cellKey = `${subType}-${startYear}-jelentkezok_szama_9`;
                      const isModified = !isReadOnly && modifiedCells[cellKey];

                      return (
                        <TableCell
                          key={`jelentkezok-${subType}-${startYear}`}
                          align="center"
                          sx={{ backgroundColor: "#f3e5f520" }}
                        >
                          <TextField
                            type="number"
                            value={displayValue}
                            onChange={(e) => {
                              if (!isReadOnly) {
                                handleDataChange(
                                  subType,
                                  startYear,
                                  "jelentkezok_szama_9",
                                  e.target.value
                                );
                              }
                            }}
                            disabled={isReadOnly}
                            size="small"
                            inputProps={{
                              min: 0,
                              style: { textAlign: "center" },
                            }}
                            sx={{
                              width: "70px",
                              backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                              "& .MuiInputBase-input": {
                                fontWeight: isReadOnly ? "bold" : "normal",
                                color: isReadOnly ? "#666" : "inherit",
                              },
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                  borderWidth: isModified ? "2px" : "1px",
                                },
                                "&:hover fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                },
                              },
                            }}
                          />
                        </TableCell>
                      );
                    })}

                    {/* 9. évfolyamra felvettek száma */}
                    {evszamok.map((schoolYear) => {
                      const startYear = parseInt(schoolYear.split("/")[0]);
                      const data = tableData[subType]?.[startYear];
                      const isReadOnly = isSummaryRow(subType);
                      const displayValue = isReadOnly
                        ? getCalculatedValue(
                            subType,
                            startYear,
                            "felvettek_szama_9"
                          )
                        : data?.felvettek_szama_9 || 0;

                      // Check if this specific cell has been modified by the user
                      const cellKey = `${subType}-${startYear}-felvettek_szama_9`;
                      const isModified = !isReadOnly && modifiedCells[cellKey];

                      return (
                        <TableCell
                          key={`felvettek-${subType}-${startYear}`}
                          align="center"
                          sx={{ backgroundColor: "#e8f5e820" }}
                        >
                          <TextField
                            type="number"
                            value={displayValue}
                            onChange={(e) => {
                              if (!isReadOnly) {
                                handleDataChange(
                                  subType,
                                  startYear,
                                  "felvettek_szama_9",
                                  e.target.value
                                );
                              }
                            }}
                            disabled={isReadOnly}
                            size="small"
                            inputProps={{
                              min: 0,
                              style: { textAlign: "center" },
                            }}
                            sx={{
                              width: "70px",
                              backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                              "& .MuiInputBase-input": {
                                fontWeight: isReadOnly ? "bold" : "normal",
                                color: isReadOnly ? "#666" : "inherit",
                              },
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                  borderWidth: isModified ? "2px" : "1px",
                                },
                                "&:hover fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                },
                              },
                            }}
                          />
                        </TableCell>
                      );
                    })}

                    {/* 9. évfolyamra felvehető létszám */}
                    {evszamok.map((schoolYear) => {
                      const startYear = parseInt(schoolYear.split("/")[0]);
                      const data = tableData[subType]?.[startYear];
                      const isReadOnly = isSummaryRow(subType);
                      const displayValue = isReadOnly
                        ? getCalculatedValue(
                            subType,
                            startYear,
                            "felvettek_letszam_9"
                          )
                        : data?.felvettek_letszam_9 || 0;

                      // Check if this specific cell has been modified by the user
                      const cellKey = `${subType}-${startYear}-felvettek_letszam_9`;
                      const isModified = !isReadOnly && modifiedCells[cellKey];

                      return (
                        <TableCell
                          key={`letszam-${subType}-${startYear}`}
                          align="center"
                          sx={{ backgroundColor: "#fff3e020" }}
                        >
                          <TextField
                            type="number"
                            value={displayValue}
                            onChange={(e) => {
                              if (!isReadOnly) {
                                handleDataChange(
                                  subType,
                                  startYear,
                                  "felvettek_letszam_9",
                                  e.target.value
                                );
                              }
                            }}
                            disabled={isReadOnly}
                            size="small"
                            inputProps={{
                              min: 0,
                              style: { textAlign: "center" },
                            }}
                            sx={{
                              width: "70px",
                              backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                              "& .MuiInputBase-input": {
                                fontWeight: isReadOnly ? "bold" : "normal",
                                color: isReadOnly ? "#666" : "inherit",
                              },
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                  borderWidth: isModified ? "2px" : "1px",
                                },
                                "&:hover fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: isModified
                                    ? "#ff9800"
                                    : undefined,
                                },
                              },
                            }}
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

      {/* Status Messages */}

      {/* Snackbar for save notifications */}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
};

export default FelvettekSzama;
