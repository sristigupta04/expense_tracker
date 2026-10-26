
import { useMemo, useState } from "react";
import {
  Search,
  PlusCircle,
  ReceiptText,
  Wallet,
  TrendingUp,
  TrendingDown,
  X,
  AlertCircle,
} from "lucide-react";

import { useExpense } from "../context/expenseContext";
import Navbar from "../components/Navbar";
import TransactionForm from "../components/Transactionform";
import TransactionTable from "../components/Transactiontable";
import Loader from "../components/Loader";
import formatCurrency from "../utils/formatCurrency";

export default function Transactions() {
  const {
    transactions = [],
    loading,
    error,
    addExpense,
    removeExpense,
    editExpense,
  } = useExpense();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const totals = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
          result.income += amount;
        } else {
          result.expense += amount;
        }

        return result;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch = [
        transaction.title,
        transaction.category,
        transaction.type,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <ReceiptText size={18} />
                Money management
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Transactions
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Manage your income and expenses in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              <ReceiptText size={18} className="text-blue-600" />
              <span>
                <strong className="text-slate-900">
                  {transactions.length}
                </strong>{" "}
                total transactions
              </span>
            </div>
          </div>

          {/* Summary cards */}
          <section
            aria-label="Transaction summary"
            className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <SummaryCard
              title="Total income"
              amount={formatCurrency(totals.income)}
              icon={TrendingUp}
              color="emerald"
            />

            <SummaryCard
              title="Total expenses"
              amount={formatCurrency(totals.expense)}
              icon={TrendingDown}
              color="rose"
            />

            <SummaryCard
              title="Net cash flow"
              amount={formatCurrency(totals.income - totals.expense)}
              icon={Wallet}
              color="blue"
            />
          </section>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Main content */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Transaction form */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PlusCircle size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Add transaction
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Record income or spending
                  </p>
                </div>
              </div>

              <TransactionForm addTransaction={addExpense} />
            </section>

            {/* Transaction history */}
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <ReceiptText size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Transaction history
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Search and manage your records
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search title or category..."
                      aria-label="Search transactions"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    aria-label="Filter transaction type"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex min-h-48 items-center justify-center">
                    <Loader text="Loading transactions..." />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <ReceiptText size={26} />
                    </div>

                    <h3 className="font-bold text-slate-900">
                      {transactions.length === 0
                        ? "No transactions yet"
                        : "No matching transactions"}
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      {transactions.length === 0
                        ? "Add your first income or expense using the form."
                        : "Try another search term or change the transaction filter."}
                    </p>

                    {(search || typeFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setTypeFilter("all");
                        }}
                        className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="mb-4 text-xs font-medium text-slate-500">
                      Showing {filteredTransactions.length} of{" "}
                      {transactions.length} transactions
                    </p>

                    <TransactionTable
                      transactions={filteredTransactions}
                      deleteTransaction={removeExpense}
                      editTransaction={editExpense}
                    />
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function SummaryCard({ title, amount, icon: Icon, color }) {
  const styles = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      accent: "bg-emerald-500",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600",
      accent: "bg-rose-500",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      accent: "bg-blue-600",
    },
  };

  const style = styles[color] || styles.blue;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-900">
            {amount}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </article>
  );
}
