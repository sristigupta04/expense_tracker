
import { useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/Transactionsform";
import TransactionTable from "../components/TransactionTable";

import CategoryChart from "../components/charts/categorychart";
import IncomeChart from "../components/charts/IncomeChart";
import ExpenseChart from "../components/charts/ExpenseChart";
import MonthlyChart from "../components/charts/MonthlyChart";

import Loader from "../components/Loader";

import calculateBalance from "../utils/calculateBalance";
import { useExpense } from "../context/ExpenseContext";

export default function Dashboard() {
  const {
    transactions = [],
    loading,
    addExpense,
    removeExpense,
    editExpense,
  } = useExpense();

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  // Calculate financial summary
  const { income, expense, balance } =
    calculateBalance(transactions);

  // Get the five most recent transactions.
  // This creates a copy so the original context array is not modified.
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = new Date(
          a.date || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.date || b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [transactions]);

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);

    // Scroll to the transaction form when editing.
    document
      .getElementById("transaction-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  const handleClearSelection = () => {
    setSelectedTransaction(null);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 text-slate-900">
        {/* Loading overlay/component */}
        {loading && <Loader />}

        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Dashboard Header */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Personal Finance
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Track your money, understand your spending,
                and stay in control of your finances.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:self-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                💰
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Total transactions
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {transactions.length}
                </p>
              </div>
            </div>
          </header>

          {/* Financial Summary */}
          <section
            aria-label="Financial summary"
            className="mb-8"
          >
            <SummaryCard
              balance={balance}
              income={income}
              expense={expense}
            />
          </section>

          {/* Transaction Form and Recent Transactions */}
          <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-5">
            {/* Add/Edit Transaction Form */}
            <div
              id="transaction-form"
              className="min-w-0 scroll-mt-24 xl:col-span-2"
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      {selectedTransaction
                        ? "Edit Transaction"
                        : "Add Transaction"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedTransaction
                        ? "Update your transaction details."
                        : "Record your income or expenses."}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                    {selectedTransaction ? "✏️" : "＋"}
                  </div>
                </div>

                <TransactionForm
                  addTransaction={addExpense}
                  editTransaction={editExpense}
                  selectedTransaction={selectedTransaction}
                  clearSelection={handleClearSelection}
                />
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="min-w-0 xl:col-span-3">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      Recent Transactions
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your latest financial activity.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {recentTransactions.length} recent
                  </span>
                </div>

                {transactions.length > 0 ? (
                  <TransactionTable
                    transactions={recentTransactions}
                    deleteTransaction={removeExpense}
                    editTransaction={handleEditTransaction}
                  />
                ) : (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                      🧾
                    </div>

                    <h3 className="font-semibold text-slate-800">
                      No transactions yet
                    </h3>

                    <p className="mt-2 max-w-xs text-sm text-slate-500">
                      Add your first income or expense using
                      the form to see it here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Financial Analytics */}
          <section aria-label="Financial analytics">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Financial Analytics
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Understand where your money comes from
                and where it goes.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Category Distribution */}
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                <div className="mb-5">
                  <h3 className="font-bold text-slate-900">
                    Category Distribution
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Explore your spending by category.
                  </p>
                </div>

                <CategoryChart
                  transactions={transactions}
                />
              </div>

              {/* Expense Analysis */}
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                <div className="mb-5">
                  <h3 className="font-bold text-slate-900">
                    Expense Analysis
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Review your outgoing money.
                  </p>
                </div>

                <ExpenseChart
                  transactions={transactions}
                />
              </div>

              {/* Income Analysis */}
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                <div className="mb-5">
                  <h3 className="font-bold text-slate-900">
                    Income Analysis
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Understand your income sources.
                  </p>
                </div>

                <IncomeChart
                  transactions={transactions}
                />
              </div>

              {/* Monthly Overview */}
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
                <div className="mb-5">
                  <h3 className="font-bold text-slate-900">
                    Monthly Overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Compare your financial activity over time.
                  </p>
                </div>

                <MonthlyChart
                  transactions={transactions}
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-500">
            Manage your money with clarity and confidence.
          </footer>
        </div>
      </main>
    </>
  );
}
