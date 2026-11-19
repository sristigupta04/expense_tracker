
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
  useEffect,
} from "react";

import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  isAuthenticated as checkAuthentication,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return checkAuthentication() ? getCurrentUser() : null;
    } catch (error) {
      console.error("Session restoration failed:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Synchronize expired sessions with React state
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener(
      "auth:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const loggedInUser = await loginService(email, password);
      const currentUser = loggedInUser || getCurrentUser();

      if (!currentUser || !checkAuthentication()) {
        setUser(null);

        return {
          success: false,
          message: "Unable to establish a valid session.",
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

  // Logout
  const logout = useCallback(() => {
    try {
      logoutService();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Refresh user
  const refreshUser = useCallback(() => {
    try {
      const currentUser = checkAuthentication()
        ? getCurrentUser()
        : null;

      setUser(currentUser || null);

      return currentUser || null;
    } catch (error) {
      console.error("Unable to refresh user:", error);
      setUser(null);
      return null;
    }
  }, []);

  // Update user
  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser || typeof updatedUser !== "object") {
      return;
    }

    setUser((previousUser) => ({
      ...(previousUser || {}),
      ...updatedUser,
    }));
  }, []);

  const isAuthenticated = useMemo(
    () => Boolean(user) && checkAuthentication(),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [
      user,
      loading,
      isAuthenticated,
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
