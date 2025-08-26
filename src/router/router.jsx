import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import NavigationWithLoading from "../components/NavigationWithLoading.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import TableProtectedRoute from "../components/TableProtectedRoute.jsx";
import TokenValidationGuard from "../components/TokenValidationGuard.jsx";
import ProactiveTokenRefresh from "../components/ProactiveTokenRefresh.jsx";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import SchoolSelectionIndicator from "../components/SchoolSelectionIndicator.jsx";
import { LoadingProvider } from "../contexts/LoadingContext.jsx";
import RouteLoadingSpinner from "../components/RouteLoadingSpinner.jsx";

const LoginPage = lazy(() => import("../pages/Login"));
const DashboardPage = lazy(() => import("../pages/Dashboard"));
const AlapadatokPage = lazy(() => import("../pages/Alapadatok"));
const DataImportPage = lazy(() => import("../pages/DataImport"));
const TanuloletszamPage = lazy(() => import("../pages/Tanuloletszam.jsx"));
const KompetenciaPage = lazy(() => import("../pages/Kompetencia.jsx"));
const VersenyekPage = lazy(() => import("../pages/Versenyek.jsx"));
const UsersPage = lazy(() => import("../pages/Users.jsx"));
const TableManagementPage = lazy(() =>
  import("../pages/TableManagementPage.jsx")
);
const SchoolsPage = lazy(() => import("../pages/Schools.jsx"));
const FelnottkepzesPage = lazy(() => import("../pages/Felnottkepzes.jsx"));
const OrszagosKompetenciameresPage = lazy(() =>
  import("../pages/OrszagosKompetenciameres.jsx")
);
const NszfhMeresekPage = lazy(() => import("../pages/NszfhMeresek.jsx"));
const SzakmaiEredmenyekPage = lazy(() =>
  import("../pages/SzakmaiEredmenyek.jsx")
);
const ElhelyezkedesimMutatoPage = lazy(() =>
  import("../pages/ElhelyezkedesimMutato.jsx")
);
const VegzettekElegedettsegePage = lazy(() =>
  import("../pages/VegzettekElegedettsege.jsx")
);
const VizsgaeredmenyekPage = lazy(() =>
  import("../pages/Vizsgaeredmenyek.jsx")
);
const IntezményiElismeresekPage = lazy(() =>
  import("../pages/IntezményiElismeresek.jsx")
);
const SzakmaiBemutatokKonferenciakPage = lazy(() =>
  import("../pages/SzakmaiBemutatokKonferenciak.jsx")
);
const ElegedettsegMeresEredmenyeiPage = lazy(() =>
  import("../pages/ElegedettsegMeresEredmenyei.jsx")
);
const MuhelyiskolaiReszszakmatPage = lazy(() =>
  import("../pages/MuhelyiskolaiReszszakmat.jsx")
);
const DobbantoProgramAranyaPage = lazy(() =>
  import("../pages/DobbantoProgramAranya.jsx")
);
const SajatosNevelesiIgenyuTanulokAranyaPage = lazy(() =>
  import("../pages/SajatosNevelesiIgenyuTanulokAranya.jsx")
);
const HatanyosHelyzetuTanulokAranyaPage = lazy(() =>
  import("../pages/HatanyosHelyzetuTanulokAranya.jsx")
);
const IntezményiNevelesiMutatokPage = lazy(() =>
  import("../pages/IntezményiNevelesiMutatok.jsx")
);
const SzakképzésiMunkaszerződésArányPage = lazy(() =>
  import("../pages/SzakképzésiMunkaszerződésArány.jsx")
);
const OktatoPerDiak = lazy(() => import("../pages/tables/Oktatoperdiak.jsx"));
const FelvettekPage = lazy(() => import("../pages/tables/FelvettekSzama.jsx"));
const LogsPage = lazy(() => import("../pages/Logs.jsx"));
const OktatokEgyebTevPage = lazy(() =>
  import("../pages/Oktatok_egyeb_tev.jsx")
);
export default function Router() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return (
    <BrowserRouter>
      <LoadingProvider>
        <TokenValidationGuard>
          <ProactiveTokenRefresh />

          <Suspense
            fallback={<RouteLoadingSpinner message="Oldal betöltése..." />}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />{" "}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <NavigationWithLoading>
                      <DashboardPage />
                    </NavigationWithLoading>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alapadatok"
                element={
                  <NavigationWithLoading>
                    <AlapadatokPage />
                  </NavigationWithLoading>
                }
              />
              <Route
                path="/adat-import"
                element={
                  <ProtectedRoute>
                    <NavigationWithLoading>
                      <DataImportPage />
                    </NavigationWithLoading>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tanulo_letszam"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <TanuloletszamPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/kompetencia"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <KompetenciaPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/versenyek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <VersenyekPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <UsersPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/table-management"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <TableManagementPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <TableProtectedRoute tableName="logs">
                    <NavigationWithLoading>
                      <LogsPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />{" "}
              <Route
                path="/schools"
                element={
                  <ProtectedRoute>
                    <NavigationWithLoading>
                      <SchoolsPage />
                    </NavigationWithLoading>
                  </ProtectedRoute>
                }
              />{" "}
              <Route
                path="/felnottkepzes"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <FelnottkepzesPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/orszagos-kompetenciameres"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <OrszagosKompetenciameresPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/nszfh-meresek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <NszfhMeresekPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakmai-eredmenyek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <SzakmaiEredmenyekPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/elhelyezkedesi-mutato"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <ElhelyezkedesimMutatoPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/vegzettek-elegedettsege"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <VegzettekElegedettsegePage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/vizsgaeredmenyek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <VizsgaeredmenyekPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/intezmenyi-elismeresek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <IntezményiElismeresekPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakmai-bemutatok-konferenciak"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <SzakmaiBemutatokKonferenciakPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/elegedettseg-meres-eredmenyei"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <ElegedettsegMeresEredmenyeiPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/muhelyiskolai-reszszakmat"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <MuhelyiskolaiReszszakmatPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/dobbanto-program-aranya"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <DobbantoProgramAranyaPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/sajatos-nevelesi-igenyu-tanulok-aranya"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <SajatosNevelesiIgenyuTanulokAranyaPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/hatranyos-helyezu-tanulok-aranya"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <HatanyosHelyzetuTanulokAranyaPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/intezmenyi-nevelesi-mutatok"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <IntezményiNevelesiMutatokPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakkepzesi-munkaszerződes-arany"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <SzakképzésiMunkaszerződésArányPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/oktatok-egyeb-tev"
                element={
                  <TableProtectedRoute tableName="oktatok_egyeb_tev">
                    <NavigationWithLoading>
                      <OktatokEgyebTevPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              {/* Additional table routes for future implementation */}
              <Route
                path="/tanugyi_adatok"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <div>Tanügyi adatok - Coming Soon</div>
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/felvettek_szama"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <SchoolSelectionIndicator>
                        <FelvettekPage />
                      </SchoolSelectionIndicator>
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/oktato_per_diak"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      <OktatoPerDiak />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </Suspense>
        </TokenValidationGuard>
      </LoadingProvider>
    </BrowserRouter>
  );
}
