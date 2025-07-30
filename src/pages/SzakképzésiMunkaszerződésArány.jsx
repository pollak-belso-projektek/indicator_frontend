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
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import { useGetTanugyiAdatokQuery } from "../store/api/apiSlice";
import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../store/slices/authSlice";

export default function SzakképzésiMunkaszerződésArány() {
  const schoolYears = generateSchoolYears();

  const selectedSchool = useSelector(selectSelectedSchool);

  const { data, error, isLoading } = useGetTanugyiAdatokQuery({
    alapadatok_id: selectedSchool?.id,
    ev: 2024,
  });

  console.log("API Data:", data);
  console.log("Is Loading:", isLoading);
  console.log("Error:", error);

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

  // Use useEffect to calculate data when API data becomes available
  useEffect(() => {
    console.log(
      "useEffect triggered - data:",
      data?.length,
      "institutionStructure:",
      institutionStructure.length,
      "hasInitializedFromAPI:",
      hasInitializedFromAPI,
      "isModified:",
      isModified
    );

    // Only initialize from API if we haven't done it yet and user hasn't made changes
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      !hasInitializedFromAPI &&
      !isModified
    ) {
      console.log("Calculating data from API...");

      // Function to calculate data from API response
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

        // Calculate actual numbers from API data
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
                      const studentAgazat = student.uj_Szkt_agazat_tipusa || "";
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

                      specTotalStudents = studentsWithoutSpecificSzakma.length;
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
                      const studentAgazat = student.uj_Szkt_agazat_tipusa || "";
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

                      specTotalStudents = studentsWithoutSpecificSzakma.length;
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

        // Calculate percentages
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
      {/* Vocational Training Information
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
      </Card>{" "}
      */}
    </Box>
  );
}
