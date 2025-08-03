import { useState, useEffect } from "react";
import { fields } from "../tableData/tanuloTanugyiData";
import { employeeFields } from "../tableData/alkalmazottMunkaugyiData";
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

export default function DataImport() {
  const [tanugyiData, setTanugyiData] = useState(null);
  const [alkalmazottData, setAlkalmazottData] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Tanügyi adatok API hooks
  const [addTanugyiAdatok, tanugyiResult] = useAddTanugyiAdatokMutation();
  const {
    data: tanugyiDataFromAPI,
    error: tanugyiError,
    isLoading: tanugyiLoading,
  } = useGetTanugyiAdatokQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
    ev: 2024,
  });

  // Alkalmazott adatok API hooks
  const [addAlkalmazottAdatok, alkalmazottResult] =
    useAddAlkalmazottAdatokMutation();
  const {
    data: alkalmazottDataFromAPI,
    error: alkalmazottError,
    isLoading: alkalmazottLoading,
  } = useGetAlkalmazottAdatokQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
    ev: 2024,
  });

  // Tanügyi adatok effect
  useEffect(() => {
    console.log(tanugyiData);
    if (tanugyiData) {
      addTanugyiAdatok({
        alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
        tanugyi_adatok: tanugyiData,
      });
    }
  }, [tanugyiData, addTanugyiAdatok]);

  // Alkalmazott adatok effect - csak oktatókat szűrve
  useEffect(() => {
    console.log(alkalmazottData);
    if (alkalmazottData) {
      // Szűrés: csak azok, akiknek munkakörében szerepel az "oktató" szó
      const oktatokData = alkalmazottData.filter(
        (item) =>
          item.munkakor && item.munkakor.toLowerCase().includes("oktató")
      );

      console.log(
        "Oktatók száma:",
        oktatokData.length,
        "az összes",
        alkalmazottData.length,
        "alkalmazottból"
      );

      if (oktatokData.length > 0) {
        addAlkalmazottAdatok({
          alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
          alkalmazott_adatok: oktatokData,
        });
      }
    }
  }, [alkalmazottData, addAlkalmazottAdatok]);

  useEffect(() => {
    console.log("Tanügyi eredmény:", tanugyiResult);
  }, [tanugyiResult]);

  useEffect(() => {
    console.log("Alkalmazott eredmény:", alkalmazottResult);
  }, [alkalmazottResult]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
                  <CustomSheetUploader
                    onFileUpload={async (data, file) => {
                      console.log("Tanügyi - Feltöltött fájl:", file.name);
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
                    }}
                    maxFileSize={5 * 1024 * 1024}
                    showPreview={true}
                    maxPreviewRows={10}
                    uploadMessage="Húzd ide a tanügyi Excel vagy CSV fájlt vagy kattints a tallózáshoz"
                    loadingMessage="Tanügyi fájl feldolgozása..."
                  />

                  {tanugyiData && (
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
                  <AlertTitle>Fontos tudnivaló</AlertTitle>
                  Csak azok az alkalmazottak kerülnek feltöltésre, akiknek a
                  munkakör oszlopában szerepel az "oktató" szó.
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
                  <CustomSheetUploader
                    onFileUpload={async (data, file) => {
                      console.log("Alkalmazott - Feltöltött fájl:", file.name);
                      console.log("Alkalmazott - Adatok:", data);

                      // Átalakítás a megfelelő formátumra
                      const mappedData = data.map((item) => {
                        const newItem = {};
                        employeeFields.forEach((field) => {
                          newItem[field.key] = item[field.label] || "";
                        });
                        return newItem;
                      });

                      setAlkalmazottData(mappedData);
                    }}
                    onError={(error) => {
                      console.error("Alkalmazott uploader hiba:", error);
                    }}
                    maxFileSize={5 * 1024 * 1024}
                    showPreview={true}
                    maxPreviewRows={10}
                    uploadMessage="Húzd ide az alkalmazotti Excel vagy CSV fájlt vagy kattints a tallózáshoz"
                    loadingMessage="Alkalmazotti fájl feldolgozása..."
                  />

                  {alkalmazottData && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="success">
                        <AlertTitle>Sikeresen feldolgozva!</AlertTitle>
                        {alkalmazottData.length} alkalmazotti adat lett
                        feldolgozva.
                      </Alert>
                      {alkalmazottData.filter(
                        (item) =>
                          item.munkakor &&
                          item.munkakor.toLowerCase().includes("oktató")
                      ).length !== alkalmazottData.length && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          <AlertTitle>Szűrés alkalmazva</AlertTitle>
                          Csak{" "}
                          {
                            alkalmazottData.filter(
                              (item) =>
                                item.munkakor &&
                                item.munkakor.toLowerCase().includes("oktató")
                            ).length
                          }{" "}
                          oktató kerül feltöltésre a {alkalmazottData.length}{" "}
                          alkalmazottból.
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
