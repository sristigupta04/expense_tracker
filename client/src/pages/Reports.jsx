
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ChartNoAxesCombined,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ReceiptText,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  BarChart3,
  CircleDollarSign,
} from "lucide-react";

import {
  getDashboardReport,
  getCategoryReport,
  getMonthlyReport,
} from "../services/report";

import formatCurrency from "../utils/formatCurrency";
import Loader from "../components/common/Loader";
export default function Reports() {
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  const [categoryReport, setCategoryReport] = useState({});
  const [monthlyReport, setMonthlyReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [summaryData, categoryData, monthlyData] = await Promise.all([
        getDashboardReport(),
        getCategoryReport(),
        getMonthlyReport(),
      ]);

      setSummary({
        income: Number(summaryData?.income) || 0,
        expense: Number(summaryData?.expense) || 0,
        balance: Number(summaryData?.balance) || 0,
      });

      setCategoryReport(categoryData || {});
      setMonthlyReport(monthlyData || {});
    } catch (err) {
      console.error("Error loading reports:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load reports. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const categories = useMemo(
    () =>
      Object.entries(categoryReport)
        .map(([name, amount]) => [name, Number(amount) || 0])
        .sort((a, b) => b[1] - a[1]),
    [categoryReport]
  );

  const months = useMemo(
    () =>
      Object.entries(monthlyReport).map(([name, amount]) => [
        name,
        Number(amount) || 0,
      ]),
    [monthlyReport]
  );

  const maxCategoryAmount = Math.max(
    ...categories.map(([, amount]) => amount),
    1
  );

  const maxMonthlyAmount = Math.max(
    ...months.map(([, amount]) => amount),
    1
  );

  const savingsRate =
    summary.income > 0
      ? ((summary.income - summary.expense) / summary.income) * 100
      : 0;

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <Loader text="Loading financial reports..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ChartNoAxesCombined size={15} />
              Financial insights
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track your financial performance and understand your spending
              patterns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReports(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh reports"}
          </button>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center"
          >
            <AlertCircle size={20} className="shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => loadReports(true)}
              disabled={refreshing}
              className="self-start font-bold underline underline-offset-4 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary */}
        <section aria-label="Financial summary">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">
              Financial overview
            </h2>
            <span className="text-xs font-medium text-slate-400">
              Based on available report data
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total income"
              amount={formatCurrency(summary.income)}
              description="Money received"
              icon={TrendingUp}
              theme="emerald"
            />

            <SummaryCard
              title="Total expenses"
              amount={formatCurrency(summary.expense)}
              description="Money spent"
              icon={TrendingDown}
              theme="rose"
            />

            <SummaryCard
              title="Current balance"
              amount={formatCurrency(summary.balance)}
              description="Income minus expenses"
              icon={Wallet}
              theme="blue"
            />
          </div>
        </section>

        {/* Insights */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PiggyBank size={23} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Savings difference
              </p>
              <p
                className={`mt-1 break-words text-xl font-extrabold ${
                  summary.income - summary.expense >= 0
                    ? "text-emerald-700"
                    : "text-rose-600"
                }`}
              >
                {formatCurrency(summary.income - summary.expense)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <CircleDollarSign size={23} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Income retained
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">
                {summary.income > 0
                  ? `${savingsRate.toFixed(1)}%`
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Based on income minus expenses
              </p>
            </div>
          </div>
        </section>

        {/* Reports */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Category breakdown */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <ReceiptText size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    Category breakdown
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Expenses grouped by category
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                {categories.length} categories
              </span>
            </div>

            {categories.length === 0 ? (
              <EmptyReport message="No category data available yet." />
            ) : (
              <div className="space-y-5">
                {categories.map(([category, amount], index) => {
                  const percentage = Math.min(
                    (amount / maxCategoryAmount) * 100,
                    100
                  );

                  return (
                    <div key={category}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                          <span className="truncate text-sm font-medium text-slate-700">
                            {category}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>

                      <div
                        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={`${category} spending`}
                        aria-valuemin={0}
                        aria-valuemax={maxCategoryAmount}
                        aria-valuenow={amount}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            index === 0 ? "bg-blue-700" : "bg-blue-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Monthly overview */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <CalendarDays size={21} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Monthly overview
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Financial activity by month
                </p>
              </div>
            </div>

            {months.length === 0 ? (
              <EmptyReport message="No monthly data available yet." />
            ) : (
              <div className="space-y-5">
                {months.map(([month, amount]) => {
                  const percentage = Math.min(
                    (amount / maxMonthlyAmount) * 100,
                    100
                  );

                  return (
                    <div key={month}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-slate-700">
                          {month}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Financial note */}
        <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
            {summary.balance >= 0 ? (
              <ArrowUpRight size={22} />
            ) : (
              <ArrowDownRight size={22} />
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              Your financial snapshot
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {summary.balance >= 0
                ? "Your reported balance is non-negative. Review the category and monthly breakdowns to understand your financial activity."
                : "Your reported balance is negative. Review your spending breakdown to identify categories where you may be able to reduce expenses."}
            </p>
          </div>
        </section>

        <footer className="flex items-center justify-center gap-2 pb-2 text-xs text-slate-400">
          <BarChart3 size={14} />
          Reports are calculated from the data provided by your backend.
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({ title, amount, description, icon: Icon, theme }) {
  const styles = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-500",
      label: "text-emerald-700",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700",
      accent: "bg-rose-500",
      label: "text-rose-700",
    },
    blue: {
      icon: "bg-blue-50 text-blue-700",
      accent: "bg-blue-700",
      label: "text-blue-700",
    },
  };

  const style = styles[theme] || styles.blue;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            {amount}
          </p>
          <p className={`mt-2 text-xs font-medium ${style.label}`}>
            {description}
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

function EmptyReport({ message }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <ChartNoAxesCombined size={23} />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <p className="mt-1 text-xs text-slate-400">
        Data will appear here when available.
      </p>
    </div>
  );
}
