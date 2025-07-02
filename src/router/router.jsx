import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import Navigation from "../components/Navigation.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import TableProtectedRoute from "../components/TableProtectedRoute.jsx";
import TokenValidationGuard from "../components/TokenValidationGuard.jsx";
import ProactiveTokenRefresh from "../components/ProactiveTokenRefresh.jsx";
import CacheDebugPanel from "../components/CacheDebugPanel.jsx";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import SchoolSelectionIndicator from "../components/SchoolSelectionIndicator.jsx";

const LoginPage = lazy(() => import("../pages/Login"));
const DashboardPage = lazy(() => import("../pages/Dashboard"));
const AlapadatokPage = lazy(() => import("../pages/Alapadatok"));
const DataImportPage = lazy(() => import("../pages/DataImport"));
const TanuloletszamPage = lazy(() => import("../pages/Tanuloletszam.jsx"));
const KompetenciaPage = lazy(() => import("../pages/Kompetencia.jsx"));
const VersenyekPage = lazy(() => import("../pages/Versenyek.jsx"));
const UsersPage = lazy(() => import("../pages/Users.jsx"));
const SchoolsPage = lazy(() => import("../pages/Schools.jsx"));
const OktatoPerDiak = lazy(() => import("../pages/tables/Oktatoperdiak.jsx"));
const FelvettekPage = lazy(() => import("../pages/tables/FelvettekSzama.jsx"));
export default function Router() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return (
    <BrowserRouter>
      <TokenValidationGuard>
        <ProactiveTokenRefresh />

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
                  <Navigation>
                    <DashboardPage />
                  </Navigation>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alapadatok"
              element={
                <Navigation>
                  <AlapadatokPage />
                </Navigation>
              }
            />
            <Route
              path="/adat-import"
              element={
                <ProtectedRoute>
                  <Navigation>
                    <DataImportPage />
                  </Navigation>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tanulo_letszam"
              element={
                <TableProtectedRoute>
                  <Navigation>
                    <TanuloletszamPage />
                  </Navigation>
                </TableProtectedRoute>
              }
            />
            <Route
              path="/kompetencia"
              element={
                <TableProtectedRoute>
                  <Navigation>
                    <KompetenciaPage />
                  </Navigation>
                </TableProtectedRoute>
              }
            />
            <Route
              path="/versenyek"
              element={
                <TableProtectedRoute>
                  <Navigation>
                    <VersenyekPage />
                  </Navigation>
                </TableProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <TableProtectedRoute>
                  <Navigation>
                    <UsersPage />
                  </Navigation>
                </TableProtectedRoute>
              }
            />
            <Route
              path="/schools"
              element={
                <ProtectedRoute>
                  <Navigation>
                    <SchoolsPage />
                  </Navigation>
                </ProtectedRoute>
              }
            />
            {/* Additional table routes for future implementation */}
            <Route
              path="/tanugyi_adatok"
              element={
                <TableProtectedRoute>
                  <Navigation>
                    <div>Tanügyi adatok - Coming Soon</div>
                  </Navigation>
                </TableProtectedRoute>
              }
            />
            <Route
              path="/felvettek_szama"
              element={
                <TableProtectedRoute>
                  <Navigation>
                    <SchoolSelectionIndicator>
                    <FelvettekPage />
                    </SchoolSelectionIndicator>
                  </Navigation>
                </TableProtectedRoute>
              }
            />
            <Route
              path="/oktato_per_diak"
              element={
                <TableProtectedRoute>
                  <Navigation>
                    <OktatoPerDiak />
                  </Navigation>
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
    </BrowserRouter>
  );
}
