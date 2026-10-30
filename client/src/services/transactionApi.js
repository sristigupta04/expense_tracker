import api from "./api";

const BASE_URL = "/transactions";

const validateId = (id) => {
  if (!id || !/^[a-f\d]{24}$/i.test(String(id))) {
    throw new Error("A valid transaction ID is required.");
  }
};

const validateTransaction = (transaction) => {
  if (
    !transaction ||
    typeof transaction !== "object" ||
    Array.isArray(transaction)
  ) {
    throw new Error("Valid transaction details are required.");
  }
};

// Get all transactions
export const getTransactions = async (params = {}) => {
  const { data } = await api.get(BASE_URL, { params });
  return data;
};

// Add a transaction
export const addTransaction = async (transaction) => {
  validateTransaction(transaction);

  const { data } = await api.post(BASE_URL, transaction);
  return data;
};

// Update a transaction
export const updateTransaction = async (id, transaction) => {
  validateId(id);
  validateTransaction(transaction);

  const { data } = await api.put(
    `${BASE_URL}/${encodeURIComponent(id)}`,
    transaction
  );

  return data;
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  validateId(id);

  const { data } = await api.delete(
    `${BASE_URL}/${encodeURIComponent(id)}`
  );

  return data;
};

// Default export for useExpense.js compatibility
const transactionApi = {
  getAll: getTransactions,
  create: addTransaction,
  update: updateTransaction,
  remove: deleteTransaction,
};

export default transactionApi;