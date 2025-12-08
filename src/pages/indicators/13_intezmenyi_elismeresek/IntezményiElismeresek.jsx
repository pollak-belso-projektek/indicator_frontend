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
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoIntezményiElismeresek from "./info_intezmenyi_elismeresek";
import TitleIntezményiElismeresek from "./title_intezmenyi_elismeresek";


export default function IntezményiElismeresek() {
  const schoolYears = [
    "2020/2021. tanév",
    "2021/2022. tanév",
    "2022/2023. tanév",
    "2023/2024. tanév",
  ];

  const recognitionCategories = [
    {
      category: "intezmenyi_altal_elnyert",
      title: "Intézmény által elnyert díjak, elismerések",
      description: "Az intézmény szintjén elnyert díjak és elismerések",
      backgroundColor: "#e8f5e8",
      items: [],
    },
    {
      category: "munkavallalok_altal_elnyert",
      title:
        "Munkavállalók által elnyert díjak, elismerések, kitüntetésre való felterjesztések",
      description: "Munkatársak által elnyert díjak és elismerések",
      backgroundColor: "#fff8e8",
      items: [
        {
          key: "itm_miniszteri_elismero_oklevel",
          label: "ITM Miniszteri Elismerő Oklevél",
        },
        { key: "itm_szakkepzesert_dij", label: "ITM Szakképzésért díj" },
        {
          key: "kim_miniszter_elismero_oklevele",
          label: "KIM Miniszter Elismerő Oklevele",
        },
        { key: "kim_szakkepzesert_dij", label: "KIM Szakképzésért díj" },
        {
          key: "kim_oktatoi_szolgalati_emlekazerem",
          label: "KIM Oktatói szolgálati Emlékérem",
        },
        {
          key: "pedagogus_szolgalati_emlekazerem",
          label: "Pedagógus szolgálati Emlékérem",
        },
        { key: "hszc_kivalosagi_dij", label: "HSZC Kiválósági díj" },
      ],
    },
  ];

  // Initialize data structure
  const [recognitionData, setRecognitionData] = useState(() => {
    const initialData = {};

    recognitionCategories.forEach((category) => {
      initialData[category.category] = {};
      if (category.items.length > 0) {
        // For categories with predefined items
        category.items.forEach((item) => {
          initialData[category.category][item.key] = {};
          schoolYears.forEach((year) => {
            initialData[category.category][item.key][year] = "0";
          });
        });
      } else {
        // For open categories (like institutional awards)
        schoolYears.forEach((year) => {
          initialData[category.category][year] = "0";
        });
      }
    });

    return initialData;
  });

  const [savedData, setSavedData] = useState(null);
  const [isModified, setIsModified] = useState(false);

  // Handle data changes for categories with items
  const handleDataChange = (category, item, year, value) => {
    setRecognitionData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category][item],
          [year]: value,
        },
      },
    }));
    setIsModified(true);
  };

  // Handle data changes for simple categories
  const handleSimpleDataChange = (category, year, value) => {
    setRecognitionData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [year]: value,
      },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    setSavedData(JSON.parse(JSON.stringify(recognitionData)));
    setIsModified(false);
    console.log("Saving recognition data:", recognitionData);
  };

  const handleReset = () => {
    if (savedData) {
      setRecognitionData(JSON.parse(JSON.stringify(savedData)));
      setIsModified(false);
    }
  };

  return (
    <PageWrapper
      titleContent={<TitleIntezményiElismeresek />}
      infoContent={<InfoIntezményiElismeresek />}
    >
      <Box sx={{ p: 3 }}>
        <LockStatusIndicator tableName="intezmenyi_elismeresek" />

        {/* Main Data Tables */}
        {recognitionCategories.map((categoryData, categoryIndex) => (
          <Card key={categoryData.category} sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                sx={{
                  color: "#1976d2",
                  fontWeight: "bold",
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
                          minWidth: 300,
                          textAlign: "center",
                        }}
                      >
                        {categoryData.items.length > 0
                          ? "Elismerés típusa"
                          : "Témakörök"}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          minWidth: 100,
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
                    {categoryData.items.length > 0 ? (
                      // For categories with predefined items
                      categoryData.items.map((item, index) => (
                        <TableRow
                          key={item.key}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#f9f9f9" : "white",
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
                            {item.label}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              backgroundColor: "#e3f2fd",
                            }}
                          >
                            <Chip
                              label="Darab"
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
                                  recognitionData[categoryData.category]?.[
                                  item.key
                                  ]?.[year] || "0"
                                }
                                onChange={(e) =>
                                  handleDataChange(
                                    categoryData.category,
                                    item.key,
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
                      ))
                    ) : (
                      // For simple categories (like institutional awards)
                      <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                        <TableCell
                          sx={{
                            fontWeight: "medium",
                            textAlign: "left",
                            pl: 2,
                            fontStyle: "italic",
                          }}
                        >
                          Intézmény által elnyert díjak, elismerések
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            backgroundColor: "#e3f2fd",
                          }}
                        >
                          <Chip
                            label="Darab"
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
                                recognitionData[categoryData.category]?.[year] ||
                                "0"
                              }
                              onChange={(e) =>
                                handleSimpleDataChange(
                                  categoryData.category,
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
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <LockedTableWrapper tableName="intezmenyi_elismeresek">
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

        {/* Categories Information */}
        <Card sx={{ mt: 3, backgroundColor: "#f8f9fa" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Elismerés kategóriák
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Chip
                label="Helyi szintű elismerések"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Regionális díjak"
                color="secondary"
                variant="outlined"
              />
              <Chip
                label="Országos kitüntetések"
                color="success"
                variant="outlined"
              />
              <Chip label="Szakmai elismerések" color="info" variant="outlined" />
              <Chip label="Kulturális díjak" color="warning" variant="outlined" />
              <Chip label="Sport eredmények" color="error" variant="outlined" />
            </Box>
            <Typography variant="body2">
              Az elismerések számolása darabszám alapján történik. Az intézményi
              szintű elismerések külön nyilvántartandók a munkatársak egyéni
              elismeréseitől.
            </Typography>
          </CardContent>
        </Card>

        {/* Documentation Guidelines */}
        <Card sx={{ mt: 3, backgroundColor: "#f0f8ff" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Dokumentálási irányelvek
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Intézményi elismerések:</strong> Az iskola egészét
                  érintő díjak és elismerések
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Munkatársi elismerések:</strong> Pedagógusok és
                  alkalmazottak egyéni elismerései
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Területi megoszlás:</strong> Helyi, megyei, regionális
                  és országos szintek elkülönítése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Dokumentáció:</strong> Oklevelek, elismerő iratok
                  digitális archiválása
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>

        {/* Quality Indicators */}
        <Card sx={{ mt: 3, backgroundColor: "#f8fff8" }}>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Minőségi mutatók
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Az elismerések száma és típusa az intézmény szakmai elismertségének
              és társadalmi megbecsülésének fontos mutatója.
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body2">
                  Szakmai kiválóság elismerése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Pedagógiai innováció értékelése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Társadalmi szerepvállalás elismerése
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Intézményi presztízs növelése
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
}
