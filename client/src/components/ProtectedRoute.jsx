
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import Loader from "./common/Loader";

const ProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Wait while authentication is being checked
  if (loading) {
    return <Loader />;
  }

  // Redirect unauthenticated users
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Allow authenticated users
  return <Outlet />;
};

export default ProtectedRoute;
