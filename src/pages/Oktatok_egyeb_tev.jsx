import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
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
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import { selectSelectedSchool, selectUserId } from "../store/slices/authSlice";
import TableLoadingOverlay from "../components/shared/TableLoadingOverlay";
import {
  useGetOktatokEgyebTevByAlapadatokQuery,
  useAddOktatokEgyebTevMutation,
  useUpdateOktatokEgyebTevMutation,
} from "../store/api/oktatokEgyebTevSlice";

export default function OktatokEgyebTev() {
  const schoolYears = useMemo(() => generateSchoolYears(), []);
  const schoolYearsRef = useRef(schoolYears);
  const selectedSchool = useSelector(selectSelectedSchool);
  const uId = useSelector(selectUserId);

  // State for the form data
  const [data, setData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [error, setError] = useState(null);
  const [modifiedCells, setModifiedCells] = useState(new Set());

  // UI state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // API hooks - Use multiple individual hooks for each year (React allows this pattern)
  // Since we know the years in advance, we can create fixed hooks
  const currentYear = new Date().getFullYear();
  const year1 = parseInt(schoolYears[0]?.split("/")[0]) || currentYear;
  const year2 = parseInt(schoolYears[1]?.split("/")[0]) || currentYear - 1;
  const year3 = parseInt(schoolYears[2]?.split("/")[0]) || currentYear - 2;
  const year4 = parseInt(schoolYears[3]?.split("/")[0]) || currentYear - 3;

  const query1 = useGetOktatokEgyebTevByAlapadatokQuery(
    {
      alapadatokId: selectedSchool?.id,
      tanev: year1,
    },
    {
      skip: !selectedSchool?.id,
    }
  );

  const query2 = useGetOktatokEgyebTevByAlapadatokQuery(
    {
      alapadatokId: selectedSchool?.id,
      tanev: year2,
    },
    {
      skip: !selectedSchool?.id,
    }
  );

  const query3 = useGetOktatokEgyebTevByAlapadatokQuery(
    {
      alapadatokId: selectedSchool?.id,
      tanev: year3,
    },
    {
      skip: !selectedSchool?.id,
    }
  );

  const query4 = useGetOktatokEgyebTevByAlapadatokQuery(
    {
      alapadatokId: selectedSchool?.id,
      tanev: year4,
    },
    {
      skip: !selectedSchool?.id,
    }
  );

  // Combine all API data
  const allQueries = [query1, query2, query3, query4];
  const isLoadingData = allQueries.some((query) => query.isLoading);
  const apiError = allQueries.find((query) => query.error)?.error;
  const apiData = allQueries
    .map((query) => query.data)
    .filter(Boolean)
    .flat();

  const refetch = () => {
    allQueries.forEach((query) => query.refetch());
  };

  const [addOktatokEgyebTev, { isLoading: isAdding }] =
    useAddOktatokEgyebTevMutation();
  const [updateOktatokEgyebTev, { isLoading: isUpdating }] =
    useUpdateOktatokEgyebTevMutation();

  const isLoading = isLoadingData || isAdding || isUpdating;

  // Initialize data structure
  const initialData = useMemo(() => {
    const data = {};
    schoolYearsRef.current.forEach((year) => {
      data[year] = {
        // Szakértői tevékenység
        szakertoi_tevekenyseg: {
          szakkepzesi_szakerto: "",
          koznevelesi_szakerto: "",
          koznevelesi_szaktanacsado: "",
        },
        // Szakmai vizsga
        szakmai_vizsga: {
          vizsgafelugyelo: "",
          agazati_alapvizsgan_elnok: "",
          feladatkeszito_lektor: "",
        },
        // Érettségi vizsga
        erettsegi_vizsga: {
          erettsegi_elnok: "",
          emelt_erettsegi_vb_tag: "",
          emelt_erettsegi_vb_elnok: "",
          erettsegi_vizsgaztato: "",
        },
        // Egyéb tevékenységek
        tanterviro: "",
        tananyagfejleszto: "",
        tankonyv_jegyzetiro: "",
        szakmai_tisztsegviselo: "",
        // Oktatók létszáma - backend-ből jön
        oktatok_letszama: "",
      };
    });
    return data;
  }, []); // Empty deps array to make it stable

  // Track if data has been initialized from API
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Transform frontend data to API format
  const transformFrontendDataToApi = (frontendData, year) => {
    const yearStart = parseInt(year.split("/")[0]);
    const yearData = frontendData[year];

    return {
      alapadatok_id: selectedSchool?.id,
      tanev_kezdete: yearStart,
      // Szakértői tevékenység
      szakkepzesi_szakerto:
        parseInt(yearData?.szakertoi_tevekenyseg?.szakkepzesi_szakerto) || 0,
      koznevelesi_szakerto:
        parseInt(yearData?.szakertoi_tevekenyseg?.koznevelesi_szakerto) || 0,
      koznevelesi_szaktanacsado:
        parseInt(yearData?.szakertoi_tevekenyseg?.koznevelesi_szaktanacsado) ||
        0,
      // Vizsgák
      vizsgafelugyelo: parseInt(yearData?.szakmai_vizsga?.vizsgafelugyelo) || 0,
      agazati_alapvizsgan_elnok:
        parseInt(yearData?.szakmai_vizsga?.agazati_alapvizsgan_elnok) || 0,
      feladatkeszito_lektor:
        parseInt(yearData?.szakmai_vizsga?.feladatkeszito_lektor) || 0,
      // Érettségi vizsga
      erettsegi_elnok:
        parseInt(yearData?.erettsegi_vizsga?.erettsegi_elnok) || 0,
      emelt_erettsegi_vb_tag:
        parseInt(yearData?.erettsegi_vizsga?.emelt_erettsegi_vb_tag) || 0,
      emelt_erettsegi_vb_elnok:
        parseInt(yearData?.erettsegi_vizsga?.emelt_erettsegi_vb_elnok) || 0,
      erettsegi_vizsgaztato:
        parseInt(yearData?.erettsegi_vizsga?.erettsegi_vizsgaztato) || 0,
      // Egyéb
      tanterviro: parseInt(yearData?.tanterviro) || 0,
      tananyagfejleszto: parseInt(yearData?.tananyagfejleszto) || 0,
      tankonyv_jegyzetiro: parseInt(yearData?.tankonyv_jegyzetiro) || 0,
      szakmai_tisztsegviselo: parseInt(yearData?.szakmai_tisztsegviselo) || 0,
      // Oktatók létszáma
      oktatok_letszama: parseInt(yearData?.oktatok_letszama) || 0,
      createBy: uId || "",
    };
  };

  // Initialize data on mount and when API data changes
  useEffect(() => {
    if (
      apiData &&
      Array.isArray(apiData) &&
      apiData.length > 0 &&
      !isDataInitialized
    ) {
      // Use API data if available
      const frontendData = {};
      schoolYearsRef.current.forEach((year) => {
        const yearStart = parseInt(year.split("/")[0]);
        const record = apiData.find((r) => r.tanev_kezdete === yearStart);

        frontendData[year] = {
          szakertoi_tevekenyseg: {
            szakkepzesi_szakerto:
              record?.szakkepzesi_szakerto?.toString() || "",
            koznevelesi_szakerto:
              record?.koznevelesi_szakerto?.toString() || "",
            koznevelesi_szaktanacsado:
              record?.koznevelesi_szaktanacsado?.toString() || "",
          },
          szakmai_vizsga: {
            vizsgafelugyelo: record?.vizsgafelugyelo?.toString() || "",
            agazati_alapvizsgan_elnok:
              record?.agazati_alapvizsgan_elnok?.toString() || "",
            feladatkeszito_lektor:
              record?.feladatkeszito_lektor?.toString() || "",
          },
          erettsegi_vizsga: {
            erettsegi_elnok: record?.erettsegi_elnok?.toString() || "",
            emelt_erettsegi_vb_tag:
              record?.emelt_erettsegi_vb_tag?.toString() || "",
            emelt_erettsegi_vb_elnok:
              record?.emelt_erettsegi_vb_elnok?.toString() || "",
            erettsegi_vizsgaztato:
              record?.erettsegi_vizsgaztato?.toString() || "",
          },
          tanterviro: record?.tanterviro?.toString() || "",
          tananyagfejleszto: record?.tananyagfejleszto?.toString() || "",
          tankonyv_jegyzetiro: record?.tankonyv_jegyzetiro?.toString() || "",
          szakmai_tisztsegviselo:
            record?.szakmai_tisztsegviselo?.toString() || "",
          oktatok_letszama: record?.oktatok_letszama?.toString() || "",
          _recordId: record?.id,
        };
      });
      setData(frontendData);
      setIsModified(false);
      setIsDataInitialized(true);
    }
  }, [apiData, isDataInitialized]); // Removed schoolYears from deps

  // Initialize empty data structure once on mount if no API data
  useEffect(() => {
    if (
      !isLoadingData &&
      !isDataInitialized &&
      (!apiData || apiData.length === 0)
    ) {
      setData(initialData);
      setIsDataInitialized(true);
    }
  }, [isLoadingData, isDataInitialized, apiData]); // Removed initialData from deps

  // Handle API errors
  useEffect(() => {
    if (apiError) {
      setError("Hiba történt az adatok betöltése során!");
    } else {
      setError(null);
    }
  }, [apiError]);

  // Reset data when school changes
  useEffect(() => {
    setIsDataInitialized(false);
    setData({});
    setIsModified(false);
    setModifiedCells(new Set()); // Clear modified cells
  }, [selectedSchool?.id]);

  // Handle input changes
  const handleInputChange = (category, field, year, value) => {
    // Validate input - only allow non-negative integers
    if (value !== "" && (isNaN(value) || parseInt(value) < 0)) {
      return; // Don't update if invalid
    }

    // Create a unique key for the cell
    const cellKey = field
      ? `${year}-${category}-${field}`
      : `${year}-${category}`;

    if (category === "oktatok_letszama") {
      // Handle oktatok_letszama directly
      setData((prevData) => ({
        ...prevData,
        [year]: {
          ...prevData[year],
          oktatok_letszama: value,
        },
      }));
    } else if (
      typeof data[year]?.[category] === "object" &&
      data[year][category] !== null
    ) {
      // Handle nested objects (like szakertoi_tevekenyseg, szakmai_vizsga, etc.)
      setData((prevData) => ({
        ...prevData,
        [year]: {
          ...prevData[year],
          [category]: {
            ...prevData[year]?.[category],
            [field]: value,
          },
        },
      }));
    } else {
      // Handle direct fields (like tanterviro, tananyagfejleszto, etc.)
      setData((prevData) => ({
        ...prevData,
        [year]: {
          ...prevData[year],
          [category]: value,
        },
      }));
    }

    // Mark cell as modified
    setModifiedCells((prev) => new Set(prev).add(cellKey));
    setIsModified(true);
  };

  // Calculate totals for each category
  const calculateCategoryTotal = (yearData, category) => {
    if (!yearData || !yearData[category]) return 0;

    if (typeof yearData[category] === "object" && yearData[category] !== null) {
      // For nested objects, sum all values
      return Object.values(yearData[category]).reduce((sum, value) => {
        const num = parseInt(value) || 0;
        return sum + num;
      }, 0);
    } else {
      // For direct values
      return parseInt(yearData[category]) || 0;
    }
  };

  // Calculate overall total for a year
  const calculateYearTotal = (yearData) => {
    if (!yearData) return 0;
    const categories = [
      "szakertoi_tevekenyseg",
      "szakmai_vizsga",
      "erettsegi_vizsga",
      "tanterviro",
      "tananyagfejleszto",
      "tankonyv_jegyzetiro",
      "szakmai_tisztsegviselo",
    ];
    return categories.reduce((sum, category) => {
      return sum + calculateCategoryTotal(yearData, category);
    }, 0);
  };

  // Calculate percentage for szakertoi tevekenyseg
  const calculateSzakertoimPercentage = (yearData) => {
    if (!yearData) return 0;
    const oktAtokLetszama = parseInt(yearData.oktatok_letszama) || 0;
    const osszesenTevekenyseg = calculateYearTotal(yearData);

    if (oktAtokLetszama === 0) return 0;
    return ((osszesenTevekenyseg / oktAtokLetszama) * 100).toFixed(1);
  };

  // Check if a cell is modified
  const isCellModified = (category, field, year) => {
    const cellKey = field
      ? `${year}-${category}-${field}`
      : `${year}-${category}`;
    return modifiedCells.has(cellKey);
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedSchool?.id) {
      setNotification({
        open: true,
        message: "Nincs kiválasztott intézmény!",
        severity: "error",
      });
      return;
    }

    if (modifiedCells.size === 0) {
      setNotification({
        open: true,
        message: "Nincs módosított adat a mentéshez!",
        severity: "info",
      });
      return;
    }

    try {
      // Only save years that have modified cells
      const modifiedYears = new Set();
      modifiedCells.forEach((cellKey) => {
        const year = cellKey.split("-")[0];
        modifiedYears.add(year);
      });

      const savePromises = Array.from(modifiedYears).map(async (year) => {
        const apiPayload = transformFrontendDataToApi(data, year);
        const recordId = data[year]?._recordId;

        if (recordId) {
          // Update existing record
          return updateOktatokEgyebTev({
            id: recordId,
            ...apiPayload,
          });
        } else {
          // Create new record
          return addOktatokEgyebTev(apiPayload);
        }
      });

      await Promise.all(savePromises);

      setIsModified(false);
      setModifiedCells(new Set()); // Clear modified cells

      setNotification({
        open: true,
        message: "Az adatok sikeresen mentve lettek!",
        severity: "success",
      });

      // Refresh data from server to ensure consistency
      refetch();
    } catch (error) {
      console.error("Save error:", error);
      setNotification({
        open: true,
        message: "Hiba történt a mentés során!",
        severity: "error",
      });
    }
  };

  // Handle reset
  const handleReset = () => {
    setModifiedCells(new Set()); // Clear modified cells first

    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      // Recreate data from API if available
      const frontendData = {};
      schoolYearsRef.current.forEach((year) => {
        const yearStart = parseInt(year.split("/")[0]);
        const record = apiData.find((r) => r.tanev_kezdete === yearStart);

        frontendData[year] = {
          szakertoi_tevekenyseg: {
            szakkepzesi_szakerto:
              record?.szakkepzesi_szakerto?.toString() || "",
            koznevelesi_szakerto:
              record?.koznevelesi_szakerto?.toString() || "",
            koznevelesi_szaktanacsado:
              record?.koznevelesi_szaktanacsado?.toString() || "",
          },
          szakmai_vizsga: {
            vizsgafelugyelo: record?.vizsgafelugyelo?.toString() || "",
            agazati_alapvizsgan_elnok:
              record?.agazati_alapvizsgan_elnok?.toString() || "",
            feladatkeszito_lektor:
              record?.feladatkeszito_lektor?.toString() || "",
          },
          erettsegi_vizsga: {
            erettsegi_elnok: record?.erettsegi_elnok?.toString() || "",
            emelt_erettsegi_vb_tag:
              record?.emelt_erettsegi_vb_tag?.toString() || "",
            emelt_erettsegi_vb_elnok:
              record?.emelt_erettsegi_vb_elnok?.toString() || "",
            erettsegi_vizsgaztato:
              record?.erettsegi_vizsgaztato?.toString() || "",
          },
          tanterviro: record?.tanterviro?.toString() || "",
          tananyagfejleszto: record?.tananyagfejleszto?.toString() || "",
          tankonyv_jegyzetiro: record?.tankonyv_jegyzetiro?.toString() || "",
          szakmai_tisztsegviselo:
            record?.szakmai_tisztsegviselo?.toString() || "",
          oktatok_letszama: record?.oktatok_letszama?.toString() || "",
          _recordId: record?.id,
        };
      });
      setData(frontendData);
      setIsModified(false);
      setIsDataInitialized(true);
      setNotification({
        open: true,
        message: "Az adatok visszaállítva az eredeti értékekre!",
        severity: "info",
      });
    } else {
      // Reset to empty data structure
      setData(initialData);
      setIsModified(false);
      setIsDataInitialized(true);
      setNotification({
        open: true,
        message: "Az adatok visszaállítva üres értékekre!",
        severity: "info",
      });
    }
  };

  const categoryLabels = {
    szakertoi_tevekenyseg: "Szakértői tevékenység",
    szakmai_vizsga: "Szakmai vizsga",
    erettsegi_vizsga: "Érettségi vizsga",
    tanterviro: "Tantervíró",
    tananyagfejleszto: "Tananyag fejlesztő",
    tankonyv_jegyzetiro: "Tankönyv, jegyzet író",
    szakmai_tisztsegviselo: "Szakmai tisztségviselő",
  };

  const fieldLabels = {
    // Szakértői tevékenység
    szakkepzesi_szakerto: "Szakképzési szakértő",
    koznevelesi_szakerto: "Köznevelsési szakértő",
    koznevelesi_szaktanacsado: "Köznevelsési szaktanácsadó",

    // Szakmai vizsga
    vizsgafelugyelo: "Vizsgafelügyelő",
    agazati_alapvizsgan_elnok: "Ágazati alapvizsgán elnök",
    feladatkeszito_lektor: "Feladatkészítő, lektor",

    // Érettségi vizsga
    erettsegi_elnok: "Érettségi elnök",
    emelt_erettsegi_vb_tag: "Emelt szintű érettségi bizottság tag",
    emelt_erettsegi_vb_elnok: "Emelt szintű érettségi bizottság elnök",
    erettsegi_vizsgaztato: "Érettségi vizsgáztató",
  };

  return (
    <Box p={1}>
      <Typography variant="h5" gutterBottom>
        23. Oktatók egyéb tevékenységei
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Ez az oldal az oktatók iskolarendszeren kívüli egyéb tevékenységeit
        gyűjti össze különböző kategóriákban. Minden kategóriában megadható,
        hogy hány oktató végez ilyen jellegű tevékenységet.
      </Typography>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content - only show when not loading */}
      {!isLoading && (
        <>
          <Typography variant="body2" color="text.secondary" paragraph>
            💡 A módosított cellák sárga háttérrel vannak jelölve. Csak a módosított
            adatok kerülnek mentésre. Csak nem-negatív egész számok adhatók meg.
          </Typography>

          {/* Action buttons */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isModified || isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : "Mentés"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              disabled={!isModified || isLoading}
            >
          Visszaállítás
        </Button>
        {isModified && (
          <Chip
            label="Van nem mentett módosítás"
            color="warning"
            variant="outlined"
          />
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data table */}
      <Card sx={{ position: "relative" }}>
        <TableLoadingOverlay
          isLoading={isLoading}
          message="Adatok mentése folyamatban, kérjük várjon..."
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Oktatók egyéb tevékenységei tanévenkénti bontásban
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 300 }}>
                    Tevékenység típusa
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      {year}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(categoryLabels).map(
                  ([categoryKey, categoryLabel]) => {
                    const isObjectCategory =
                      typeof data[schoolYears[0]]?.[categoryKey] === "object" &&
                      data[schoolYears[0]]?.[categoryKey] !== null;

                    if (isObjectCategory) {
                      // Handle nested objects
                      return [
                        // Category header row
                        <TableRow key={`${categoryKey}-header`}>
                          <TableCell
                            colSpan={schoolYears.length + 1}
                            sx={{
                              backgroundColor: "primary.light",
                              color: "primary.contrastText",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {categoryLabel}
                          </TableCell>
                        </TableRow>,
                        // Field rows for this category
                        ...Object.entries(fieldLabels)
                          .filter(([fieldKey]) =>
                            data[schoolYears[0]]?.[categoryKey]?.hasOwnProperty(
                              fieldKey
                            )
                          )
                          .map(([fieldKey, fieldLabel]) => (
                            <TableRow key={`${categoryKey}-${fieldKey}`}>
                              <TableCell sx={{ pl: 3 }}>{fieldLabel}</TableCell>
                              {schoolYears.map((year) => (
                                <TableCell key={year} align="center">
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={
                                      data[year]?.[categoryKey]?.[fieldKey] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        categoryKey,
                                        fieldKey,
                                        year,
                                        e.target.value
                                      )
                                    }
                                    inputProps={{
                                      min: 0,
                                      step: 1,
                                      style: { textAlign: "center" },
                                    }}
                                    sx={{
                                      width: 80,
                                      borderRadius: 2,
                                      backgroundColor: isCellModified(
                                        categoryKey,
                                        fieldKey,
                                        year
                                      )
                                        ? "yellow"
                                        : "transparent",
                                    }}
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          )),
                        // Category total row
                        <TableRow key={`${categoryKey}-total`}>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "grey.100",
                              pl: 3,
                            }}
                          >
                            {categoryLabel} - Összesen
                          </TableCell>
                          {schoolYears.map((year) => (
                            <TableCell
                              key={year}
                              align="center"
                              sx={{
                                fontWeight: "bold",
                                backgroundColor: "grey.100",
                              }}
                            >
                              {calculateCategoryTotal(data[year], categoryKey)}
                            </TableCell>
                          ))}
                        </TableRow>,
                      ];
                    } else {
                      // Handle direct fields
                      return (
                        <TableRow key={categoryKey}>
                          <TableCell>{categoryLabel}</TableCell>
                          {schoolYears.map((year) => (
                            <TableCell key={year} align="center">
                              <TextField
                                size="small"
                                type="number"
                                value={data[year]?.[categoryKey] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    categoryKey,
                                    null,
                                    year,
                                    e.target.value
                                  )
                                }
                                inputProps={{
                                  min: 0,
                                  step: 1,
                                  style: { textAlign: "center" },
                                }}
                                sx={{
                                  width: 80,
                                  borderRadius: 2,
                                  backgroundColor: isCellModified(
                                    categoryKey,
                                    null,
                                    year
                                  )
                                    ? "yellow"
                                    : "transparent",
                                }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    }
                  }
                )}

                {/* Overall total row */}
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "orange",
                      color: "primary.contrastText",
                    }}
                  >
                    ÖSSZESEN
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "orange",
                        color: "primary.contrastText",
                      }}
                    >
                      {calculateYearTotal(data[year])}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Oktatók létszáma */}
                <TableRow
                  sx={{
                    backgroundColor: "lightgray",
                    fontWeight: "bold",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      borderTop: "2px solid #333",
                    }}
                  >
                    Oktatók létszáma (fő)
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      sx={{
                        borderTop: "2px solid #333",
                        fontWeight: "bold",
                      }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        value={data[year]?.oktatok_letszama || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "oktatok_letszama",
                            null,
                            year,
                            e.target.value
                          )
                        }
                        inputProps={{
                          min: 0,
                          step: 1,
                          style: { textAlign: "center" },
                        }}
                        sx={{
                          "& .MuiInputBase-input": {
                            textAlign: "center",
                            fontWeight: "bold",
                          },
                          backgroundColor: isCellModified(
                            "oktatok_letszama",
                            null,
                            year
                          )
                            ? "yellow"
                            : "transparent",
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>

                {/* Szakértői tevékenységet folytató oktatók aránya */}
                <TableRow
                  sx={{
                    backgroundColor: "lightblue",
                    fontWeight: "bold",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    Szakértői tevékenységet folytató oktatók aránya (%)
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {calculateSzakertoimPercentage(data[year])}%
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
        </>
      )}
    </Box>
  );
}
