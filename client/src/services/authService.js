
import api from "./api";

// Register a new user through the backend
export async function register(userData) {
  const { name, email, password } = userData;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error("All fields are required.");
  }

  const response = await api.post("/auth/register", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  const data = response.data;

  // Save a token only if the backend actually returns one.
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  if (data.user) {
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    return data.user;
  }

  return data;
}

// Login an existing user through the backend
export async function login(email, password) {
  if (!email?.trim() || !password) {
    throw new Error("Email and password are required.");
  }

  const response = await api.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  const data = response.data;

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  const user = data.user || data;

  if (user && (user._id || user.id || user.email || user.name)) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  return user;
}

// Logout the current user
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
}

// Return the current user saved in this browser
export function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("currentUser");
    return null;
  }
}

// Check whether a user and token are available
export function isAuthenticated() {
  return Boolean(
    localStorage.getItem("token") && getCurrentUser()
  );
}
