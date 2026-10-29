import api from "./api";

const BASE_URL = "/transfers";

const transferService = {
  // Get all transfers with optional filters and pagination
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get transfer details by ID
  getById: async (transferId) => {
    if (!transferId) {
      throw new Error("Transfer ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(transferId)}`
    );

    return response.data;
  },

  // Create a transfer between accounts
  create: async (transferData) => {
    if (!transferData) {
      throw new Error("Transfer data is required.");
    }

    const {
      fromAccountId,
      toAccountId,
      amount,
      transferDate,
    } = transferData;

    if (!fromAccountId || !toAccountId) {
      throw new Error("Source and destination accounts are required.");
    }

    if (String(fromAccountId) === String(toAccountId)) {
      throw new Error("Source and destination accounts must be different.");
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Transfer amount must be greater than zero.");
    }

    if (!transferDate) {
      throw new Error("Transfer date is required.");
    }

    const response = await api.post(BASE_URL, {
      ...transferData,
      amount: Number(amount),
    });

    return response.data;
  },

  // Update transfer details, if supported by backend
  update: async (transferId, transferData) => {
    if (!transferId) {
      throw new Error("Transfer ID is required.");
    }

    const response = await api.put(
      `${BASE_URL}/${encodeURIComponent(transferId)}`,
      transferData
    );

    return response.data;
  },

  // Get transfers associated with a bank account
  getByAccount: async (accountId, params = {}) => {
    if (!accountId) {
      throw new Error("Bank account ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/account/${encodeURIComponent(accountId)}`,
      { params }
    );

    return response.data;
  },

  // Get transfer summary
  getSummary: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/summary`, { params });
    return response.data;
  },

  // Cancel a pending transfer, if supported by backend
  cancel: async (transferId) => {
    if (!transferId) {
      throw new Error("Transfer ID is required.");
    }

    const response = await api.patch(
      `${BASE_URL}/${encodeURIComponent(transferId)}/cancel`
    );

    return response.data;
  },

  // Delete a transfer record, if supported by backend
  remove: async (transferId) => {
    if (!transferId) {
      throw new Error("Transfer ID is required.");
    }

    const response = await api.delete(
      `${BASE_URL}/${encodeURIComponent(transferId)}`
    );

    return response.data;
  },
};

export default transferService;