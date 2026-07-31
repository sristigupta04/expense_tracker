import api from "./api";

// Register User
export const register = async (userData) => {
  try {
    const { data } = await api.post("/auth/register", userData);

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    }

    return data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Registration failed"
    );
  }
};

// Login User
export const login = async (email, password) => {
  try {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    }

    return data.user;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Invalid email or password"
    );
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
};

// Current User
export const getCurrentUser = () => {
  const user = localStorage.getItem("currentUser");

  return user ? JSON.parse(user) : null;
};

// Authentication Check
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};