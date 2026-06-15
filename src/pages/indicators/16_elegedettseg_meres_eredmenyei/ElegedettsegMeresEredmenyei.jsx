import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import {
  useGetElegedettsegMeresQuery,
  useAddElegedettsegMeresMutation,
  useUpdateElegedettsegMeresMutation,
} from "../../../store/api/apiSlice";
import {
  Box,
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
  Snackbar,
  Container,
  Fade,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import { generateSchoolYears } from "../../../utils/schoolYears";
import {
  useGetAllElegedettsegMeresQuery,
  useAddElegedettsegMeresMutation,
  useUpdateElegedettsegMeresMutation,
} from "../../../store/api/apiSlice";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoElegedettsegMeres from "./info_elegedettseg_meres";
import TitleElegedettsegMeres from "./title_elegedettseg_meres";

const evszamok = generateSchoolYears();

// Mapping for the exact JSON properties the backend expects
const categoryTypes = [
  { key: "szulo", label: "Szülők", color: "#e3f2fd" },
  { key: "oktato", label: "Oktatók", color: "#fff9c4" },
  { key: "tanulo", label: "Tanulók", color: "#e8f5e9" },
  { key: "dualis_kepzohely", label: "Duális képzőhelyek", color: "#f3e5f5" },
  { key: "munkaeropiaci", label: "Munkaerőpiaci szereplők", color: "#fff3e0" },
];

export default function ElegedettsegMeresEredmenyei() {
  const schoolYears = useMemo(() => generateSchoolYears(), []);
  const selectedSchool = useSelector(selectSelectedSchool);

  const stakeholderCategories = [
    {
      key: "szulo",
      dbKey: "szulok_elegedettsege",
      label: "Szülő",
      description: "Szülői elégedettség az intézmény működésével",
      color: "#e8f5e8",
    },
    {
      key: "oktato",
      dbKey: "oktatok_elegedettsege",
      label: "Oktató",
      description: "Pedagógusok elégedettsége a munkakörülményekkel",
      color: "#fff8e8",
    },
    {
      key: "tanulo",
      dbKey: "tanulok_elegedettsege",
      label: "Tanuló",
      description: "Tanulók elégedettsége az oktatással és környezettel",
      color: "#e8f2ff",
    },
    {
      key: "dualis_kepzohely",
      dbKey: "dualis_kepzohely_elegedettsege",
      label: "Duális képzőhely",
      description: "Gyakorlati képzési helyek elégedettsége",
      color: "#f8e8ff",
    },
    {
      key: "munkaeropiaci",
      dbKey: "munkaero_piac_elegedettsege",
      label: "Munkaerőpiac",
      description: "Munkaerőpiaci partnerek elégedettsége",
      color: "#e8fff8",
    },
  ];

  // One query per school year
  const elegedettsegQueries = schoolYears.map((yearRange) => {
    const startYear = parseInt(yearRange.split("/")[0]);
    return useGetElegedettsegMeresQuery(
      { alapadatok_id: selectedSchool?.id, tanev_kezdete: startYear },
      { skip: !selectedSchool }
    );
  });

  const apiData = useMemo(() => {
    return elegedettsegQueries.flatMap((q) => q.data || []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elegedettsegQueries.map((q) => q.fulfilledTimeStamp).join(","), selectedSchool?.id]);

  const isLoading = useMemo(
    () => elegedettsegQueries.some((q) => q.isLoading),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [elegedettsegQueries.map((q) => q.isLoading).join(",")]
  );
  const isFetching = useMemo(
    () => elegedettsegQueries.some((q) => q.isFetching),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [elegedettsegQueries.map((q) => q.isFetching).join(",")]
  );

  const [addElegedettseg] = useAddElegedettsegMeresMutation();
  const [updateElegedettseg] = useUpdateElegedettsegMeresMutation();

  // satisfactionData: { [stakeholderKey]: { [yearRange]: "0" } }
  const createEmpty = useCallback(() => {
    const d = {};
    stakeholderCategories.forEach((s) => {
      d[s.key] = {};
      schoolYears.forEach((y) => { d[s.key][y] = "0"; });
    });
    return d;
  }, [schoolYears]);

  const [satisfactionData, setSatisfactionData] = useState(createEmpty);
  const [originalData, setOriginalData] = useState(createEmpty);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (stakeholder, year, value) => {
    setSatisfactionData((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [categoryKey]: numValue === "" ? "" : numValue
      }
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(satisfactionData)));
    setIsModified(false);
    console.log("Saving satisfaction data:", satisfactionData);
  };

  const handleReset = () => {
    if (savedData) {
      setSatisfactionData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <PageWrapper
      titleContent={<TitleElegedettsegMeresEredmenyei />}
      infoContent={<InfoElegedettsegMeresEredmenyei />}
    >
      {/* Instructions Card */}
      <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
        <CardContent>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            Az indikátor kiszámítása: Az adott partner elégedettségének egyedi
            és átlagos százalékos értéke, amely megmutatja, hogy mennyire
            elégedett az adott témában az intézmény működésével, folyamataival.
          </Typography>

          <Box
            sx={{
              p: 2,
              backgroundColor: "#f0f8ff",
              borderRadius: 1,
              border: "1px solid #90caf9",
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              <strong>Megjegyzés:</strong> Az indikátor értelmezhető az
              intézmény egészére, ágazatonként, szakmánként.
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "#e8f5e8",
              borderRadius: 1,
              border: "1px solid #4caf50",
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              <strong>Adatforrás:</strong> Partneri elégedettségi kérdőív
              eredménye.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box>

 <LockStatusIndicator tableName="elegedettseg" sx={{mb:1}}/>
        {isModified && (
          <Alert severity="warning" sx={{mb:3}}>
            Mentetlen módosítások vannak. Ne felejtsd el menteni a
            változtatásokat!
          </Alert>
        )}
         
        {savedData && !isModified && (
          <Alert severity="success" >
            Az adatok sikeresen mentve!
          </Alert>
        )}
    
     
      

        {/* Main Data Table */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <LockedTableWrapper tableName="elegedettseg">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!isModified}
                >
                  {isSaving || isAdding || isUpdating ? "Mentés..." : "Mentés"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={!isModified || !savedData}
                >
                  Visszacsnállítás
                </Button>
              </LockedTableWrapper>
            </Stack>

            <Typography variant="h6" component="h2" gutterBottom sx={{ ml: 2 }}>
              Célcsoportok elégedettségének mérése (1-5 skála)
            </Typography>

            <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table size="medium" sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        minWidth: 200,
                        borderRight: "2px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 3,
                        verticalAlign: "middle",
                      }}
                    >
                      Célcsoport
                    </TableCell>
                    {evszamok.map((yearStr, i) => (
                      <TableCell
                        key={`${yearStr}-header`}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#fff2cc",
                          borderBottom: "1px solid #ddd",
                          borderRight: i === evszamok.length - 1 ? "none" : "1px solid #ddd",
                          minWidth: 120,
                        }}
                      >
                        {yearStr}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Data Rows */}
                  {categoryTypes.map((category) => (
                    <TableRow key={category.key} hover>
                      <TableCell
                        sx={{
                          borderRight: "2px solid #ddd",
                          position: "sticky",
                          left: 0,
                          backgroundColor: category.color,
                          zIndex: 1,
                          fontWeight: "bold"
                        }}
                      >
                        {category.label}
                      </TableCell>
                      {evszamok.map((yearStr, i) => {
                        const year = parseInt(yearStr.split("/")[0], 10);
                        return (
                          <TableCell
                            key={`${category.key}-${year}`}
                            align="center"
                            sx={{
                              borderRight: i === evszamok.length - 1 ? "none" : "1px solid #ddd",
                            }}
                          >
                            <TextField
                              type="number"
                              size="small"
                              value={tableData[year]?.[category.key] ?? ""}
                              onChange={(e) => handleDataChange(year, category.key, e.target.value)}
                              inputProps={{
                                min: 0,
                                max: 5,
                                step: 0.1,
                                style: { textAlign: "center", padding: "8px" },
                              }}
                              sx={{ width: "80px", backgroundColor: "#fff" }}
                              placeholder="0.0"
                              disabled={!selectedSchool}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {/* Average Row */}
                  <TableRow sx={{ backgroundColor: "#fffde7" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        borderRight: "2px solid #ddd",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fffde7",
                        zIndex: 1,
                      }}
                    >
                      Átlagérték
                    </TableCell>
                    {evszamok.map((yearStr, i) => {
                      const year = parseInt(yearStr.split("/")[0], 10);
                      return (
                        <TableCell 
                          key={`avg-${year}`} 
                          align="center" 
                          sx={{ 
                            fontWeight: "bold",
                            borderRight: i === evszamok.length - 1 ? "none" : "1px solid #ddd",
                            fontSize: "1.1rem"
                          }}
                        >
                          {calculateTotalAverages[year] || "0.00"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              {stakeholderCategories.map((stakeholder) => (
                <Card
                  key={stakeholder.key}
                  sx={{
                    backgroundColor: stakeholder.color,
                    border: "1px solid #ddd",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      {stakeholder.label}
                    </Typography>
                    <Typography variant="body2">
                      {stakeholder.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Measurement Guidelines */}
        <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Mérési irányelvek
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Szülői elégedettség:</strong> Kommunikáció,
                  tájékoztatás, oktatás minősége, tanulói fejlődés
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Oktatói elégedettség:</strong> Munkakörülmények,
                  vezetői támogatás, fejlődési lehetőségek, eszközellátottság
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Tanulói elégedettség:</strong> Oktatás színvonala,
                  tanár-diák kapcsolat, iskolai környezet, felszereltség
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Duális képzőhely:</strong> Tanulók felkészültsége,
                  együttműködés színvonala, kommunikáció hatékonysága
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Munkaerőpiac:</strong> Végzettek kompetenciái,
                  munkahelyi alkalmasság, szakmai felkészültség
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>

        {/* Data Collection Methods */}
        <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Adatgyűjtési módszerek
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Chip
                label="Online kérdőívek"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Papír alapú felmérések"
                color="secondary"
                variant="outlined"
              />
              <Chip
                label="Személyes interjúk"
                color="success"
                variant="outlined"
              />
              <Chip
                label="Telefonos megkeresés"
                color="info"
                variant="outlined"
              />
              <Chip
                label="Fókuszcsoportos beszélgetések"
                color="warning"
                variant="outlined"
              />
            </Box>
            <Typography variant="body2">
              Az elégedettségi mérések rendszeres időközönként (évente)
              végrehajtandók, reprezentatív mintavétellel, validált
              kérdőívekkel.
            </Typography>
          </CardContent>
        </Card>

        {/* Quality Indicators */}
        <Card sx={{ mt: 3, backgroundColor: "#fff8f0" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Minőségi mutatók
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Az elégedettségi mutatók az intézmény teljesítményének átfogó
              értékelését teszik lehetővé különböző szemszögekből.
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body2">
                  <strong>Trendanalízis:</strong> Évenkénti változások nyomon
                  követése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Összehasonlító elemzés:</strong> Különböző érintettek
                  véleményének összevetése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Fejlesztési területek:</strong> Alacsony elégedettségi
                  mutatók elemzése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Benchmarking:</strong> Más intézményekkel való
                  összehasonlítás lehetősége
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Jelmagyarázat
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip
                label="0-100% skála"
                variant="outlined"
                sx={{ backgroundColor: "#e8f4fd" }}
              />
              <Chip
                label="Tizedesjegyek használhatók"
                variant="outlined"
                sx={{ backgroundColor: "#f0f8ff" }}
              />
            </Stack>
            <Typography variant="body2">
              Az értékek 0-100% közötti százalékos formában adandók meg. A
              magasabb értékek nagyobb elégedettséget jelentenek.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
}
