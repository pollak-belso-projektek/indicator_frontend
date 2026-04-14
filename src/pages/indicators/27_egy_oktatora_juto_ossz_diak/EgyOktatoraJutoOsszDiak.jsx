import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
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
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography
} from "@mui/material";
import { Save as SaveIcon, RestartAlt as RestartAltIcon } from "@mui/icons-material";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import {
  useGetAllAlapadatokQuery,
  useGetEgyOktatoraJutoTanuloByAlapadatokQuery,
  useAddEgyOktatoraJutoTanuloMutation,
  useUpdateEgyOktatoraJutoTanuloMutation,
  useGetTanugyiAdatokQuery,
  useGetAlkalmazottAdatokQuery
} from "../../../store/api/apiSlice";
import { generateSchoolYears, getCurrentSchoolYear } from "../../../utils/schoolYears";
import PageWrapper from "../../PageWrapper";
import InfoEgyOktatoraJutoOsszDiak from "./info_egy_oktatora_juto_ossz_diak";
import TitleEgyOktatoraJutoOsszDiak from "./title_egy_oktatora_juto_ossz_diak";

const evszamok = generateSchoolYears();

export default function EgyOktatoraJutoOsszDiak() {
  const selectedSchool = useSelector(selectSelectedSchool);
  const { data: schoolsData } = useGetAllAlapadatokQuery();

  const [selectedYear, setSelectedYear] = useState(getCurrentSchoolYear());
  const [tableData, setTableData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSaving, setIsSaving] = useState(false);

  const [addEgyOktatora] = useAddEgyOktatoraJutoTanuloMutation();
  const [updateEgyOktatora] = useUpdateEgyOktatoraJutoTanuloMutation();

  const formattedYear = selectedYear ? parseInt(selectedYear.split('/')[0]) : new Date().getFullYear();

  // Fetch saved data
  const { data: egyOktatoraData, isFetching: isEgyOktatoraFetching } = useGetEgyOktatoraJutoTanuloByAlapadatokQuery(
    { alapadatok_id: selectedSchool?.id, year: formattedYear },
    { skip: !selectedSchool || !selectedYear }
  );

  // Fetch Tanügyi adatok (student data)
  const { data: tanugyiData } = useGetTanugyiAdatokQuery(
    { alapadatok_id: selectedSchool?.id, ev: formattedYear },
    { skip: !selectedSchool || !selectedYear }
  );

  // Fetch Alkalmazott adatok (teacher/staff data)
  const { data: alkalmazottData } = useGetAlkalmazottAdatokQuery(
    { alapadatok_id: selectedSchool?.id, tanev_kezdete: formattedYear },
    { skip: !selectedSchool || !selectedYear }
  );

  // Count students from Tanügyi adatok (only for selected year)
  const studentCount = useMemo(() => {
    if (!tanugyiData || !Array.isArray(tanugyiData)) return 0;
    return tanugyiData.filter(s => s.tanev_kezdete === formattedYear).length;
  }, [tanugyiData, formattedYear]);

  // Count teachers from Alkalmazott adatok
  const teacherCount = useMemo(() => {
    if (!alkalmazottData || !Array.isArray(alkalmazottData)) return 0;
    return alkalmazottData.filter(a => a.TanevKezdete === formattedYear).length;
  }, [alkalmazottData, formattedYear]);

  // Calculate ratio
  const calculatedRatio = useMemo(() => {
    if (teacherCount === 0) return 0;
    return parseFloat((studentCount / teacherCount).toFixed(2));
  }, [studentCount, teacherCount]);

  // Populate table from fetched data
  useEffect(() => {
    if (egyOktatoraData && !isEgyOktatoraFetching) {
      const formattedData = {};
      const originalFormattedData = {};

      formattedData[selectedYear] = { id: null, letszam: "" };
      originalFormattedData[selectedYear] = { id: null, letszam: "" };

      if (Array.isArray(egyOktatoraData)) {
        egyOktatoraData.forEach(item => {
          if (item.tanev_kezdete !== formattedYear) return;
          formattedData[selectedYear] = { id: item.id, letszam: parseFloat(item.letszam) || "" };
          originalFormattedData[selectedYear] = { id: item.id, letszam: parseFloat(item.letszam) || "" };
        });
      }

      setTableData(prev => ({ ...prev, [selectedYear]: formattedData[selectedYear] }));
      setOriginalData(prev => ({ ...prev, [selectedYear]: originalFormattedData[selectedYear] }));
      setIsModified(false);
    }
  }, [egyOktatoraData, isEgyOktatoraFetching, selectedYear, formattedYear]);

  const handleReset = () => {
    setTableData(prev => ({
      ...prev,
      [selectedYear]: originalData[selectedYear] ? JSON.parse(JSON.stringify(originalData[selectedYear])) : { id: null, letszam: "" }
    }));
    setIsModified(false);
  };

  const handleDataChange = (value) => {
    if (value && isNaN(value)) return;
    setTableData(prev => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        letszam: value === "" ? "" : parseFloat(value)
      }
    }));
    setIsModified(true);
  };

  const isFieldModified = () => {
    const orig = originalData[selectedYear]?.letszam ?? "";
    const curr = tableData[selectedYear]?.letszam ?? "";
    return orig !== curr;
  };

  const handleSaveData = async () => {
    setIsSaving(true);
    try {
      const yearPrefix = parseInt(selectedYear.split('/')[0]);
      const id = originalData[selectedYear]?.id;
      const letszam = tableData[selectedYear]?.letszam || calculatedRatio;

      const recordData = {
        alapadatok_id: selectedSchool.id,
        tanev_kezdete: yearPrefix,
        letszam: letszam
      };

      if (id) {
        await updateEgyOktatora({ id, ...recordData }).unwrap();
        setSnackbarMessage("Sikeresen frissítve!");
      } else {
        await addEgyOktatora(recordData).unwrap();
        setSnackbarMessage("Sikeresen mentve!");
      }

      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOriginalData(JSON.parse(JSON.stringify(tableData)));
      setIsModified(false);
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      setSnackbarMessage(error?.data?.message || error?.message || "Hiba történt a mentés során");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const headerSx = {
    fontWeight: "bold",
    backgroundColor: "#60a5fa",
    color: "#000",
    textAlign: "center",
    border: "1px solid #000"
  };

  const subHeaderSx = {
    fontWeight: "bold",
    backgroundColor: "#fcd34d",
    color: "#000",
    textAlign: "center",
    border: "1px solid #000",
    p: 1
  };

  const cellSx = {
    border: "1px solid #000",
    p: 1
  };

  return (
    <PageWrapper
      titleContent={<TitleEgyOktatoraJutoOsszDiak />}
      infoContent={<InfoEgyOktatoraJutoOsszDiak />}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Válasszon tanévet</InputLabel>
            <Select
              value={selectedYear}
              label="Válasszon tanévet"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {evszamok.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={!isModified}
            >
              Visszaállítás
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveData}
              disabled={isSaving || !selectedSchool}
            >
              {isSaving ? "Mentés..." : "Mentés"}
            </Button>
          </Stack>
          {isModified && (
            <Alert severity="warning" sx={{ py: 0 }}>Módosítás történt!</Alert>
          )}
        </Stack>

        {!selectedSchool && (
          <Alert severity="info" sx={{ mb: 2 }}>Kérjük, válasszon intézményt!</Alert>
        )}

        <TableContainer component={Paper} sx={{ border: "1px solid #000" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headerSx} rowSpan={2}>Megnevezés</TableCell>
                <TableCell sx={headerSx} colSpan={1}>
                  {selectedYear || ""}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={subHeaderSx}>Érték</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Row 1: Tanulói létszám (from Tanügyi adatok) */}
              <TableRow>
                <TableCell sx={{ ...cellSx, fontWeight: "bold", backgroundColor: "#e0f2fe" }}>
                  Tanulói létszám összesen (Tanügyi adatokból)
                </TableCell>
                <TableCell sx={{ ...cellSx, textAlign: "right", backgroundColor: "#f0f9ff" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {studentCount} fő
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Row 2: Oktatói létszám (from Alkalmazottak) */}
              <TableRow>
                <TableCell sx={{ ...cellSx, fontWeight: "bold", backgroundColor: "#e0f2fe" }}>
                  Oktatói létszám összesen (Alkalmazott adatokból)
                </TableCell>
                <TableCell sx={{ ...cellSx, textAlign: "right", backgroundColor: "#f0f9ff" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {teacherCount} fő
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Row 3: Calculated ratio */}
              <TableRow>
                <TableCell sx={{ ...cellSx, fontWeight: "bold", backgroundColor: "#dcfce7" }}>
                  Egy oktatóra jutó össz diák (számított)
                </TableCell>
                <TableCell sx={{ ...cellSx, textAlign: "right", backgroundColor: "#f0fdf4" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#16a34a" }}>
                    {calculatedRatio}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Row 4: Manually overrideable value (saved to DB) */}
              <TableRow>
                <TableCell sx={{ ...cellSx, fontWeight: "bold", backgroundColor: "#fef9c3" }}>
                  Egy oktatóra jutó össz diák (mentett érték)
                </TableCell>
                <TableCell sx={cellSx}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={tableData[selectedYear]?.letszam ?? ""}
                    onChange={(e) => handleDataChange(e.target.value)}
                    placeholder={String(calculatedRatio)}
                    sx={{
                      '& input': {
                        textAlign: 'right',
                        p: 1,
                        backgroundColor: isFieldModified() ? '#fef08a' : 'inherit'
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </PageWrapper>
  );
}
