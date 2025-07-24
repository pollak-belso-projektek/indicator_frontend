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
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";

export default function ElhelyezkedesimMutato() {
  const schoolYears = ["2020/2021", "2021/2022", "2022/2023", "2023/2024"];

  const institutionTypes = [
    {
      key: "technikum_szakkepezo",
      label: "technikum+szakképző iskola",
      subTypes: [
        { key: "ebbol_technikum", label: "ebből: technikum" },
        { key: "szakmankent_1", label: "szakmánként" },
        { key: "szakmankent_2", label: "szakmánként" },
      ],
    },
    {
      key: "szakkepezo_iskola",
      label: "ebből: szakképző iskola",
      subTypes: [
        { key: "szakmankent_3", label: "szakmánként" },
        { key: "szakmankent_4", label: "szakmánként" },
        { key: "szakmankent_5", label: "szakmánként" },
      ],
    },
  ];

  const dataCategories = [
    {
      key: "szakmai_okatasban_vegzettek_aranya",
      label: "szakmai oktatásban végzettek elhelyezkedési aránya (%)",
      color: "#fff2cc",
    },
    {
      key: "elhelyezkedok_szama",
      label: "elhelyezkedők száma (fő)",
      color: "#d5e8d4",
    },
    {
      key: "szakmai_okatasban_sikeresen_vegzettek_szama",
      label: "szakmai oktatásban sikeresen végzettek száma (fő)",
      color: "#e8f4fd",
    },
  ];

  // Initialize data structure
  const [employmentData, setEmploymentData] = useState(() => {
    const initialData = {};

    // Initialize "összesen" row
    initialData["osszesen"] = {};
    dataCategories.forEach((category) => {
      initialData["osszesen"][category.key] = {};
      schoolYears.forEach((year) => {
        initialData["osszesen"][category.key][year] = "0";
      });
    });

    // Initialize institution type rows
    institutionTypes.forEach((instType) => {
      // Main institution type
      initialData[instType.key] = {};
      dataCategories.forEach((category) => {
        initialData[instType.key][category.key] = {};
        schoolYears.forEach((year) => {
          initialData[instType.key][category.key][year] = "0";
        });
      });

      // Sub types (szakmánként rows)
      instType.subTypes.forEach((subType) => {
        initialData[subType.key] = {};
        dataCategories.forEach((category) => {
          initialData[subType.key][category.key] = {};
          schoolYears.forEach((year) => {
            initialData[subType.key][category.key][year] = "0";
          });
        });
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (rowKey, category, year, value) => {
    setEmploymentData((prev) => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [category]: {
          ...prev[rowKey][category],
          [year]: value,
        },
      },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(employmentData)));
    setIsModified(false);
    console.log("Saving employment data:", employmentData);
  };

  const handleReset = () => {
    if (savedData) {
      setEmploymentData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  // Helper function to get row label
  const getRowLabel = (rowKey) => {
    if (rowKey === "osszesen") return "összesen";

    const instType = institutionTypes.find((type) => type.key === rowKey);
    if (instType) return instType.label;

    // Check subtypes
    for (const instType of institutionTypes) {
      const subType = instType.subTypes.find((sub) => sub.key === rowKey);
      if (subType) return subType.label;
    }

    return rowKey;
  };

  // Get all row keys in order
  const getAllRowKeys = () => {
    const rowKeys = ["osszesen"];

    institutionTypes.forEach((instType) => {
      rowKeys.push(instType.key);
      instType.subTypes.forEach((subType) => {
        rowKeys.push(subType.key);
      });
    });

    return rowKeys;
  };

  const allRowKeys = getAllRowKeys();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        9. Elhelyezkedési mutató
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A szakmai oktatásban tanulói jogviszonyban sikeresen végzettek
        elhelyezkedési aránya.
      </Typography>

      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Elhelyezkedők kell tekinteni mindazokat, akik:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography variant="body2">
                szakképző iskolában végzettek és érettségire felkészítő
                képzésben tanultak tovább,
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                technikumban végzettek és felsőoktatásban tanultak tovább,
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                szakképző iskolában vagy technikumban végzettek és másodiku vagy
                további szakképesítés megszerzésért tanultak tovább,
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                szakképző iskolában vagy technikumban végzettek és a sikeresen
                befejezett szakmai oktatásban sikeresen megszerzett szakmai
                végzettségüknek megfelelő munkakörben helyezkedtek el,
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                szakképző iskolában vagy technikumban végzettek, akik egyéb
                módon helyezkedtek el.
              </Typography>
            </li>
          </Box>

          <Box
            sx={{ mt: 3, p: 2, backgroundColor: "#fff2cc", borderRadius: 1 }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              <strong>Számítási módszer:</strong>
              <br />
              Szakmai oktatásban tanulói jogviszonyban végzett elhelyezkedési
              száma / Szakmai oktatásban tanulói jogviszonyban sikeresen
              végzettek száma × 100
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Elhelyezkedési adatok intézménytípusonként
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      minWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    Intézménytípusonként
                  </TableCell>
                  {dataCategories.map((category) => (
                    <TableCell
                      key={category.key}
                      colSpan={schoolYears.length}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 300,
                        backgroundColor: category.color,
                        fontSize: "0.8rem",
                      }}
                    >
                      {category.label}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {dataCategories.map((category) =>
                    schoolYears.map((year) => (
                      <TableCell
                        key={`${category.key}-${year}`}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          minWidth: 80,
                          backgroundColor: category.color,
                          fontSize: "0.75rem",
                        }}
                      >
                        {year}
                      </TableCell>
                    ))
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {allRowKeys.map((rowKey, index) => {
                  const isMainRow =
                    rowKey === "osszesen" ||
                    institutionTypes.some((type) => type.key === rowKey);
                  const isSubRow = !isMainRow;

                  return (
                    <TableRow
                      key={rowKey}
                      sx={{
                        backgroundColor:
                          rowKey === "osszesen"
                            ? "#fff2cc"
                            : isMainRow
                            ? "#f0f8ff"
                            : "#f9f9f9",
                        "&:hover": {
                          backgroundColor:
                            rowKey === "osszesen"
                              ? "#ffe6b3"
                              : isMainRow
                              ? "#e6f3ff"
                              : "#f0f0f0",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: isMainRow ? "bold" : "medium",
                          pl: isSubRow ? 4 : 2,
                          textAlign: "left",
                        }}
                      >
                        {getRowLabel(rowKey)}
                      </TableCell>
                      {dataCategories.map((category) =>
                        schoolYears.map((year) => (
                          <TableCell
                            key={`${category.key}-${year}`}
                            align="center"
                            sx={{ backgroundColor: category.color + "40" }}
                          >
                            <TextField
                              type="number"
                              value={
                                employmentData[rowKey]?.[category.key]?.[
                                  year
                                ] || "0"
                              }
                              onChange={(e) =>
                                handleDataChange(
                                  rowKey,
                                  category.key,
                                  year,
                                  e.target.value
                                )
                              }
                              size="small"
                              inputProps={{
                                min: 0,
                                max: category.key.includes("aranya")
                                  ? 100
                                  : undefined,
                                step: category.key.includes("aranya")
                                  ? 0.01
                                  : 1,
                                style: { textAlign: "center" },
                              }}
                              sx={{ width: "70px" }}
                            />
                          </TableCell>
                        ))
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

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
        </CardContent>
      </Card>

      {/* Legend */}
      <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Jelmagyarázat
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
            {dataCategories.map((category) => (
              <Chip
                key={category.key}
                label={category.label}
                variant="outlined"
                sx={{ backgroundColor: category.color }}
              />
            ))}
          </Stack>
          <Typography variant="body2">
            A táblázat az elhelyezkedési mutatókat jeleníti meg
            intézménytípusonként és tanévenként. Az arányok százalékban, a
            létszámok főben értendők.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
