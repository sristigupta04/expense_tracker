import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionsForm";
import TransactionTable from "../components/TransactionTable";
import CategoryChart from "../components/charts/categorychart";
import IncomeChart from "../components/charts/IncomeChart";
import Loader from "../components/Loader";
import ExpenseChart from "../components/charts/ExpenseChart";
import calculateBalance from "../utils/calculateBalance";
import { useExpense } from "../context/ExpenseContext";
import MonthlyChart from "../components/charts/MonthlyChart";
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
  addTransaction={addExpense}
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