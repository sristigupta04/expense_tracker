import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

export default function ProtectedRoute({ children }) {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}