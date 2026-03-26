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
  useGetSzakmaiTovabbkepzesekQuery,
  useAddSzakmaiTovabbkepzesMutation 
} from "../../../store/api/apiSlice";
import { generateSchoolYears } from "../../../utils/schoolYears";
import PageWrapper from "../../PageWrapper";
import InfoSzakmaiTovabbkepzesek from "./info_szakmai_tovabbkepzesek";
import TitleSzakmaiTovabbkepzesek from "./title_szakmai_tovabbkepzesek";

const evszamok = generateSchoolYears();

export default function SzakmaiTovabbkepzesek() {
  const selectedSchool = useSelector(selectSelectedSchool);
  const [selectedYear, setSelectedYear] = useState(evszamok[0]);
  
  const [tableData, setTableData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSaving, setIsSaving] = useState(false);

  const [addSzakmaiTovabbkepzes] = useAddSzakmaiTovabbkepzesMutation();

  const { data: tovabbkepzesData, isLoading: isDataLoading, isFetching } = useGetSzakmaiTovabbkepzesekQuery(
    { alapadatok_id: selectedSchool?.id, tanev: selectedYear },
    { skip: !selectedSchool || !selectedYear }
  );

  // Initialize data structure
  const initializeDataStore = () => {
    const struct = {
      oktatok_letszama: "",
      veztok_letszama: "",
      ikk_10_alatt: "",
      ikk_10: "",
      ikk_20: "",
      ikk_30: "",
      ikk_40: "",
      ikk_50: "",
      ikk_60: "",
      ikk_90: "",
      ikk_120: "",
      vallalati_tovabbkepzes: "",
      egyedi_oraszam: "",
      ujabb_diploma: "",
      alapkepesites_mesterfokozat: "",
      pedagogus_szakvizsga: "",
      egyeb_posztgradualis: "",
      forditott_osszeg: ""
    };
    return struct;
  };

  useEffect(() => {
    if (tovabbkepzesData && !isFetching) {
      let formattedData = initializeDataStore();
      
      // If we have an existing record from backend, patch our empty struct with it
      if (Array.isArray(tovabbkepzesData) && tovabbkepzesData.length > 0) {
          const apiRecord = tovabbkepzesData[0]; // Assuming one record per year usually, or map it properly
          // Note: need exact field names from backend, we will assume they match our state keys for now 
          // (or map them out here)
          formattedData = {
              id: apiRecord.id, // keep id for update logic if bulk update handles it
              oktatok_letszama: apiRecord.oktatok_letszama ?? "",
              veztok_letszama: apiRecord.veztok_letszama ?? "",
              ikk_10_alatt: apiRecord.ikk_10_alatt ?? "",
              ikk_10: apiRecord.ikk_10 ?? "",
              ikk_20: apiRecord.ikk_20 ?? "",
              ikk_30: apiRecord.ikk_30 ?? "",
              ikk_40: apiRecord.ikk_40 ?? "",
              ikk_50: apiRecord.ikk_50 ?? "",
              ikk_60: apiRecord.ikk_60 ?? "",
              ikk_90: apiRecord.ikk_90 ?? "",
              ikk_120: apiRecord.ikk_120 ?? "",
              vallalati_tovabbkepzes: apiRecord.vallalati_tovabbkepzes ?? "",
              egyedi_oraszam: apiRecord.egyedi_oraszam ?? "",
              ujabb_diploma: apiRecord.ujabb_diploma ?? "",
              alapkepesites_mesterfokozat: apiRecord.alapkepesites_mesterfokozat ?? "",
              pedagogus_szakvizsga: apiRecord.pedagogus_szakvizsga ?? "",
              egyeb_posztgradualis: apiRecord.egyeb_posztgradualis ?? "",
              forditott_osszeg: apiRecord.forditott_osszeg ?? ""
          };
      }
      
      setTableData(formattedData);
      setOriginalData(JSON.parse(JSON.stringify(formattedData)));
      setIsModified(false);
    } else if (!tovabbkepzesData && !isFetching) {
        // Init empty
        let emptyStruct = initializeDataStore();
        setTableData(emptyStruct);
        setOriginalData(JSON.parse(JSON.stringify(emptyStruct)));
        setIsModified(false);
    }
  }, [tovabbkepzesData, isFetching, selectedYear]);

  const handleReset = () => {
    setTableData(JSON.parse(JSON.stringify(originalData)));
    setIsModified(false);
  };

  const isFieldModified = (field) => {
    const orig = originalData[field] ?? "";
    const curr = tableData[field] ?? "";
    return orig !== curr;
  };

  const getFieldSx = (field) => ({
    '& input': { 
      textAlign: 'right', 
      p: 1,
      backgroundColor: isFieldModified(field) ? '#fef08a' : 'inherit'
    }
  });

  const handleDataChange = (field, value) => {
    // Validate number input or empty string
    if (value && isNaN(value)) return;

    setTableData(prev => ({
      ...prev,
      [field]: value === "" ? "" : parseFloat(value)
    }));
    setIsModified(true);
  };

  // Calculations
  const calcData = useMemo(() => {
    const getNum = (val) => val ? parseFloat(val) : 0;
    
    const fieldsToSum = [
      'veztok_letszama', 'ikk_10_alatt', 'ikk_10', 'ikk_20', 'ikk_30', 'ikk_40', 
      'ikk_50', 'ikk_60', 'ikk_90', 'ikk_120', 'vallalati_tovabbkepzes', 
      'egyedi_oraszam', 'ujabb_diploma', 'alapkepesites_mesterfokozat', 
      'pedagogus_szakvizsga', 'egyeb_posztgradualis'
    ];

    const resztvevokOsszesen = fieldsToSum.reduce((acc, field) => acc + getNum(tableData[field]), 0);
    const oktatokLetszama = getNum(tableData.oktatok_letszama);
    const forditottOsszeg = getNum(tableData.forditott_osszeg);

    const arany = oktatokLetszama > 0 ? ((resztvevokOsszesen / oktatokLetszama) * 100).toFixed(1) + '%' : '0%';
    const fKoltseg = oktatokLetszama > 0 ? Math.round(forditottOsszeg / oktatokLetszama) : 0;

    return { resztvevokOsszesen, oktatokLetszama, forditottOsszeg, arany, fKoltseg };
  }, [tableData]);

  const handleSaveData = async () => {
    setIsSaving(true);

    try {
      const payload = {
        id: tableData.id || undefined,
        alapadatok_id: selectedSchool.id,
        tanev: selectedYear,
        oktatok_letszama: tableData.oktatok_letszama === "" ? null : parseFloat(tableData.oktatok_letszama),
        veztok_letszama: tableData.veztok_letszama === "" ? null : parseFloat(tableData.veztok_letszama),
        ikk_10_alatt: tableData.ikk_10_alatt === "" ? null : parseFloat(tableData.ikk_10_alatt),
        ikk_10: tableData.ikk_10 === "" ? null : parseFloat(tableData.ikk_10),
        ikk_20: tableData.ikk_20 === "" ? null : parseFloat(tableData.ikk_20),
        ikk_30: tableData.ikk_30 === "" ? null : parseFloat(tableData.ikk_30),
        ikk_40: tableData.ikk_40 === "" ? null : parseFloat(tableData.ikk_40),
        ikk_50: tableData.ikk_50 === "" ? null : parseFloat(tableData.ikk_50),
        ikk_60: tableData.ikk_60 === "" ? null : parseFloat(tableData.ikk_60),
        ikk_90: tableData.ikk_90 === "" ? null : parseFloat(tableData.ikk_90),
        ikk_120: tableData.ikk_120 === "" ? null : parseFloat(tableData.ikk_120),
        vallalati_tovabbkepzes: tableData.vallalati_tovabbkepzes === "" ? null : parseFloat(tableData.vallalati_tovabbkepzes),
        egyedi_oraszam: tableData.egyedi_oraszam === "" ? null : parseFloat(tableData.egyedi_oraszam),
        ujabb_diploma: tableData.ujabb_diploma === "" ? null : parseFloat(tableData.ujabb_diploma),
        alapkepesites_mesterfokozat: tableData.alapkepesites_mesterfokozat === "" ? null : parseFloat(tableData.alapkepesites_mesterfokozat),
        pedagogus_szakvizsga: tableData.pedagogus_szakvizsga === "" ? null : parseFloat(tableData.pedagogus_szakvizsga),
        egyeb_posztgradualis: tableData.egyeb_posztgradualis === "" ? null : parseFloat(tableData.egyeb_posztgradualis),
        forditott_osszeg: tableData.forditott_osszeg === "" ? null : parseFloat(tableData.forditott_osszeg)
      };

      // Ensure bulk request wrapped in array for consistent generic backend handling, OR single payload depending on backend.
      // Usually simple singular add endpoint takes array for bulk or singular dict. Let's send an array containing one element as requested by bulk save.
      await addSzakmaiTovabbkepzes([payload]).unwrap();
      
      setSnackbarMessage(`Sikeresen mentve!`);
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
    fontWeight: 'bold', 
    backgroundColor: '#1976d2',
    color: '#fff',
    border: '1px solid rgba(224, 224, 224, 1)'
  };

  const cellSx = {
    border: '1px solid rgba(224, 224, 224, 1)'
  };

  const rowLabels = [
    { key: 'veztok_letszama', label: 'Vezetők létszáma' },
    { key: 'ikk_10_alatt', label: '10 óránál kevesebb', group: 'IKK által szervezett' },
    { key: 'ikk_10', label: '10 óra', group: 'IKK által szervezett' },
    { key: 'ikk_20', label: '20 óra', group: 'IKK által szervezett' },
    { key: 'ikk_30', label: '30 óra', group: 'IKK által szervezett' },
    { key: 'ikk_40', label: '40 óra', group: 'IKK által szervezett' },
    { key: 'ikk_50', label: '50 óra', group: 'IKK által szervezett' },
    { key: 'ikk_60', label: '60 óra', group: 'IKK által szervezett' },
    { key: 'ikk_90', label: '90 óra', group: 'IKK által szervezett' },
    { key: 'ikk_120', label: '120 óra', group: 'IKK által szervezett' },
    { key: 'vallalati_tovabbkepzes', label: 'vállalati továbbképzés' },
    { key: 'egyedi_oraszam', label: 'egyedi óraszám' },
    { key: 'ujabb_diploma', label: 'újabb diploma' },
    { key: 'alapkepesites_mesterfokozat', label: 'alapképesítés magasabb szintű elsajátítása-mesterfokozat' },
    { key: 'pedagogus_szakvizsga', label: 'pedagógus szakvizsga' },
    { key: 'egyeb_posztgradualis', label: 'egyéb posztgraduális' },
  ];

  return (
    <PageWrapper
      titleContent={<TitleSzakmaiTovabbkepzesek />}
      infoContent={<InfoSzakmaiTovabbkepzesek />}
      isLoading={isDataLoading}
    >
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Válasszon tanévet</InputLabel>
          <Select
            value={selectedYear}
            label="Válasszon tanévet"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
             {evszamok.map((ev) => (
                <MenuItem key={ev} value={ev}>{ev}</MenuItem>
              ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={!isModified || isSaving}
            >
              Visszállítás
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveData}
              disabled={!isModified || isSaving}
            >
              Mentés
            </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto', mt: 3, border: '2px solid #000' }}>
        <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} sx={headerSx}></TableCell>
              <TableCell align="center" sx={{ ...headerSx, width: 200 }}>{selectedYear}. október 1. (fő)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Oktatok letszama is a separate top-level input implicitly, but let's put it at the bottom as specified in Excel, or anywhere visible */}
            
            {rowLabels.map((rowItem, idx) => {
              // Group logic
              let isFirstInGroup = false;

              if (rowItem.group) {
                // Determine if it's the first element in the IKK group
                if (idx === 0 || rowLabels[idx - 1].group !== rowItem.group) {
                  isFirstInGroup = true;
                }
              }

              return (
                <TableRow key={rowItem.key}>
                   {isFirstInGroup && (
                     <TableCell rowSpan={9} sx={{ ...cellSx, width: 120, writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', fontWeight: 'bold' }}>
                       IKK által szervezett
                     </TableCell>
                   )}
                   {!rowItem.group && idx > 0 && (
                     <TableCell colSpan={1} sx={{ ...cellSx, width: 120 }} /> // Spacer if we don't need rowSpan from above
                   )}
                   {idx === 0 && (
                       <TableCell colSpan={1} sx={{ ...cellSx, width: 120, fontWeight: 'bold' }}>
                         {/* Empty for first row which is Vezetok letszama but no group */}
                       </TableCell>
                   )}

                   <TableCell sx={cellSx}>
                      {rowItem.group && <span style={{ marginLeft: 20 }}></span>} {/* Indent grouped items slightly if not using vertical text */}
                      {rowItem.label}
                      {idx === 0 && <span style={{position: 'absolute', left: 20}}>Vezetők létszáma</span>} {/* Custom handling for first line */}
                   </TableCell>

                   <TableCell align="center" sx={cellSx}>
                      <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={tableData[rowItem.key] ?? ""}
                        onChange={(e) => handleDataChange(rowItem.key, e.target.value)}
                        sx={getFieldSx(rowItem.key)}
                      />
                   </TableCell>
                </TableRow>
              );
            })}
           
            <TableRow sx={{ backgroundColor: '#fff3cd' }}>
              <TableCell colSpan={2} sx={{ ...cellSx, fontWeight: 'bold' }}>Összesen:</TableCell>
              <TableCell align="center" sx={{ ...cellSx, fontWeight: 'bold' }}>{calcData.resztvevokOsszesen || 0}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} sx={{ ...cellSx, fontWeight: 'bold' }}>Oktatók létszáma (fő):</TableCell>
              <TableCell align="center" sx={cellSx}>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={tableData.oktatok_letszama ?? ""}
                  onChange={(e) => handleDataChange('oktatok_letszama', e.target.value)}
                  sx={getFieldSx('oktatok_letszama')}
                />
              </TableCell>
            </TableRow>

            <TableRow sx={{ backgroundColor: '#f8d7da' }}>
              <TableCell colSpan={2} sx={{ ...cellSx, fontWeight: 'bold', color: '#721c24' }}>Szakmai továbbképzésen résztvevő oktatók aránya:</TableCell>
              <TableCell align="center" sx={{ ...cellSx, fontWeight: 'bold', color: '#721c24' }}>{calcData.arany}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} sx={{ ...cellSx, fontWeight: 'bold', color: '#721c24' }}>Továbbképzésre fordított összeg az intézményben (Ft):</TableCell>
              <TableCell align="center" sx={cellSx}>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={tableData.forditott_osszeg ?? ""}
                  onChange={(e) => handleDataChange('forditott_osszeg', e.target.value)}
                  sx={getFieldSx('forditott_osszeg')}
                />
              </TableCell>
            </TableRow>

            <TableRow sx={{ backgroundColor: '#fff3cd' }}>
              <TableCell colSpan={2} sx={{ ...cellSx, fontWeight: 'bold', color: '#721c24' }}>Szakmai képzésre fordított, egy főre jutó költség (Ft/fő):</TableCell>
              <TableCell align="center" sx={{ ...cellSx, fontWeight: 'bold' }}>{calcData.fKoltseg} Ft</TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'gray' }}>
        További megjegyzés: Kérjük a legördülőből válassza ki az évet. A cellák kitöltésekor a háttér sárgára vált, jelezve az el nem mentett adatokat.
      </Typography>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}
