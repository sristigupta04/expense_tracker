
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

export default function FinancialSnapshot() {
  const { transactions = [], loading = false } = useExpense();

  const snapshot = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const validTransactions = transactions.filter(
      (transaction) =>
        Number.isFinite(Number(transaction.amount)) &&
        Number(transaction.amount) >= 0
    );

    const monthlyTransactions = validTransactions.filter((transaction) => {
      const date = new Date(
        transaction.date || transaction.createdAt || ""
      );

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    const calculateTotals = (items) =>
      items.reduce(
        (totals, transaction) => {
          const amount = Number(transaction.amount) || 0;
          const type = String(transaction.type || "").toLowerCase();

          if (type === "income") totals.income += amount;
          if (type === "expense") totals.expense += amount;

          return totals;
        },
        { income: 0, expense: 0 }
      );

    const allTotals = calculateTotals(validTransactions);
    const monthTotals = calculateTotals(monthlyTransactions);

    return {
      income: monthTotals.income,
      expense: monthTotals.expense,
      balance: monthTotals.income - monthTotals.expense,
      savingsRate:
        monthTotals.income > 0
          ? ((monthTotals.income - monthTotals.expense) /
              monthTotals.income) *
            100
          : 0,
      allIncome: allTotals.income,
      allExpense: allTotals.expense,
      monthlyTransactions,
      transactions: validTransactions,
    };
  }, [transactions]);

  const formatMonth = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="animate-pulse space-y-5">
          <div className="h-7 w-52 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-slate-100"
              />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-6 text-slate-900">
      {/* Snapshot heading */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles size={16} />
            YOUR MONEY, AT A GLANCE
          </div>

          <h2 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
            Financial Snapshot
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Understand your financial health for {formatMonth}.
          </p>
        </div>

        <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <CalendarDays size={17} />
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

      {/* Insights */}
      <FinancialInsights
        income={snapshot.income}
        expense={snapshot.expense}
        balance={snapshot.balance}
        savingsRate={snapshot.savingsRate}
        transactions={snapshot.monthlyTransactions}
      />

      {/* Footer */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
        <div className="rounded-xl bg-white p-2 text-indigo-600 shadow-sm">
          <ArrowUpRight size={19} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-slate-800">
            Small steps create financial progress
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Review your spending regularly and use your actual transaction
            history to make better financial decisions.
          </p>
        </div>
      </div>
    </section>
  );
}
