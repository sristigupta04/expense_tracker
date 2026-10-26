
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
} from "lucide-react";

import {
  getDashboardReport,
  getCategoryReport,
  getMonthlyReport,
} from "../services/report";

import formatCurrency from "../utils/formatCurrency";
import Loader from "../components/Loader";

export default function Reports() {
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  const [categoryReport, setCategoryReport] = useState({});
  const [monthlyReport, setMonthlyReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryData, categoryData, monthlyData] =
        await Promise.all([
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
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const categories = useMemo(() => {
    return Object.entries(categoryReport).sort(
      (a, b) => Number(b[1]) - Number(a[1])
    );
  }, [categoryReport]);

  const months = useMemo(() => {
    return Object.entries(monthlyReport);
  }, [monthlyReport]);

  const maxCategoryAmount = Math.max(
    ...categories.map(([, amount]) => Number(amount) || 0),
    1
  );

  const maxMonthlyAmount = Math.max(
    ...months.map(([, amount]) => Number(amount) || 0),
    1
  );

  if (loading) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader text="Loading financial reports..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <ChartNoAxesCombined size={18} />
              Financial insights
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Understand your income, spending patterns, and financial health.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh reports
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>

            <button
              type="button"
              onClick={loadReports}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section
          aria-label="Financial summary"
          className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
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
        </section>

        {/* Report panels */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Category report */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ReceiptText size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Category breakdown
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Expenses by category
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {categories.length} categories
              </span>
            </div>

            {categories.length === 0 ? (
              <EmptyReport message="No category data available yet." />
            ) : (
              <div className="space-y-5">
                {categories.map(([category, amount]) => {
                  const value = Number(amount) || 0;
                  const percentage = Math.min(
                    (value / maxCategoryAmount) * 100,
                    100
                  );

                  return (
                    <div key={category}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-slate-700">
                          {category}
                        </span>

                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {formatCurrency(value)}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-[width] duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Monthly report */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <CalendarDays size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Monthly overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Monthly financial activity
                </p>
              </div>
            </div>

            {months.length === 0 ? (
              <EmptyReport message="No monthly data available yet." />
            ) : (
              <div className="space-y-5">
                {months.map(([month, amount]) => {
                  const value = Number(amount) || 0;
                  const percentage = Math.min(
                    (value / maxMonthlyAmount) * 100,
                    100
                  );

                  return (
                    <div key={month}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-slate-700">
                          {month}
                        </span>

                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {formatCurrency(value)}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-[width] duration-700"
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

        {/* Insight footer */}
        <section className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            {summary.balance >= 0 ? (
              <ArrowUpRight size={21} />
            ) : (
              <ArrowDownRight size={21} />
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              Your financial snapshot
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {summary.balance >= 0
                ? "Your reported balance is non-negative. Review the category and monthly breakdowns to understand where your money goes."
                : "Your reported expenses exceed your income. Review the category breakdown to identify areas where you may be able to reduce spending."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ title, amount, description, icon: Icon, theme }) {
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

  const style = styles[theme] || styles.blue;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-900">
            {amount}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
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
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
      <ChartNoAxesCombined size={25} className="mb-3 text-slate-400" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
