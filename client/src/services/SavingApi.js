
import api from "./api";

// Get all saving goals
export const getSavingGoals = async () => {
  const { data } = await api.get("/saving-goals");

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.goals)) return data.goals;
  if (Array.isArray(data?.savingGoals)) return data.savingGoals;

  return [];
};

// Create a saving goal
export const createSavingGoal = async (goal) => {
  if (!goal || typeof goal !== "object") {
    throw new Error("Valid saving goal details are required.");
  }

  const { data } = await api.post("/saving-goals", goal);
  return data;
};

// Update a saving goal
export const updateSavingGoal = async (id, goal) => {
  if (!id) {
    throw new Error("Saving goal ID is required.");
  }

  if (!goal || typeof goal !== "object") {
    throw new Error("Valid saving goal details are required.");
  }

  const { data } = await api.put(`/saving-goals/${id}`, goal);
  return data;
};

// Delete a saving goal
export const deleteSavingGoal = async (id) => {
  if (!id) {
    throw new Error("Saving goal ID is required.");
  }

  const { data } = await api.delete(`/saving-goals/${id}`);
  return data;
};
