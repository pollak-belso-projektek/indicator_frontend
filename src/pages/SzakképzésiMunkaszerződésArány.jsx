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
  CircularProgress,
  Backdrop,
  Snackbar,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import {
  useGetTanugyiAdatokQuery,
  useGetAllSZMSZQuery,
  useAddSZMSZMutation,
  useUpdateSZMSZMutation,
} from "../store/api/apiSlice";
import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../store/slices/authSlice";

export default function SzakképzésiMunkaszerződésArány() {
  const schoolYears = generateSchoolYears();

  const selectedSchool = useSelector(selectSelectedSchool);

  const { data: szmszData } = useGetAllSZMSZQuery({
    alapadatok_id: selectedSchool?.id,
    tanev: 2024,
  });

  const { data } = useGetTanugyiAdatokQuery({
    alapadatok_id: selectedSchool?.id,
    ev: 2024,
  });

  const [addSZMSZ, { isLoading: isAdding }] = useAddSZMSZMutation();
  const [updateSZMSZ, { isLoading: isUpdating }] = useUpdateSZMSZMutation();

  const szakiranyok_szakmak = useMemo(() => {
    return (tipus) => {
      return (
        selectedSchool?.alapadatok_szakirany
          ?.map((szakiranyok) => {
            const specializations =
              szakiranyok?.szakirany?.szakma
                ?.filter((item) => {
                  if (item.szakma.tipus == null) {
                    return selectedSchool?.alapadatok_szakma.some(
                      (item2) => item2.szakma.nev === item.szakma.nev
                    );
                  }
                  return (
                    item.szakma.tipus === tipus &&
                    selectedSchool?.alapadatok_szakma.some(
                      (item2) => item2.szakma.nev === item.szakma.nev
                    )
                  );
                })
                ?.map((item) => item.szakma.nev) || [];

            return {
              name: szakiranyok.szakirany.nev,
              specializations:
                specializations.length > 0
                  ? [...specializations, "Nincs meghatározva"]
                  : specializations,
            };
          })
          .filter((szakirany) => szakirany.specializations.length > 0) || []
      );
    };
  }, [selectedSchool]);

  // Define the institution types and specializations based on the attachment
  const institutionStructure = useMemo(
    () =>
      [
        {
          category: "összesen",
          subcategory: "technikum+szakképző iskola",
          szakiranyok: [],
        },
        {
          category: "intézménytípusonként",
          subcategory: "ebből: technikum",
          szakiranyok: szakiranyok_szakmak("Technikum"),
        },
        {
          category: "intézménytípusonként",
          subcategory: "ebből: szakképző iskola",
          szakiranyok: szakiranyok_szakmak("Szakképző iskola"),
        },
      ].filter((institution) => {
        // Always show the "összesen" category
        if (institution.category === "összesen") {
          return true;
        }
        // For institution types, only show if they have szakiranyok
        return institution.szakiranyok && institution.szakiranyok.length > 0;
      }),
    [szakiranyok_szakmak]
  );

  // Initialize data structure for the three main sections with empty data first
  const [szakképzésiData, setSzakképzésiData] = useState({
    percentage: {},
    contract_students: {},
    total_students: {},
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [hasInitializedFromAPI, setHasInitializedFromAPI] = useState(false);
  const [initializedWithSZMSZ, setInitializedWithSZMSZ] = useState(false);
  const [structureInitialized, setStructureInitialized] = useState(false);
  const [shouldProcessAPIData, setShouldProcessAPIData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Initialize the data structure when institutionStructure becomes available
  useEffect(() => {
    if (institutionStructure.length > 0 && !structureInitialized) {
      console.log("Initializing data structure...");

      const initialData = {
        percentage: {},
        contract_students: {},
        total_students: {},
      };

      // Initialize all sections with empty data
      Object.keys(initialData).forEach((section) => {
        institutionStructure.forEach((institution, institutionIndex) => {
          const key = `${institution.category}_${institutionIndex}`;
          initialData[section][key] = {};

          // Add subcategory
          initialData[section][key][institution.subcategory] = {};
          schoolYears.forEach((year) => {
            initialData[section][key][institution.subcategory][year] = "0";
          });

          // Add szakiranyok and their specializations
          if (institution.szakiranyok && institution.szakiranyok.length > 0) {
            institution.szakiranyok.forEach((szakirany) => {
              // Add szakirany itself
              initialData[section][key][szakirany.name] = {};
              schoolYears.forEach((year) => {
                initialData[section][key][szakirany.name][year] = "0";
              });

              // Add specializations under szakirany with unique keys
              szakirany.specializations.forEach((spec, specIndex) => {
                const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                initialData[section][key][uniqueSpecKey] = {};
                schoolYears.forEach((year) => {
                  initialData[section][key][uniqueSpecKey][year] = "0";
                });
              });
            });
          }
        });
      });

      setSzakképzésiData(initialData);
      setStructureInitialized(true);
    }
  }, [institutionStructure, schoolYears, structureInitialized]);

  // Use useEffect to calculate data when API data becomes available
  useEffect(() => {
    // Don't proceed if structure isn't initialized yet or if we shouldn't process API data
    if (!structureInitialized || !shouldProcessAPIData) {
      return;
    }

    console.log(
      "useEffect triggered - data:",
      data?.length,
      "szmszData:",
      szmszData?.length,
      "institutionStructure:",
      institutionStructure.length,
      "hasInitializedFromAPI:",
      hasInitializedFromAPI,
      "initializedWithSZMSZ:",
      initializedWithSZMSZ,
      "isModified:",
      isModified,
      "structureInitialized:",
      structureInitialized,
      "shouldProcessAPIData:",
      shouldProcessAPIData
    );

    const hasSZMSZData =
      szmszData && Array.isArray(szmszData) && szmszData.length > 0;
    const hasStudentData = data && Array.isArray(data) && data.length > 0;

    // Re-initialize conditions:
    // 1. Never initialized before and have some data
    // 2. Previously initialized with student data but now SZMSZ data is available
    // 3. User hasn't made manual changes
    const shouldInitialize =
      !isModified &&
      ((!hasInitializedFromAPI && (hasSZMSZData || hasStudentData)) ||
        (hasInitializedFromAPI && !initializedWithSZMSZ && hasSZMSZData));

    if (shouldInitialize) {
      console.log("Calculating data from API...");
      if (hasSZMSZData && !initializedWithSZMSZ) {
        console.log(
          "Re-initializing with SZMSZ data (priority over student data)"
        );
      }

      // Function to calculate data from SZMSZ endpoint or fall back to student data
      const calculateDataFromAPI = () => {
        const calculatedData = {
          percentage: {},
          contract_students: {},
          total_students: {},
        };

        // Initialize the structure
        Object.keys(calculatedData).forEach((section) => {
          institutionStructure.forEach((institution, institutionIndex) => {
            const key = `${institution.category}_${institutionIndex}`;
            calculatedData[section][key] = {};

            // Add subcategory
            calculatedData[section][key][institution.subcategory] = {};
            schoolYears.forEach((year) => {
              calculatedData[section][key][institution.subcategory][year] = "0";
            });

            // Add szakiranyok and their specializations
            if (institution.szakiranyok && institution.szakiranyok.length > 0) {
              institution.szakiranyok.forEach((szakirany) => {
                // Add szakirany itself
                calculatedData[section][key][szakirany.name] = {};
                schoolYears.forEach((year) => {
                  calculatedData[section][key][szakirany.name][year] = "0";
                });

                // Add specializations under szakirany with unique keys
                szakirany.specializations.forEach((spec, specIndex) => {
                  const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                  calculatedData[section][key][uniqueSpecKey] = {};
                  schoolYears.forEach((year) => {
                    calculatedData[section][key][uniqueSpecKey][year] = "0";
                  });
                });
              });
            }
          });
        });

        // Check if we have SZMSZ data (saved data) to use first
        if (szmszData && Array.isArray(szmszData) && szmszData.length > 0) {
          console.log("Using SZMSZ saved data...");
          console.log("🔍 DEBUG: Full szmszData structure:", szmszData);
          console.log("🔍 DEBUG: Sample record:", szmszData[0]);
          console.log(
            "🔍 DEBUG: All available fields in first record:",
            Object.keys(szmszData[0])
          );

          // Process SZMSZ data
          schoolYears.forEach((schoolYear) => {
            const yearStart = parseInt(schoolYear.split("/")[0]);

            // Filter SZMSZ data for this school year
            const szmszForYear = szmszData.filter(
              (record) => record.tanev_kezdete === yearStart
            );

            console.log(
              `🔍 DEBUG: Processing year ${schoolYear} (yearStart: ${yearStart}), found ${szmszForYear.length} SZMSZ records for this year`
            );

            institutionStructure.forEach((institution, institutionIndex) => {
              const key = `${institution.category}_${institutionIndex}`;

              console.log(
                `🔍 DEBUG: Processing institution - category: ${
                  institution.category
                }, subcategory: ${
                  institution.subcategory
                }, szakiranyok count: ${institution.szakiranyok?.length || 0}`
              );

              if (institution.category === "összesen") {
                // Calculate totals for all institution types from SZMSZ data
                let totalContractStudents = 0;
                let totalStudents = 0;

                szmszForYear.forEach((record) => {
                  // Handle both nested object and flat string formats
                  const recordType = record.szakma?.tipus || record.tipus;
                  if (
                    recordType === "Technikum" ||
                    recordType === "Szakképző iskola"
                  ) {
                    totalStudents += record.tanulok_osszeletszam || 0;
                    totalContractStudents +=
                      record.munkaszerzodeses_tanulok_szama || 0;
                  }
                });

                calculatedData.total_students[key][institution.subcategory][
                  schoolYear
                ] = totalStudents.toString();
                calculatedData.contract_students[key][institution.subcategory][
                  schoolYear
                ] = totalContractStudents.toString();
              } else if (institution.subcategory.includes("technikum")) {
                // Calculate for technikum from SZMSZ data
                let contractStudents = 0;
                let totalStudents = 0;

                if (
                  institution.szakiranyok &&
                  institution.szakiranyok.length > 0
                ) {
                  institution.szakiranyok.forEach((szakirany) => {
                    let szakiranyContractStudents = 0;
                    let szakiranyTotalStudents = 0;

                    console.log(
                      `🔍 DEBUG: Processing technikum szakirany: ${
                        szakirany.name
                      }, specializations: ${JSON.stringify(
                        szakirany.specializations
                      )}`
                    );

                    szakirany.specializations.forEach((spec, specIndex) => {
                      const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                      let specContractStudents = 0;
                      let specTotalStudents = 0;

                      if (spec === "Nincs meghatározva") {
                        // For "Nincs meghatározva", find records for this szakirany where szakma is null
                        // Since we can't determine the type from a null szakma, we'll rely on the institution context
                        const szakiranyRecords = szmszForYear.filter(
                          (record) => {
                            const recordSzakirany = record.szakirany?.nev;
                            const hasNoSzakma = record.szakma === null;

                            // For "Nincs meghatározva", we match by szakirany and null szakma
                            // The institution type (Technikum vs Szakképző iskola) will be determined by context
                            const isCorrectSzakirany =
                              recordSzakirany === szakirany.name;

                            console.log(
                              `🔍 DEBUG: Checking "Nincs meghatározva" record for ${szakirany.name} (Technikum):`,
                              {
                                recordSzakirany,
                                szakmaIsNull: record.szakma === null,
                                isCorrectSzakirany,
                                hasNoSzakma,
                                match: isCorrectSzakirany && hasNoSzakma,
                              }
                            );

                            return isCorrectSzakirany && hasNoSzakma;
                          }
                        );

                        szakiranyRecords.forEach((record) => {
                          specTotalStudents += record.tanulok_osszeletszam || 0;
                          specContractStudents +=
                            record.munkaszerzodeses_tanulok_szama || 0;
                        });

                        console.log(
                          `🔍 DEBUG: "Nincs meghatározva" for ${szakirany.name} (Technikum) - found ${szakiranyRecords.length} records, total: ${specTotalStudents}, contract: ${specContractStudents}`
                        );

                        // Additional debug: show the actual records found
                        if (szakiranyRecords.length > 0) {
                          console.log(
                            `🔍 DEBUG: Actual records found:`,
                            szakiranyRecords
                          );
                        }
                      } else {
                        // Find exact match for this specialization
                        const matchingRecords = szmszForYear.filter(
                          (record) => {
                            const recordType = record.szakma?.tipus;
                            const recordSzakirany = record.szakirany?.nev;
                            const recordSzakma = record.szakma?.nev;
                            return (
                              recordType === "Technikum" &&
                              recordSzakirany === szakirany.name &&
                              recordSzakma === spec
                            );
                          }
                        );

                        matchingRecords.forEach((record) => {
                          specTotalStudents += record.tanulok_osszeletszam || 0;
                          specContractStudents +=
                            record.munkaszerzodeses_tanulok_szama || 0;
                        });
                      }

                      calculatedData.total_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specTotalStudents.toString();
                      calculatedData.contract_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specContractStudents.toString();

                      szakiranyTotalStudents += specTotalStudents;
                      szakiranyContractStudents += specContractStudents;
                    });

                    // Update szakirany totals
                    calculatedData.total_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyTotalStudents.toString();
                    calculatedData.contract_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyContractStudents.toString();

                    totalStudents += szakiranyTotalStudents;
                    contractStudents += szakiranyContractStudents;
                  });
                }

                calculatedData.total_students[key][institution.subcategory][
                  schoolYear
                ] = totalStudents.toString();
                calculatedData.contract_students[key][institution.subcategory][
                  schoolYear
                ] = contractStudents.toString();
              } else if (institution.subcategory.includes("szakképző iskola")) {
                // Calculate for szakképző iskola from SZMSZ data
                let contractStudents = 0;
                let totalStudents = 0;

                if (
                  institution.szakiranyok &&
                  institution.szakiranyok.length > 0
                ) {
                  institution.szakiranyok.forEach((szakirany) => {
                    let szakiranyContractStudents = 0;
                    let szakiranyTotalStudents = 0;

                    console.log(
                      `🔍 DEBUG: Processing szakképző iskola szakirany: ${
                        szakirany.name
                      }, specializations: ${JSON.stringify(
                        szakirany.specializations
                      )}`
                    );

                    szakirany.specializations.forEach((spec, specIndex) => {
                      const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                      let specContractStudents = 0;
                      let specTotalStudents = 0;

                      if (spec === "Nincs meghatározva") {
                        // For "Nincs meghatározva", find records for this szakirany where szakma is null
                        // Since we can't determine the type from a null szakma, we'll rely on the institution context
                        const szakiranyRecords = szmszForYear.filter(
                          (record) => {
                            const recordSzakirany = record.szakirany?.nev;
                            const hasNoSzakma = record.szakma === null;

                            // For "Nincs meghatározva", we match by szakirany and null szakma
                            // The institution type (Technikum vs Szakképző iskola) will be determined by context
                            const isCorrectSzakirany =
                              recordSzakirany === szakirany.name;

                            console.log(
                              `🔍 DEBUG: Checking "Nincs meghatározva" record for ${szakirany.name} (Szakképző iskola):`,
                              {
                                recordSzakirany,
                                szakmaIsNull: record.szakma === null,
                                isCorrectSzakirany,
                                hasNoSzakma,
                                match: isCorrectSzakirany && hasNoSzakma,
                              }
                            );

                            return isCorrectSzakirany && hasNoSzakma;
                          }
                        );

                        szakiranyRecords.forEach((record) => {
                          specTotalStudents += record.tanulok_osszeletszam || 0;
                          specContractStudents +=
                            record.munkaszerzodeses_tanulok_szama || 0;
                        });

                        console.log(
                          `🔍 DEBUG: "Nincs meghatározva" for ${szakirany.name} (Szakképző iskola) - found ${szakiranyRecords.length} records, total: ${specTotalStudents}, contract: ${specContractStudents}`
                        );

                        // Additional debug: show the actual records found
                        if (szakiranyRecords.length > 0) {
                          console.log(
                            `🔍 DEBUG: Actual records found:`,
                            szakiranyRecords
                          );
                        }
                      } else {
                        // Find exact match for this specialization
                        const matchingRecords = szmszForYear.filter(
                          (record) => {
                            const recordType = record.szakma?.tipus;
                            const recordSzakirany = record.szakirany?.nev;
                            const recordSzakma = record.szakma?.nev;
                            return (
                              recordType === "Szakképző iskola" &&
                              recordSzakirany === szakirany.name &&
                              recordSzakma === spec
                            );
                          }
                        );

                        matchingRecords.forEach((record) => {
                          specTotalStudents += record.tanulok_osszeletszam || 0;
                          specContractStudents +=
                            record.munkaszerzodeses_tanulok_szama || 0;
                        });
                      }

                      calculatedData.total_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specTotalStudents.toString();
                      calculatedData.contract_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specContractStudents.toString();

                      szakiranyTotalStudents += specTotalStudents;
                      szakiranyContractStudents += specContractStudents;
                    });

                    calculatedData.total_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyTotalStudents.toString();
                    calculatedData.contract_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyContractStudents.toString();

                    totalStudents += szakiranyTotalStudents;
                    contractStudents += szakiranyContractStudents;
                  });
                }

                calculatedData.total_students[key][institution.subcategory][
                  schoolYear
                ] = totalStudents.toString();
                calculatedData.contract_students[key][institution.subcategory][
                  schoolYear
                ] = contractStudents.toString();
              }
            });
          });
        } else if (data && Array.isArray(data) && data.length > 0) {
          console.log("No SZMSZ data found, calculating from student data...");
          // Fall back to original calculation from student data
          schoolYears.forEach((schoolYear) => {
            const yearStart = parseInt(schoolYear.split("/")[0]);

            // Filter students for this school year
            const studentsForYear = data.filter(
              (student) =>
                student.tanev_kezdete === yearStart &&
                student.tanulo_jogviszonya === "Tanulói jogviszony"
            );

            // Count by institution type and specialization
            institutionStructure.forEach((institution, institutionIndex) => {
              const key = `${institution.category}_${institutionIndex}`;

              if (institution.category === "összesen") {
                // Calculate totals for all institution types
                let totalContractStudents = 0;
                let totalStudents = 0;

                studentsForYear.forEach((student) => {
                  const hasContract =
                    student.szakkepzesi_munkaszerzodessel === "Igen";
                  const evfolyam = student.evfolyam || "";

                  // Check if it's technikum or szakképző iskola
                  if (
                    evfolyam.toLowerCase().includes("technikum") ||
                    evfolyam.toLowerCase().includes("szakképző")
                  ) {
                    totalStudents++;
                    if (hasContract) {
                      totalContractStudents++;
                    }
                  }
                });

                calculatedData.total_students[key][institution.subcategory][
                  schoolYear
                ] = totalStudents.toString();
                calculatedData.contract_students[key][institution.subcategory][
                  schoolYear
                ] = totalContractStudents.toString();
              } else if (institution.subcategory.includes("technikum")) {
                // Calculate for technikum
                let contractStudents = 0;
                let totalStudents = 0;

                const technikumStudents = studentsForYear.filter((student) => {
                  const evfolyam = student.evfolyam || "";
                  return evfolyam.toLowerCase().includes("technikum");
                });

                if (
                  institution.szakiranyok &&
                  institution.szakiranyok.length > 0
                ) {
                  institution.szakiranyok.forEach((szakirany) => {
                    let szakiranyContractStudents = 0;
                    let szakiranyTotalStudents = 0;

                    // Filter students for this specific szakirany
                    const szakiranyStudents = technikumStudents.filter(
                      (student) => {
                        const studentAgazat =
                          student.uj_Szkt_agazat_tipusa || "";
                        return (
                          studentAgazat
                            .toLowerCase()
                            .includes(szakirany.name.toLowerCase()) ||
                          studentAgazat === "Na" ||
                          !studentAgazat
                        );
                      }
                    );

                    szakirany.specializations.forEach((spec, specIndex) => {
                      const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                      let specContractStudents = 0;
                      let specTotalStudents = 0;

                      if (spec === "Nincs meghatározva") {
                        // Count students with "Na" or empty szakma, or those that don't match any other specialization
                        const studentsWithoutSpecificSzakma =
                          szakiranyStudents.filter((student) => {
                            const studentSzakma =
                              student.uj_szkt_szakma_tipusa || "";
                            return (
                              studentSzakma === "Na" ||
                              !studentSzakma ||
                              !szakirany.specializations
                                .slice(0, -1)
                                .some((otherSpec) =>
                                  studentSzakma
                                    .toLowerCase()
                                    .includes(otherSpec.toLowerCase())
                                )
                            );
                          });

                        specTotalStudents =
                          studentsWithoutSpecificSzakma.length;
                        specContractStudents =
                          studentsWithoutSpecificSzakma.filter(
                            (s) => s.szakkepzesi_munkaszerzodessel === "Igen"
                          ).length;
                      } else {
                        // Count students with this specific specialization within the szakirany
                        const studentsWithSpec = szakiranyStudents.filter(
                          (student) => {
                            const studentSzakma =
                              student.uj_szkt_szakma_tipusa || "";
                            return studentSzakma
                              .toLowerCase()
                              .includes(spec.toLowerCase());
                          }
                        );

                        specTotalStudents = studentsWithSpec.length;
                        specContractStudents = studentsWithSpec.filter(
                          (s) => s.szakkepzesi_munkaszerzodessel === "Igen"
                        ).length;
                      }

                      calculatedData.total_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specTotalStudents.toString();
                      calculatedData.contract_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specContractStudents.toString();

                      szakiranyTotalStudents += specTotalStudents;
                      szakiranyContractStudents += specContractStudents;
                    });

                    // Update szakirany totals
                    calculatedData.total_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyTotalStudents.toString();
                    calculatedData.contract_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyContractStudents.toString();

                    totalStudents += szakiranyTotalStudents;
                    contractStudents += szakiranyContractStudents;
                  });
                }

                calculatedData.total_students[key][institution.subcategory][
                  schoolYear
                ] = totalStudents.toString();
                calculatedData.contract_students[key][institution.subcategory][
                  schoolYear
                ] = contractStudents.toString();
              } else if (institution.subcategory.includes("szakképző iskola")) {
                // Calculate for szakképző iskola
                let contractStudents = 0;
                let totalStudents = 0;

                const szakképzőStudents = studentsForYear.filter((student) => {
                  const evfolyam = student.evfolyam || "";
                  return (
                    evfolyam.toLowerCase().includes("szakképző") &&
                    !evfolyam.toLowerCase().includes("technikum")
                  );
                });

                if (
                  institution.szakiranyok &&
                  institution.szakiranyok.length > 0
                ) {
                  institution.szakiranyok.forEach((szakirany) => {
                    let szakiranyContractStudents = 0;
                    let szakiranyTotalStudents = 0;

                    // Filter students for this specific szakirany
                    const szakiranyStudents = szakképzőStudents.filter(
                      (student) => {
                        const studentAgazat =
                          student.uj_Szkt_agazat_tipusa || "";
                        return (
                          studentAgazat
                            .toLowerCase()
                            .includes(szakirany.name.toLowerCase()) ||
                          studentAgazat === "Na" ||
                          !studentAgazat
                        );
                      }
                    );

                    szakirany.specializations.forEach((spec, specIndex) => {
                      const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                      let specContractStudents = 0;
                      let specTotalStudents = 0;

                      if (spec === "Nincs meghatározva") {
                        const studentsWithoutSpecificSzakma =
                          szakiranyStudents.filter((student) => {
                            const studentSzakma =
                              student.uj_szkt_szakma_tipusa || "";
                            return (
                              studentSzakma === "Na" ||
                              !studentSzakma ||
                              !szakirany.specializations
                                .slice(0, -1)
                                .some((otherSpec) =>
                                  studentSzakma
                                    .toLowerCase()
                                    .includes(otherSpec.toLowerCase())
                                )
                            );
                          });

                        specTotalStudents =
                          studentsWithoutSpecificSzakma.length;
                        specContractStudents =
                          studentsWithoutSpecificSzakma.filter(
                            (s) => s.szakkepzesi_munkaszerzodessel === "Igen"
                          ).length;
                      } else {
                        const studentsWithSpec = szakiranyStudents.filter(
                          (student) => {
                            const studentSzakma =
                              student.uj_szkt_szakma_tipusa || "";
                            return studentSzakma
                              .toLowerCase()
                              .includes(spec.toLowerCase());
                          }
                        );

                        specTotalStudents = studentsWithSpec.length;
                        specContractStudents = studentsWithSpec.filter(
                          (s) => s.szakkepzesi_munkaszerzodessel === "Igen"
                        ).length;
                      }

                      calculatedData.total_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specTotalStudents.toString();
                      calculatedData.contract_students[key][uniqueSpecKey][
                        schoolYear
                      ] = specContractStudents.toString();

                      szakiranyTotalStudents += specTotalStudents;
                      szakiranyContractStudents += specContractStudents;
                    });

                    calculatedData.total_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyTotalStudents.toString();
                    calculatedData.contract_students[key][szakirany.name][
                      schoolYear
                    ] = szakiranyContractStudents.toString();

                    totalStudents += szakiranyTotalStudents;
                    contractStudents += szakiranyContractStudents;
                  });
                }

                calculatedData.total_students[key][institution.subcategory][
                  schoolYear
                ] = totalStudents.toString();
                calculatedData.contract_students[key][institution.subcategory][
                  schoolYear
                ] = contractStudents.toString();
              }
            });
          });
        }

        // Calculate percentages for all data (both SZMSZ and student data)
        Object.keys(calculatedData.percentage).forEach((institutionKey) => {
          Object.keys(calculatedData.percentage[institutionKey]).forEach(
            (itemKey) => {
              schoolYears.forEach((year) => {
                const contractCount = parseFloat(
                  calculatedData.contract_students[institutionKey]?.[itemKey]?.[
                    year
                  ] || 0
                );
                const totalCount = parseFloat(
                  calculatedData.total_students[institutionKey]?.[itemKey]?.[
                    year
                  ] || 0
                );

                if (totalCount > 0) {
                  const percentage = Math.round(
                    (contractCount / totalCount) * 100
                  );
                  calculatedData.percentage[institutionKey][itemKey][year] =
                    percentage.toString();
                } else {
                  calculatedData.percentage[institutionKey][itemKey][year] =
                    "0";
                }
              });
            }
          );
        });

        return calculatedData;
      };

      const calculatedData = calculateDataFromAPI();
      console.log("Calculated data:", calculatedData);
      setSzakképzésiData(calculatedData);
      setHasInitializedFromAPI(true);

      // Track which data source we used for initialization
      if (hasSZMSZData) {
        setInitializedWithSZMSZ(true);
        console.log("Initialized with SZMSZ data");
      } else {
        setInitializedWithSZMSZ(false);
        console.log("Initialized with student data");
      }
    }
  }, [
    data,
    szmszData,
    institutionStructure,
    schoolYears,
    hasInitializedFromAPI,
    initializedWithSZMSZ,
    isModified,
    structureInitialized,
    shouldProcessAPIData,
  ]);

  // Enhanced handle data change that triggers auto-calculation
  const handleDataChangeWithCalculation = (
    section,
    institutionKey,
    subcategory,
    year,
    value
  ) => {
    // Disable API data processing when user is making manual changes
    setShouldProcessAPIData(false);

    // Update the data first
    setSzakképzésiData((prev) => {
      const newData = {
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
      };

      // Only calculate percentage for the changed item if it's a specialization
      if (subcategory.includes("_") && subcategory.split("_").length >= 3) {
        const contractValue = parseFloat(
          newData.contract_students[institutionKey]?.[subcategory]?.[year] || 0
        );
        const totalValue = parseFloat(
          newData.total_students[institutionKey]?.[subcategory]?.[year] || 0
        );

        if (totalValue > 0) {
          const percentage = Math.round((contractValue / totalValue) * 100);
          if (
            newData.percentage[institutionKey] &&
            newData.percentage[institutionKey][subcategory]
          ) {
            newData.percentage[institutionKey][subcategory][year] =
              percentage.toString();
          }
        } else {
          if (
            newData.percentage[institutionKey] &&
            newData.percentage[institutionKey][subcategory]
          ) {
            newData.percentage[institutionKey][subcategory][year] = "0";
          }
        }

        // Now recalculate totals efficiently - find the affected szakirany and institution
        const parts = subcategory.split("_");
        const szakiranyName = parts[0];

        // Calculate szakirany total by summing all its specializations
        let szakiranyTotal = 0;
        Object.keys(newData[section][institutionKey]).forEach((key) => {
          if (
            key.startsWith(szakiranyName + "_") &&
            key.split("_").length >= 3
          ) {
            szakiranyTotal += parseFloat(
              newData[section][institutionKey][key][year] || 0
            );
          }
        });

        // Update szakirany total
        if (newData[section][institutionKey][szakiranyName]) {
          newData[section][institutionKey][szakiranyName][year] =
            szakiranyTotal.toString();
        }

        // Find the institution subcategory and calculate its total
        const currentInstitution = institutionStructure.find(
          (inst, idx) => `${inst.category}_${idx}` === institutionKey
        );

        if (currentInstitution && currentInstitution.szakiranyok) {
          let subcategoryTotal = 0;
          currentInstitution.szakiranyok.forEach((szakirany) => {
            const szakiranyValue = parseFloat(
              newData[section][institutionKey][szakirany.name]?.[year] || 0
            );
            subcategoryTotal += szakiranyValue;
          });

          // Update subcategory total
          if (
            newData[section][institutionKey][currentInstitution.subcategory]
          ) {
            newData[section][institutionKey][currentInstitution.subcategory][
              year
            ] = subcategoryTotal.toString();
          }
        }

        // Calculate "összesen" total if needed
        const osszsenKey = institutionStructure.findIndex(
          (inst) => inst.category === "összesen"
        );
        if (osszsenKey >= 0) {
          const totalKey = `összesen_${osszsenKey}`;
          let grandTotal = 0;

          institutionStructure.forEach((inst, idx) => {
            if (inst.category !== "összesen") {
              const instKey = `${inst.category}_${idx}`;
              const instValue = parseFloat(
                newData[section][instKey]?.[inst.subcategory]?.[year] || 0
              );
              grandTotal += instValue;
            }
          });

          const totalSubcategory = institutionStructure[osszsenKey].subcategory;
          if (
            newData[section][totalKey] &&
            newData[section][totalKey][totalSubcategory]
          ) {
            newData[section][totalKey][totalSubcategory][year] =
              grandTotal.toString();
          }
        }

        // Recalculate percentages for updated totals
        [szakiranyName, currentInstitution?.subcategory].forEach((itemKey) => {
          if (itemKey && newData.percentage[institutionKey]?.[itemKey]) {
            const contractVal = parseFloat(
              newData.contract_students[institutionKey]?.[itemKey]?.[year] || 0
            );
            const totalVal = parseFloat(
              newData.total_students[institutionKey]?.[itemKey]?.[year] || 0
            );

            if (totalVal > 0) {
              const percentage = Math.round((contractVal / totalVal) * 100);
              newData.percentage[institutionKey][itemKey][year] =
                percentage.toString();
            } else {
              newData.percentage[institutionKey][itemKey][year] = "0";
            }
          }
        });

        // Update "összesen" percentage if needed
        if (osszsenKey >= 0) {
          const totalKey = `összesen_${osszsenKey}`;
          const totalSubcategory = institutionStructure[osszsenKey].subcategory;

          if (newData.percentage[totalKey]?.[totalSubcategory]) {
            const contractVal = parseFloat(
              newData.contract_students[totalKey]?.[totalSubcategory]?.[year] ||
                0
            );
            const totalVal = parseFloat(
              newData.total_students[totalKey]?.[totalSubcategory]?.[year] || 0
            );

            if (totalVal > 0) {
              const percentage = Math.round((contractVal / totalVal) * 100);
              newData.percentage[totalKey][totalSubcategory][year] =
                percentage.toString();
            } else {
              newData.percentage[totalKey][totalSubcategory][year] = "0";
            }
          }
        }
      }

      return newData;
    });

    setIsModified(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let savedCount = 0;
      let updatedCount = 0;

      console.log("🔍 DEBUG: Starting save process");
      console.log("🔍 DEBUG: szmszData available:", szmszData);

      // Convert szakképzésiData to API format and save/update
      for (const [institutionKey, institutionData] of Object.entries(
        szakképzésiData.total_students
      )) {
        for (const [itemKey, yearData] of Object.entries(institutionData)) {
          // ONLY PROCESS SPECIALIZATIONS (uniqueSpecKey format with underscores)
          // Skip subcategories and szakirany-level data since they're not editable
          if (!itemKey.includes("_") || itemKey.split("_").length < 3) {
            console.log(
              `🔍 DEBUG: Skipping non-specialization data: ${itemKey}`
            );
            continue; // Skip subcategories and szakirany-level data
          }

          for (const [year, totalValue] of Object.entries(yearData)) {
            const contractValue =
              szakképzésiData.contract_students[institutionKey]?.[itemKey]?.[
                year
              ] || "0";

            // Only save if there's actual data
            if (parseFloat(totalValue) > 0 || parseFloat(contractValue) > 0) {
              console.log(
                `🔍 DEBUG: Processing specialization record - institutionKey: ${institutionKey}, itemKey: ${itemKey}, year: ${year}, yearData: ${JSON.stringify(
                  yearData
                )}`
              );

              // Extract szakma from institution key
              const [szakmaFromInst] = institutionKey.split("_");

              const parts = itemKey.split("_");
              const szakiranyNev = parts[0];
              const rawSzakmaNev = parts.slice(2).join("_");

              // Handle "Nincs meghatározva" case - save as null in database
              const szakmaNev =
                rawSzakmaNev === "Nincs meghatározva" ? null : rawSzakmaNev;

              const yearStart = parseInt(year.split("/")[0]);

              console.log(`🔍 DEBUG: Extracted data:`);
              console.log(`  - szakmaFromInst: ${szakmaFromInst}`);
              console.log(`  - szakiranyNev: ${szakiranyNev}`);
              console.log(`  - rawSzakmaNev: ${rawSzakmaNev}`);
              console.log(`  - szakmaNev (for DB): ${szakmaNev}`);
              console.log(`  - yearStart: ${yearStart}`);

              // Enhanced debugging for szmszData structure
              console.log(`🔍 DEBUG: Available szmszData:`, szmszData);
              if (szmszData && szmszData.length > 0) {
                console.log(`🔍 DEBUG: First record structure:`, szmszData[0]);
                console.log(
                  `🔍 DEBUG: All record keys:`,
                  Object.keys(szmszData[0])
                );
              }

              // Check if a record already exists for this combination
              const existingRecord = szmszData?.find((record) => {
                // Try multiple possible field name variations for API fields
                const recordSzakma =
                  record.szakmaNev ||
                  record.szakma?.nev ||
                  record.szakma ||
                  record.szakkepzes_nev;
                const recordSzakirany =
                  record.szakiranyNev ||
                  record.szakirany?.nev ||
                  record.szakirany;

                // Handle null matching for "Nincs meghatározva" cases
                let szakmaMatch;
                if (szakmaNev === null) {
                  // Looking for null/undefined records
                  szakmaMatch =
                    !recordSzakma ||
                    recordSzakma === null ||
                    recordSzakma === undefined;
                } else {
                  // Looking for exact match
                  szakmaMatch = recordSzakma === szakmaNev;
                }

                const szakiranyMatch = recordSzakirany === szakiranyNev;
                const yearMatch = record.tanev_kezdete === yearStart;

                console.log(`🔍 DEBUG: Checking record ${record.id}:`);
                console.log(`  - available fields:`, Object.keys(record));
                console.log(
                  `  - recordSzakma: "${recordSzakma}" vs szakmaNev: "${szakmaNev}" -> ${szakmaMatch}`
                );
                console.log(
                  `  - recordSzakirany: "${recordSzakirany}" vs szakiranyNev: "${szakiranyNev}" -> ${szakiranyMatch}`
                );
                console.log(
                  `  - year match: ${record.tanev_kezdete} === ${yearStart} -> ${yearMatch}`
                );

                return szakmaMatch && szakiranyMatch && yearMatch;
              });

              console.log(
                `🔍 DEBUG: Found existing record:`,
                existingRecord ? `ID ${existingRecord.id}` : "none"
              );

              const recordData = {
                alapadatok_id: selectedSchool?.id,
                tanev_kezdete: yearStart,
                szakiranyNev: szakiranyNev,
                szakmaNev: szakmaNev, // Add specialization name
                tanulok_osszeletszam: parseInt(totalValue) || 0,
                munkaszerzodeses_tanulok_szama: parseInt(contractValue) || 0,
              };

              console.log(`🔍 DEBUG: Record data to save:`, recordData);

              try {
                if (existingRecord) {
                  // Update existing record
                  await updateSZMSZ({
                    id: existingRecord.id,
                    ...recordData,
                  }).unwrap();
                  updatedCount++;
                  console.log(
                    `Updated SZMSZ record for ${rawSzakmaNev} - ${szakiranyNev} - ${year}`
                  );
                } else {
                  // Create new record
                  await addSZMSZ(recordData).unwrap();
                  savedCount++;
                  console.log(
                    `Created new SZMSZ record for ${rawSzakmaNev} - ${szakiranyNev} - ${year}`
                  );
                }
              } catch (recordError) {
                console.error(
                  `Error saving SZMSZ record for ${rawSzakmaNev} - ${szakiranyNev} - ${year}:`,
                  recordError
                );
                throw recordError; // Re-throw to be caught by outer catch
              }
            }
          }
        }
      }

      setSavedData(JSON.parse(JSON.stringify(szakképzésiData)));
      setIsModified(false);
      console.log(
        `Successfully saved ${savedCount} new SZMSZ records and updated ${updatedCount} existing records`
      );

      // Show success snackbar
      setSnackbarMessage(
        `Sikeresen mentve: ${savedCount} új rekord és ${updatedCount} frissített rekord`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving SZMSZ data:", error);
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

                  // Build all items in order: subcategory, then szakiranyok and their specializations
                  const allItems = [
                    {
                      type: "subcategory",
                      displayName: institution.subcategory,
                      dataKey: institution.subcategory,
                    },
                  ];

                  if (
                    institution.szakiranyok &&
                    institution.szakiranyok.length > 0
                  ) {
                    institution.szakiranyok.forEach((szakirany) => {
                      // Add szakirany itself
                      allItems.push({
                        type: "szakirany",
                        displayName: szakirany.name,
                        dataKey: szakirany.name,
                      });

                      // Add specializations with unique keys
                      szakirany.specializations.forEach((spec, specIndex) => {
                        const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                        allItems.push({
                          type: "specialization",
                          displayName: spec,
                          dataKey: uniqueSpecKey,
                        });
                      });
                    });
                  }

                  return allItems.map((itemObj, itemIndex) => {
                    // Determine the item type and styling
                    const isSubcategory = itemObj.type === "subcategory";
                    const isSzakirany = itemObj.type === "szakirany";
                    const isSpecialization = itemObj.type === "specialization";

                    let backgroundColor = "#f9f9f9";
                    let fontWeight = "normal";
                    let fontSize = "0.8rem";
                    let paddingLeft = "8px";

                    if (isSubcategory) {
                      backgroundColor = "#fff3e0";
                      fontWeight = "bold";
                      fontSize = "0.9rem";
                    } else if (isSzakirany) {
                      backgroundColor = "#e8f5e8";
                      fontWeight = "600";
                      fontSize = "0.85rem";
                      paddingLeft = "16px";
                    } else if (isSpecialization) {
                      backgroundColor = "#f0f8ff";
                      fontWeight = "normal";
                      fontSize = "0.8rem";
                      paddingLeft = "24px";
                    }

                    // Create unique key by including item index to avoid duplicates
                    const uniqueKey = `${institutionKey}-${itemIndex}-${itemObj.dataKey}`;

                    return (
                      <TableRow key={uniqueKey} sx={{ backgroundColor }}>
                        {itemIndex === 0 && (
                          <TableCell
                            rowSpan={allItems.length}
                            sx={{
                              fontWeight: "bold",
                              textAlign: "left",
                              backgroundColor: "#f5f5f5",
                              verticalAlign: "middle",
                            }}
                          >
                            {institution.category}
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            fontWeight,
                            fontSize,
                            textAlign: "left",
                            backgroundColor,
                            paddingLeft,
                          }}
                        >
                          {itemObj.displayName}
                        </TableCell>
                        {schoolYears.map((year) => (
                          <TableCell key={year} align="center">
                            <TextField
                              type="number"
                              value={
                                szakképzésiData[dataKey][institutionKey]?.[
                                  itemObj.dataKey
                                ]?.[year] || "0"
                              }
                              onChange={(e) =>
                                dataKey === "percentage" ||
                                itemObj.type === "subcategory" ||
                                itemObj.type === "szakirany"
                                  ? null // Make percentage table, subcategories, and szakirany read-only
                                  : handleDataChangeWithCalculation(
                                      dataKey,
                                      institutionKey,
                                      itemObj.dataKey,
                                      year,
                                      e.target.value
                                    )
                              }
                              size="small"
                              disabled={
                                dataKey === "percentage" ||
                                itemObj.type === "subcategory" ||
                                itemObj.type === "szakirany"
                              } // Disable percentage inputs, subcategories, and szakirany
                              inputProps={{
                                min: 0,
                                max: dataKey === "percentage" ? 100 : undefined,
                                step: dataKey === "percentage" ? 1 : 1,
                                style: { textAlign: "center" },
                                readOnly:
                                  dataKey === "percentage" ||
                                  itemObj.type === "subcategory" ||
                                  itemObj.type === "szakirany", // Make percentage, subcategories, and szakirany read-only
                              }}
                              sx={{
                                width: "80px",
                                "& .MuiInputBase-input.Mui-disabled": {
                                  color: "#666", // Make disabled text more visible
                                  WebkitTextFillColor: "#666",
                                },
                                "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#e0e0e0", // Lighter border for disabled state
                                  },
                              }}
                              placeholder={
                                dataKey === "percentage"
                                  ? "auto"
                                  : itemObj.type === "subcategory" ||
                                    itemObj.type === "szakirany"
                                  ? "total"
                                  : dataKey === "contract_students"
                                  ? "0"
                                  : "0"
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  });
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
        "szakképzési munkaszerződéssel rendelkezők aránya (%) - AUTOMATIKUSAN SZÁMÍTOTT",
        "%",
        "#ffebee"
      )}
      {/* Contract Students Count Table */}
      {renderTableSection(
        "contract_students",
        "szakképzési munkaszerződéssel rendelkező tanulók száma (tanulói jogviszony) (fő) - SZERKESZTHETŐ",
        "fő",
        "#e3f2fd"
      )}
      {/* Total Students Table */}
      {renderTableSection(
        "total_students",
        "szakirányú oktatásban részt vevő tanulók összlétszáma (tanulói jogviszony) (fő) - SZERKESZTHETŐ",
        "fő",
        "#e8f5e8"
      )}
      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
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
          disabled={
            !isModified || !savedData || isUpdating || isAdding || isSaving
          }
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
  );
}
