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
import PageWrapper from "./PageWrapper";
import LockStatusIndicator from "../components/LockStatusIndicator";
import LockedTableWrapper from "../components/LockedTableWrapper";
import InfoSzakmaiBemutatokKonferenciak from "./indicators/14_szakmai_bemutatok_konferenciak/info_szakmai_bemutatok_konferenciak";
import TitleSzakmaiBemutatokKonferenciak from "./indicators/14_szakmai_bemutatok_konferenciak/title_szakmai_bemutatok_konferenciak";

export default function SzakmaiBemutatokKonferenciak() {
  const schoolYears = [
    "2021/2022. tanév",
    "2022/2023. tanév",
    "2023/2024. tanév",
    "2024/2025. tanév",
  ];

  const eventCategories = [
    {
      category: "szakmai_bemutatok",
      title: "Szakmai bemutatók",
      description: "Szakmai bemutatók és ismeretterjesztő előadások",
      backgroundColor: "#e8f5e8",
      metrics: [
        { key: "tevekenyseged_szinteren", label: "tevékenységek szinterei" },
        { key: "bevont_tanulok_szama", label: "bevont tanulók száma (fő)" },
      ],
    },
    {
      category: "konferenciak",
      title: "Konferenciák",
      description: "Szakmai konferenciák és tudományos rendezvények",
      backgroundColor: "#fff8e8",
      metrics: [
        { key: "tevekenyseged_szinteren", label: "tevékenységek szinterei" },
        { key: "bevont_tanulok_szama", label: "bevont tanulók száma (fő)" },
      ],
    },
    {
      category: "szakmai_rendezvenyek",
      title: "Szakmai rendezvények",
      description: "Egyéb szakmai rendezvények és programok",
      backgroundColor: "#e8f2ff",
      metrics: [
        { key: "tevekenyseged_szinteren", label: "tevékenységek szinterei" },
        { key: "bevont_tanulok_szama", label: "bevont tanulók száma (fő)" },
      ],
    },
  ];

  // Initialize data structure
  const [eventData, setEventData] = useState(() => {
    const initialData = {};

    eventCategories.forEach((category) => {
      initialData[category.category] = {};
      category.metrics.forEach((metric) => {
        initialData[category.category][metric.key] = {};
        schoolYears.forEach((year) => {
          initialData[category.category][metric.key][year] = "0";
        });
      });
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes
  const handleDataChange = (category, metric, year, value) => {
    setEventData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [metric]: {
          ...prev[category][metric],
          [year]: value,
        },
      },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(eventData)));
    setIsModified(false);
    console.log("Saving event data:", eventData);
  };

  const handleReset = () => {
    if (savedData) {
      setEventData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <PageWrapper
      titleContent={<TitleSzakmaiBemutatokKonferenciak />}
      infoContent={<InfoSzakmaiBemutatokKonferenciak />}
    >
      <Box sx={{ p: 3 }}>
        <LockStatusIndicator tableName="szakmai_bemutatok_konferenciak" />

        {/* Instructions Card */}
        <Card sx={{ mb: 3, backgroundColor: "#fff9c4" }}>
          <CardContent>

            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
              Ilyen lehet például: szakmai konferencia, országos vagy regionális
              szakmai verseny, új technológiákat és piaci szerepeket bemutató
              szakmai nap vagy vásár.
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Az indikátor egy-egy tanévben megszervezett alkalmas összegyűjtését,
              felsorolását teszi szükségessé. Fontos, hogy az egymást követő
              tanévek összeállított listáin szerepelő alkalmat intézmény tanévről
              tanévre összehasonlítsa.
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
                <strong>Megjegyzés:</strong> A kizárólag PR-tevékenységhez
                kapcsolódó rendezvényeket (pl. nyílt nap) nem kell szerepeltetnie
                az intézménynek az általa szervezett szakmai bemutatók között.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Main Data Tables */}
        {eventCategories.map((categoryData, categoryIndex) => (
          <Card key={categoryData.category} sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                sx={{
                  color: "#1976d2",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {categoryData.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {categoryData.description}
              </Typography>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ overflowX: "auto" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{ backgroundColor: categoryData.backgroundColor }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          verticalAlign: "middle",
                          minWidth: 200,
                          textAlign: "center",
                        }}
                      >
                        Témakörök
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          minWidth: 150,
                          backgroundColor: "#e3f2fd",
                        }}
                      >
                        Információk
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
                    {categoryData.metrics.map((metric, index) => (
                      <TableRow
                        key={metric.key}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
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
                          {metric.label}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            backgroundColor: "#e3f2fd",
                          }}
                        >
                          <Chip
                            label={
                              metric.key === "bevont_tanulok_szama"
                                ? "Fő"
                                : "Darab"
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              backgroundColor: "white",
                              borderColor: "#1976d2",
                              color: "#1976d2",
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        {schoolYears.map((year) => (
                          <TableCell key={year} align="center">
                            <TextField
                              type="number"
                              value={
                                eventData[categoryData.category]?.[metric.key]?.[
                                year
                                ] || "0"
                              }
                              onChange={(e) =>
                                handleDataChange(
                                  categoryData.category,
                                  metric.key,
                                  year,
                                  e.target.value
                                )
                              }
                              size="small"
                              inputProps={{
                                min: 0,
                                step: 1,
                                style: { textAlign: "center" },
                              }}
                              sx={{ width: "80px" }}
                              placeholder="0"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <LockedTableWrapper tableName="szakmai_bemutatok_konferenciak">
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
          </LockedTableWrapper>
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

        {/* Event Types Information */}
        <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Rendezvény típusok
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Chip
                label="Szakmai konferenciák"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Technológiai bemutatók"
                color="secondary"
                variant="outlined"
              />
              <Chip label="Szakmai verseny" color="success" variant="outlined" />
              <Chip
                label="Piaci szerepek bemutatása"
                color="info"
                variant="outlined"
              />
              <Chip
                label="Ismeretterjesztő előadások"
                color="warning"
                variant="outlined"
              />
              <Chip label="Szakmai napok" color="error" variant="outlined" />
            </Box>
            <Typography variant="body2">
              A rendezvények kategorizálása segíti az intézmény szakmai
              tevékenységének átfogó értékelését és a különböző területeken való
              aktivitás mérését.
            </Typography>
          </CardContent>
        </Card>

        {/* Metrics Explanation */}
        <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Mérési szempontok
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Tevékenységek szinterei:</strong> A megszervezett
                  rendezvények, bemutatók, konferenciák száma
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Bevont tanulók száma:</strong> A rendezvényeken
                  résztvevő tanulók összesített létszáma (fő)
                </Typography>
              </li>
            </Box>
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              <strong>Fontos:</strong> Csak azokat a rendezvényeket vegye
              figyelembe, amelyeknek az intézmény a fő szervezője vagy
              társszervezője.
            </Typography>
          </CardContent>
        </Card>

        {/* Quality Indicators */}
        <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Minőségi mutatók
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              A szakmai rendezvények száma és résztvevői létszáma az intézmény
              szakmai elismertségének és kapcsolatrendszerének fontos mutatója.
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body2">
                  Szakmai kapcsolatok erősítése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">Tudásmegosztás és -átadás</Typography>
              </li>
              <li>
                <Typography variant="body2">Iparági trendek követése</Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Intézményi láthatóság növelése
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>

        {/* Exclusions Card */}
        <Card sx={{ mt: 3, backgroundColor: "#fff0f5" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom color="error">
              Nem tartozik ide
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>PR rendezvények:</strong> Nyílt napok, toborzó
                  rendezvények
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Iskolai ünnepségek:</strong> Ballagás, évnyitó, évzáró
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Sporteseményeket:</strong> Amatőr sportrendezvények
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Belső továbbképzések:</strong> Csak pedagógusoknak szóló
                  képzések
                </Typography>
              </li>
            </Box>
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              Csak a szakmai tudásátadást és -megosztást célzó rendezvények
              kerüljenek be ebbe a kategóriába.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
}
