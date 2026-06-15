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
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../../../utils/schoolYears";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoElegedettsegMeresEredmenyei from "./info_elegedettseg_meres_eredmenyei";
import TitleElegedettsegMeresEredmenyei from "./title_elegedettseg_meres_eredmenyei";

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
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Load API data into state
  useEffect(() => {
    if (!isFetching && apiData) {
      const newData = createEmpty();
      const origData = createEmpty();

      apiData.forEach((item) => {
        const yearRange = `${item.tanev_kezdete}/${item.tanev_kezdete + 1}`;
        stakeholderCategories.forEach((s) => {
          const val = item[s.dbKey];
          if (val !== undefined && val !== null) {
            newData[s.key][yearRange] = val.toString();
            origData[s.key][yearRange] = val.toString();
            if (!newData[s.key]._ids) newData[s.key]._ids = {};
            if (!origData[s.key]._ids) origData[s.key]._ids = {};
            newData[s.key]._ids[yearRange] = item.id;
            origData[s.key]._ids[yearRange] = item.id;
          }
        });
      });

      setSatisfactionData(newData);
      setOriginalData(origData);
      setIsModified(false);
    }
  }, [apiData, isFetching]);


  const handleSave = async () => {
    if (!selectedSchool) return;
    setIsSaving(true);
    let savedCount = 0;
    let updatedCount = 0;

    try {
      const promises = [];

      schoolYears.forEach((yearRange) => {
        const tanev_kezdete = parseInt(yearRange.split("/")[0]);
        // Find existing record for this year (any stakeholder shares the same row)
        const existingId = stakeholderCategories.reduce((id, s) => {
          return id || satisfactionData[s.key]?._ids?.[yearRange];
        }, null);

        // Check if any field changed for this year
        const anyModified = stakeholderCategories.some((s) => {
          const orig = originalData[s.key]?.[yearRange] || "0";
          const curr = satisfactionData[s.key]?.[yearRange] || "0";
          return orig !== curr;
        });

        if (!anyModified) return;

        const recordData = {
          alapadatok_id: selectedSchool.id,
          tanev_kezdete,
        };
        stakeholderCategories.forEach((s) => {
          recordData[s.key] = parseFloat(satisfactionData[s.key]?.[yearRange] || 0);
        });

        if (existingId) {
          promises.push(
            updateElegedettseg({ id: existingId, ...recordData }).unwrap().then(() => { updatedCount++; })
          );
        } else {
          promises.push(
            addElegedettseg(recordData).unwrap().then(() => { savedCount++; })
          );
        }
      });

      if (promises.length > 0) {
        await Promise.all(promises);
        setSnackbarMessage(`Sikeresen mentve: ${savedCount} új, ${updatedCount} frissítve`);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Nem történt módosítás!");
        setSnackbarSeverity("info");
      }
      setSnackbarOpen(true);
      setIsModified(false);
    } catch (error) {
      console.error("Hiba mentés közben:", error);
      setSnackbarMessage("Hiba történt a mentés során!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = useCallback(() => {
    setSatisfactionData(JSON.parse(JSON.stringify(originalData)));
    setIsModified(false);
  }, [originalData]);

  // Handle data changes
  const handleDataChange = useCallback((stakeholder, year, value) => {
    setSatisfactionData((prev) => ({
      ...prev,
      [stakeholder]: {
        ...prev[stakeholder],
        [year]: value,
      },
    }));
    setIsModified(true);
  }, []);

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
        {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
        {isModified && (
          <Alert severity="warning" sx={{mb:3}}>
            Mentetlen módosítások vannak. Ne felejtsd el menteni a
            változtatásokat!
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
                  disabled={!isModified || isSaving || !selectedSchool}
                >
                  Mentés
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={!isModified || isSaving}
                >
                  Visszacsnállítás
                </Button>
              </LockedTableWrapper>
            </Stack>
            <Typography variant="h6" component="h2" gutterBottom>
              Végzetteket foglalkoztató munkáadók elégedettsége (%)
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
                      sx={{
                        fontWeight: "bold",
                        verticalAlign: "middle",
                        minWidth: 200,
                        textAlign: "center",
                      }}
                    >
                      Érintett fél
                    </TableCell>
                    {schoolYears.map((year) => (
                      <TableCell
                        key={year}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          minWidth: 120,
                          backgroundColor: "#e8f4fd",
                        }}
                      >
                        {year}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakeholderCategories.map((stakeholder) => (
                    <TableRow
                      key={stakeholder.key}
                      sx={{
                        backgroundColor: stakeholder.color,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "medium",
                          textAlign: "left",
                          pl: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {stakeholder.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stakeholder.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      {schoolYears.map((year) => (
                        <TableCell key={year} align="center">
                          <TextField
                            type="number"
                            value={
                              satisfactionData[stakeholder.key]?.[year] || "0"
                            }
                            onChange={(e) =>
                              handleDataChange(
                                stakeholder.key,
                                year,
                                e.target.value
                              )
                            }
                            size="small"
                            inputProps={{
                              min: 0,
                              max: 100,
                              step: 0.1,
                              style: { textAlign: "center" },
                            }}
                            sx={{ width: "80px" }}
                            placeholder="0-100"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action Buttons */}

            {/* Status Messages */}
          </CardContent>
        </Card>

        {/* Stakeholder Details */}
        <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Érintett felek részletesen
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 2,
                mb: 2,
              }}
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}
