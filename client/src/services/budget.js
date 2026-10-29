
import api from "./api";

// Get all budgets
export const getBudgets = async () => {
  const { data } = await api.get("/budget");
  return data;
};

// Create a new budget
export const createBudget = async (budget) => {
  if (!budget || typeof budget !== "object") {
    throw new Error("Valid budget details are required.");
  }

  const { data } = await api.post("/budget", budget);
  return data;
};

// Update an existing budget
export const updateBudget = async (id, budget) => {
  if (!id) {
    throw new Error("Budget ID is required to update a budget.");
  }

  if (!budget || typeof budget !== "object") {
    throw new Error("Valid budget details are required.");
  }

  const { data } = await api.put(`/budget/${id}`, budget);
  return data;
};

// Delete an existing budget
export const deleteBudget = async (id) => {
  if (!id) {
    throw new Error("Budget ID is required to delete a budget.");
  }

  const { data } = await api.delete(`/budget/${id}`);
  return data;
};
