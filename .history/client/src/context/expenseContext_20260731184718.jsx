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

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Add transaction
  const addExpense = async (transaction) => {
    try {
      const data = await addTransaction(transaction);

      setTransactions((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Delete transaction
  const removeExpense = async (id) => {
    try {
      await deleteTransaction(id);

      setTransactions((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // Update transaction
  const editExpense = async (id, updatedTransaction) => {
    try {
      const data = await updateTransaction(id, updatedTransaction);

      setTransactions((prev) =>
        prev.map((item) =>
          item._id === id ? data : item
        )
      );
    } catch (error) {
      console.error("Error updating transaction:", error);
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