
import { useMemo } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import { useExpense } from "../../context/expenseContext";
import SnapshotCards from "./SnapshotCards";
import SnapshotCharts from "./SnapshotCharts";
import FinancialInsights from "./FinancialInsights";

const getTransactionDate = (transaction) => {
  const value = transaction.date || transaction.createdAt;

  if (!value) return null;

  // Avoid timezone shifts for YYYY-MM-DD date-only values.
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const calculateTotals = (items) =>
  items.reduce(
    (totals, transaction) => {
      const amount = Number(transaction.amount);
      const type = String(transaction.type || "").toLowerCase();

      if (!Number.isFinite(amount) || amount < 0) return totals;

      if (type === "income") {
        totals.income += amount;
      } else if (type === "expense") {
        totals.expense += amount;
      }

      return totals;
    },
    { income: 0, expense: 0 }
  );

export default function FinancialSnapshot() {
  const { transactions = [], loading = false } = useExpense();

  const now = new Date();

  const formatMonth = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(now);

  const snapshot = useMemo(() => {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const validTransactions = transactions.filter((transaction) => {
      const amount = Number(transaction.amount);

      return (
        Number.isFinite(amount) &&
        amount >= 0 &&
        ["income", "expense"].includes(
          String(transaction.type || "").toLowerCase()
        )
      );
    });

    const monthlyTransactions = validTransactions.filter((transaction) => {
      const date = getTransactionDate(transaction);

      return (
        date &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    const allTotals = calculateTotals(validTransactions);
    const monthTotals = calculateTotals(monthlyTransactions);

    const balance = monthTotals.income - monthTotals.expense;

    return {
      income: monthTotals.income,
      expense: monthTotals.expense,
      balance,
      savingsRate:
        monthTotals.income > 0
          ? (balance / monthTotals.income) * 100
          : 0,
      allIncome: allTotals.income,
      allExpense: allTotals.expense,
      monthlyTransactions,
      transactions: validTransactions,
    };
  }, [transactions, now.getMonth(), now.getFullYear()]);

  if (loading) {
    return (
      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded-lg bg-slate-200" />
            <div className="h-8 w-56 rounded-lg bg-slate-200" />
            <div className="h-4 w-64 max-w-full rounded-lg bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-slate-100"
              />
            ))}
          </div>

          <div className="h-64 rounded-2xl bg-slate-100" />
          <div className="h-44 rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-6 text-slate-900">
      {/* Snapshot heading */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-blue-700 sm:text-sm">
            <Sparkles size={16} />
            YOUR MONEY, AT A GLANCE
          </div>

          <h2 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Financial Snapshot
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Understand your financial health for {formatMonth}.
          </p>
        </div>

        <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
          <CalendarDays size={17} className="shrink-0" />
          <span className="truncate">{formatMonth}</span>
        </div>
      </header>

      {/* Summary cards */}
      <SnapshotCards
        income={snapshot.income}
        expense={snapshot.expense}
        balance={snapshot.balance}
        savingsRate={snapshot.savingsRate}
      />

      {/* Charts */}
      <SnapshotCharts transactions={snapshot.transactions} />

      {/* Financial insights */}
      <FinancialInsights
        income={snapshot.income}
        expense={snapshot.expense}
        balance={snapshot.balance}
        savingsRate={snapshot.savingsRate}
        transactions={snapshot.monthlyTransactions}
      />

      {/* Footer */}
      <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
          <ArrowUpRight size={19} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-slate-800">
            Small steps create financial progress
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Review your spending regularly and use your transaction history
            to make better financial decisions.
          </p>
        </div>
      </div>
    </section>
  );
}
