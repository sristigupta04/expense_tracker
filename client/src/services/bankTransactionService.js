import api from "./api";

const BASE_URL = "/bank-transactions";

const bankTransactionService = {
  // Get all bank transactions with optional filters
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get transaction by ID
  getById: async (transactionId) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(transactionId)}`
    );

    return response.data;
  },

  // Get transactions for a specific bank account
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

  // Create a bank transaction
  create: async (transactionData) => {
    if (!transactionData) {
      throw new Error("Transaction data is required.");
    }

    const response = await api.post(BASE_URL, transactionData);
    return response.data;
  },

  // Update a bank transaction
  update: async (transactionId, transactionData) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    const response = await api.put(
      `${BASE_URL}/${encodeURIComponent(transactionId)}`,
      transactionData
    );

    return response.data;
  },

  // Delete a bank transaction
  remove: async (transactionId) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    const response = await api.delete(
      `${BASE_URL}/${encodeURIComponent(transactionId)}`
    );

    return response.data;
  },

  // Get transactions using date, type, status and amount filters
  getFiltered: async ({
    accountId,
    type,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    page = 1,
    limit = 10,
    sortBy = "date",
    sortOrder = "desc",
  } = {}) => {
    const params = {
      ...(accountId && { accountId }),
      ...(type && type !== "All" && { type }),
      ...(status && status !== "All" && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(minAmount !== undefined && minAmount !== "" && { minAmount }),
      ...(maxAmount !== undefined && maxAmount !== "" && { maxAmount }),
      ...(search && { search }),
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Mark a transaction as matched during reconciliation
  markMatched: async (transactionId, matchData = {}) => {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    const response = await api.patch(
      `${BASE_URL}/${encodeURIComponent(transactionId)}/match`,
      matchData
    );

    return response.data;
  },

  // Get transaction summary
  getSummary: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/summary`, { params });
    return response.data;
  },
};

export default bankTransactionService;