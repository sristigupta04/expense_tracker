
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
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

      if (!currentUser || !checkAuthentication()) {
        setUser(null);

        return {
          success: false,
          message: "Login failed. Please check your credentials.",
        };
      }

      setUser(currentUser);

      return {
        success: true,
        user: currentUser,
      };
    } catch (error) {
      setUser(null);

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
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(() => {
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser || null);
      return currentUser || null;
    } catch (error) {
      console.error("Unable to refresh user:", error);
      setUser(null);
      return null;
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser || typeof updatedUser !== "object") {
      return;
    }

    setUser((previousUser) => ({
      ...(previousUser || {}),
      ...updatedUser,
    }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated:
        Boolean(user) && checkAuthentication(),
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [
      user,
      loading,
      login,
      logout,
      refreshUser,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}

export default AuthContext;
