
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "../services/transactionApi";

const ExpenseContext = createContext(null);

function normalizeTransactions(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.transactions)) return data.transactions;
  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTransactions();
      setTransactions(normalizeTransactions(data));
    } catch (err) {
      console.error("Fetch transactions failed:", err);
      setError(
        getErrorMessage(err, "Unable to load transactions.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Add transaction
  const addExpense = useCallback(async (transaction) => {
    try {
      const data = await addTransaction(transaction);
      const newTransaction = data?.transaction ?? data;

      if (!newTransaction?._id && !newTransaction?.id) {
        await fetchTransactions();
      } else {
        setTransactions((previous) => [
          newTransaction,
          ...previous,
        ]);
      }

      setError("");
      return newTransaction;
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Unable to add transaction."
      );

      setError(message);
      throw new Error(message);
    }
  }, [fetchTransactions]);

  // Delete transaction
  const removeExpense = useCallback(async (id) => {
    if (!id) {
      throw new Error("Transaction ID is missing.");
    }

    try {
      await deleteTransaction(id);

      setTransactions((previous) =>
        previous.filter(
          (item) => String(item._id || item.id) !== String(id)
        )
      );

      setError("");
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Unable to delete transaction."
      );

      setError(message);
      throw new Error(message);
    }
  }, []);

  // Update transaction
  const editExpense = useCallback(async (id, updatedTransaction) => {
    if (!id) {
      throw new Error("Transaction ID is missing.");
    }

    try {
      const data = await updateTransaction(id, updatedTransaction);
      const updatedItem = data?.transaction ?? data;

      if (!updatedItem?._id && !updatedItem?.id) {
        await fetchTransactions();
      } else {
        setTransactions((previous) =>
          previous.map((item) =>
            String(item._id || item.id) === String(id)
              ? updatedItem
              : item
          )
        );
      }

      setError("");
      return updatedItem;
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Unable to update transaction."
      );

      setError(message);
      throw new Error(message);
    }
  }, [fetchTransactions]);

  const value = useMemo(
    () => ({
      transactions,
      loading,
      error,
      fetchTransactions,
      addExpense,
      removeExpense,
      editExpense,
    }),
    [
      transactions,
      loading,
      error,
      fetchTransactions,
      addExpense,
      removeExpense,
      editExpense,
    ]
  );

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);

  if (!context) {
    throw new Error(
      "useExpense must be used inside an ExpenseProvider"
    );
  }

  return context;
}
