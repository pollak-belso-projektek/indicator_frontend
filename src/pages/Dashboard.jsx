import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  Alert,
  Collapse,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Dashboard as DashboardIcon,
  DataUsage as DataIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import TokenDebugPanel from "../components/TokenDebugPanel";
import {
  selectUserPermissions,
  selectUserTableAccess,
  selectUser,
  selectSelectedSchool,
} from "../store/slices/authSlice";
import CacheDebugPanel from "../components/CacheDebugPanel";

import { useCheckHealthQuery } from "../store/api/healthSlice";
import { useRedirectNotification } from "../hooks/useRedirectNotification";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showDebugPanels, setShowDebugPanels] = useState(false);

  // Use redirect notification hook to handle access denied notifications
  useRedirectNotification();

  const user = useSelector(selectUser);
  const userPermissions = useSelector(selectUserPermissions);
  const tableAccess = useSelector(selectUserTableAccess);
  const selectedSchool = useSelector(selectSelectedSchool);

  const isSuperadmin = userPermissions?.isSuperadmin || false;
  const isAdmin = userPermissions?.isAdmin || false;
  const isHSZC = userPermissions?.isHSZC || false;

  const { data: healthResponse, error: healthError } = useCheckHealthQuery();

  // Extract health data from the response structure
  // Success case: healthResponse directly contains the health data
  // Error case: healthError.data contains the health data (like HTTP 503 with health info)
  const healthData = healthResponse || healthError?.data;

  useEffect(() => {
    console.log("Health check response:", healthResponse);
    console.log("Health check data:", healthData);
    console.log("Health check error:", healthError);
  }, [healthResponse, healthData, healthError]);

  // Helper functions for health data formatting
  const formatUptime = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes) => {
    if (!bytes) return "N/A";
    const mb = (bytes / 1024 / 1024).toFixed(1);
    return `${mb} MB`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("hu-HU");
  };

  // Get overall system health status
  const getSystemHealth = () => {
    if (!healthData) return { status: "unknown", color: "default" };

    // If we have health data, use it regardless of HTTP error status
    const overallStatus = healthData.status;

    // Calculate health based on available services
    const services = healthData.services || {};
    const serviceStatuses = Object.values(services);
    const totalServices = serviceStatuses.length;
    const healthyServices = serviceStatuses.filter(
      (service) => service.status === "healthy"
    ).length;
    const unhealthyServices = totalServices - healthyServices;

    // If overall status is healthy and no unhealthy services
    if (overallStatus === "healthy" && unhealthyServices === 0) {
      return { status: "healthy", color: "success" };
    } else if (unhealthyServices > 0 || overallStatus === "degraded") {
      return { status: "degraded", color: "warning" };
    } else {
      return { status: "unhealthy", color: "error" };
    }
  };

  // Quick access items based on user permissions
  const getQuickAccessItems = () => {
    const items = [];

    // Always available
    items.push({
      title: "Alapadatok",
      description: "Intézmény alapadatainak megtekintése és szerkesztése",
      icon: <SettingsIcon />,
      color: "primary",
      route: "/alapadatok",
    });

    if (tableAccess && Array.isArray(tableAccess)) {
      const accessibleTables = tableAccess.map((access) => access.tableName);

      if (accessibleTables.includes("tanulo_letszam")) {
        items.push({
          title: "Tanulólétszám",
          description: "Tanulók létszámadatainak kezelése",
          icon: <GroupIcon />,
          color: "secondary",
          route: "/tanulo_letszam",
        });
      }

      if (accessibleTables.includes("kompetencia")) {
        items.push({
          title: "Kompetenciamérés",
          description: "Kompetenciamérés eredményeinek nyomon követése",
          icon: <AssessmentIcon />,
          color: "success",
          route: "/kompetencia",
        });
      }

      if (accessibleTables.includes("versenyek")) {
        items.push({
          title: "Versenyek",
          description: "Versenyeredmények és díjak kezelése",
          icon: <StarIcon />,
          color: "warning",
          route: "/versenyek",
        });
      }

      if (accessibleTables.includes("szakmai_eredmenyek")) {
        items.push({
          title: "Szakmai eredmények",
          description: "Szakmai, közismereti és kulturális eredmények",
          icon: <TrendingUpIcon />,
          color: "info",
          route: "/szakmai-eredmenyek",
        });
      }

      if (accessibleTables.includes("elhelyezkedesi_mutato")) {
        items.push({
          title: "Elhelyezkedési mutató",
          description: "Végzettek elhelyezkedési adatainak követése",
          icon: <WorkIcon />,
          color: "success",
          route: "/elhelyezkedesi-mutato",
        });
      }
    }

    // Admin and superadmin specific items
    if (isAdmin || isSuperadmin) {
      items.push({
        title: "Adatok importálása",
        description: "Adatok importálása a Kréta rendszerből",
        icon: <DataIcon />,
        color: "error",
        route: "/adat-import",
      });
    }

    if (isSuperadmin) {
      items.push({
        title: "Felhasználók",
        description: "Felhasználók és jogosultságok kezelése",
        icon: <PersonIcon />,
        color: "primary",
        route: "/users",
      });

      items.push({
        title: "Táblák",
        description: "Adatbázis táblák kezelése",
        icon: <SettingsIcon />,
        color: "secondary",
        route: "/table-management",
      });

      items.push({
        title: "Iskolák",
        description: "Összes iskola megtekintése és kezelése",
        icon: <SchoolIcon />,
        color: "secondary",
        route: "/schools",
      });
    }

    return items.slice(0, 8); // Limit to 8 items for better layout
  };

  const quickAccessItems = getQuickAccessItems();

  // User type description
  const getUserTypeDescription = () => {
    if (isSuperadmin)
      return "Teljes rendszerhez való hozzáférés minden funkcióval";
    if (isAdmin) return "Adminisztrátori jogosultságok az intézmény adataihoz";
    if (isHSZC) return "HSZC szintű hozzáférés több intézmény adataihoz";
    return "Alapszintű hozzáférés az intézmény adataihoz";
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              <DashboardIcon sx={{ mr: 2, verticalAlign: "middle" }} />
              Üdvözöljük a rendszerben!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              {user?.name || "Felhasználó"}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              {getUserTypeDescription()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Elérhető funkciók
                  </Typography>
                  <Typography variant="h4">
                    {quickAccessItems.length}
                  </Typography>
                </Box>
                <DataIcon sx={{ fontSize: 40, color: "primary.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tábla jogosultságok
                  </Typography>
                  <Typography variant="h4">
                    {tableAccess ? tableAccess.length : 0}
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: "success.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Felhasználói szint
                  </Typography>
                  <Typography variant="h6">
                    {isSuperadmin
                      ? "Fejlesztő"
                      : isAdmin
                      ? "Admin"
                      : isHSZC
                      ? "HSZC"
                      : "Alapszint"}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: "info.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Rendszer állapot
                  </Typography>
                  {healthData ? (
                    <Box>
                      {(() => {
                        const systemHealth = getSystemHealth();
                        const statusLabels = {
                          healthy: "Egészséges",
                          degraded: "Részlegesen működik",
                          unhealthy: "Problémás",
                          unknown: "Ismeretlen",
                        };
                        return (
                          <Chip
                            label={statusLabels[systemHealth.status]}
                            color={systemHealth.color}
                            size="small"
                            icon={
                              systemHealth.status === "healthy" ? (
                                <CheckCircleIcon />
                              ) : (
                                <ErrorIcon />
                              )
                            }
                          />
                        );
                      })()}
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        {healthData.services
                          ? `${
                              Object.values(healthData.services).filter(
                                (service) => service.status === "healthy"
                              ).length
                            }/${
                              Object.keys(healthData.services).length
                            } szolgáltatás`
                          : `v${healthData.version || "ismeretlen"}`}
                      </Typography>
                    </Box>
                  ) : healthError ? (
                    <Chip
                      label="Offline"
                      color="error"
                      size="small"
                      icon={<ErrorIcon />}
                    />
                  ) : (
                    <Chip label="Ellenőrzés..." color="default" size="small" />
                  )}
                </Box>
                <TrendingUpIcon
                  sx={{
                    fontSize: 40,
                    color: getSystemHealth().color + ".main",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Access Section */}
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        Gyors hozzáférés
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickAccessItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(item.route)}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <Box sx={{ mr: 2, color: `${item.color}.main` }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
                <Button size="small" color={item.color} sx={{ mt: 1 }}>
                  Megnyitás
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Health Status Section - Only show if health data is available */}
      {healthData && (
        <>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            Rendszer részletek
          </Typography>

          {/* Services Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
                    <Typography variant="h6">Szolgáltatások</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Összes:
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {healthData.services
                        ? Object.keys(healthData.services).length
                        : 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Egészséges:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {healthData.services
                        ? Object.values(healthData.services).filter(
                            (service) => service.status === "healthy"
                          ).length
                        : 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Problémás:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {healthData.services
                        ? Object.values(healthData.services).filter(
                            (service) => service.status !== "healthy"
                          ).length
                        : 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <TimerIcon sx={{ mr: 1, color: "info.main" }} />
                    <Typography variant="h6">Gateway</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {formatUptime(healthData.uptime)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 1 }}
                  >
                    Működési idő
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {healthData.version
                      ? `v${healthData.version}`
                      : "Verzió ismeretlen"}{" "}
                    | {formatTimestamp(healthData.timestamp)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <StorageIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Adatbázis</Typography>
                  </Box>
                  {(() => {
                    // Check if we have direct database info or through services
                    const directDb = healthData.database;
                    const mainService = healthData.services?.main_service;
                    const dbFromService = mainService?.healthData?.database;

                    // Use direct database info if available, otherwise try service data
                    const dbInfo = directDb || dbFromService;
                    const dbStatus = dbInfo?.status;

                    if (!dbInfo) {
                      return (
                        <Box sx={{ textAlign: "center" }}>
                          <Chip
                            label="Nincs adat"
                            color="default"
                            size="small"
                          />
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 1 }}
                          >
                            Adatbázis információ nem elérhető
                          </Typography>
                        </Box>
                      );
                    }

                    return (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            Állapot:
                          </Typography>
                          <Chip
                            label={
                              dbStatus === "connected" || dbStatus === "healthy"
                                ? "Kapcsolódva"
                                : "Lecsatlakozva"
                            }
                            color={
                              dbStatus === "connected" || dbStatus === "healthy"
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            Válaszidő:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {dbInfo.responseTime || "N/A"}
                          </Typography>
                        </Box>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Individual Services */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Szolgáltatások részletei
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {healthData.services &&
              Object.entries(healthData.services).map(
                ([serviceName, serviceData]) => (
                  <Grid item xs={12} md={6} key={serviceName}>
                    <Card
                      sx={{
                        border:
                          serviceData.status !== "healthy"
                            ? "2px solid"
                            : "none",
                        borderColor:
                          serviceData.status === "unhealthy"
                            ? "error.main"
                            : "inherit",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6">
                            {serviceName
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Typography>
                          <Chip
                            label={
                              serviceData.status === "healthy"
                                ? "Egészséges"
                                : "Problémás"
                            }
                            color={
                              serviceData.status === "healthy"
                                ? "success"
                                : "error"
                            }
                            size="small"
                            icon={
                              serviceData.status === "healthy" ? (
                                <CheckCircleIcon />
                              ) : (
                                <ErrorIcon />
                              )
                            }
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                          >
                            Utolsó ellenőrzés:{" "}
                            {formatTimestamp(serviceData.lastCheck)}
                          </Typography>
                          {serviceData.healthData?.version && (
                            <Typography variant="body2" color="textSecondary">
                              Verzió: {serviceData.healthData.version}
                            </Typography>
                          )}
                        </Box>

                        {/* Error message for unhealthy services */}
                        {serviceData.status !== "healthy" &&
                          serviceData.error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Hiba:
                              </Typography>
                              <Typography variant="body2">
                                {serviceData.error}
                              </Typography>
                            </Alert>
                          )}

                        {/* Service-specific memory and uptime data - only show if service is healthy */}
                        {serviceData.status === "healthy" &&
                        serviceData.healthData ? (
                          <>
                            {serviceData.healthData.memory && (
                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  gutterBottom
                                >
                                  Memória:
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    RSS:
                                  </Typography>
                                  <Typography variant="caption">
                                    {formatMemory(
                                      serviceData.healthData.memory.rss
                                    )}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    Heap használt:
                                  </Typography>
                                  <Typography variant="caption">
                                    {formatMemory(
                                      serviceData.healthData.memory.heapUsed
                                    )}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            {serviceData.healthData.uptime && (
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  gutterBottom
                                >
                                  Működési idő:{" "}
                                  {formatUptime(serviceData.healthData.uptime)}
                                </Typography>
                              </Box>
                            )}
                          </>
                        ) : (
                          serviceData.status !== "healthy" && (
                            <Box sx={{ textAlign: "center", py: 2 }}>
                              <ErrorIcon
                                sx={{
                                  fontSize: 48,
                                  color: "error.main",
                                  mb: 1,
                                }}
                              />
                              <Typography variant="body2" color="error">
                                A szolgáltatás nem elérhető
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Memória és működési idő adatok nem elérhetők
                              </Typography>
                            </Box>
                          )
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
          </Grid>
        </>
      )}

      {/* Health Error Alert - Only show if no health data is available */}
      {healthError && !healthData && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            Rendszer állapot ellenőrzése sikertelen
          </Typography>
          <Typography variant="body2">
            A backend szerver nem elérhető vagy hibás válaszokat ad.
          </Typography>
        </Alert>
      )}

      {/* HTTP Error but with Health Data Alert */}
      {healthError && healthData && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            Rendszer állapot problémás (HTTP {healthError.status || "hiba"})
          </Typography>
          <Typography variant="body2">
            A backend szerver hibás válaszokat ad, de részleges
            állapotinformációk elérhetők.
          </Typography>
        </Alert>
      )}

      {/* Degraded System Alert */}
      {healthData && healthData.status === "degraded" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            Részlegesen működő rendszer
          </Typography>
          <Typography variant="body2">
            Egy vagy több szolgáltatás nem működik megfelelően.
            {healthData.services &&
              ` ${
                Object.values(healthData.services).filter(
                  (service) => service.status !== "healthy"
                ).length
              } szolgáltatás problémás a ${
                Object.keys(healthData.services).length
              } szolgáltatásból.`}
          </Typography>
        </Alert>
      )}

      {/* Recent Activity / Instructions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Használati útmutató
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Alapadatok"
                    secondary="Kezdje az intézmény alapadatainak ellenőrzésével és frissítésével"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tanulói adatok"
                    secondary="Vigye fel vagy importálja a tanulói létszám adatokat"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssessmentIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Eredmények"
                    secondary="Rögzítse a különböző mérések és versenyek eredményeit"
                  />
                </ListItem>
                {(isAdmin || isSuperadmin) && (
                  <ListItem>
                    <ListItemIcon>
                      <DataIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Adatimport"
                      secondary="Importáljon adatokat közvetlenül a Kréta rendszerből"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jogosultságok
              </Typography>
              {tableAccess && tableAccess.length > 0 ? (
                <Stack spacing={1}>
                  {tableAccess.slice(0, 5).map((access, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">
                        {access.tableName}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {access.permissionsDetails?.canRead && (
                          <Chip label="Olvasás" size="small" color="info" />
                        )}
                        {access.permissionsDetails?.canCreate && (
                          <Chip
                            label="Létrehozás"
                            size="small"
                            color="success"
                          />
                        )}
                        {access.permissionsDetails?.canUpdate && (
                          <Chip
                            label="Módosítás"
                            size="small"
                            color="warning"
                          />
                        )}
                        {access.permissionsDetails?.canDelete && (
                          <Chip label="Törlés" size="small" color="error" />
                        )}
                      </Stack>
                    </Box>
                  ))}
                  {tableAccess.length > 5 && (
                    <Typography variant="body2" color="textSecondary">
                      ... és még {tableAccess.length - 5} jogosultság
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Alert severity="info">
                  Nincsenek specifikus tábla jogosultságok beállítva.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Debug Panel Section - Only for privileged users */}
      {(isSuperadmin || isAdmin) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Fejlesztői eszközök</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={showDebugPanels}
                    onChange={(e) => setShowDebugPanels(e.target.checked)}
                    icon={<VisibilityOffIcon />}
                    checkedIcon={<VisibilityIcon />}
                  />
                }
                label={
                  showDebugPanels
                    ? "Debug panel elrejtése"
                    : "Debug panel megjelenítése"
                }
              />
            </Box>

            <Collapse in={showDebugPanels}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Ezek a eszközök csak fejlesztési és hibakeresési célokra
                szolgálnak.
              </Alert>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TokenDebugPanel />
                <CacheDebugPanel />
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
