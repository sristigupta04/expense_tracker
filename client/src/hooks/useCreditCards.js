import { useCallback, useEffect, useState } from "react";
import creditCardService from "../services/creditCardService";

export default function useCreditCard({ autoFetch = true } = {}) {
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all credit cards
  const fetchCreditCards = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const result = await creditCardService.getAll(params);

      const cards =
        result?.cards ??
        result?.creditCards ??
        result?.data?.cards ??
        result?.data ??
        result;

      if (!Array.isArray(cards)) {
        throw new Error("Invalid credit cards response.");
      }

      setCreditCards(cards);
      return cards;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load credit cards."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a credit card
  const createCreditCard = useCallback(async (cardData) => {
    setLoading(true);
    setError("");

    try {
      const result = await creditCardService.create(cardData);

      const newCard =
        result?.card ??
        result?.data?.card ??
        result?.data ??
        result;

      if (newCard && typeof newCard === "object" && newCard.id != null) {
        setCreditCards((previous) => [
          newCard,
          ...previous.filter(
            (card) => String(card.id) !== String(newCard.id)
          ),
        ]);
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add credit card."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a credit card
  const updateCreditCard = useCallback(async (cardId, cardData) => {
    setLoading(true);
    setError("");

    try {
      const result = await creditCardService.update(cardId, cardData);

      const updatedCard =
        result?.card ??
        result?.data?.card ??
        result?.data ??
        result;

      if (updatedCard && typeof updatedCard === "object") {
        setCreditCards((previous) =>
          previous.map((card) =>
            String(card.id) === String(cardId)
              ? { ...card, ...updatedCard }
              : card
          )
        );
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update credit card."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a credit card
  const deleteCreditCard = useCallback(async (cardId) => {
    setLoading(true);
    setError("");

    try {
      const result = await creditCardService.remove(cardId);

      setCreditCards((previous) =>
        previous.filter((card) => String(card.id) !== String(cardId))
      );

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete credit card."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Record a payment
  const makePayment = useCallback(async (cardId, paymentData) => {
    setLoading(true);
    setError("");

    try {
      const result = await creditCardService.makePayment(
        cardId,
        paymentData
      );

      // Refresh cards so the outstanding balance stays in sync.
      const updatedCards = await creditCardService.getAll();

      const cards =
        updatedCards?.cards ??
        updatedCards?.creditCards ??
        updatedCards?.data?.cards ??
        updatedCards?.data ??
        updatedCards;

      if (Array.isArray(cards)) {
        setCreditCards(cards);
      }

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to process credit card payment."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment history for one card
  const fetchPayments = useCallback(async (cardId, params = {}) => {
    setError("");

    try {
      return await creditCardService.getPayments(cardId, params);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load payment history."
      );
      throw err;
    }
  }, []);

  // Load cards on mount
  useEffect(() => {
    if (!autoFetch) return;

    fetchCreditCards().catch(() => {
      // Error is already stored in state.
    });
  }, [autoFetch, fetchCreditCards]);

  return {
    creditCards,
    setCreditCards,
    loading,
    error,
    fetchCreditCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    makePayment,
    fetchPayments,
  };
}