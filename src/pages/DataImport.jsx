import { useState, useEffect } from "react";
import { fields } from "../tableData/tanuloTanugyiData";
import { mapEmployeeData } from "../tableData/alkalmazottMunkaugyiData";
import {
  useAddTanugyiAdatokMutation,
  useGetTanugyiAdatokQuery,
  useAddAlkalmazottAdatokMutation,
  useGetAlkalmazottAdatokQuery,
} from "../store/api/apiSlice";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
} from "@mui/material";
import { CustomSheetUploader } from "../components/CustomSheetUploader";
import { useSelector } from "react-redux";
import { selectSelectedSchool } from "../store/slices/authSlice";
import {
  validateTanugyiFile,
  validateAlkalmazottFile,
} from "../utils/fileValidation";

export default function DataImport() {
  const [tanugyiData, setTanugyiData] = useState(null);
  const [alkalmazottData, setAlkalmazottData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [tanugyiValidationError, setTanugyiValidationError] = useState(null);
  const [alkalmazottValidationError, setAlkalmazottValidationError] =
    useState(null);

  const selectedSchool = useSelector(selectSelectedSchool);

  // Tanügyi adatok API hooks
  const [addTanugyiAdatok, tanugyiResult] = useAddTanugyiAdatokMutation();
  const {
    data: tanugyiDataFromAPI,
    error: tanugyiError,
    isLoading: tanugyiLoading,
  } = useGetTanugyiAdatokQuery({
    alapadatok_id: selectedSchool?.id,
    tanev_kezdete: 2024,
  });

  // Alkalmazott adatok API hooks
  const [addAlkalmazottAdatok, alkalmazottResult] =
    useAddAlkalmazottAdatokMutation();
  const {
    data: alkalmazottDataFromAPI,
    error: alkalmazottError,
    isLoading: alkalmazottLoading,
  } = useGetAlkalmazottAdatokQuery({
    alapadatok_id: selectedSchool?.id,
    tanev_kezdete: 2024,
  });

  // Tanügyi adatok effect
  useEffect(() => {
    console.log(tanugyiData);
    if (tanugyiData && !tanugyiValidationError) {
      addTanugyiAdatok({
        alapadatok_id: selectedSchool?.id,
        tanev_kezdete: 2024,
        tanugyi_adatok: tanugyiData,
      });
    }
  }, [tanugyiData, addTanugyiAdatok, tanugyiValidationError]);

  // Alkalmazott adatok effect - csak oktatókat szűrve
  useEffect(() => {
    console.log(alkalmazottData);
    if (alkalmazottData && !alkalmazottValidationError) {
      // Szűrés: csak azok, akiknek munkakörében szerepel az "oktató" vagy "tanár" szó
      const oktatokData = alkalmazottData.filter((item) => {
        const munkakor = item.Munkakor || item.munkakor || "";
        return (
          munkakor.toLowerCase().includes("oktató") ||
          munkakor.toLowerCase().includes("tanár")
        );
      });

      console.log(
        "Oktatók száma:",
        oktatokData.length,
        "az összes",
        alkalmazottData.length,
        "alkalmazottból"
      );

      if (oktatokData.length > 0) {
        // Adatok transzformálása a backend API formátumához
        const transformedData = oktatokData.map((item) => {
          const transformedItem = { ...item };

          // Integer mezők konverziója
          if (transformedItem.TanevKezdete) {
            transformedItem.TanevKezdete =
              parseInt(transformedItem.TanevKezdete) || 2024;
          } else {
            transformedItem.TanevKezdete = 2024;
          }

          if (transformedItem.KotelezoOraszama) {
            transformedItem.KotelezoOraszama =
              parseInt(String(transformedItem.KotelezoOraszama).trim()) || 0;
          } else {
            transformedItem.KotelezoOraszama = 0;
          }

          // Decimal mezők konverziója
          if (transformedItem.Oraszam) {
            transformedItem.Oraszam =
              parseFloat(String(transformedItem.Oraszam).trim()) || 0.0;
          } else {
            transformedItem.Oraszam = 0.0;
          }

          if (transformedItem.FeladattalTerheltOraszam) {
            transformedItem.FeladattalTerheltOraszam =
              parseFloat(
                String(transformedItem.FeladattalTerheltOraszam).trim()
              ) || 0.0;
          } else {
            transformedItem.FeladattalTerheltOraszam = 0.0;
          }

          if (transformedItem.PedagogusHetiOraszama) {
            transformedItem.PedagogusHetiOraszama =
              parseFloat(
                String(transformedItem.PedagogusHetiOraszama).trim()
              ) || 0.0;
          } else {
            transformedItem.PedagogusHetiOraszama = 0.0;
          }

          return transformedItem;
        });

        addAlkalmazottAdatok({
          alapadatok_id: selectedSchool?.id,
          alkalmazottak_munkaugy: transformedData,
        });
      }
    }
  }, [alkalmazottData, addAlkalmazottAdatok, alkalmazottValidationError]);

  useEffect(() => {
    console.log("Tanügyi eredmény:", tanugyiResult);
  }, [tanugyiResult]);

  useEffect(() => {
    console.log("Alkalmazott eredmény:", alkalmazottResult);
  }, [alkalmazottResult]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Validációs hibák törlése tab váltáskor
    setTanugyiValidationError(null);
    setAlkalmazottValidationError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nincs adat";
    return (
      dateString.split("T")[0].replace(/-/g, ".") +
      ". " +
      dateString.split("T")[1].slice(0, 8)
    );
  };

  const isLoading = tanugyiLoading || alkalmazottLoading;
  const hasError = tanugyiError || alkalmazottError;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="70vh"
        >
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ mb: 4 }}
          >
            Adatok Feltöltése
          </Typography>

          <Paper sx={{ width: "100%" }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Tanügyi Adatok" />
              <Tab label="Alkalmazottak Munkaugyi Adatai" />
            </Tabs>

            {/* Tanügyi Adatok Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Tanügyi Adatok Feltöltése
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Tanügyi fájl követelmények</AlertTitle>A fájlnak
                  tartalmaznia kell legalább egyet az alábbi oszlopok közül:
                  <strong>
                    {" "}
                    Oktatási azonosítója, Osztály, Bejáró, Tankötelezettséget
                    teljesítő
                  </strong>
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Legutóbb betöltött adatok:</strong>{" "}
                    {tanugyiDataFromAPI &&
                    Array.isArray(tanugyiDataFromAPI) &&
                    tanugyiDataFromAPI.length > 0
                      ? (() => {
                          const maxItem = tanugyiDataFromAPI.reduce(
                            (max, item) =>
                              new Date(item.createAt) > new Date(max.createAt)
                                ? item
                                : max
                          );
                          return formatDate(maxItem.createAt);
                        })()
                      : "Nincs adat"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Betöltött adatok száma:</strong>{" "}
                    <Chip
                      label={
                        tanugyiDataFromAPI && Array.isArray(tanugyiDataFromAPI)
                          ? tanugyiDataFromAPI.length
                          : 0
                      }
                      color="primary"
                      size="small"
                    />
                  </Typography>
                </Box>

                <Paper variant="outlined" sx={{ p: 3 }}>
                  {tanugyiValidationError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <AlertTitle>Hibás fájltípus!</AlertTitle>
                      {tanugyiValidationError}
                    </Alert>
                  )}

                  <CustomSheetUploader
                    onFileUpload={async (data, file) => {
                      console.log("Tanügyi - Feltöltött fájl:", file.name);

                      // Fejlécek kinyerése (első sor)
                      const headers =
                        data.length > 0 ? Object.keys(data[0]) : [];
                      console.log("Tanügyi - Fejlécek:", headers);

                      // Fájl validáció
                      const validation = validateTanugyiFile(headers);
                      console.log("Tanügyi - Validáció eredménye:", validation);

                      if (!validation.isValid) {
                        setTanugyiValidationError(validation.error);
                        setTanugyiData(null);
                        return;
                      }

                      // Ha sikerült a validáció, töröljük a hibát
                      setTanugyiValidationError(null);

                      console.log("Tanügyi - Adatok:", data);
                      setTanugyiData(
                        data.map((item) => {
                          const newItem = {};
                          fields.forEach((field) => {
                            newItem[field.key] = item[field.label] || "";
                          });
                          return newItem;
                        })
                      );
                    }}
                    onError={(error) => {
                      console.error("Tanügyi uploader hiba:", error);
                      setTanugyiValidationError(
                        `Fájl beolvasási hiba: ${error.message || error}`
                      );
                    }}
                    maxFileSize={5 * 1024 * 1024}
                    showPreview={true}
                    maxPreviewRows={10}
                    uploadMessage="Húzd ide a tanügyi Excel vagy CSV fájlt vagy kattints a tallózáshoz"
                    loadingMessage="Tanügyi fájl feldolgozása..."
                  />

                  {tanugyiData && !tanugyiValidationError && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <AlertTitle>Sikeresen feldolgozva!</AlertTitle>
                      {tanugyiData.length} tanügyi adat lett feldolgozva.
                    </Alert>
                  )}
                </Paper>
              </Box>
            )}

            {/* Alkalmazottak Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Alkalmazottak Munkaugyi Adatai
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Fontos tudnivalók</AlertTitle>
                  • Csak azok az alkalmazottak kerülnek feltöltésre, akiknek a
                  munkakör oszlopában szerepel az "oktató" vagy "tanár" szó.
                  <br />• A fájlnak tartalmaznia kell legalább egyet az alábbi
                  oszlopok közül:
                  <strong>
                    {" "}
                    Munkakör, Pedagógus fokozat, Foglalkoztatási jogviszony,
                    Pedagógus oktatási azonosító
                  </strong>
                </Alert>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Legutóbb betöltött adatok:</strong>{" "}
                    {alkalmazottDataFromAPI &&
                    Array.isArray(alkalmazottDataFromAPI) &&
                    alkalmazottDataFromAPI.length > 0
                      ? (() => {
                          const maxItem = alkalmazottDataFromAPI.reduce(
                            (max, item) =>
                              new Date(item.createAt) > new Date(max.createAt)
                                ? item
                                : max
                          );
                          return formatDate(maxItem.createAt);
                        })()
                      : "Nincs adat"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Betöltött oktatók száma:</strong>{" "}
                    <Chip
                      label={
                        alkalmazottDataFromAPI &&
                        Array.isArray(alkalmazottDataFromAPI)
                          ? alkalmazottDataFromAPI.length
                          : 0
                      }
                      color="secondary"
                      size="small"
                    />
                  </Typography>
                </Box>

                <Paper variant="outlined" sx={{ p: 3 }}>
                  {alkalmazottValidationError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <AlertTitle>Hibás fájltípus!</AlertTitle>
                      {alkalmazottValidationError}
                    </Alert>
                  )}

                  <CustomSheetUploader
                    onFileUpload={async (data, file) => {
                      console.log("Alkalmazott - Feltöltött fájl:", file.name);

                      // Fejlécek kinyerése (első sor)
                      const headers =
                        data.length > 0 ? Object.keys(data[0]) : [];
                      console.log("Alkalmazott - Fejlécek:", headers);

                      // Fájl validáció
                      const validation = validateAlkalmazottFile(headers);
                      console.log(
                        "Alkalmazott - Validáció eredménye:",
                        validation
                      );

                      if (!validation.isValid) {
                        setAlkalmazottValidationError(validation.error);
                        setAlkalmazottData(null);
                        return;
                      }

                      // Ha sikerült a validáció, töröljük a hibát
                      setAlkalmazottValidationError(null);

                      console.log("Alkalmazott - Adatok:", data);

                      // Átalakítás a megfelelő formátumra
                      const mappedData = mapEmployeeData(data);

                      console.log("Alkalmazott - Mapped Data:", mappedData);
                      setAlkalmazottData(mappedData);
                    }}
                    onError={(error) => {
                      console.error("Alkalmazott uploader hiba:", error);
                      setAlkalmazottValidationError(
                        `Fájl beolvasási hiba: ${error.message || error}`
                      );
                    }}
                    maxFileSize={5 * 1024 * 1024}
                    showPreview={true}
                    maxPreviewRows={10}
                    uploadMessage="Húzd ide az alkalmazotti Excel vagy CSV fájlt vagy kattints a tallózáshoz"
                    loadingMessage="Alkalmazotti fájl feldolgozása..."
                  />

                  {alkalmazottData && !alkalmazottValidationError && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="success">
                        <AlertTitle>Sikeresen feldolgozva!</AlertTitle>
                        {alkalmazottData.length} alkalmazotti adat lett
                        feldolgozva.
                      </Alert>
                      {alkalmazottData.filter((item) => {
                        const munkakor = item.Munkakor || item.munkakor || "";
                        return (
                          munkakor.toLowerCase().includes("oktató") ||
                          munkakor.toLowerCase().includes("tanár")
                        );
                      }).length !== alkalmazottData.length && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          <AlertTitle>Szűrés alkalmazva</AlertTitle>
                          Csak{" "}
                          {
                            alkalmazottData.filter((item) => {
                              const munkakor =
                                item.Munkakor || item.munkakor || "";
                              return (
                                munkakor.toLowerCase().includes("oktató") ||
                                munkakor.toLowerCase().includes("tanár")
                              );
                            }).length
                          }{" "}
                          oktató/tanár kerül feltöltésre a{" "}
                          {alkalmazottData.length} alkalmazottból.
                        </Alert>
                      )}
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
}
