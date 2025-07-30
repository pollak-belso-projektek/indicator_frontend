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
  useGetAllFelvettekSzamaQuery,
  useUpdateFelvettekSzamaMutation,
  useGetAllAlapadatokQuery,
} from "../../store/api/apiSlice";
import FelvettekSzamaInfo from "../../components/infos/FelvettekSzamaInfo";

const evszamok = generateSchoolYears();

const FelvettekSzama = () => {
  const selectedSchool = useSelector(selectSelectedSchool);

  // API hooks
  const {
    data: apiAdmissionData,
    error: fetchError,
    isLoading: isFetching,
  } = useGetAllFelvettekSzamaQuery();

  const { data: schoolsData, isLoading: isLoadingSchools } =
    useGetAllAlapadatokQuery();

  const [updateAdmissionData, { isLoading: isUpdating }] =
    useUpdateFelvettekSzamaMutation();

  // State for the integrated table data
  const [tableData, setTableData] = useState({});
  const [isModified, setIsModified] = useState(false);

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

  // Calculate percentage automatically (jelentkezők/felvettek arány)
  const calculatePercentage = (programType, year) => {
    const programData = tableData[programType];
    if (!programData) return "0%";

    const data = programData[year];
    if (!data || !data.felvettek_szama_9 || data.felvettek_szama_9 === 0)
      return "0%";

    const ratio = data.jelentkezok_szama_9 / data.felvettek_szama_9;
    const percentage = ratio * 100;

    // Handle special cases for display
    if (percentage === 0) return "0%";
    if (percentage < 100) return percentage.toFixed(1) + "%"; // Less than 100%
    if (percentage === 100) return "100%";

    return Math.round(percentage * 10) / 10 + "%"; // Round to 1 decimal place and add %
  };

  const handleSave = async () => {
    try {
      // Implementation for saving the structured data
      setIsModified(false);
      console.log("Saving data:", tableData);
    } catch (error) {
      console.error("Error saving admission data:", error);
    }
  };

  const handleReset = () => {
    setIsModified(false);
  };

  useEffect(() => {
    console.log(programTypes);
  }, [programTypes]);

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

      <TableContainer
        component={Paper}
        sx={{ maxWidth: "100%", overflowX: "auto" }}
      >
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
                      const data = tableData[subType]?.[startYear];
                      const hasData =
                        data &&
                        (data.jelentkezok_szama_9 > 0 ||
                          data.felvettek_szama_9 > 0);

                      return (
                        <TableCell
                          key={`jelentkezesek-${subType}-${startYear}`}
                          align="center"
                          sx={{
                            backgroundColor: "#e3f2fd20",
                            fontWeight: "bold",
                            color: hasData ? "primary.main" : "text.disabled",
                          }}
                        >
                          {hasData ? percentage : "0"}
                        </TableCell>
                      );
                    })}

                    {/* 9. évfolyamra jelentkezők száma */}
                    {evszamok.map((schoolYear) => {
                      const startYear = parseInt(schoolYear.split("/")[0]);
                      const data = tableData[subType]?.[startYear];
                      return (
                        <TableCell
                          key={`jelentkezok-${subType}-${startYear}`}
                          align="center"
                          sx={{ backgroundColor: "#f3e5f520" }}
                        >
                          <TextField
                            type="number"
                            value={data?.jelentkezok_szama_9 || 0}
                            onChange={(e) =>
                              handleDataChange(
                                subType,
                                startYear,
                                "jelentkezok_szama_9",
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

                    {/* 9. évfolyamra felvettek száma */}
                    {evszamok.map((schoolYear) => {
                      const startYear = parseInt(schoolYear.split("/")[0]);
                      const data = tableData[subType]?.[startYear];
                      return (
                        <TableCell
                          key={`felvettek-${subType}-${startYear}`}
                          align="center"
                          sx={{ backgroundColor: "#e8f5e820" }}
                        >
                          <TextField
                            type="number"
                            value={data?.felvettek_szama_9 || 0}
                            onChange={(e) =>
                              handleDataChange(
                                subType,
                                startYear,
                                "felvettek_szama_9",
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

                    {/* 9. évfolyamra felvehető létszám */}
                    {evszamok.map((schoolYear) => {
                      const startYear = parseInt(schoolYear.split("/")[0]);
                      const data = tableData[subType]?.[startYear];
                      return (
                        <TableCell
                          key={`letszam-${subType}-${startYear}`}
                          align="center"
                          sx={{ backgroundColor: "#fff3e020" }}
                        >
                          <TextField
                            type="number"
                            value={data?.felvettek_letszam_9 || 0}
                            onChange={(e) =>
                              handleDataChange(
                                subType,
                                startYear,
                                "felvettek_letszam_9",
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
          onClick={handleSave}
          disabled={!isModified || isUpdating}
        >
          {isUpdating ? "Mentés..." : "Mentés"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={!isModified || isUpdating}
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
    </Box>
  );
};

export default FelvettekSzama;
