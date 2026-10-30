import api from "./api";

const BASE_URL = "/recurring-transactions";

const validateId = (id) => {
  if (!id || !/^[a-f\d]{24}$/i.test(String(id))) {
    throw new Error("A valid recurring transaction ID is required.");
  }
};

const validatePayload = (payload) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error("Valid recurring transaction details are required.");
  }
};

// Get all recurring transactions
export const getRecurringTransactions = async () => {
  const { data } = await api.get(BASE_URL);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

// Create recurring transaction
export const createRecurringTransaction = async (payload) => {
  validatePayload(payload);

  const { data } = await api.post(BASE_URL, payload);

  if (!data?.record) {
    throw new Error("The server did not return the created record.");
  }

  return data.record;
};

// Update recurring transaction
export const updateRecurringTransaction = async (id, payload) => {
  validateId(id);
  validatePayload(payload);

  const { data } = await api.patch(
    `${BASE_URL}/${encodeURIComponent(id)}`,
    payload
  );

  if (!data?.record) {
    throw new Error("The server did not return the updated record.");
  }

  return data.record;
};

// Mark recurring transaction as paid
export const markRecurringPaid = async (id) => {
  validateId(id);

  const { data } = await api.patch(
    `${BASE_URL}/${encodeURIComponent(id)}/paid`
  );

  return data;
};

// Delete recurring transaction
export const deleteRecurringTransaction = async (id) => {
  validateId(id);

  const { data } = await api.delete(
    `${BASE_URL}/${encodeURIComponent(id)}`
  );

  return data;
};