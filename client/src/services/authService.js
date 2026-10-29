
import api from "./api";

const isValidMongoId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

function saveAuthData(data) {
  const user = data?.user || data;
  const token = data?.token;

  // MongoDB ObjectId must be a 24-character hexadecimal string.
  const userId = user?._id || user?.id;

  if (!token || !isValidMongoId(userId)) {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");

    throw new Error(
      "Invalid user ID received. Please check the backend authController."
    );
  }

  const normalizedUser = {
    ...user,
    id: userId,
    _id: userId,
  };

  localStorage.setItem("token", token);
  localStorage.setItem("currentUser", JSON.stringify(normalizedUser));

  return normalizedUser;
}

// Register
export async function register(userData) {
  const { name, email, password, number } = userData || {};

  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error("All fields are required.");
  }

  const response = await api.post("/auth/register", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    ...(number ? { number } : {}),
  });

  return saveAuthData(response.data || {});
}

// Login
export async function login(email, password) {
  if (!email?.trim() || !password) {
    throw new Error("Email and password are required.");
  }

  const response = await api.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return saveAuthData(response.data || {});
}

// Logout
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
}

// Current user
export function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    const userId = user?._id || user?.id;

    if (!isValidMongoId(userId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      return null;
    }

    return {
      ...user,
      id: userId,
      _id: userId,
    };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    return null;
  }
}

// Authentication status
export function isAuthenticated() {
  return Boolean(
    localStorage.getItem("token") && getCurrentUser()
  );
}
