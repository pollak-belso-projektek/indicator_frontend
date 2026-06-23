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
const TanuloletszamPage = lazy(
  () => import("../pages/indicators/1_tanulo_letszam/Tanuloletszam.jsx"),
);
const KompetenciaPage = lazy(
  () => import("../pages/indicators/6_kompetencia/Kompetencia.jsx"),
);
const HianyzasPage = lazy(
  () => import("../pages/indicators/26_hianyzas/Hianyzas.jsx"),
);
const SzakmaiTovabbkepzesekPage = lazy(
  () => import("../pages/indicators/22_szakmai_tovabbkepzesek/SzakmaiTovabbkepzesek.jsx"),
);
const UsersPage = lazy(() => import("../pages/Users.jsx"));
const ProfileEditPage = lazy(() => import("../pages/ProfileEdit.jsx"));
const TableManagementPage = lazy(
  () => import("../pages/TableManagementPage.jsx"),
);
const SchoolsPage = lazy(() => import("../pages/Schools.jsx"));
const FelnottkepzesPage = lazy(
  () => import("../pages/indicators/5_felnottkepzes/Felnottkepzes.jsx"),
);
const OrszagosKompetenciameresPage = lazy(
  () => import("../pages/OrszagosKompetenciameres.jsx"),
);
const NszfhMeresekPage = lazy(
  () => import("../pages/indicators/7_nszfh_meresek/NszfhMeresek.jsx"),
);
const SzakmaiEredmenyekPage = lazy(
  () =>
    import("../pages/indicators/8_szakmai_eredmenyek/SzakmaiEredmenyek.jsx"),
);
const ElhelyezkedesimMutatoPage = lazy(
  () =>
    import("../pages/indicators/9_elhelyezkedesi_mutato/ElhelyezkedesimMutato.jsx"),
);
const VegzettekElegedettsegePage = lazy(
  () =>
    import("../pages/indicators/10_vegzettek_elegedettsege/VegzettekElegedettsege.jsx"),
);
const VizsgaeredmenyekPage = lazy(
  () => import("../pages/indicators/11_vizsgaeredmenyek/Vizsgaeredmenyek.jsx"),
);
const SzakmaiVizsgaPage = lazy(
  () => import("../pages/indicators/12_szakmai_vizsga/SzakmaiVizsga.jsx"),
);
const IntezményiElismeresekPage = lazy(
  () =>
    import("../pages/indicators/13_intezmenyi_elismeresek/IntezményiElismeresek.jsx"),
);
const SzakmaiBemutatokKonferenciakPage = lazy(
  () => import("../pages/indicators/14_szakmai_bemutatok_konferenciak/SzakmaiBemutatokKonferenciak.jsx"),
);
const LemorzsolodasPage = lazy(
  () => import("../pages/indicators/15_lemorzsolodas/Lemorzsolodas.jsx"),
);
const ElegedettsegMeresEredmenyeiPage = lazy(
  () =>
    import("../pages/indicators/16_elegedettseg_meres_eredmenyei/ElegedettsegMeresEredmenyei.jsx"),
);
const MuhelyiskolaiReszszakmatPage = lazy(
  () =>
    import("../pages/indicators/21_muhelyiskolai_reszszakmat/MuhelyiskolaiReszszakmat.jsx"),
);
const DobbantoProgramAranyaPage = lazy(
  () =>
    import("../pages/indicators/20_dobbanto_program_aranya/DobbantoProgramAranya.jsx"),
);
const SajatosNevelesiIgenyuTanulokAranyaPage = lazy(
  () =>
    import("../pages/indicators/19_sajatos_nevelesi_igenyu_tanulok_aranya/SajatosNevelesiIgenyuTanulokAranya.jsx"),
);
const HatanyosHelyzetuTanulokAranyaPage = lazy(
  () =>
    import("../pages/indicators/18_hatranyos_helyezu_tanulok_aranya/HatanyosHelyzetuTanulokAranya.jsx"),
);
const IntezményiNevelesiMutatokPage = lazy(
  () =>
    import("../pages/indicators/17_intezmenyi_nevelesi_mutatok/IntezményiNevelesiMutatok.jsx"),
);
const SzakképzésiMunkaszerződésArányPage = lazy(
  () =>
    import("../pages/indicators/4_szakkepzesi_munkaszerződes_arany/SzakképzésiMunkaszerződésArány.jsx"),
);
const OktatoPerDiak = lazy(() => import("../pages/tables/Oktatoperdiak.jsx"));
const EgyOktatoraJutoOsszDiak = lazy(
  () =>
    import("../pages/indicators/27_egy_oktatora_juto_ossz_diak/EgyOktatoraJutoOsszDiak.jsx"),
);
const FelvettekPage = lazy(
  () => import("../pages/indicators/2_felvettek_szama/FelvettekSzama.jsx"),
);
const LogsPage = lazy(() => import("../pages/Logs.jsx"));
const ChangelogPage = lazy(() => import("../pages/Changelog.jsx"));
const OktatokEgyebTevPage = lazy(
  () => import("../pages/indicators/23_oktato_egyeb_tev/Oktatok_egyeb_tev.jsx"),
);
const PalyazatokPage = lazy(
  () => import("../pages/indicators/24_palyazatok/Palyazatok.jsx"),
);
const SzervezetfejlesztesPage = lazy(
  () => import("../pages/indicators/33_szervezetfejlesztes/Szervezetfejlesztes.jsx"),
);
const DualisKepzohelyekSzamaPage = lazy(
  () => import("../pages/indicators/30_dualis_kepzohelyek_szama/DualisKepzohelyekSzama.jsx"),
);
const InnovaciosTevekenysegekPage = lazy(
  () => import("../pages/indicators/34_innovacios_tevekenysegek/InnovaciosTevekenysegek.jsx"),
);
const SzakkepzesZolditesePage = lazy(
  () => import("../pages/indicators/36_szakkepzes_zolditese/SzakkepzesZolditese.jsx"),
);
const PalyaOrientacioPage = lazy(
  () => import("../pages/indicators/31_palyaorientacio/PalyaOrientacio.jsx"),
);
const DigitalisKompetenciaPage = lazy(
  () => import("../pages/indicators/35_digitalis_kompetencia/DigitalisKompetencia.jsx"),
);
const EgyuttmukodesekSzamaPage = lazy(
  () => import("../pages/indicators/32_egyuttmukudesek_szama/EgyuttmukodesekSzama.jsx"),
);
const TanulmanyiEredmenyPage = lazy(
  () => import("../pages/indicators/25_tanulmani_eredmeny/Tanulmanyi_Eredmeny.jsx"),
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
  "/versenyek",
  "/intezmenyi-elismeresek",
  "/elhelyezkedesi-mutato",
  "/vegzettek-elegedettsege",
  "/szakkepzesi-munkaszerződes-arany",
  "/felnottkepzes",
  "/szakmai-vizsga",
  "/muhelyiskolai-reszszakmat",
  "/dobbanto-program-aranya",
  "/intezmenyi-nevelesi-mutatok",
  "/szakmai-bemutatok-konferenciak",
  "/oktato_per_diak",
  "/egy-oktatora-juto-ossz-diak",
  "/oktatok-egyeb-tev",
  "/adat-import",
  "/alapadatok",
  "/hianyzas",
  "/szakmai-tovabbkepzesek",
  "/palyazatok",
  "/szervezetfejlesztes",
  "/dualis-kepzohelyek-szama",
  "/innovacios-tevekenysegek",
  "/szakkepzes-zolditese",
  "/digitalis-kompetencia",
  "/tanulmani-eredmeny",
  "/palyaorientacio",
  "/egyuttmukudesek-szama",
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
                        "/tanulo_letszam",
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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <NavigationWithLoading>
                      <ProfileEditPage />
                    </NavigationWithLoading>
                  </ProtectedRoute>
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
              />
              <Route
                path="/changelog"
                element={
                  <ProtectedRoute>
                    <NavigationWithLoading>
                      <ChangelogPage />
                    </NavigationWithLoading>
                  </ProtectedRoute>
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
                        "/felnottkepzes",
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
                        "/orszagos-kompetenciameres",
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
                        "/nszfh-meresek",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/versenyek"
                element={
                  <TableProtectedRoute>
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzakmaiEredmenyekPage />,
                        "/versenyek",
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
                        "/elhelyezkedesi-mutato",
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
                        "/vegzettek-elegedettsege",
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
                        "/vizsgaeredmenyek",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakmai-vizsga"
                element={
                  <TableProtectedRoute tableName="szakmai_vizsga_eredmenyek">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzakmaiVizsgaPage />,
                        "/szakmai-vizsga",
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
                        "/intezmenyi-elismeresek",
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
                        "/szakmai-bemutatok-konferenciak",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/lemorzsolodas"
                element={
                  <TableProtectedRoute tableName="lemorzsolodas">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <LemorzsolodasPage />,
                        "/lemorzsolodas",
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
                        "/elegedettseg-meres-eredmenyei",
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
                        "/muhelyiskolai-reszszakmat",
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
                        "/dobbanto-program-aranya",
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
                        "/sajatos-nevelesi-igenyu-tanulok-aranya",
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
                        "/hatranyos-helyezu-tanulok-aranya",
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
                        "/intezmenyi-nevelesi-mutatok",
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
                        "/szakkepzesi-munkaszerződes-arany",
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
                        "/oktato-egyeb-tev",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/hianyzas"
                element={
                  <TableProtectedRoute tableName="hianyzas">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <HianyzasPage />,
                        "/hianyzas",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />

              <Route
                path="/szakmai-tovabbkepzesek"
                element={
                  <TableProtectedRoute tableName="szakmai_tovabbkepzesek">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzakmaiTovabbkepzesekPage />,
                        "/szakmai-tovabbkepzesek",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/palyazatok"
                element={
                  <TableProtectedRoute tableName="palyazatok">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <PalyazatokPage />,
                        "/palyazatok",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szervezetfejlesztes"
                element={
                  <TableProtectedRoute tableName="szervezetfejlesztes">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzervezetfejlesztesPage />,
                        "/szervezetfejlesztes",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/dualis-kepzohelyek-szama"
                element={
                  <TableProtectedRoute tableName="dualis_kepzohelyek">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <DualisKepzohelyekSzamaPage />,
                        "/dualis-kepzohelyek-szama",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/innovacios-tevekenysegek"
                element={
                  <TableProtectedRoute tableName="innovacios_tevekenysegek">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <InnovaciosTevekenysegekPage />,
                        "/innovacios-tevekenysegek",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/szakkepzes-zolditese"
                element={
                  <TableProtectedRoute tableName="szakkepzes_zolditese">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <SzakkepzesZolditesePage />,
                        "/szakkepzes-zolditese",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/palyaorientacio"
                element={
                  <TableProtectedRoute tableName="palya_orientacio">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <PalyaOrientacioPage />,
                        "/palyaorientacio",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/digitalis-kompetencia"
                element={
                  <TableProtectedRoute tableName="digitalis_kompetencia">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <DigitalisKompetenciaPage />,
                        "/digitalis-kompetencia",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
              <Route
                path="/egyuttmukudesek-szama"
                element={
                  <TableProtectedRoute tableName="egyuttmukudesek_szama">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <EgyuttmukodesekSzamaPage />,
                        "/egyuttmukudesek-szama",
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
                        "/felvettek_szama",
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
                        "/oktato_per_diak",
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
                        "/egy-oktatora-juto-ossz-diak",
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
              <Route
                path="/tanulmani-eredmeny"
                element={
                  <TableProtectedRoute tableName="tanulmanyi_eredmeny">
                    <NavigationWithLoading>
                      {withSchoolRequired(
                        <TanulmanyiEredmenyPage />,
                        "/tanulmani-eredmeny",
                      )}
                    </NavigationWithLoading>
                  </TableProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </TokenValidationGuard>
      </LoadingProvider>
    </BrowserRouter>
  );
}
