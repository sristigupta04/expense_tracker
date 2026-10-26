
import {
  createContext,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  isAuthenticated as checkAuthentication,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const loggedInUser = await loginService(email, password);
      const currentUser = loggedInUser || getCurrentUser();

      setUser(currentUser);

      return {
        success: true,
        user: currentUser,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      logoutService();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user) && checkAuthentication(),
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
