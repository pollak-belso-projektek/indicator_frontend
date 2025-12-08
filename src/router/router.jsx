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
import SchoolRequiredWrapper from "../components/SchoolRequiredWrapper.jsx";
import { LoadingProvider } from "../contexts/LoadingContext.jsx";
import RouteLoadingSpinner from "../components/RouteLoadingSpinner.jsx";

const LoginPage = lazy(() => import("../pages/Login"));
const DashboardPage = lazy(() => import("../pages/Dashboard"));
const AlapadatokPage = lazy(() => import("../pages/Alapadatok"));
const DataImportPage = lazy(() => import("../pages/DataImport"));
const TanuloletszamPage = lazy(() =>
  import("../pages/indicators/1_tanulo_letszam/Tanuloletszam.jsx")
);
const KompetenciaPage = lazy(() =>
  import("../pages/indicators/6_kompetencia/Kompetencia.jsx")
);
const VersenyekPage = lazy(() => import("../pages/Versenyek.jsx"));
const UsersPage = lazy(() => import("../pages/Users.jsx"));
const TableManagementPage = lazy(() =>
  import("../pages/TableManagementPage.jsx")
);
const SchoolsPage = lazy(() => import("../pages/Schools.jsx"));
const FelnottkepzesPage = lazy(() => import("../pages/indicators/5_felnottkepzes/Felnottkepzes.jsx"));
const OrszagosKompetenciameresPage = lazy(() =>
  import("../pages/OrszagosKompetenciameres.jsx")
);
const NszfhMeresekPage = lazy(() =>
  import("../pages/indicators/7_nszfh_meresek/NszfhMeresek.jsx")
);
const SzakmaiEredmenyekPage = lazy(() =>
  import("../pages/indicators/8_szakmai_eredmenyek/SzakmaiEredmenyek.jsx")
);
const ElhelyezkedesimMutatoPage = lazy(() =>
  import("../pages/indicators/9_elhelyezkedesi_mutato/ElhelyezkedesimMutato.jsx")
);
const VegzettekElegedettsegePage = lazy(() =>
  import("../pages/indicators/10_vegzettek_elegedettsege/VegzettekElegedettsege.jsx")
);
const VizsgaeredmenyekPage = lazy(() =>
  import("../pages/indicators/11_vizsgaeredmenyek/Vizsgaeredmenyek.jsx")
);
const IntezményiElismeresekPage = lazy(() =>
  import("../pages/indicators/13_intezmenyi_elismeresek/IntezményiElismeresek.jsx")
);
const SzakmaiBemutatokKonferenciakPage = lazy(() =>
  import("../pages/SzakmaiBemutatokKonferenciak.jsx")
);
const ElegedettsegMeresEredmenyeiPage = lazy(() =>
  import(
    "../pages/indicators/16_elegedettseg_meres_eredmenyei/ElegedettsegMeresEredmenyei.jsx"
  )
);
const MuhelyiskolaiReszszakmatPage = lazy(() =>
  import("../pages/indicators/21_muhelyiskolai_reszszakmat/MuhelyiskolaiReszszakmat.jsx")
);
const DobbantoProgramAranyaPage = lazy(() =>
  import("../pages/indicators/20_dobbanto_program_aranya/DobbantoProgramAranya.jsx")
);
const SajatosNevelesiIgenyuTanulokAranyaPage = lazy(() =>
  import(
    "../pages/indicators/19_sajatos_nevelesi_igenyu_tanulok_aranya/SajatosNevelesiIgenyuTanulokAranya.jsx"
  )
);
const HatanyosHelyzetuTanulokAranyaPage = lazy(() =>
  import(
    "../pages/indicators/18_hatranyos_helyezu_tanulok_aranya/HatanyosHelyzetuTanulokAranya.jsx"
  )
);
const IntezményiNevelesiMutatokPage = lazy(() =>
  import("../pages/indicators/17_intezmenyi_nevelesi_mutatok/IntezményiNevelesiMutatok.jsx")
);
const SzakképzésiMunkaszerződésArányPage = lazy(() =>
  import("../pages/indicators/4_szakkepzesi_munkaszerződes_arany/SzakképzésiMunkaszerződésArány.jsx")
);
const OktatoPerDiak = lazy(() => import("../pages/tables/Oktatoperdiak.jsx"));
const EgyOktatoraJutoOsszDiak = lazy(() =>
  import("../pages/indicators/27_egy_oktatora_juto_ossz_diak/EgyOktatoraJutoOsszDiak.jsx")
);
const FelvettekPage = lazy(() =>
  import("../pages/indicators/2_felvettek_szama/FelvettekSzama.jsx")
);
const LogsPage = lazy(() => import("../pages/Logs.jsx"));
const OktatokEgyebTevPage = lazy(() =>
  import("../pages/Oktatok_egyeb_tev.jsx")
);

// List of pages that require school selection
const SCHOOL_REQUIRED_PAGES = [
  "/tanulo_letszam",
  "/felvettek_szama",
  "/sajatos-nevelesi-igenyu-tanulok-aranya",
  "/hatranyos-helyezu-tanulok-aranya",
  "/kompetencia",
  "/orszagos-kompetenciameres",
  "/nszfh-meresek",
  "/vizsgaeredmenyek",
  "/elegedettseg-meres-eredmenyei",
  "/szakmai-eredmenyek",
  "/intezmenyi-elismeresek",
  "/elhelyezkedesi-mutato",
  "/vegzettek-elegedettsege",
  "/szakkepzesi-munkaszerződes-arany",
  "/felnottkepzes",
  "/muhelyiskolai-reszszakmat",
  "/dobbanto-program-aranya",
  "/intezmenyi-nevelesi-mutatok",
  "/szakmai-bemutatok-konferenciak",
  "/oktato_per_diak",
  "/egy-oktatora-juto-ossz-diak",
  "/oktatok-egyeb-tev",
  "/adat-import",
  "/alapadatok",
];

export default function Router() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Helper function to wrap components that require school selection
  const withSchoolRequired = (component, path) => {
    if (SCHOOL_REQUIRED_PAGES.includes(path)) {
      return <SchoolRequiredWrapper>{component}</SchoolRequiredWrapper>;
    }
    return component;
  };

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
                  <TableProtectedRoute tableName="alapadatok">
                    <NavigationWithLoading>
                      {withSchoolRequired(<AlapadatokPage />, "/alapadatok")}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/adat-import"
                element={
                  <TableProtectedRoute tableName="adat-import">
                    <NavigationWithLoading>
                      {withSchoolRequired(<DataImportPage />, "/adat-import")}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/tanulo_letszam"
                element={
                  <TableProtectedRoute tableName="tanulo_letszam">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <TanuloletszamPage />,
                        "/tanulo_letszam"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/kompetencia"
                element={
                  <TableProtectedRoute tableName="kompetencia">
                    <NavigationWithLoading>
                      {withSchoolRequired(<KompetenciaPage />, "/kompetencia")}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/versenyek"
                element={
                  <TableProtectedRoute tableName="versenyek">
                    <NavigationWithLoading>
                      <VersenyekPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <TableProtectedRoute tableName="user">
                    <NavigationWithLoading>
                      <UsersPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/table-management"
                element={
                  <TableProtectedRoute tableName="table-management">
                    <NavigationWithLoading>
                      <TableManagementPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <TableProtectedRoute tableName="log">
                    <NavigationWithLoading>
                      <LogsPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />{" "}
              <Route
                path="/schools"
                element={
                  <TableProtectedRoute tableName="alapadatok">
                    <NavigationWithLoading>
                      <SchoolsPage />
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />{" "}
              <Route
                path="/felnottkepzes"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <FelnottkepzesPage />,
                        "/felnottkepzes"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/orszagos-kompetenciameres"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <OrszagosKompetenciameresPage />,
                        "/orszagos-kompetenciameres"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/nszfh-meresek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <NszfhMeresekPage />,
                        "/nszfh-meresek"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakmai-eredmenyek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzakmaiEredmenyekPage />,
                        "/szakmai-eredmenyek"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/elhelyezkedesi-mutato"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <ElhelyezkedesimMutatoPage />,
                        "/elhelyezkedesi-mutato"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/vegzettek-elegedettsege"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <VegzettekElegedettsegePage />,
                        "/vegzettek-elegedettsege"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/vizsgaeredmenyek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <VizsgaeredmenyekPage />,
                        "/vizsgaeredmenyek"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/intezmenyi-elismeresek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <IntezményiElismeresekPage />,
                        "/intezmenyi-elismeresek"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakmai-bemutatok-konferenciak"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzakmaiBemutatokKonferenciakPage />,
                        "/szakmai-bemutatok-konferenciak"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/elegedettseg-meres-eredmenyei"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <ElegedettsegMeresEredmenyeiPage />,
                        "/elegedettseg-meres-eredmenyei"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/muhelyiskolai-reszszakmat"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <MuhelyiskolaiReszszakmatPage />,
                        "/muhelyiskolai-reszszakmat"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/dobbanto-program-aranya"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <DobbantoProgramAranyaPage />,
                        "/dobbanto-program-aranya"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/sajatos-nevelesi-igenyu-tanulok-aranya"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SajatosNevelesiIgenyuTanulokAranyaPage />,
                        "/sajatos-nevelesi-igenyu-tanulok-aranya"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/hatranyos-helyezu-tanulok-aranya"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <HatanyosHelyzetuTanulokAranyaPage />,
                        "/hatranyos-helyezu-tanulok-aranya"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/intezmenyi-nevelesi-mutatok"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <IntezményiNevelesiMutatokPage />,
                        "/intezmenyi-nevelesi-mutatok"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakkepzesi-munkaszerződes-arany"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzakképzésiMunkaszerződésArányPage />,
                        "/szakkepzesi-munkaszerződes-arany"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/oktato-egyeb-tev"
                element={
                  <TableProtectedRoute tableName="oktato-egyeb-tev">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <OktatokEgyebTevPage />,
                        "/oktato-egyeb-tev"
                      )}
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
                      {withSchoolRequired(
                        <SchoolSelectionIndicator>
                          <FelvettekPage />
                        </SchoolSelectionIndicator>,
                        "/felvettek_szama"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/oktato_per_diak"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <OktatoPerDiak />,
                        "/oktato_per_diak"
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/egy-oktatora-juto-ossz-diak"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <EgyOktatoraJutoOsszDiak />,
                        "/egy-oktatora-juto-ossz-diak"
                      )}
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
