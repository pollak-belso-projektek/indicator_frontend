import { useSelector } from "react-redux";
import { useState } from "react";
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [showDebugPanels, setShowDebugPanels] = useState(false);

  const user = useSelector(selectUser);
  const userPermissions = useSelector(selectUserPermissions);
  const tableAccess = useSelector(selectUserTableAccess);
  const selectedSchool = useSelector(selectSelectedSchool);

  const isSuperadmin = userPermissions?.isSuperadmin || false;
  const isAdmin = userPermissions?.isAdmin || false;
  const isHSZC = userPermissions?.isHSZC || false;

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
                      ? "Superadmin"
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
                  <Chip label="Aktív" color="success" size="small" />
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: "warning.main" }} />
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
