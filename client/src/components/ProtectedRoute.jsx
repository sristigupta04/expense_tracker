
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/authService";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (authenticated === null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader color="border-blue-600" />
        <p className="text-sm font-medium text-slate-500">
          Verifying your session...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
