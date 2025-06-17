import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import Navigation from "../components/Navigation.jsx";

const DashboardPage = lazy(() => import("../pages/Dashboard"));
const AlapadatokPage = lazy(() => import("../pages/Alapadatok"));
const DataImportPage = lazy(() => import("../pages/DataImport"));
const TanuloletszamPage = lazy(() => import("../pages/Tanuloletszam.jsx"));
const KompetenciaPage = lazy(() => import("../pages/Kompetencia.jsx"));
const VersenyekPage = lazy(() => import("../pages/Versenyek.jsx"));

export default function Router() {
  return (
    <BrowserRouter>
      <Navigation>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "90vh",
              }}
            >
              <Spinner size="xl" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alapadatok" element={<AlapadatokPage />} />
            <Route path="/adat-import" element={<DataImportPage />} />
            <Route path="/tanuloletszam" element={<TanuloletszamPage />} />
            <Route path="/kompetencia" element={<KompetenciaPage />} />
            <Route path="/versenyek" element={<VersenyekPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </Navigation>
    </BrowserRouter>
  );
}
