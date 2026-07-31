import { createContext, useContext, useState, useEffect } from "react";
import {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
} from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogin = (email, password) => {
    const loggedInUser = login(email, password);

    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isAuthenticated(),
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}