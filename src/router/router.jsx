import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import Navigation from "../components/Navigation.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { selectIsAuthenticated } from "../store/slices/authSlice";

const LoginPage = lazy(() => import("../pages/Login"));
const DashboardPage = lazy(() => import("../pages/Dashboard"));
const AlapadatokPage = lazy(() => import("../pages/Alapadatok"));
const DataImportPage = lazy(() => import("../pages/DataImport"));
const TanuloletszamPage = lazy(() => import("../pages/Tanuloletszam.jsx"));
const KompetenciaPage = lazy(() => import("../pages/Kompetencia.jsx"));
const VersenyekPage = lazy(() => import("../pages/Versenyek.jsx"));
const UsersPage = lazy(() => import("../pages/Users.jsx"));

export default function Router() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <BrowserRouter>
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
          />

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
              <ProtectedRoute>
                <Navigation>
                  <AlapadatokPage />
                </Navigation>
              </ProtectedRoute>
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
            path="/tanuloletszam"
            element={
              <ProtectedRoute>
                <Navigation>
                  <TanuloletszamPage />
                </Navigation>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kompetencia"
            element={
              <ProtectedRoute>
                <Navigation>
                  <KompetenciaPage />
                </Navigation>
              </ProtectedRoute>
            }
          />

          <Route
            path="/versenyek"
            element={
              <ProtectedRoute>
                <Navigation>
                  <VersenyekPage />
                </Navigation>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Navigation>
                  <UsersPage />
                </Navigation>
              </ProtectedRoute>
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
    </BrowserRouter>
  );
}
