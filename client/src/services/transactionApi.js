
import api from "./api";

// Get all transactions
export const getTransactions = async () => {
  const { data } = await api.get("/transactions");
  return data;
};

// Add a new transaction
export const addTransaction = async (transaction) => {
  const { data } = await api.post("/transactions", transaction);
  return data;
};

// Update an existing transaction
export const updateTransaction = async (id, transaction) => {
  if (!id) {
    throw new Error("Transaction ID is required to update a transaction.");
  }

  const { data } = await api.put(`/transactions/${id}`, transaction);
  return data;
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  if (!id) {
    throw new Error("Transaction ID is required to delete a transaction.");
  }

  const { data } = await api.delete(`/transactions/${id}`);
  return data;
};
