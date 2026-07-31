import api from "./api";

// Get all budgets
export const getBudgets = async () => {
  const { data } = await api.get("/budget");
  return data;
};

// Create budget
export const createBudget = async (budget) => {
  const { data } = await api.post("/budget", budget);
  return data;
};

// Update budget
export const updateBudget = async (id, budget) => {
  const { data } = await api.put(`/budget/${id}`, budget);
  return data;
};

// Delete budget
export const deleteBudget = async (id) => {
  const { data } = await api.delete(`/budget/${id}`);
  return data;
};