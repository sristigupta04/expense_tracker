import { useExpense } from "../context/ExpenseContext";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";

export default function Transactions() {
  const {
    transactions,
    addExpense,
    removeExpense,
    updateExpense,
  } = useExpense();

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Transactions
          </h1>

          <p className="mt-2 text-slate-500">
            Add, edit and manage your income and expenses.
          </p>
        </div>

        {/* Transaction Form */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-slate-800">
            Add Transaction
          </h2>

          <TransactionForm
            addTransaction={addExpense}
          />
        </div>

        {/* Transaction Table */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-slate-800">
            Transaction History
          </h2>

          <TransactionTable
            transactions={transactions}
            deleteTransaction={removeExpense}
            editTransaction={updateExpense}
          />
        </div>
      </div>
    </div>
  );
}