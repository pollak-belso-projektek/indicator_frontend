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

  const { data } = useGetTanugyiAdatokQuery({
    alapadatok_id: selectedSchool?.id,
    ev: 2024,
  });

  const { data: szmszData } = useGetAllSZMSZQuery({
    alapadatok_id: selectedSchool?.id,
    tanev: 2024,
  });

  const [addSZMSZ, { isLoading: isAdding }] = useAddSZMSZMutation();
  const [updateSZMSZ, { isLoading: isUpdating }] = useUpdateSZMSZMutation();

  function szakiranyok_szakmak(tipus) {
    return (
      selectedSchool?.alapadatok_szakirany
        ?.map((szakiranyok) => {
          const specializations =
            szakiranyok?.szakirany?.szakma
              ?.filter(
                (item) =>
                  item.szakma.tipus === tipus &&
                  selectedSchool?.alapadatok_szakma.some(
                    (item2) => item2.szakma.nev === item.szakma.nev
                  )
              )
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
  }

  // Define the institution types and specializations based on the attachment
  const institutionStructure = [
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
  });

  // Initialize data structure for the three main sections with empty data first
  const [szakképzésiData, setSzakképzésiData] = useState(() => {
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

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [hasInitializedFromAPI, setHasInitializedFromAPI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Use useEffect to calculate data when API data becomes available
  useEffect(() => {
    console.log(
      "useEffect triggered - data:",
      data?.length,
      "szmszData:",
      szmszData?.length,
      "institutionStructure:",
      institutionStructure.length,
      "hasInitializedFromAPI:",
      hasInitializedFromAPI,
      "isModified:",
      isModified
    );

    // Only initialize from API if we haven't done it yet and user hasn't made changes
    if (
      ((szmszData && Array.isArray(szmszData) && szmszData.length > 0) ||
        (data && Array.isArray(data) && data.length > 0)) &&
      !hasInitializedFromAPI &&
      !isModified
    ) {
      console.log("Calculating data from API...");

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

          // Process SZMSZ data
          schoolYears.forEach((schoolYear) => {
            const yearStart = parseInt(schoolYear.split("/")[0]);

            // Filter SZMSZ data for this school year
            const szmszForYear = szmszData.filter(
              (record) => record.tanev_kezdete === yearStart
            );

            institutionStructure.forEach((institution, institutionIndex) => {
              const key = `${institution.category}_${institutionIndex}`;

              if (institution.category === "összesen") {
                // Calculate totals for all institution types from SZMSZ data
                let totalContractStudents = 0;
                let totalStudents = 0;

                szmszForYear.forEach((record) => {
                  if (
                    record.szakma?.tipus === "Technikum" ||
                    record.szakma?.tipus === "Szakképző iskola"
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

                    szakirany.specializations.forEach((spec, specIndex) => {
                      const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                      let specContractStudents = 0;
                      let specTotalStudents = 0;

                      if (spec === "Nincs meghatározva") {
                        // For "Nincs meghatározva", sum all records for this szakirany that don't match other specs
                        const szakiranyRecords = szmszForYear.filter(
                          (record) =>
                            record.szakma?.tipus === "Technikum" &&
                            record.szakirany?.nev === szakirany.name
                        );

                        const matchedSpecs = new Set();
                        szakirany.specializations
                          .slice(0, -1)
                          .forEach((otherSpec) => {
                            szakiranyRecords.forEach((record) => {
                              if (record.szakma?.nev === otherSpec) {
                                matchedSpecs.add(record.szakma.nev);
                              }
                            });
                          });

                        szakiranyRecords.forEach((record) => {
                          if (!matchedSpecs.has(record.szakma?.nev)) {
                            specTotalStudents +=
                              record.tanulok_osszeletszam || 0;
                            specContractStudents +=
                              record.munkaszerzodeses_tanulok_szama || 0;
                          }
                        });
                      } else {
                        // Find exact match for this specialization
                        const matchingRecords = szmszForYear.filter(
                          (record) =>
                            record.szakma?.tipus === "Technikum" &&
                            record.szakirany?.nev === szakirany.name &&
                            record.szakma?.nev === spec
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

                    szakirany.specializations.forEach((spec, specIndex) => {
                      const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                      let specContractStudents = 0;
                      let specTotalStudents = 0;

                      if (spec === "Nincs meghatározva") {
                        // For "Nincs meghatározva", sum all records for this szakirany that don't match other specs
                        const szakiranyRecords = szmszForYear.filter(
                          (record) =>
                            record.szakma?.tipus === "Szakképző iskola" &&
                            record.szakirany?.nev === szakirany.name
                        );

                        const matchedSpecs = new Set();
                        szakirany.specializations
                          .slice(0, -1)
                          .forEach((otherSpec) => {
                            szakiranyRecords.forEach((record) => {
                              if (record.szakma?.nev === otherSpec) {
                                matchedSpecs.add(record.szakma.nev);
                              }
                            });
                          });

                        szakiranyRecords.forEach((record) => {
                          if (!matchedSpecs.has(record.szakma?.nev)) {
                            specTotalStudents +=
                              record.tanulok_osszeletszam || 0;
                            specContractStudents +=
                              record.munkaszerzodeses_tanulok_szama || 0;
                          }
                        });
                      } else {
                        // Find exact match for this specialization
                        const matchingRecords = szmszForYear.filter(
                          (record) =>
                            record.szakma?.tipus === "Szakképző iskola" &&
                            record.szakirany?.nev === szakirany.name &&
                            record.szakma?.nev === spec
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
    }
  }, [
    data,
    szmszData,
    institutionStructure,
    schoolYears,
    hasInitializedFromAPI,
    isModified,
  ]);

  // Enhanced handle data change that triggers auto-calculation
  const handleDataChangeWithCalculation = (
    section,
    institutionKey,
    subcategory,
    year,
    value
  ) => {
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

      // Calculate totals for categories and subcategories
      institutionStructure.forEach((institution, institutionIndex) => {
        const instKey = `${institution.category}_${institutionIndex}`;

        // Calculate subcategory totals (sum of szakiranyok and specializations)
        if (institution.szakiranyok && institution.szakiranyok.length > 0) {
          let subcategoryTotal = 0;

          institution.szakiranyok.forEach((szakirany) => {
            // Calculate szakirany total (sum of its specializations only)
            let szakiranyTotal = 0;
            szakirany.specializations.forEach((spec, specIndex) => {
              const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
              const specValue = parseFloat(
                newData[section][instKey]?.[uniqueSpecKey]?.[year] || 0
              );
              szakiranyTotal += specValue;
            });

            // Update szakirany total
            if (
              newData[section][instKey] &&
              newData[section][instKey][szakirany.name]
            ) {
              newData[section][instKey][szakirany.name][year] =
                szakiranyTotal.toString();
            }

            // Add szakirany total to subcategory total
            subcategoryTotal += szakiranyTotal;
          });

          // Update subcategory total
          if (
            newData[section][instKey] &&
            newData[section][instKey][institution.subcategory]
          ) {
            newData[section][instKey][institution.subcategory][year] =
              subcategoryTotal.toString();
          }
        }

        // Calculate "összesen" total (sum of all subcategories)
        if (institution.category === "összesen") {
          let totalSum = 0;

          // Sum all other institution subcategories
          institutionStructure.forEach((otherInst, otherIndex) => {
            if (otherInst.category !== "összesen") {
              const otherKey = `${otherInst.category}_${otherIndex}`;
              const subcatValue = parseFloat(
                newData[section][otherKey]?.[otherInst.subcategory]?.[year] || 0
              );
              totalSum += subcatValue;
            }
          });

          // Update total
          if (
            newData[section][instKey] &&
            newData[section][instKey][institution.subcategory]
          ) {
            newData[section][instKey][institution.subcategory][year] =
              totalSum.toString();
          }
        }
      });

      // If we're updating contract_students or total_students, recalculate percentage
      if (section === "contract_students" || section === "total_students") {
        // Recalculate percentages for all items after totals are updated
        institutionStructure.forEach((institution, institutionIndex) => {
          const instKey = `${institution.category}_${institutionIndex}`;

          // Calculate percentage for subcategory
          const contractStudents = parseFloat(
            newData.contract_students[instKey]?.[institution.subcategory]?.[
              year
            ] || 0
          );
          const totalStudents = parseFloat(
            newData.total_students[instKey]?.[institution.subcategory]?.[
              year
            ] || 0
          );

          if (totalStudents > 0) {
            const percentage = Math.round(
              (contractStudents / totalStudents) * 100
            );
            newData.percentage[instKey][institution.subcategory][year] =
              percentage.toString();
          } else {
            newData.percentage[instKey][institution.subcategory][year] = "0";
          }

          // Calculate percentages for szakiranyok and specializations
          if (institution.szakiranyok && institution.szakiranyok.length > 0) {
            institution.szakiranyok.forEach((szakirany) => {
              // Szakirany percentage
              const szakiranyContract = parseFloat(
                newData.contract_students[instKey]?.[szakirany.name]?.[year] ||
                  0
              );
              const szakiranyTotal = parseFloat(
                newData.total_students[instKey]?.[szakirany.name]?.[year] || 0
              );

              if (szakiranyTotal > 0) {
                const szakiranyPercentage = Math.round(
                  (szakiranyContract / szakiranyTotal) * 100
                );
                newData.percentage[instKey][szakirany.name][year] =
                  szakiranyPercentage.toString();
              } else {
                newData.percentage[instKey][szakirany.name][year] = "0";
              }

              // Specialization percentages
              szakirany.specializations.forEach((spec, specIndex) => {
                const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
                const specContract = parseFloat(
                  newData.contract_students[instKey]?.[uniqueSpecKey]?.[year] ||
                    0
                );
                const specTotal = parseFloat(
                  newData.total_students[instKey]?.[uniqueSpecKey]?.[year] || 0
                );

                if (specTotal > 0) {
                  const specPercentage = Math.round(
                    (specContract / specTotal) * 100
                  );
                  newData.percentage[instKey][uniqueSpecKey][year] =
                    specPercentage.toString();
                } else {
                  newData.percentage[instKey][uniqueSpecKey][year] = "0";
                }
              });
            });
          }
        });
      }

      // Always recalculate all percentages after any change to ensure consistency
      institutionStructure.forEach((institution, institutionIndex) => {
        const instKey = `${institution.category}_${institutionIndex}`;

        // Calculate percentage for subcategory
        const subcatContract = parseFloat(
          newData.contract_students[instKey]?.[institution.subcategory]?.[
            year
          ] || 0
        );
        const subcatTotal = parseFloat(
          newData.total_students[instKey]?.[institution.subcategory]?.[year] ||
            0
        );

        if (subcatTotal > 0) {
          const subcatPercentage = Math.round(
            (subcatContract / subcatTotal) * 100
          );
          newData.percentage[instKey][institution.subcategory][year] =
            subcatPercentage.toString();
        } else {
          newData.percentage[instKey][institution.subcategory][year] = "0";
        }

        // Calculate percentages for szakiranyok and specializations
        if (institution.szakiranyok && institution.szakiranyok.length > 0) {
          institution.szakiranyok.forEach((szakirany) => {
            // Szakirany percentage
            const szakiranyContract = parseFloat(
              newData.contract_students[instKey]?.[szakirany.name]?.[year] || 0
            );
            const szakiranyTotalStudents = parseFloat(
              newData.total_students[instKey]?.[szakirany.name]?.[year] || 0
            );

            if (szakiranyTotalStudents > 0) {
              const szakiranyPercentage = Math.round(
                (szakiranyContract / szakiranyTotalStudents) * 100
              );
              newData.percentage[instKey][szakirany.name][year] =
                szakiranyPercentage.toString();
            } else {
              newData.percentage[instKey][szakirany.name][year] = "0";
            }

            // Specialization percentages
            szakirany.specializations.forEach((spec, specIndex) => {
              const uniqueSpecKey = `${szakirany.name}_${specIndex}_${spec}`;
              const specContract = parseFloat(
                newData.contract_students[instKey]?.[uniqueSpecKey]?.[year] || 0
              );
              const specTotal = parseFloat(
                newData.total_students[instKey]?.[uniqueSpecKey]?.[year] || 0
              );

              if (specTotal > 0) {
                const specPercentage = Math.round(
                  (specContract / specTotal) * 100
                );
                newData.percentage[instKey][uniqueSpecKey][year] =
                  specPercentage.toString();
              } else {
                newData.percentage[instKey][uniqueSpecKey][year] = "0";
              }
            });
          });
        }
      });

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
                `🔍 DEBUG: Processing specialization record - institutionKey: ${institutionKey}, itemKey: ${itemKey}, year: ${year}`
              );

              // Extract szakma from institution key
              const [szakmaFromInst] = institutionKey.split("_");

              // Parse uniqueSpecKey format: "Gazdasági szakirány_0_Pénzügyi-számviteli ügyintéző"
              const parts = itemKey.split("_");
              const szakiranyNev = parts[0]; // "Gazdasági szakirány"
              const szakmaNev = parts.slice(2).join("_"); // "Pénzügyi-számviteli ügyintéző"

              const yearStart = parseInt(year.split("/")[0]);

              console.log(`🔍 DEBUG: Extracted data:`);
              console.log(`  - szakmaFromInst: ${szakmaFromInst}`);
              console.log(`  - szakiranyNev: ${szakiranyNev}`);
              console.log(`  - szakmaNev: ${szakmaNev}`);
              console.log(`  - yearStart: ${yearStart}`);

              // Check if a record already exists for this combination
              const existingRecord = szmszData?.find((record) => {
                // Try both nested object and flat string formats for API fields
                const recordSzakma = record.szakma?.nev || record.szakma;
                const recordSzakirany =
                  record.szakirany?.nev || record.szakirany;
                const recordSpecialization =
                  record.szakkepzes_nev || record.specialization;

                const szakmaMatch = recordSzakma === szakmaFromInst;
                const szakiranyMatch = recordSzakirany === szakiranyNev;
                const yearMatch = record.tanev_kezdete === yearStart;
                const specMatch = recordSpecialization === szakmaNev;

                console.log(`🔍 DEBUG: Checking record ${record.id}:`);
                console.log(
                  `  - szakma match: ${recordSzakma} === ${szakmaFromInst} -> ${szakmaMatch}`
                );
                console.log(
                  `  - szakirany match: ${recordSzakirany} === ${szakiranyNev} -> ${szakiranyMatch}`
                );
                console.log(
                  `  - year match: ${record.tanev_kezdete} === ${yearStart} -> ${yearMatch}`
                );
                console.log(
                  `  - specialization match: ${recordSpecialization} === ${szakmaNev} -> ${specMatch}`
                );

                return szakmaMatch && szakiranyMatch && yearMatch && specMatch;
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

              try {
                if (existingRecord) {
                  // Update existing record
                  await updateSZMSZ({
                    id: existingRecord.id,
                    ...recordData,
                  }).unwrap();
                  updatedCount++;
                  console.log(
                    `Updated SZMSZ record for ${szakmaNev} - ${szakiranyNev} - ${year}`
                  );
                } else {
                  // Create new record
                  await addSZMSZ(recordData).unwrap();
                  savedCount++;
                  console.log(
                    `Created new SZMSZ record for ${szakmaNev} - ${szakiranyNev} - ${year}`
                  );
                }
              } catch (recordError) {
                console.error(
                  `Error saving SZMSZ record for ${szakmaNev} - ${szakiranyNev} - ${year}:`,
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
