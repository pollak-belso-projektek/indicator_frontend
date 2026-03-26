import { Fragment, useMemo, useState, useEffect, useCallback } from "react";
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
  Divider,
  Snackbar,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { selectSelectedSchool } from "../../../store/slices/authSlice";
import { useGetAllAlapadatokQuery } from "../../../store/api/apiSlice";
import { generateSchoolYears } from "../../../utils/schoolYears";
import PageWrapper from "../../PageWrapper";
import LockStatusIndicator from "../../../components/LockStatusIndicator";
import LockedTableWrapper from "../../../components/LockedTableWrapper";
import InfoSzakmaiVizsga from "./info_szakmai_vizsga";
import TitleSzakmaiVizsga from "./title_szakmai_vizsga";

const numberFormatter = new Intl.NumberFormat("hu-HU");

const normalizeValue = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return "";
  }
  return Math.max(0, parsed).toString();
};

const SzakmaiVizsga = () => {
  const schoolYears = useMemo(() => generateSchoolYears(), []);
  const selectedSchool = useSelector(selectSelectedSchool);

  const shouldFetchAllSchools =
    !!selectedSchool?.id && !selectedSchool?.alapadatok_szakirany;

  const {
    data: schoolsData,
    isLoading: isLoadingSchools,
    isFetching: isFetchingSchools,
  } = useGetAllAlapadatokQuery(undefined, {
    skip: !shouldFetchAllSchools,
  });

  const activeSchool = useMemo(() => {
    if (!selectedSchool?.id) return null;
    if (selectedSchool?.alapadatok_szakirany?.length) {
      return selectedSchool;
    }
    if (!schoolsData || !Array.isArray(schoolsData)) return null;
    return schoolsData.find((school) => school.id === selectedSchool.id) || null;
  }, [selectedSchool, schoolsData]);

  const availableProfessions = useMemo(() => {
    if (!activeSchool?.alapadatok_szakirany) return [];

    const unique = new Set();
    activeSchool.alapadatok_szakirany.forEach((szakiranyKapcsolat) => {
      szakiranyKapcsolat?.szakirany?.szakma?.forEach((szakmaKapcsolat) => {
        const name =
          szakmaKapcsolat?.szakma?.nev ||
          szakmaKapcsolat?.szakma?.megnevezes ||
          null;
        if (name) {
          unique.add(name);
        }
      });
    });

    return Array.from(unique).sort((a, b) =>
      a.localeCompare(b, "hu", { sensitivity: "base" }),
    );
  }, [activeSchool]);

  const createYearTemplate = useCallback(() => {
    return schoolYears.reduce((acc, year) => {
      acc[year] = "";
      return acc;
    }, {});
  }, [schoolYears]);

  const buildDataset = useCallback(
    (source, rows) => {
      if (!rows?.length) {
        return {};
      }

      const dataset = {};
      rows.forEach((rowKey) => {
        dataset[rowKey] = {
          ...createYearTemplate(),
          ...(source?.[rowKey] || {}),
        };
      });

      return dataset;
    },
    [createYearTemplate],
  );

  const [eligibleData, setEligibleData] = useState({});
  const [successfulData, setSuccessfulData] = useState({});
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setEligibleData({});
    setSuccessfulData({});
    setSavedSnapshot(null);
    setIsModified(false);
  }, [selectedSchool?.id]);

  useEffect(() => {
    if (!availableProfessions.length) {
      setEligibleData({});
      setSuccessfulData({});
      return;
    }

    setEligibleData((prev) => buildDataset(prev, availableProfessions));
    setSuccessfulData((prev) => buildDataset(prev, availableProfessions));
  }, [availableProfessions, buildDataset]);

  const sumForYear = useCallback(
    (dataset, year) => {
      if (!availableProfessions.length) return 0;
      return availableProfessions.reduce((sum, rowKey) => {
        const rawValue = dataset?.[rowKey]?.[year];
        if (rawValue === "" || rawValue === null || rawValue === undefined) {
          return sum;
        }
        const parsed = parseFloat(rawValue);
        if (Number.isNaN(parsed)) {
          return sum;
        }
        return sum + parsed;
      }, 0);
    },
    [availableProfessions],
  );

  const getNumericValue = useCallback(
    (dataset, rowKey, year) => {
      if (rowKey === "Összesen") {
        return sumForYear(dataset, year);
      }
      const rawValue = dataset?.[rowKey]?.[year];
      if (rawValue === "" || rawValue === null || rawValue === undefined) {
        return 0;
      }
      const parsed = parseFloat(rawValue);
      return Number.isNaN(parsed) ? 0 : parsed;
    },
    [sumForYear],
  );

  const getRatio = useCallback(
    (rowKey, year) => {
      const success = getNumericValue(successfulData, rowKey, year);
      const eligible = getNumericValue(eligibleData, rowKey, year);
      if (!eligible) {
        return "0.00";
      }
      return ((success / eligible) * 100).toFixed(2);
    },
    [eligibleData, successfulData, getNumericValue],
  );

  const yearlySummary = useMemo(
    () =>
      schoolYears.map((year) => ({
        year,
        ratio: getRatio("Összesen", year),
        success: getNumericValue(successfulData, "Összesen", year),
        eligible: getNumericValue(eligibleData, "Összesen", year),
      })),
    [schoolYears, getRatio, getNumericValue, successfulData, eligibleData],
  );

  const rowsForTable = useMemo(() => {
    if (!availableProfessions.length) {
      return [];
    }
    return ["Összesen", ...availableProfessions];
  }, [availableProfessions]);

  const handleEligibleChange = useCallback(
    (rowKey, year, value) => {
      if (rowKey === "Összesen") return;
      const normalized = normalizeValue(value);
      setEligibleData((prev) => {
        const baseRow = prev[rowKey]
          ? { ...prev[rowKey] }
          : createYearTemplate();
        baseRow[year] = normalized;
        return {
          ...prev,
          [rowKey]: baseRow,
        };
      });
      setIsModified(true);
    },
    [createYearTemplate],
  );

  const handleSuccessfulChange = useCallback(
    (rowKey, year, value) => {
      if (rowKey === "Összesen") return;
      const normalized = normalizeValue(value);
      setSuccessfulData((prev) => {
        const baseRow = prev[rowKey]
          ? { ...prev[rowKey] }
          : createYearTemplate();
        baseRow[year] = normalized;
        return {
          ...prev,
          [rowKey]: baseRow,
        };
      });
      setIsModified(true);
    },
    [createYearTemplate],
  );

  const handleSave = () => {
    setSavedSnapshot({
      eligible: JSON.parse(JSON.stringify(eligibleData)),
      success: JSON.parse(JSON.stringify(successfulData)),
    });
    setIsModified(false);
    setSnackbarState({
      open: true,
      message: "Ideiglenes mentés sikeres. Backend mentés integrációra vár.",
      severity: "success",
    });
  };

  const handleReset = () => {
    if (!savedSnapshot) return;
    setEligibleData(buildDataset(savedSnapshot.eligible, availableProfessions));
    setSuccessfulData(
      buildDataset(savedSnapshot.success, availableProfessions),
    );
    setIsModified(false);
  };

  const closeSnackbar = () => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const formatCount = (value) => numberFormatter.format(Math.round(value) || 0);

  const isBusyWithSchoolData =
    shouldFetchAllSchools && (isLoadingSchools || isFetchingSchools);

  return (
    <PageWrapper
      titleContent={<TitleSzakmaiVizsga />}
      infoContent={<InfoSzakmaiVizsga />}
    >
      <Box>
        <LockStatusIndicator tableName="szakmai_vizsga_eredmenyek" />

        {!selectedSchool && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Kérjük, válasszon egy iskolát a felső menüsorban a szakmai vizsga
            adatok megtekintéséhez.
          </Alert>
        )}

        {selectedSchool && isBusyWithSchoolData && !activeSchool && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {selectedSchool && !activeSchool && !isBusyWithSchoolData && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Nem található részletes adat a kiválasztott intézményhez. Ellenőrizze,
            hogy az Iskolák menüpontban fel van-e véve minden szükséges információ.
          </Alert>
        )}

        {selectedSchool && activeSchool && (
          <Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2, mb: 3 }}>
              <Chip
                color="primary"
                label={`Iskola: ${activeSchool.iskola_neve || "ismeretlen"}`}
              />
              <Chip
                color="secondary"
                label={`Intézménytípus: ${activeSchool.intezmeny_tipus || "nincs megadva"}`}
              />
              <Chip
                label={`Elérhető szakmák: ${availableProfessions.length}`}
                variant="outlined"
              />
              <Chip label={`Kezelt tanévek: ${schoolYears.length}`} variant="outlined" />
            </Stack>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mutató definíciója
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  A sikeres szakmai vizsgát tett tanulók aránya a vizsgára
                  bocsátható tanulók számához viszonyítva. Az arány automatikusan
                  számítódik a megadott vizsgára bocsátható és sikeres vizsgát tett
                  létszámok alapján.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {yearlySummary.map((summary) => (
                    <Card key={summary.year} variant="outlined" sx={{ minWidth: 200 }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {summary.year}
                        </Typography>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                          {summary.ratio}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sikeres: {formatCount(summary.success)} fő · Vizsgára
                          bocsátható: {formatCount(summary.eligible)} fő
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {!availableProfessions.length ? (
              <Alert severity="info">
                A kiválasztott intézményhez még nincs szakma hozzárendelve.
                Vegye fel a szükséges szakmákat az Iskolák menüpontban,
                vagy az intézményi alapadatok szerkesztésével.
              </Alert>
            ) : (
              <>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <LockedTableWrapper tableName="szakmai_vizsga_eredmenyek">
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={!isModified || !availableProfessions.length}
                    >
                      Mentés
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleReset}
                      disabled={!isModified || !savedSnapshot}
                    >
                      Visszaállítás
                    </Button>
                  </LockedTableWrapper>
                </Stack>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell rowSpan={2} sx={{ fontWeight: "bold", minWidth: 220 }}>
                          Szakma
                        </TableCell>
                        {schoolYears.map((year) => (
                          <TableCell key={`${year}-header`} align="center" colSpan={3} sx={{ fontWeight: "bold" }}>
                            {year}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow sx={{ backgroundColor: "#fafafa" }}>
                        {schoolYears.map((year) => (
                          <Fragment key={`${year}-metric-head`}>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "#1565c0" }}>
                              Arány (%)
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                              Sikeres (fő)
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "#ef6c00" }}>
                              Vizsgára bocsátható (fő)
                            </TableCell>
                          </Fragment>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rowsForTable.map((rowKey) => {
                        const isTotalRow = rowKey === "Összesen";
                        return (
                          <TableRow
                            key={rowKey}
                            sx={{
                              backgroundColor: isTotalRow ? "#fffde7" : undefined,
                            }}
                          >
                            <TableCell sx={{ fontWeight: isTotalRow ? "bold" : "medium" }}>
                              {rowKey}
                            </TableCell>
                            {schoolYears.map((year) => (
                              <Fragment key={`${rowKey}-${year}-metrics`}>
                                <TableCell align="center" sx={{ fontWeight: isTotalRow ? 600 : 500 }}>
                                  {getRatio(rowKey, year)}%
                                </TableCell>
                                <TableCell align="center">
                                  {isTotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {formatCount(
                                        getNumericValue(successfulData, rowKey, year),
                                      )}
                                    </Typography>
                                  ) : (
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={successfulData?.[rowKey]?.[year] ?? ""}
                                      onChange={(event) =>
                                        handleSuccessfulChange(
                                          rowKey,
                                          year,
                                          event.target.value,
                                        )
                                      }
                                      inputProps={{
                                        min: 0,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                        style: { textAlign: "center" },
                                      }}
                                      sx={{ width: 100 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {isTotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {formatCount(
                                        getNumericValue(eligibleData, rowKey, year),
                                      )}
                                    </Typography>
                                  ) : (
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={eligibleData?.[rowKey]?.[year] ?? ""}
                                      onChange={(event) =>
                                        handleEligibleChange(
                                          rowKey,
                                          year,
                                          event.target.value,
                                        )
                                      }
                                      inputProps={{
                                        min: 0,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                        style: { textAlign: "center" },
                                      }}
                                      sx={{ width: 100 }}
                                    />
                                  )}
                                </TableCell>
                              </Fragment>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}

        <Snackbar
          open={snackbarState.open}
          autoHideDuration={4000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={closeSnackbar}
            severity={snackbarState.severity}
            sx={{ width: "100%" }}
          >
            {snackbarState.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageWrapper>
  );
};

export default SzakmaiVizsga;
