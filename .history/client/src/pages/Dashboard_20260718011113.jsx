import { useState } from "react";

import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import CategoryChart from "../components/charts/CategoryChart";
import ExpenseChart from "../components/charts/ExpenseChart";
import IncomeChart from "../components/charts/IncomeChart";
import MonthlyChart from "../components/charts/MonthlyChart";
import Loader from "../components/Loader";
import calculateBalance from "../utils/calculateBalance";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      title: "Salary",
      amount: 30000,
      type: "income",
      category: "Salary",
      date: "2026-07-01",
    },
    {
      id: 2,
      title: "Food",
      amount: 500,
      type: "expense",
      category: "Food",
      date: "2026-07-02",
    },
  ]);

  const { income, expense, balance } =
    calculateBalance(transactions);

  return (
    <>
      <Navbar />

      <SummaryCard
        balance={balance}
        income={income}
        expense={expense}
      />

      <TransactionForm
        transactions={transactions}
        setTransactions={setTransactions}
      />

      <TransactionTable
        transactions={transactions}
        setTransactions={setTransactions}
      />

      <CategoryChart transactions={transactions} />

      <ExpenseChart transactions={transactions} />

      <IncomeChart transactions={transactions} />

      <MonthlyChart transactions={transactions} />
    </>
  );
}