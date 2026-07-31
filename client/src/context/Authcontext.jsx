import { createContext, useContext, useEffect, useState } from "react";
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

  const handleLogin = async (email, password) => {
    try {
      const loggedInUser = await login(email, password);
      setUser(loggedInUser);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
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