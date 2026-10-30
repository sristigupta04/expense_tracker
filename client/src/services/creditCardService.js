import api from "./api";

const BASE_URL = "/credit-cards";

const creditCardService = {
  // Get all credit cards
  getAll: async (params = {}) => {
    const { data } = await api.get(BASE_URL, { params });
    return data;
  },

  // Get credit card by ID
  getById: async (cardId) => {
    if (!cardId) throw new Error("Credit card ID is required.");

    const { data } = await api.get(
      `${BASE_URL}/${encodeURIComponent(cardId)}`
    );

    return data;
  },

  // Create credit card
  create: async (cardData) => {
    if (
      !cardData ||
      typeof cardData !== "object" ||
      Array.isArray(cardData)
    ) {
      throw new Error("Valid credit card details are required.");
    }

    const { data } = await api.post(BASE_URL, cardData);
    return data;
  },

  // Update credit card
  update: async (cardId, cardData) => {
    if (!cardId) throw new Error("Credit card ID is required.");

    if (
      !cardData ||
      typeof cardData !== "object" ||
      Array.isArray(cardData)
    ) {
      throw new Error("Valid credit card details are required.");
    }

    const { data } = await api.put(
      `${BASE_URL}/${encodeURIComponent(cardId)}`,
      cardData
    );

    return data;
  },

  // Delete credit card
  remove: async (cardId) => {
    if (!cardId) throw new Error("Credit card ID is required.");

    const { data } = await api.delete(
      `${BASE_URL}/${encodeURIComponent(cardId)}`
    );

    return data;
  },

  // Get card transactions
  getTransactions: async (cardId, params = {}) => {
    if (!cardId) throw new Error("Credit card ID is required.");

    const { data } = await api.get(
      `${BASE_URL}/${encodeURIComponent(cardId)}/transactions`,
      { params }
    );

    return data;
  },

  // Make credit card payment
  makePayment: async (cardId, paymentData) => {
    if (!cardId) throw new Error("Credit card ID is required.");

    const amount = Number(paymentData?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Enter a valid payment amount greater than zero.");
    }

    const { data } = await api.post(
      `${BASE_URL}/${encodeURIComponent(cardId)}/payments`,
      { ...paymentData, amount }
    );

    return data;
  },

  // Get payment history
  getPayments: async (cardId, params = {}) => {
    if (!cardId) throw new Error("Credit card ID is required.");

    const { data } = await api.get(
      `${BASE_URL}/${encodeURIComponent(cardId)}/payments`,
      { params }
    );

    return data;
  },

  // Get credit card summary
  getSummary: async (params = {}) => {
    const { data } = await api.get(`${BASE_URL}/summary`, { params });
    return data;
  },
};

export default creditCardService;