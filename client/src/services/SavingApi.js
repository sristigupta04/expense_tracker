import api from "./api";

const BASE_URL = "/saving-goals";

const validateId = (id) => {
  if (!id || !/^[a-f\d]{24}$/i.test(String(id))) {
    throw new Error("A valid saving goal ID is required.");
  }
};

const validateGoal = (goal) => {
  if (
    !goal ||
    typeof goal !== "object" ||
    Array.isArray(goal)
  ) {
    throw new Error("Valid saving goal details are required.");
  }
};

// Get all saving goals
export const getSavingGoals = async (params = {}) => {
  const { data } = await api.get(BASE_URL, { params });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.goals)) return data.goals;
  if (Array.isArray(data?.savingGoals)) return data.savingGoals;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

// Create a saving goal
export const createSavingGoal = async (goal) => {
  validateGoal(goal);

  const { data } = await api.post(BASE_URL, goal);
  return data;
};

// Update a saving goal
export const updateSavingGoal = async (id, goal) => {
  validateId(id);
  validateGoal(goal);

  const { data } = await api.put(
    `${BASE_URL}/${encodeURIComponent(id)}`,
    goal
  );

  return data;
};

// Delete a saving goal
export const deleteSavingGoal = async (id) => {
  validateId(id);

  const { data } = await api.delete(
    `${BASE_URL}/${encodeURIComponent(id)}`
  );

  return data;
};