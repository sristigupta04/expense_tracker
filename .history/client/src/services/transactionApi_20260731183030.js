import api from "./api";

// Get all transactions
export const getTransactions = async () => {
  const { data } = await api.get("/transactions");
  return data;
};

// Get one transaction
export const getTransaction = async (id) => {
  const { data } = await api.get(`/transactions/${id}`);
  return data;
};

// Create transaction
export const addTransaction = async (transaction) => {
  const { data } = await api.post(
    "/transactions",
    transaction
  );
  return data;
};

// Update transaction
export const updateTransaction = async (
  id,
  transaction
) => {
  const { data } = await api.put(
    `/transactions/${id}`,
    transaction
  );
  return data;
};

// Delete transaction
export const deleteTransaction = async (id) => {
  const { data } = await api.delete(
    `/transactions/${id}`
  );
  return data;
};