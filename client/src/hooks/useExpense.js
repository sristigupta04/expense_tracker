import { useCallback, useEffect, useState } from "react";
import transactionApi from "../services/transactionApi";

function normalizeTransactions(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.transactions)) return result.transactions;
  if (Array.isArray(result?.data?.transactions)) {
    return result.data.transactions;
  }
  if (Array.isArray(result?.data)) return result.data;

  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getTransactionId(transaction) {
  return transaction?._id ?? transaction?.id ?? null;
}

export default function useExpense({ autoFetch = true } = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch transactions
  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const result = await transactionApi.getAll(params);
      const list = normalizeTransactions(result);

      setTransactions(list);
      return list;
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to load transactions."
      );

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add transaction
  const createTransaction = useCallback(
    async (transactionData) => {
      setError("");

      try {
        const result = await transactionApi.create(transactionData);
        const created = result?.transaction ?? result?.data ?? result;

        if (!getTransactionId(created)) {
          await fetchTransactions();
        } else {
          setTransactions((previous) => [
            created,
            ...previous.filter(
              (item) =>
                String(getTransactionId(item)) !==
                String(getTransactionId(created))
            ),
          ]);
        }

        return created;
      } catch (err) {
        setError(
          getErrorMessage(err, "Failed to create transaction.")
        );
        throw err;
      }
    },
    [fetchTransactions]
  );

  // Update transaction
  const updateTransaction = useCallback(
    async (id, transactionData) => {
      if (!id) {
        throw new Error("Transaction ID is required.");
      }

      setError("");

      try {
        const result = await transactionApi.update(id, transactionData);
        const updated = result?.transaction ?? result?.data ?? result;

        if (!getTransactionId(updated)) {
          await fetchTransactions();
        } else {
          setTransactions((previous) =>
            previous.map((item) =>
              String(getTransactionId(item)) === String(id)
                ? updated
                : item
            )
          );
        }

        return updated;
      } catch (err) {
        setError(
          getErrorMessage(err, "Failed to update transaction.")
        );
        throw err;
      }
    },
    [fetchTransactions]
  );

  // Delete transaction
  const deleteTransaction = useCallback(async (id) => {
    if (!id) {
      throw new Error("Transaction ID is required.");
    }

    setError("");

    try {
      const result = await transactionApi.remove(id);

      setTransactions((previous) =>
        previous.filter(
          (transaction) =>
            String(getTransactionId(transaction)) !== String(id)
        )
      );

      return result;
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to delete transaction.")
      );
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!autoFetch) return;

    fetchTransactions().catch(() => {
      // The error is already stored in state.
    });
  }, [autoFetch, fetchTransactions]);

  return {
    transactions,
    setTransactions,
    loading,
    error,
    fetchTransactions,

    // Original names
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Compatibility aliases for Dashboard.jsx
    addExpense: createTransaction,
    editExpense: updateTransaction,
    removeExpense: deleteTransaction,
  };
}