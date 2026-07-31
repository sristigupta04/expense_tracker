import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionsForm";
import TransactionTable from "../components/TransactionTable";
import CategoryChart from "../components/charts/CategoryChart";
import IncomeChart from "../components/charts/IncomeChart";
import Loader from "../components/Loader";

import calculateBalance from "../utils/calculateBalance";
import { useExpense } from "../context/ExpenseContext";

export default function Dashboard() {
  const {
    transactions,
    addExpense,
    removeExpense,
  } = useExpense();

  const { income, expense, balance } =
    calculateBalance(transactions);

  const loading = false;

  return (
    <>
      <Navbar />

      {loading && <Loader />}

      <SummaryCard
        balance={balance}
        income={income}
        expense={expense}
      />

      <TransactionForm
        addExpense={addExpense}
      />

      <TransactionTable
        transactions={transactions}
        remove={removeExpense}
      />

      <CategoryChart
        transactions={transactions}
      />

      <ExpenseChart
        transactions={transactions}
      />

      <IncomeChart
        transactions={transactions}
      />

      <MonthlyChart
        transactions={transactions}
      />
    </>
  );
}