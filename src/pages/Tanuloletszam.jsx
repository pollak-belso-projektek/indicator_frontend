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
  CircularProgress,
  Backdrop,
  Snackbar,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { selectSelectedSchool } from "../store/slices/authSlice";
import {
  useGetTanuloLetszamQuery,
  useAddTanuloLetszamMutation,
  useUpdateTanuloLetszamMutation,
  useGetTanugyiAdatokQuery,
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
    error: _fetchError,
    isLoading: _isFetching,
  } = useGetTanuloLetszamQuery(
    { alapadatok_id: selectedSchool?.id },
    { skip: !selectedSchool?.id }
  );

  const { data: schoolsData, isLoading: _isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const { data: tanugyiData } = useGetTanugyiAdatokQuery({
    alapadatok_id: selectedSchool?.id,
    ev: 2024,
  });

  const [addStudentData, { isLoading: isUpdating }] =
    useAddTanuloLetszamMutation();

  const [updateTanuloLetszam, { isLoading: _isUpdatingRecord }] =
    useUpdateTanuloLetszamMutation();

  // State for the integrated table data
  const [tableData, setTableData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editableData, setEditableData] = useState([]);
  const [savedData, setSavedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [dataSource, setDataSource] = useState(null);

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

    // Add "Összesen" category that will calculate totals from all entries
    const institutionTypes = [
      ...new Set(relevantSchools.map((school) => school.intezmeny_tipus)),
    ];
    if (institutionTypes.length > 0) {
      categories.push({
        category: "Összesen",
        subTypes: ["Összesen"], // Single row that calculates everything
        isTotal: true,
      });

      // Add individual institution types as separate categories
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
            // Add szakirány category first
            const szakiranyName = szakirany.nev;
            if (szakiranyName) {
              const existingSzakiranyCategory = categories.find(
                (cat) =>
                  cat.category === `Szakirányonként` &&
                  cat.szakiranyName === szakiranyName
              );

              if (!existingSzakiranyCategory) {
                // Get szakmák under this szakirány
                let szakmaNevek = [];
                if (szakirany.szakma && Array.isArray(szakirany.szakma)) {
                  szakmaNevek = szakirany.szakma
                    .map((szakmaData) => szakmaData.szakma?.nev)
                    .filter(Boolean);
                }

                // Add szakirány category with its szakmák
                const subTypes =
                  szakmaNevek.length > 0
                    ? [...szakmaNevek, `Nincs meghatározva (${szakiranyName})`]
                    : [`Nincs meghatározva (${szakiranyName})`];

                if (subTypes.length > 0) {
                  categories.push({
                    category: `Szakirányonként`,
                    subcategory: `ebből: ${szakiranyName}`,
                    subTypes: subTypes,
                    szakiranyName: szakiranyName,
                    isSzakirany: true,
                  });
                }
              }
            }
          }
        });
      }
    });

    return categories;
  }, [schoolsData, selectedSchool]);

  // Process tableData into chart-compatible format
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

    // Convert tableData to chart format
    if (tableData && Object.keys(tableData).length > 0) {
      const chartCompatibleData = [];

      // Group data by programType (szakma or "Nincs meghatározva" entries)
      Object.keys(tableData).forEach((programType) => {
        const yearCounts = {};

        // Process each year for this programType
        last4Years.forEach((year) => {
          const data = tableData[programType]?.[year];
          yearCounts[year] = {
            "Tanulói jogviszony": data?.tanuloi_jogviszony || 0,
            "Felnőttképzési jogviszony": data?.felnottkepzesi_jogviszony || 0,
            Összesen:
              (data?.tanuloi_jogviszony || 0) +
              (data?.felnottkepzesi_jogviszony || 0),
          };
        });

        chartCompatibleData.push({
          name: programType,
          yearCounts: yearCounts,
        });
      });

      setEditableData(chartCompatibleData);

      return {
        chartData: chartCompatibleData,
        years: last4Years,
      };
    } else if (apiStudentData && Array.isArray(apiStudentData)) {
      // Fallback to original logic if tableData is not available
      const groupedByAgazat = {};

      apiStudentData.forEach((item) => {
        // Use the same logic as initialization for consistency
        let programType;
        if (item.szakma?.nev) {
          programType = item.szakma.nev;
        } else if (item.szakirany?.nev) {
          programType = `Nincs meghatározva (${item.szakirany.nev})`;
        } else {
          programType = "Unknown";
        }

        const year = item.tanev_kezdete;
        const jogviszonyType =
          item.jogv_tipus === 0
            ? "Tanulói jogviszony"
            : "Felnőttképzési jogviszony";

        if (!groupedByAgazat[programType]) {
          groupedByAgazat[programType] = {
            name: programType,
            yearCounts: {},
          };
        }

        if (!groupedByAgazat[programType].yearCounts[year]) {
          groupedByAgazat[programType].yearCounts[year] = {
            "Tanulói jogviszony": 0,
            "Felnőttképzési jogviszony": 0,
            Összesen: 0,
          };
        }

        // Add to the count instead of overwriting
        groupedByAgazat[programType].yearCounts[year][jogviszonyType] +=
          item.letszam || 0;
        groupedByAgazat[programType].yearCounts[year]["Összesen"] =
          groupedByAgazat[programType].yearCounts[year]["Tanulói jogviszony"] +
          groupedByAgazat[programType].yearCounts[year][
            "Felnőttképzési jogviszony"
          ];
      });

      // Ensure all program types have entries for all 4 years
      Object.values(groupedByAgazat).forEach((programData) => {
        last4Years.forEach((year) => {
          if (!programData.yearCounts[year]) {
            programData.yearCounts[year] = {
              "Tanulói jogviszony": 0,
              "Felnőttképzési jogviszony": 0,
              Összesen: 0,
            };
          }
        });
      });

      const chartCompatibleData = Object.values(groupedByAgazat);
      setEditableData(chartCompatibleData);

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
  }, [tableData, apiStudentData]);

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

  // Calculate institution type totals by summing all szakirány entries for that institution type
  const calculateInstitutionTypeTotal = (institutionType, year, field) => {
    if (!schoolsData || !Array.isArray(schoolsData)) return 0;

    let total = 0;
    const targetInstType = institutionType.replace("ebből: ", "");

    // Find all szakirány categories that belong to this institution type
    const relevantSchools = selectedSchool
      ? schoolsData.filter(
          (school) =>
            school.id === selectedSchool.id &&
            school.intezmeny_tipus === targetInstType
        )
      : schoolsData.filter(
          (school) => school.intezmeny_tipus === targetInstType
        );

    // Get all szakirány names that belong to this institution type
    const szakiranyNamesInInstType = new Set();
    relevantSchools.forEach((school) => {
      if (
        school.alapadatok_szakirany &&
        Array.isArray(school.alapadatok_szakirany)
      ) {
        school.alapadatok_szakirany.forEach((szakiranyData) => {
          const szakiranyName = szakiranyData.szakirany?.nev;
          if (szakiranyName) {
            szakiranyNamesInInstType.add(szakiranyName);
          }
        });
      }
    });

    // Sum up all szakirány totals and individual szakma entries for this institution type
    programTypes.forEach((category) => {
      if (
        category.isSzakirany &&
        szakiranyNamesInInstType.has(category.szakiranyName)
      ) {
        // This szakirány belongs to our target institution type
        category.subTypes.forEach((subType) => {
          if (field === "total") {
            total += calculateTotal(subType, year);
          } else {
            total += tableData[subType]?.[year]?.[field] || 0;
          }
        });
      }
    });

    return total;
  };

  // Calculate grand total of everything in the table for "Összesen" row
  const calculateGrandTotal = (year, field) => {
    let total = 0;

    // Sum up all szakirány categories
    programTypes.forEach((category) => {
      if (category.isSzakirany) {
        // This is a szakirány category, sum all its subTypes
        category.subTypes.forEach((subType) => {
          if (field === "total") {
            total += calculateTotal(subType, year);
          } else {
            total += tableData[subType]?.[year]?.[field] || 0;
          }
        });
      }
    });

    return total;
  };

  const handleSaveData = async () => {
    try {
      setIsSaving(true);
      let savedCount = 0;
      let updatedCount = 0;

      console.log("🔍 DEBUG: Starting save process");
      console.log("🔍 DEBUG: apiStudentData available:", apiStudentData);

      // Convert tableData to API format and save/update
      for (const [programType, yearData] of Object.entries(tableData)) {
        for (const [year, fields] of Object.entries(yearData)) {
          // Handle tanulói jogviszony
          if (fields.tanuloi_jogviszony > 0) {
            // Determine szakirany and szakma from programType
            let szakiranyName = null;
            let szakmaNev = null;

            // Handle "Nincs meghatározva" case - save as null in database
            if (programType.startsWith("Nincs meghatározva")) {
              szakmaNev = null;
              // Extract szakirány name from the programType if it's in format "Nincs meghatározva (szakirányName)"
              const match = programType.match(/Nincs meghatározva \((.+)\)$/);
              if (match) {
                szakiranyName = match[1];
              } else {
                szakiranyName = "Nincs meghatározva";
              }
            } else {
              // Regular szakma name
              szakmaNev = programType;

              // Try to find the szakirany this szakma belongs to
              const foundCategory = programTypes.find(
                (cat) => cat.isSzakirany && cat.subTypes.includes(programType)
              );
              if (foundCategory) {
                szakiranyName = foundCategory.szakiranyName;
              } else {
                // Fallback: use the programType as szakirany
                szakiranyName = programType;
              }
            }

            // Check if a record already exists for this combination
            const existingRecord = apiStudentData?.find((record) => {
              const recordSzakiranyNev = record.szakirany?.nev;
              const recordSzakmaNev = record.szakma?.nev;

              // Handle null matching for "Nincs meghatározva" cases
              let szakmaMatch;
              if (
                szakmaNev === null ||
                programType.startsWith("Nincs meghatározva")
              ) {
                // Looking for null/undefined records
                szakmaMatch =
                  !recordSzakmaNev ||
                  recordSzakmaNev === null ||
                  recordSzakmaNev === undefined;
              } else {
                // Looking for exact match
                szakmaMatch = recordSzakmaNev === szakmaNev;
              }

              const szakiranyMatch = recordSzakiranyNev === szakiranyName;
              const yearMatch = record.tanev_kezdete === parseInt(year);
              const jogvMatch = record.jogv_tipus === 0; // tanulói jogviszony

              console.log(`🔍 Checking existing record for update (tanulói):`, {
                programType,
                szakiranyName,
                szakmaNev,
                recordSzakiranyNev,
                recordSzakmaNev,
                szakmaMatch,
                szakiranyMatch,
                yearMatch,
                jogvMatch,
                recordId: record.id,
              });

              return szakmaMatch && szakiranyMatch && yearMatch && jogvMatch;
            });

            const recordData = {
              alapadatok_id: selectedSchool?.id,
              letszam: fields.tanuloi_jogviszony,
              jogv_tipus: 0, // 0 for tanulói jogviszony
              szakirany: szakiranyName,
              szakma: szakmaNev, // null for "Nincs meghatározva"
              tanev_kezdete: parseInt(year),
            };

            console.log(
              `🔍 DEBUG: Record data for tanulói jogviszony:`,
              recordData
            );

            try {
              if (existingRecord) {
                // Update existing record
                await updateTanuloLetszam({
                  id: existingRecord.id,
                  ...recordData,
                }).unwrap();
                updatedCount++;
                console.log(
                  `Updated student record for ${programType} - tanulói jogviszony - ${year}`
                );
              } else {
                // Create new record
                await addStudentData(recordData).unwrap();
                savedCount++;
                console.log(
                  `Created new student record for ${programType} - tanulói jogviszony - ${year}`
                );
              }
            } catch (recordError) {
              console.error(
                `Error saving student record for ${programType} - tanulói jogviszony - ${year}:`,
                recordError
              );
              throw recordError;
            }
          }

          // Handle felnőttképzési jogviszony
          if (fields.felnottkepzesi_jogviszony > 0) {
            // Determine szakirany and szakma from programType
            let szakiranyName = null;
            let szakmaNev = null;

            // Handle "Nincs meghatározva" case - save as null in database
            if (programType.startsWith("Nincs meghatározva")) {
              szakmaNev = null;
              // Extract szakirány name from the programType if it's in format "Nincs meghatározva (szakirányName)"
              const match = programType.match(/Nincs meghatározva \((.+)\)$/);
              if (match) {
                szakiranyName = match[1];
              } else {
                szakiranyName = "Nincs meghatározva";
              }
            } else {
              // Regular szakma name
              szakmaNev = programType;

              // Try to find the szakirany this szakma belongs to
              const foundCategory = programTypes.find(
                (cat) => cat.isSzakirany && cat.subTypes.includes(programType)
              );
              if (foundCategory) {
                szakiranyName = foundCategory.szakiranyName;
              } else {
                // Fallback: use the programType as szakirany
                szakiranyName = programType;
              }
            }

            // Check if a record already exists for this combination
            const existingRecord = apiStudentData?.find((record) => {
              const recordSzakiranyNev = record.szakirany?.nev;
              const recordSzakmaNev = record.szakma?.nev;

              // Handle null matching for "Nincs meghatározva" cases
              let szakmaMatch;
              if (
                szakmaNev === null ||
                programType.startsWith("Nincs meghatározva")
              ) {
                // Looking for null/undefined records
                szakmaMatch =
                  !recordSzakmaNev ||
                  recordSzakmaNev === null ||
                  recordSzakmaNev === undefined;
              } else {
                // Looking for exact match
                szakmaMatch = recordSzakmaNev === szakmaNev;
              }

              const szakiranyMatch = recordSzakiranyNev === szakiranyName;
              const yearMatch = record.tanev_kezdete === parseInt(year);
              const jogvMatch = record.jogv_tipus === 1; // felnőttképzési jogviszony

              console.log(
                `🔍 Checking existing record for update (felnőttképzési):`,
                {
                  programType,
                  szakiranyName,
                  szakmaNev,
                  recordSzakiranyNev,
                  recordSzakmaNev,
                  szakmaMatch,
                  szakiranyMatch,
                  yearMatch,
                  jogvMatch,
                  recordId: record.id,
                }
              );

              return szakmaMatch && szakiranyMatch && yearMatch && jogvMatch;
            });

            const recordData = {
              alapadatok_id: selectedSchool?.id,
              letszam: fields.felnottkepzesi_jogviszony,
              jogv_tipus: 1, // 1 for felnőttképzési jogviszony
              szakirany: szakiranyName,
              szakma: szakmaNev, // null for "Nincs meghatározva"
              tanev_kezdete: parseInt(year),
            };

            console.log(
              `🔍 DEBUG: Record data for felnőttképzési jogviszony:`,
              recordData
            );

            try {
              if (existingRecord) {
                // Update existing record
                await updateTanuloLetszam({
                  id: existingRecord.id,
                  ...recordData,
                }).unwrap();
                updatedCount++;
                console.log(
                  `Updated student record for ${programType} - felnőttképzési jogviszony - ${year}`
                );
              } else {
                // Create new record
                await addStudentData(recordData).unwrap();
                savedCount++;
                console.log(
                  `Created new student record for ${programType} - felnőttképzési jogviszony - ${year}`
                );
              }
            } catch (recordError) {
              console.error(
                `Error saving student record for ${programType} - felnőttképzési jogviszony - ${year}:`,
                recordError
              );
              throw recordError;
            }
          }
        }
      }

      setSavedData(JSON.parse(JSON.stringify(tableData)));
      setIsModified(false);
      console.log(
        `Successfully saved ${savedCount} new student records and updated ${updatedCount} existing records`
      );

      // Show success snackbar
      setSnackbarMessage(
        `Sikeresen mentve: ${savedCount} új rekord és ${updatedCount} frissített rekord`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving student data:", error);
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

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleResetData = () => {
    if (savedData) {
      setTableData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Initialize tableData from API data when available
  useEffect(() => {
    const hasTanuloLetszamData =
      apiStudentData &&
      Array.isArray(apiStudentData) &&
      apiStudentData.length > 0;
    const hasTanugyiData =
      tanugyiData && Array.isArray(tanugyiData) && tanugyiData.length > 0;

    console.log(tanugyiData);

    if (hasTanuloLetszamData) {
      // Priority: Use TanuloLetszam data if available
      const initialTableData = {};

      // Convert API data back to table format
      apiStudentData.forEach((record) => {
        // Extract programType correctly from the nested object structure
        let programType;
        if (record.szakma?.nev) {
          // If szakma exists, use szakma name
          programType = record.szakma.nev;
        } else if (record.szakirany?.nev) {
          // If no szakma but szakirany exists, use "Nincs meghatározva (szakiranyName)"
          programType = `Nincs meghatározva (${record.szakirany.nev})`;
        } else {
          // Fallback
          programType = "Unknown";
        }

        const year = record.tanev_kezdete;
        const jogvType = record.jogv_tipus;
        const letszam = record.letszam || 0;

        console.log(
          `🔍 Processing TanuloLetszam record: ${programType}, year: ${year}, jogv: ${jogvType}, letszam: ${letszam}`
        );

        if (!initialTableData[programType]) {
          initialTableData[programType] = {};
        }
        if (!initialTableData[programType][year]) {
          initialTableData[programType][year] = {
            tanuloi_jogviszony: 0,
            felnottkepzesi_jogviszony: 0,
          };
        }

        if (jogvType === 0) {
          initialTableData[programType][year].tanuloi_jogviszony = letszam;
        } else if (jogvType === 1) {
          initialTableData[programType][year].felnottkepzesi_jogviszony =
            letszam;
        }
      });

      setTableData(initialTableData);
      setSavedData(JSON.parse(JSON.stringify(initialTableData)));
      setDataSource("TanuloLetszam");
      console.log(
        "Initialized table data from TanuloLetszam API:",
        initialTableData
      );
    } else if (hasTanugyiData) {
      // Fallback: Calculate from tanugyi data when TanuloLetszam data is not available
      console.log(
        "TanuloLetszam data not available, calculating from tanugyi data..."
      );
      const calculatedData = {};

      console.log("Processing tanugyi data for calculation...");
      console.log("Sample student record:", tanugyiData[0]);
      console.log("Total tanugyi records:", tanugyiData.length);

      // Track filtering statistics
      let totalProcessed = 0;
      let filteredOut = 0;
      let evfolyamStats = {};

      // Process tanugyi data by szakirany and szakma
      tanugyiData.forEach((student) => {
        totalProcessed++;

        // Extract relevant fields from student data - using correct field names from tanugyi data
        let szakmaNev =
          student.uj_szkt_szakma_tipusa ||
          student.szakma_nev ||
          student.szakkepzes_nev ||
          "Nincs meghatározva";

        // Clean up szakma name - remove code suffix like "- 5 0613 12 03 (2020)"
        if (szakmaNev && szakmaNev !== "Nincs meghatározva") {
          szakmaNev = szakmaNev.split(" - ")[0].trim();
        }

        // Handle "Na" as "Nincs meghatározva"
        if (szakmaNev === "Na" || szakmaNev === "NA" || szakmaNev === "na") {
          szakmaNev = "Nincs meghatározva";
        }

        // Extract szakirány information
        const szakiranyName =
          student.uj_Szkt_agazat_tipusa || "Nincs meghatározva";

        const evfolyam = student.evfolyam || "";
        const year = student.tanev_kezdete || 2024;

        // Track institution types and evfolyam values for debugging
        evfolyamStats[evfolyam] = (evfolyamStats[evfolyam] || 0) + 1;

        // Only log first 10 students to avoid console spam
        if (totalProcessed <= 10) {
          console.log(
            `Processing student ${totalProcessed}: szakma="${szakmaNev}", szakirany="${szakiranyName}", evfolyam="${evfolyam}", year=${year}`
          );
        }

        // Determine institution type from evfolyam - be more inclusive
        const isTechnikum = evfolyam.toLowerCase().includes("technikum");
        const isSzakkepzo = evfolyam.toLowerCase().includes("szakképző");
        const isGimnazium = evfolyam.toLowerCase().includes("gimnázium");
        const hasEvfolyamNumber = /\d+/.test(evfolyam); // Any evfolyam with numbers (9, 10, 11, 12, 13, etc.)

        // Determine jogviszony type based on student data
        const isFelnottkepzesi =
          student.tanulo_jogviszonya?.toLowerCase().includes("felnőtt") ||
          student.munkarend?.toLowerCase().includes("felnőtt") ||
          student.munkarend?.toLowerCase().includes("levelező") ||
          student.munkarend?.toLowerCase().includes("esti") ||
          evfolyam.toLowerCase().includes("felnőtt") ||
          evfolyam.toLowerCase().includes("levelező") ||
          evfolyam.toLowerCase().includes("esti") ||
          student.kepzes_forma?.toLowerCase().includes("felnőtt");

        // Use szakma name as program type, but for "Nincs meghatározva" include szakirány
        let programType;
        if (szakmaNev === "Nincs meghatározva") {
          // Create a unique key for "Nincs meghatározva" entries by szakirány
          programType = `Nincs meghatározva (${szakiranyName})`;
        } else {
          programType = szakmaNev;
        }

        // Include students in technikum, szakképző, or any evfolyam with numbers (more inclusive)
        if (isTechnikum || isSzakkepzo || isGimnazium || hasEvfolyamNumber) {
          if (!calculatedData[programType]) {
            calculatedData[programType] = {};
          }
          if (!calculatedData[programType][year]) {
            calculatedData[programType][year] = {
              tanuloi_jogviszony: 0,
              felnottkepzesi_jogviszony: 0,
            };
          }

          // Count the student in the appropriate category
          if (isFelnottkepzesi) {
            calculatedData[programType][year].felnottkepzesi_jogviszony += 1;
            if (totalProcessed <= 10) {
              console.log(
                `✅ INCLUDED (felnőtt): ${programType} - ${evfolyam} - ${year}`
              );
            }
          } else {
            calculatedData[programType][year].tanuloi_jogviszony += 1;
            if (totalProcessed <= 10) {
              console.log(
                `✅ INCLUDED (tanulói): ${programType} - ${evfolyam} - ${year}`
              );
            }
          }
        } else {
          filteredOut++;
          if (totalProcessed <= 10) {
            console.log(
              `❌ FILTERED OUT: ${programType} - ${evfolyam} - year: ${year}`
            );
          }
        }
      });

      // Log filtering statistics
      console.log("Tanugyi data processing stats:");
      console.log("- Total records processed:", totalProcessed);
      console.log("- Records filtered out:", filteredOut);
      console.log("- Records included:", totalProcessed - filteredOut);
      console.log("- Evfolyam distribution:", evfolyamStats);

      // Show sample of szakma names found
      const szakmaNames = Object.keys(calculatedData);
      console.log("- Sample szakma names found:", szakmaNames.slice(0, 10));
      console.log("- Total unique szakma names:", szakmaNames.length);
      console.log("- Final calculated data:", calculatedData);

      setTableData(calculatedData);
      setSavedData(JSON.parse(JSON.stringify(calculatedData)));
      setDataSource("TanugyiAdatok");
      console.log("Calculated table data from tanugyi data:", calculatedData);
    }
  }, [apiStudentData, tanugyiData]);

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

          {dataSource && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor:
                  dataSource === "TanuloLetszam" ? "#e8f5e8" : "#fff3e0",
                borderRadius: 1,
                border: `1px solid ${
                  dataSource === "TanuloLetszam" ? "#4caf50" : "#ff9800"
                }`,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                📊 Adatforrás:{" "}
                {dataSource === "TanuloLetszam"
                  ? "Tanulólétszám API (elsődleges)"
                  : "Tanügyi adatok API (számított)"}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                {dataSource === "TanuloLetszam"
                  ? "A mentett tanulólétszám adatok kerülnek megjelenítésre."
                  : "Nincs mentett tanulólétszám adat, ezért a tanügyi adatokból kerül kiszámításra."}
              </Typography>
            </Box>
          )}
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
                    {/* Category rows with potential subcategory */}
                    {category.isSzakirany ? (
                      // Render szakirány with subcategory and subTypes
                      <>
                        {/* Main category row */}
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#f0f8ff",
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
                                  backgroundColor: "#f0f8ff",
                                }}
                              />
                            ))}
                        </TableRow>

                        {/* Subcategory row */}
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "medium",
                              pl: 2,
                              backgroundColor: "#f8f9fa",
                              borderRight: "1px solid #ddd",
                              position: "sticky",
                              left: 0,
                              zIndex: 1,
                            }}
                          >
                            {category.subcategory}
                          </TableCell>
                          {/* Calculate totals for subcategory */}
                          {evszamok.map((schoolYear) => {
                            const startYear = parseInt(
                              schoolYear.split("/")[0]
                            );
                            let subcategoryTotal = 0;
                            category.subTypes.forEach((subType) => {
                              subcategoryTotal += calculateTotal(
                                subType,
                                startYear
                              );
                            });
                            return (
                              <TableCell
                                key={`total-${category.szakiranyName}-${startYear}`}
                                align="center"
                                sx={{
                                  backgroundColor: "#ffcdd220",
                                  fontWeight: "bold",
                                  color:
                                    subcategoryTotal > 0
                                      ? "primary.main"
                                      : "text.disabled",
                                }}
                              >
                                {subcategoryTotal}
                              </TableCell>
                            );
                          })}
                          {/* Tanulói jogviszony totals */}
                          {evszamok.map((schoolYear) => {
                            const startYear = parseInt(
                              schoolYear.split("/")[0]
                            );
                            let subcategoryTanuloi = 0;
                            category.subTypes.forEach((subType) => {
                              subcategoryTanuloi +=
                                tableData[subType]?.[startYear]
                                  ?.tanuloi_jogviszony || 0;
                            });
                            return (
                              <TableCell
                                key={`student-${category.szakiranyName}-${startYear}`}
                                align="center"
                                sx={{
                                  backgroundColor: "#e1f5fe20",
                                  fontWeight: "bold",
                                  color:
                                    subcategoryTanuloi > 0
                                      ? "primary.main"
                                      : "text.disabled",
                                }}
                              >
                                {subcategoryTanuloi}
                              </TableCell>
                            );
                          })}
                          {/* Felnőttképzési jogviszony totals */}
                          {evszamok.map((schoolYear) => {
                            const startYear = parseInt(
                              schoolYear.split("/")[0]
                            );
                            let subcategoryFelnottkepzesi = 0;
                            category.subTypes.forEach((subType) => {
                              subcategoryFelnottkepzesi +=
                                tableData[subType]?.[startYear]
                                  ?.felnottkepzesi_jogviszony || 0;
                            });
                            return (
                              <TableCell
                                key={`adult-${category.szakiranyName}-${startYear}`}
                                align="center"
                                sx={{
                                  backgroundColor: "#f3e5f520",
                                  fontWeight: "bold",
                                  color:
                                    subcategoryFelnottkepzesi > 0
                                      ? "primary.main"
                                      : "text.disabled",
                                }}
                              >
                                {subcategoryFelnottkepzesi}
                              </TableCell>
                            );
                          })}
                        </TableRow>

                        {/* Individual szakma/specialty rows */}
                        {category.subTypes.map((subType) => (
                          <TableRow
                            key={`${category.szakiranyName}-${subType}`}
                          >
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
                                fontStyle:
                                  subType === "Nincs meghatározva"
                                    ? "italic"
                                    : "normal",
                                color:
                                  subType === "Nincs meghatározva"
                                    ? "#666"
                                    : "inherit",
                              }}
                            >
                              {subType}
                            </TableCell>

                            {/* Összesen (tanulói + felnőttképzési) */}
                            {evszamok.map((schoolYear) => {
                              const startYear = parseInt(
                                schoolYear.split("/")[0]
                              );
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
                              const startYear = parseInt(
                                schoolYear.split("/")[0]
                              );
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
                              const startYear = parseInt(
                                schoolYear.split("/")[0]
                              );
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
                      </>
                    ) : (
                      // Original logic for non-szakirány categories
                      <>
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
                              const startYear = parseInt(
                                schoolYear.split("/")[0]
                              );

                              let total;
                              if (category.isInstitutionType) {
                                // For institution types, calculate from all szakma entries
                                total = calculateInstitutionTypeTotal(
                                  subType,
                                  startYear,
                                  "total"
                                );
                              } else if (
                                category.isTotal &&
                                subType === "Összesen"
                              ) {
                                // For "Összesen" row, calculate grand total of everything
                                total = calculateGrandTotal(startYear, "total");
                              } else {
                                total = calculateTotal(subType, startYear);
                              }
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
                              const startYear = parseInt(
                                schoolYear.split("/")[0]
                              );

                              if (category.isInstitutionType) {
                                // For institution types, calculate from all szakma entries (read-only)
                                const value = calculateInstitutionTypeTotal(
                                  subType,
                                  startYear,
                                  "tanuloi_jogviszony"
                                );
                                return (
                                  <TableCell
                                    key={`student-${subType}-${startYear}`}
                                    align="center"
                                    sx={{
                                      backgroundColor: "#e1f5fe40",
                                      fontWeight: "bold",
                                      color:
                                        value > 0
                                          ? "primary.main"
                                          : "text.disabled",
                                    }}
                                  >
                                    {value}
                                  </TableCell>
                                );
                              } else if (
                                category.isTotal &&
                                subType === "Összesen"
                              ) {
                                // For "Összesen" row, calculate grand total (read-only)
                                const value = calculateGrandTotal(
                                  startYear,
                                  "tanuloi_jogviszony"
                                );
                                return (
                                  <TableCell
                                    key={`student-${subType}-${startYear}`}
                                    align="center"
                                    sx={{
                                      backgroundColor: "#e1f5fe40",
                                      fontWeight: "bold",
                                      color:
                                        value > 0
                                          ? "primary.main"
                                          : "text.disabled",
                                    }}
                                  >
                                    {value}
                                  </TableCell>
                                );
                              } else {
                                // For regular entries, show editable field
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
                              }
                            })}

                            {/* Felnőttképzési jogviszony */}
                            {evszamok.map((schoolYear) => {
                              const startYear = parseInt(
                                schoolYear.split("/")[0]
                              );

                              if (category.isInstitutionType) {
                                // For institution types, calculate from all szakma entries (read-only)
                                const value = calculateInstitutionTypeTotal(
                                  subType,
                                  startYear,
                                  "felnottkepzesi_jogviszony"
                                );
                                return (
                                  <TableCell
                                    key={`adult-${subType}-${startYear}`}
                                    align="center"
                                    sx={{
                                      backgroundColor: "#f3e5f540",
                                      fontWeight: "bold",
                                      color:
                                        value > 0
                                          ? "primary.main"
                                          : "text.disabled",
                                    }}
                                  >
                                    {value}
                                  </TableCell>
                                );
                              } else if (
                                category.isTotal &&
                                subType === "Összesen"
                              ) {
                                // For "Összesen" row, calculate grand total (read-only)
                                const value = calculateGrandTotal(
                                  startYear,
                                  "felnottkepzesi_jogviszony"
                                );
                                return (
                                  <TableCell
                                    key={`adult-${subType}-${startYear}`}
                                    align="center"
                                    sx={{
                                      backgroundColor: "#f3e5f540",
                                      fontWeight: "bold",
                                      color:
                                        value > 0
                                          ? "primary.main"
                                          : "text.disabled",
                                    }}
                                  >
                                    {value}
                                  </TableCell>
                                );
                              } else {
                                // For regular entries, show editable field
                                const data = tableData[subType]?.[startYear];
                                return (
                                  <TableCell
                                    key={`adult-${subType}-${startYear}`}
                                    align="center"
                                    sx={{ backgroundColor: "#f3e5f520" }}
                                  >
                                    <TextField
                                      type="number"
                                      value={
                                        data?.felnottkepzesi_jogviszony || 0
                                      }
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
                              }
                            })}
                          </TableRow>
                        ))}
                      </>
                    )}
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
              disabled={!isModified || isUpdating || isSaving}
            >
              {isUpdating || isSaving ? "Mentés..." : "Mentés"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetData}
              disabled={!isModified || !savedData || isUpdating || isSaving}
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

      {savedData && !isModified && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Az adatok sikeresen mentve!
        </Alert>
      )}

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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
  );
}
