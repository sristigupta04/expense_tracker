import { createContext, useContext, useEffect, useState } from "react";

import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  editTransaction,
  clearTransactions,
} from "../services/transactionService";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const addExpense = (transaction) => {
    const updatedTransactions = addTransaction(transaction);
    setTransactions(updatedTransactions);
  };

  const removeExpense = (id) => {
    const updatedTransactions = deleteTransaction(id);
    setTransactions(updatedTransactions);
  };

  const updateExpense = (id, updatedTransaction) => {
    const updatedTransactions = editTransaction(
      id,
      updatedTransaction
    );

    setTransactions(updatedTransactions);
  };

  const clearExpense = () => {
    clearTransactions();
    setTransactions([]);
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        addExpense,
        removeExpense,
        updateExpense,
        clearExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  return useContext(ExpenseContext);
}