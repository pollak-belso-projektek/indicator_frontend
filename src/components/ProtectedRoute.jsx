import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated } from "../store/slices/authSlice";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
