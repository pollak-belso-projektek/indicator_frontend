import { useState, useEffect } from "react";
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

export default function OktatokEgyebTev() {
  const schoolYears = generateSchoolYears();

  // State for the form data
  const [data, setData] = useState({});
  const [isModified, setIsModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Initialize data structure
  useEffect(() => {
    const initialData = {};
    schoolYears.forEach((year) => {
      initialData[year] = {
        // Szakértői tevékenység
        szakertoi_tevekenyseg: {
          vizsgabiztossag: "",
          erettsegi_biztossag: "",
          szaktanacso: "",
          tantargyi_szakerto: "",
          kollegium_tag: "",
          egyeb_szakertoi: "",
        },
        // Oktatási és képzési tevékenység
        oktatas_kepzes: {
          felnottkepzes_oktato: "",
          esti_levelzo_oktato: "",
          tanfolyam_vezeto: "",
          korrepetitor: "",
          magantanar: "",
          egyeb_oktatas: "",
        },
        // Kutatási és fejlesztési tevékenység
        kutatas_fejlesztes: {
          tankonyviro: "",
          curriculum_fejleszto: "",
          szoftver_fejleszto: "",
          projekt_vezeto: "",
          palyazat_iro: "",
          egyeb_kutatas: "",
        },
        // Adminisztratív és vezetési tevékenység
        admin_vezetes: {
          intezmenyvezeto: "",
          hetvezeto: "",
          munkakornyivezeto: "",
          koordinator: "",
          bizottsag_tag: "",
          egyeb_admin: "",
        },
        // Társadalmi és szakmai szervezetekben való részvétel
        tarsadalmi_szakmai: {
          kamara_tag: "",
          szakmai_szervezet_tag: "",
          civil_szervezet_tag: "",
          onkormanyzati_tag: "",
          szakmai_testület_tag: "",
          egyeb_tarsadalmi: "",
        },
      };
    });
    setData(initialData);
  }, [schoolYears]);

  // Handle input changes
  const handleInputChange = (year, category, field, value) => {
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
    setIsModified(true);
  };

  // Calculate totals for each category
  const calculateCategoryTotal = (yearData, category) => {
    if (!yearData || !yearData[category]) return 0;
    return Object.values(yearData[category]).reduce((sum, value) => {
      const num = parseInt(value) || 0;
      return sum + num;
    }, 0);
  };

  // Calculate overall total for a year
  const calculateYearTotal = (yearData) => {
    if (!yearData) return 0;
    const categories = [
      "szakertoi_tevekenyseg",
      "oktatas_kepzes",
      "kutatas_fejlesztes",
      "admin_vezetes",
      "tarsadalmi_szakmai",
    ];
    return categories.reduce((sum, category) => {
      return sum + calculateCategoryTotal(yearData, category);
    }, 0);
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // API call would go here when backend is implemented
      // await saveOktatokEgyebTevData(data);

      setNotification({
        open: true,
        message: "Az adatok sikeresen mentve lettek!",
        severity: "success",
      });
      setIsModified(false);
    } catch (error) {
      setNotification({
        open: true,
        message: "Hiba történt a mentés során!",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    // Reset to original data when API is implemented
    setIsModified(false);
    setNotification({
      open: true,
      message: "Az adatok visszaállítva!",
      severity: "info",
    });
  };

  const categoryLabels = {
    szakertoi_tevekenyseg: "Szakértői tevékenység",
    oktatas_kepzes: "Oktatási és képzési tevékenység",
    kutatas_fejlesztes: "Kutatási és fejlesztési tevékenység",
    admin_vezetes: "Adminisztratív és vezetési tevékenység",
    tarsadalmi_szakmai: "Társadalmi és szakmai szervezetekben való részvétel",
  };

  const fieldLabels = {
    // Szakértői tevékenység
    vizsgabiztossag: "Vizsgabizottság tag",
    erettsegi_biztossag: "Érettségi bizottság tag",
    szaktanacso: "Szaktanácsadó",
    tantargyi_szakerto: "Tantárgyi szakértő",
    kollegium_tag: "Kollégium tag",
    egyeb_szakertoi: "Egyéb szakértői",

    // Oktatási és képzési tevékenység
    felnottkepzes_oktato: "Felnőttképzés oktató",
    esti_levelzo_oktato: "Esti/levelező oktató",
    tanfolyam_vezeto: "Tanfolyam vezető",
    korrepetitor: "Korrepetitor",
    magantanar: "Magántanár",
    egyeb_oktatas: "Egyéb oktatási",

    // Kutatási és fejlesztési tevékenység
    tankonyviro: "Tankönyvíró",
    curriculum_fejleszto: "Curriculum fejlesztő",
    szoftver_fejleszto: "Szoftver fejlesztő",
    projekt_vezeto: "Projekt vezető",
    palyazat_iro: "Pályázat író",
    egyeb_kutatas: "Egyéb kutatási",

    // Adminisztratív és vezetési tevékenység
    intezmenyvezeto: "Intézményvezető",
    hetvezeto: "Hét vezető",
    munkakornyivezeto: "Munkakörnyí vezető",
    koordinator: "Koordinátor",
    bizottsag_tag: "Bizottság tag",
    egyeb_admin: "Egyéb adminisztratív",

    // Társadalmi és szakmai szervezetekben való részvétel
    kamara_tag: "Kamara tag",
    szakmai_szervezet_tag: "Szakmai szervezet tag",
    civil_szervezet_tag: "Civil szervezet tag",
    onkormanyzati_tag: "Önkormányzati tag",
    szakmai_testület_tag: "Szakmai testület tag",
    egyeb_tarsadalmi: "Egyéb társadalmi",
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Oktatók egyéb tevékenységei
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Ez az oldal az oktatók iskolarendszeren kívüli egyéb tevékenységeit
        gyűjti össze különböző kategóriákban. Minden kategóriában megadható,
        hogy hány oktató végez ilyen jellegű tevékenységet.
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
      <Card>
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
                  ([categoryKey, categoryLabel]) => [
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
                                  data[year]?.[categoryKey]?.[fieldKey] || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    year,
                                    categoryKey,
                                    fieldKey,
                                    e.target.value
                                  )
                                }
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: 80 }}
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
                  ]
                )}

                {/* Overall total row */}
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    MINDÖSSZESEN
                  </TableCell>
                  {schoolYears.map((year) => (
                    <TableCell
                      key={year}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                      }}
                    >
                      {calculateYearTotal(data[year])}
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
    </Box>
  );
}
