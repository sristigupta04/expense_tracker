import api from "./api";

export const getRecurringTransactions = async () => {
  const { data } = await api.get("/recurring-transactions");
  return data.records || [];
};

export const createRecurringTransaction = async (payload) => {
  const { data } = await api.post("/recurring-transactions", payload);
  return data.record;
};

export const updateRecurringTransaction = async (id, payload) => {
  const { data } = await api.patch(
    `/recurring-transactions/${id}`,
    payload
  );
  return data.record;
};

export const markRecurringPaid = async (id) => {
  const { data } = await api.patch(
    `/recurring-transactions/${id}/paid`
  );
  return data;
};

export const deleteRecurringTransaction = async (id) => {
  const { data } = await api.delete(`/recurring-transactions/${id}`);
  return data;
};