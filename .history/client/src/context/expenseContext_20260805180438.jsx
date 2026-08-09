import { createContext, useContext, useEffect, useState } from "react";

import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "../services/transactionApi";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // Fetch Transactions
  // ===============================
  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();

      console.log("Transactions:", data);

      setTransactions(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ===============================
  // Add Transaction
  // ===============================
  const addExpense = async (transaction) => {
    try {
      const data = await addTransaction(transaction);

      setTransactions((prev) => [data, ...prev]);

      console.log("Added:", data);
    } catch (error) {
      console.error("Add Error:", error);
    }
  };

  // ===============================
  // Delete Transaction
  // ===============================
  const removeExpense = async (id) => {
    console.log("Delete Request ID:", id);

    if (!id) {
      console.error("❌ Transaction ID is undefined");
      return;
    }

    try {
      await deleteTransaction(id);

      setTransactions((prev) =>
        prev.filter((item) => item._id !== id)
      );

      console.log("✅ Deleted Successfully");
    } catch (error) {
      console.error(
        "Delete Error:",
        error.response?.data || error.message
      );
    }
  };

  // ===============================
  // Update Transaction
  // ===============================
  const editExpense = async (id, updatedTransaction) => {
    console.log("Update ID:", id);

    try {
      const data = await updateTransaction(
        id,
        updatedTransaction
      );

      setTransactions((prev) =>
        prev.map((item) =>
          item._id === id ? data : item
        )
      );

      console.log("Updated:", data);
    } catch (error) {
      console.error(
        "Update Error:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        loading,
        fetchTransactions,
        addExpense,
        removeExpense,
        editExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  return useContext(ExpenseContext);
}