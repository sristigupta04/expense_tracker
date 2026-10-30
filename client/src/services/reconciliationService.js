import api from "./api";

const BASE_URL = "/reconciliation";

const validateId = (id, label = "ID") => {
  if (!id || !/^[a-f\d]{24}$/i.test(String(id))) {
    throw new Error(`A valid ${label} is required.`);
  }
};

const validatePayload = (payload, label = "data") => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error(`Valid ${label} is required.`);
  }
};

const reconciliationService = {
  // Get reconciliation history
  getAll: async (params = {}) => {
    const { data } = await api.get(BASE_URL, { params });
    return data;
  },

  // Get reconciliation details
  getById: async (reconciliationId) => {
    validateId(reconciliationId, "reconciliation ID");

    const { data } = await api.get(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}`
    );

    return data;
  },

  // Start reconciliation
  start: async (payload) => {
    validatePayload(payload, "reconciliation data");

    if (!payload.accountId && !payload.statementId) {
      throw new Error("Bank account ID or statement ID is required.");
    }

    const { data } = await api.post(`${BASE_URL}/start`, payload);
    return data;
  },

  // Get reconciliation summary
  getSummary: async (params = {}) => {
    const { data } = await api.get(`${BASE_URL}/summary`, { params });
    return data;
  },

  // Get unmatched transactions
  getUnmatched: async (params = {}) => {
    const { data } = await api.get(`${BASE_URL}/unmatched`, { params });
    return data;
  },

  // Match bank and app transactions
  matchTransactions: async (payload) => {
    validatePayload(payload, "matching data");

    if (!payload.bankTransactionId || !payload.appTransactionId) {
      throw new Error(
        "Both bank transaction ID and app transaction ID are required."
      );
    }

    const { data } = await api.post(`${BASE_URL}/match`, payload);
    return data;
  },

  // Mark a match as unmatched
  unmatchTransaction: async (matchId) => {
    validateId(matchId, "match ID");

    const { data } = await api.patch(
      `${BASE_URL}/matches/${encodeURIComponent(matchId)}/unmatch`
    );

    return data;
  },

  // Get matched transaction pairs
  getMatches: async (reconciliationId, params = {}) => {
    validateId(reconciliationId, "reconciliation ID");

    const { data } = await api.get(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}/matches`,
      { params }
    );

    return data;
  },

  // Complete reconciliation
  complete: async (reconciliationId, payload = {}) => {
    validateId(reconciliationId, "reconciliation ID");
    validatePayload(payload, "completion data");

    const { data } = await api.post(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}/complete`,
      payload
    );

    return data;
  },

  // Delete reconciliation
  remove: async (reconciliationId) => {
    validateId(reconciliationId, "reconciliation ID");

    const { data } = await api.delete(
      `${BASE_URL}/${encodeURIComponent(reconciliationId)}`
    );

    return data;
  },
};

export default reconciliationService;