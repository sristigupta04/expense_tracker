import api from "./api";

// Validate MongoDB ObjectId
const isValidId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

// Get all budgets
export const getBudgets = async (params = {}) => {
  const { data } = await api.get("/budget", { params });
  return data;
};

// Create a budget
export const createBudget = async (budget) => {
  if (!budget || typeof budget !== "object" || Array.isArray(budget)) {
    throw new Error("Valid budget details are required.");
  }

  const { data } = await api.post("/budget", budget);
  return data;
};

// Update a budget
export const updateBudget = async (id, budget) => {
  if (!isValidId(id)) {
    throw new Error("A valid budget ID is required.");
  }

  if (!budget || typeof budget !== "object" || Array.isArray(budget)) {
    throw new Error("Valid budget details are required.");
  }

  const { data } = await api.put(
    `/budget/${encodeURIComponent(id)}`,
    budget
  );

  return data;
};

// Delete a budget
export const deleteBudget = async (id) => {
  if (!isValidId(id)) {
    throw new Error("A valid budget ID is required.");
  }

  const { data } = await api.delete(
    `/budget/${encodeURIComponent(id)}`
  );

  return data;
};