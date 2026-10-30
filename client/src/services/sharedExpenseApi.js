import api from "./api";

const BASE_URL = "/shared-expenses";

const validateId = (id, label = "ID") => {
  if (!id || !/^[a-f\d]{24}$/i.test(String(id))) {
    throw new Error(`A valid ${label} is required.`);
  }
};

const validatePayload = (payload, label = "details") => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error(`Valid ${label} are required.`);
  }
};

// Get all shared groups
export const getSharedGroups = async () => {
  const { data } = await api.get(`${BASE_URL}/groups`);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.groups)) return data.groups;

  return [];
};

// Create a shared group
export const createSharedGroup = async (payload) => {
  validatePayload(payload, "group details");

  const { data } = await api.post(`${BASE_URL}/groups`, payload);

  if (!data?.group) {
    throw new Error("The server did not return the created group.");
  }

  return data.group;
};

// Get group expenses
export const getGroupExpenses = async (groupId) => {
  validateId(groupId, "group ID");

  const { data } = await api.get(
    `${BASE_URL}/groups/${encodeURIComponent(groupId)}/expenses`
  );

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.expenses)) return data.expenses;

  return [];
};

// Get group balances
export const getGroupBalances = async (groupId) => {
  validateId(groupId, "group ID");

  const { data } = await api.get(
    `${BASE_URL}/groups/${encodeURIComponent(groupId)}/balances`
  );

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.balances)) return data.balances;

  return [];
};

// Create a shared expense
export const createSharedExpense = async (payload) => {
  validatePayload(payload, "expense details");

  const { data } = await api.post(`${BASE_URL}/expenses`, payload);

  if (!data?.expense) {
    throw new Error("The server did not return the created expense.");
  }

  return data.expense;
};

// Create a settlement
export const createSettlement = async (payload) => {
  validatePayload(payload, "settlement details");

  const { data } = await api.post(`${BASE_URL}/settlements`, payload);

  if (!data?.settlement) {
    throw new Error("The server did not return the created settlement.");
  }

  return data.settlement;
};