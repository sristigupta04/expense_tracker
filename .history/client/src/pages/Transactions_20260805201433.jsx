import { Search, PlusCircle } from "lucide-react";
import { useState } from "react";

import { useExpense } from "../context/ExpenseContext";
import Navbar from "../components/Navbar";
import TransactionForm from "../components/Transactionform";
import TransactionTable from "../components/Transactiontable";

export default function Transactions() {
  const {
    transactions,
    addExpense,
    removeExpense,
    updateExpense,
  } = useExpense();

  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Transactions
              </h1>

              <p className="text-slate-500 mt-2">
                Manage all your income and expenses.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search transaction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Form + Table */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Add Transaction */}

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <div className="flex items-center gap-2 mb-6">

                <PlusCircle className="text-blue-600" />

                <h2 className="text-xl font-semibold">
                  Add Transaction
                </h2>

              </div>

              <TransactionForm
                addTransaction={addExpense}
              />

            </div>

            {/* Transaction Table */}

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">

              <h2 className="text-xl font-semibold mb-6">
                Transaction History
              </h2>

              <TransactionTable
                transactions={filteredTransactions}
                deleteTransaction={removeExpense}
                editTransaction={updateExpense}
              />

            </div>

          </div>

        </div>
      </main>
    </>
  );
}