import { useState, useMemo } from "react";
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
  Grid,
  Container,
  Fade,
  Tooltip,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Calculate as CalculateIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Input as InputIcon,
  Functions as FunctionsIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { generateSchoolYears } from "../utils/schoolYears";
import GenericYearlyChart from "../components/GenericYearlyChart";
import PageWrapper from "./PageWrapper";
import LockStatusIndicator from "../components/LockStatusIndicator";
import LockedTableWrapper from "../components/LockedTableWrapper";
import InfoEgyOktatoraJutoOsszDiak from "./indicators/27_egy_oktatora_juto_ossz_diak/info_egy_oktatora_juto_ossz_diak";
import TitleEgyOktatoraJutoOsszDiak from "./indicators/27_egy_oktatora_juto_ossz_diak/title_egy_oktatora_juto_ossz_diak";

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EgyOktatoraJutoOsszDiak() {
  const schoolYears = generateSchoolYears();

  const [totalWeeklyHoursPerTeacher, setTotalWeeklyHoursPerTeacher] =
    useState(22);

  // State for the different sections based on the image
  const [formData, setFormData] = useState({
    // Input fields only (calculated fields are computed automatically)
    tanuloiJogviszonyuTanulok: schoolYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {}),

    felnottkepzesiJogviszonyuTanulok: schoolYears.reduce((acc, year) => {
      acc[year] = 0;
      return acc;
    }, {}),

    fenntartoAltalEngedelyezettHetiOratulojJogviszony: schoolYears.reduce(
      (acc, year) => {
        acc[year] = 0;
        return acc;
      },
      {}
    ),

    fenntartoAltalEngedelyezettHetiOraFelnottkepzesi: schoolYears.reduce(
      (acc, year) => {
        acc[year] = 0;
        return acc;
      },
      {}
    ),
  });

  const [isModified, setIsModified] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle input changes
  const handleInputChange = (section, year, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [year]: parseFloat(value) || 0,
      },
    }));
    setIsModified(true);
  };

  // Calculate totals and all derived values
  const calculateTotals = useMemo(() => {
    const calculations = {};

    schoolYears.forEach((year) => {
      // 1. Calculate számított oktatói létszám (sum of both órátömeg fields)
      const tanuloiOratmeg =
        formData.fenntartoAltalEngedelyezettHetiOratulojJogviszony[year] || 0;
      const felnottkepzesiOratmeg =
        formData.fenntartoAltalEngedelyezettHetiOraFelnottkepzesi[year] || 0;
      const szamitottOktatoiLetszam =
        Math.ceil(
          (tanuloiOratmeg + felnottkepzesiOratmeg) / totalWeeklyHoursPerTeacher
        ) || 0;

      // 2. Calculate szakmai oktatásban tanulók összlétszáma (sum of both tanulók fields)
      const tanuloiTotal = formData.tanuloiJogviszonyuTanulok[year] || 0;
      const felnottkepzesiTotal =
        formData.felnottkepzesiJogviszonyuTanulok[year] || 0;
      const szakmaiOktatasOsszletszam = tanuloiTotal + felnottkepzesiTotal;

      // 3. Calculate egy oktatóra jutó tanulók száma
      const egyOktatoraJutoTanulok =
        szamitottOktatoiLetszam > 0
          ? (szakmaiOktatasOsszletszam / szamitottOktatoiLetszam).toFixed(2)
          : 0;

      calculations[year] = {
        szamitottOktatoiLetszam,
        szakmaiOktatasOsszletszam,
        egyOktatoraJutoTanulok,
      };
    });

    return calculations;
  }, [formData, schoolYears]);

  const handleSave = async () => {
    try {
      // Here you would implement the actual save logic
      // For now, just show success message
      setNotification({
        open: true,
        message: "Adatok sikeresen mentve!",
        severity: "success",
      });
      setIsModified(false);
    } catch (error) {
      setNotification({
        open: true,
        message: `Hiba történt a mentés során: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleReset = () => {
    // Reset all form data to zero
    setFormData({
      tanuloiJogviszonyuTanulok: schoolYears.reduce((acc, year) => {
        acc[year] = 0;
        return acc;
      }, {}),
      felnottkepzesiJogviszonyuTanulok: schoolYears.reduce((acc, year) => {
        acc[year] = 0;
        return acc;
      }, {}),
      fenntartoAltalEngedelyezettHetiOratulojJogviszony: schoolYears.reduce(
        (acc, year) => {
          acc[year] = 0;
          return acc;
        },
        {}
      ),
      fenntartoAltalEngedelyezettHetiOraFelnottkepzesi: schoolYears.reduce(
        (acc, year) => {
          acc[year] = 0;
          return acc;
        },
        {}
      ),
    });
    setIsModified(false);
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <PageWrapper
      titleContent={<TitleEgyOktatoraJutoOsszDiak />}
      infoContent={<InfoEgyOktatoraJutoOsszDiak />}
    >
      <Container maxWidth="xl">
        <Fade in={true} timeout={800}>
          <Box sx={{ minHeight: "calc(100vh - 120px)" }}>
            <LockStatusIndicator tableName="egy_oktatora_juto_ossz_diak" />

            {/* Action Buttons */}
            <Card
              elevation={3}
              sx={{
                mb: 2,
                bgcolor: "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ py: 1.5, px: 3 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2}>
                    <LockedTableWrapper tableName="egy_oktatora_juto_ossz_diak">
                      <Tooltip title="Módosítások mentése">
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={!isModified}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1.5,
                            fontWeight: 600,
                            boxShadow: isModified ? 3 : 1,
                          }}
                        >
                          Mentés
                        </Button>
                      </Tooltip>
                      <Tooltip title="Eredeti értékek visszaállítása">
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={handleReset}
                          disabled={!isModified}
                          sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 600 }}
                        >
                          Visszaállítás
                        </Button>
                      </Tooltip>
                    </LockedTableWrapper>
                  </Stack>
                  {isModified && (
                    <Chip
                      label="Módosítva"
                      color="warning"
                      variant="filled"
                      sx={{ fontWeight: 600, animation: "pulse 2s infinite" }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Tabs Navigation */}
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      minHeight: 50,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: "transparent",
                        transition: "background 0.3s ease",
                      },
                    },
                    "& .Mui-selected": {
                      background:
                        "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                      color: "white !important",
                    },
                    "& .MuiTab-root:hover:not(.Mui-selected)": {
                      backgroundColor: "rgba(102, 126, 234, 0.08)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Tab
                    icon={<AssessmentIcon />}
                    label="Eredmények"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<InputIcon />}
                    label="Adatbevitel"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<TimeIcon />}
                    label="Óratömegek"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<BarChartIcon />}
                    label="Grafikon"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab 1: Eredmények (Results) */}
              <TabPanel value={activeTab} index={0}>
                {/*
                Tanár óraszáma mező (22 óra/hét) - lehet szerkeszthető
              */}
                <Box sx={{ p: 2, textAlign: "left" }}>
                  <TextField
                    label="Egy tanár heti óraszáma"
                    type="number"
                    value={totalWeeklyHoursPerTeacher}
                    onChange={(e) =>
                      setTotalWeeklyHoursPerTeacher(
                        parseFloat(e.target.value) || 22
                      )
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                    size="small"
                    sx={{ width: 200 }}
                  />
                </Box>

                <Box sx={{ p: 3, bgcolor: "#fafbfc", minHeight: "400px" }}>
                  <Grid container spacing={3}>
                    {/* Main Result */}
                    <Grid item xs={12}>
                      <Card
                        elevation={6}
                        sx={{
                          border: "2px solid #4caf50",
                          bgcolor: "#e8f5e8",
                          borderRadius: 3,
                          boxShadow: "0 8px 24px rgba(76, 175, 80, 0.2)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 12px 32px rgba(76, 175, 80, 0.3)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 3 }}
                          >
                            <TrendingUpIcon
                              sx={{ color: "#4caf50", fontSize: 32 }}
                            />
                            <Box>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 700, color: "#4caf50" }}
                              >
                                Egy oktatóra jutó tanulók száma (Végeredmény)
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              >
                                Automatikusan számított: tanulók összlétszáma ÷
                                számított oktatói létszám
                              </Typography>
                            </Box>
                          </Stack>
                          <TableContainer component={Paper} elevation={3}>
                            <Table>
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #e8f5e8, #c8e6c9)",
                                  }}
                                >
                                  <TableCell
                                    sx={{ fontWeight: 700, fontSize: "1rem" }}
                                  >
                                    Végeredmény
                                  </TableCell>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ fontWeight: 700, fontSize: "1rem" }}
                                    >
                                      {year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #4caf5040, #66bb6a40)",
                                  }}
                                >
                                  <TableCell
                                    sx={{ fontWeight: 700, fontSize: "1rem" }}
                                  >
                                    Tanulók/Oktató
                                  </TableCell>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{
                                        fontWeight: 700,
                                        color: "#2e7d32",
                                        fontSize: "1rem",
                                        py: 2,
                                      }}
                                    >
                                      {calculateTotals[year]
                                        ?.egyOktatoraJutoTanulok || 0}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Supporting calculations */}
                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={3}
                        sx={{
                          border: "2px solid #ff9800",
                          bgcolor: "#fff3e0",
                          height: "100%",
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            <FunctionsIcon
                              sx={{ color: "#ff9800", fontSize: 28 }}
                            />
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#ff9800" }}
                            >
                              Számított oktatói létszám
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 2,
                              color: "text.secondary",
                              fontStyle: "italic",
                            }}
                          >
                            Óratömegek összege
                          </Typography>
                          <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #fff3e0, #ffe0b2)",
                                  }}
                                >
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{
                                        fontWeight: 700,
                                        color: "#ff9800",
                                        fontSize: "1.1rem",
                                      }}
                                    >
                                      {calculateTotals[year]
                                        ?.szamitottOktatoiLetszam || 0}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={3}
                        sx={{
                          border: "2px solid #2196f3",
                          bgcolor: "#e3f2fd",
                          height: "100%",
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            <GroupIcon sx={{ color: "#2196f3", fontSize: 28 }} />
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#2196f3" }}
                            >
                              Tanulók összlétszáma
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 2,
                              color: "text.secondary",
                              fontStyle: "italic",
                            }}
                          >
                            Tanulói + felnőttképzési
                          </Typography>
                          <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #e3f2fd, #bbdefb)",
                                  }}
                                >
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{
                                        fontWeight: 700,
                                        color: "#2196f3",
                                        fontSize: "1.1rem",
                                      }}
                                    >
                                      {calculateTotals[year]
                                        ?.szakmaiOktatasOsszletszam || 0}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab 2: Adatbevitel (Data Input) */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ p: 3, bgcolor: "#fafbfc", minHeight: "400px" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={3}
                        sx={{
                          height: "100%",
                          bgcolor: "#e3f2fd",
                          borderRadius: 3,
                          border: "1px solid rgba(33, 150, 243, 0.2)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 20px rgba(33, 150, 243, 0.15)",
                          },
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            <PersonIcon sx={{ color: "#2196f3", fontSize: 28 }} />
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, color: "#2196f3" }}
                              >
                                Tanulói jogviszonyú tanulók
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                (fő) - Hagyományos tanulók
                              </Typography>
                            </Box>
                          </Stack>
                          <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #e3f2fd, #bbdefb)",
                                  }}
                                >
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ py: 1 }}
                                    >
                                      <TextField
                                        type="number"
                                        value={
                                          formData.tanuloiJogviszonyuTanulok[year]
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            "tanuloiJogviszonyuTanulok",
                                            year,
                                            e.target.value
                                          )
                                        }
                                        size="small"
                                        inputProps={{
                                          min: 0,
                                          style: {
                                            textAlign: "center",
                                            fontWeight: 600,
                                          },
                                        }}
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "&:hover fieldset": {
                                              borderColor: "#2196f3",
                                            },
                                            "&.Mui-focused fieldset": {
                                              borderColor: "#2196f3",
                                            },
                                          },
                                        }}
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={2}
                        sx={{ height: "100%", bgcolor: "#e8f5e8" }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            <GroupIcon sx={{ color: "#4caf50", fontSize: 28 }} />
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, color: "#4caf50" }}
                              >
                                Felnőttképzési jogviszonyú tanulók
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                (fő) - Felnőtt tanulók
                              </Typography>
                            </Box>
                          </Stack>
                          <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #e8f5e8, #c8e6c9)",
                                  }}
                                >
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ py: 1 }}
                                    >
                                      <TextField
                                        type="number"
                                        value={
                                          formData
                                            .felnottkepzesiJogviszonyuTanulok[
                                          year
                                          ]
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            "felnottkepzesiJogviszonyuTanulok",
                                            year,
                                            e.target.value
                                          )
                                        }
                                        size="small"
                                        inputProps={{
                                          min: 0,
                                          style: {
                                            textAlign: "center",
                                            fontWeight: 600,
                                          },
                                        }}
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "&:hover fieldset": {
                                              borderColor: "#4caf50",
                                            },
                                            "&.Mui-focused fieldset": {
                                              borderColor: "#4caf50",
                                            },
                                          },
                                        }}
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab 3: Órátömegek (Hour Allocations) */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 3, bgcolor: "#fafbfc", minHeight: "400px" }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={2}
                        sx={{ height: "100%", bgcolor: "#f3e5f5" }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            <TimeIcon sx={{ color: "#7b1fa2", fontSize: 28 }} />
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, color: "#7b1fa2" }}
                              >
                                Tanulói jogviszony óratömeg
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                (óra/hét) - Hagyományos oktatás
                              </Typography>
                            </Box>
                          </Stack>
                          <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #f3e5f5, #e1bee7)",
                                  }}
                                >
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ py: 1 }}
                                    >
                                      <TextField
                                        type="number"
                                        value={
                                          formData
                                            .fenntartoAltalEngedelyezettHetiOratulojJogviszony[
                                          year
                                          ]
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            "fenntartoAltalEngedelyezettHetiOratulojJogviszony",
                                            year,
                                            e.target.value
                                          )
                                        }
                                        size="small"
                                        inputProps={{
                                          min: 0,
                                          style: {
                                            textAlign: "center",
                                            fontWeight: 600,
                                          },
                                        }}
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "&:hover fieldset": {
                                              borderColor: "#9c27b0",
                                            },
                                            "&.Mui-focused fieldset": {
                                              borderColor: "#9c27b0",
                                            },
                                          },
                                        }}
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card
                        elevation={2}
                        sx={{ height: "100%", bgcolor: "#fff3e0" }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            <TimeIcon sx={{ color: "#f57c00", fontSize: 28 }} />
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, color: "#f57c00" }}
                              >
                                Felnőttképzési óratömeg
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                (óra/hét) - Felnőttképzés
                              </Typography>
                            </Box>
                          </Stack>
                          <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                              <TableHead>
                                <TableRow
                                  sx={{
                                    background:
                                      "linear-gradient(45deg, #fff3e0, #ffcc02)",
                                  }}
                                >
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {year}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  {schoolYears.map((year) => (
                                    <TableCell
                                      key={year}
                                      align="center"
                                      sx={{ py: 1 }}
                                    >
                                      <TextField
                                        type="number"
                                        value={
                                          formData
                                            .fenntartoAltalEngedelyezettHetiOraFelnottkepzesi[
                                          year
                                          ]
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            "fenntartoAltalEngedelyezettHetiOraFelnottkepzesi",
                                            year,
                                            e.target.value
                                          )
                                        }
                                        size="small"
                                        inputProps={{
                                          min: 0,
                                          style: {
                                            textAlign: "center",
                                            fontWeight: 600,
                                          },
                                        }}
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "&:hover fieldset": {
                                              borderColor: "#ff9800",
                                            },
                                            "&.Mui-focused fieldset": {
                                              borderColor: "#ff9800",
                                            },
                                          },
                                        }}
                                      />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab 4: Grafikon (Chart) */}
              <TabPanel value={activeTab} index={3}>
                <Box sx={{ p: 3 }}>
                  {(() => {
                    // Prepare chart data
                    const chartData = schoolYears.map((year) => {
                      const yearData = calculateTotals[year] || {};
                      const totalStudents =
                        yearData.szakmaiOktatasOsszletszam || 0;
                      const calculatedTeachers =
                        yearData.szamitottOktatoiLetszam || 0;
                      const ratio =
                        calculatedTeachers > 0
                          ? totalStudents / calculatedTeachers
                          : 0;

                      return {
                        year: year,
                        totalStudents: totalStudents,
                        calculatedTeachers: calculatedTeachers,
                        studentTeacherRatio: parseFloat(ratio.toFixed(2)),
                      };
                    });

                    const chartDataKeys = [
                      "totalStudents",
                      "calculatedTeachers",
                      "studentTeacherRatio",
                    ];
                    const chartKeyLabels = {
                      totalStudents: "Összes tanuló",
                      calculatedTeachers: "Számított oktatói létszám",
                      studentTeacherRatio: "Egy oktatóra jutó diákok száma",
                    };

                    return (
                      <GenericYearlyChart
                        data={chartData}
                        dataKeys={chartDataKeys}
                        keyLabels={chartKeyLabels}
                        yAxisLabel="Érték"
                        height={450}
                        title="Oktató-diák arány alakulása évek szerint"
                      />
                    );
                  })()}
                </Box>
              </TabPanel>
            </Card>

            {/* Notification Snackbar */}
            <Snackbar
              open={notification.open}
              autoHideDuration={5000}
              onClose={handleNotificationClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              sx={{
                "& .MuiSnackbar-root": {
                  transform: notification.open
                    ? "translateY(0)"
                    : "translateY(100%)",
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                },
              }}
            >
              <Alert
                onClose={handleNotificationClose}
                severity={notification.severity}
                variant="filled"
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  "& .MuiAlert-icon": {
                    fontSize: "1.5rem",
                  },
                  "& .MuiAlert-action": {
                    alignItems: "center",
                  },
                }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
          </Box>
        </Fade>
      </Container>
    </PageWrapper>
  );
}
