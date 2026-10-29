
import api from "./api";

// Get all transactions
export const getTransactions = async (params = {}) => {
  const { data } = await api.get("/transactions", { params });
  return data;
};

// Add a transaction
export const addTransaction = async (transaction) => {
  const { data } = await api.post("/transactions", transaction);
  return data;
};

// Update a transaction
export const updateTransaction = async (id, transaction) => {
  if (!id) {
    throw new Error("Transaction ID is required.");
  }

  const { data } = await api.put(`/transactions/${id}`, transaction);
  return data;
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  if (!id) {
    throw new Error("Transaction ID is required.");
  }

  const { data } = await api.delete(`/transactions/${id}`);
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
