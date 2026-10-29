import api from "./api";

const BASE_URL = "/reconciliation";

const reconciliationService = {
  // Get reconciliation history with optional filters
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get reconciliation details by ID
  getById: async (reconciliationId) => {
    if (!reconciliationId) {
      throw new Error("Reconciliation ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}`
    );

    return response.data;
  },

  // Start reconciliation for a bank account or statement
  start: async (payload) => {
    if (!payload) {
      throw new Error("Reconciliation data is required.");
    }

    if (!payload.accountId && !payload.statementId) {
      throw new Error("Bank account ID or statement ID is required.");
    }

    const response = await api.post(`${BASE_URL}/start`, payload);
    return response.data;
  },

  // Get reconciliation summary
  getSummary: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/summary`, { params });
    return response.data;
  },

  // Get unmatched transactions
  getUnmatched: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/unmatched`, { params });
    return response.data;
  },

  // Mark a bank transaction and app transaction as matched
  matchTransactions: async (payload) => {
    if (!payload?.bankTransactionId || !payload?.appTransactionId) {
      throw new Error(
        "Both bank transaction ID and app transaction ID are required."
      );
    }

    const response = await api.post(`${BASE_URL}/match`, payload);
    return response.data;
  },

  // Mark a transaction as unmatched
  unmatchTransaction: async (matchId) => {
    if (!matchId) {
      throw new Error("Match ID is required.");
    }

    const response = await api.patch(
      `${BASE_URL}/matches/${encodeURIComponent(matchId)}/unmatch`
    );

    return response.data;
  },

  // Get matched transaction pairs
  getMatches: async (reconciliationId, params = {}) => {
    if (!reconciliationId) {
      throw new Error("Reconciliation ID is required.");
    }

    const response = await api.get(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}/matches`,
      { params }
    );

    return response.data;
  },

  // Complete reconciliation
  complete: async (reconciliationId, payload = {}) => {
    if (!reconciliationId) {
      throw new Error("Reconciliation ID is required.");
    }

    const response = await api.post(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}/complete`,
      payload
    );

    return response.data;
  },

  // Delete a reconciliation record
  remove: async (reconciliationId) => {
    if (!reconciliationId) {
      throw new Error("Reconciliation ID is required.");
    }

    const response = await api.delete(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}`
    );

    return response.data;
  },
};

export default reconciliationService;