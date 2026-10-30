
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  ReceiptText,
  CalendarDays,
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function getTransactionDate(value) {
  if (!value) return null;

  // Prevent timezone shifts for date-only values.
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
}

function formatTransactionDate(value) {
  const date = getTransactionDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RecentTransactions({
  transactions = [],
  loading = false,
  limit = 5,
  onViewAll,
}) {
  const navigate = useNavigate();

  const latestTransactions = useMemo(() => {
    const safeLimit = Math.max(1, Number(limit) || 5);

    return [...transactions]
      .sort((a, b) => {
        const dateA = getTransactionDate(
          a.date || a.createdAt
        );
        const dateB = getTransactionDate(
          b.date || b.createdAt
        );

        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, safeLimit);
  }, [transactions, limit]);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate("/transactions");
    }
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">
            Recent Transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest money movements
          </p>
        </div>

        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          View all
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4 p-5 sm:p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-3"
            >
              <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />

              <div className="min-w-0 flex-1">
                <div className="h-4 w-32 max-w-full rounded bg-slate-100" />
                <div className="mt-2 h-3 w-24 max-w-full rounded bg-slate-100" />
              </div>

              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : latestTransactions.length === 0 ? (
        /* Empty state */
        <div className="flex min-h-60 flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ReceiptText size={26} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">
            No transactions yet
          </h3>

          <p className="mt-1 max-w-xs text-sm leading-5 text-slate-500">
            Once you add income or expenses, your latest activity will
            appear here.
          </p>
        </div>
      ) : (
        /* Transaction list */
        <div className="divide-y divide-slate-100">
          {latestTransactions.map((item, index) => {
            const type = String(item.type || "").toLowerCase();
            const isIncome = type === "income";
            const isExpense = type === "expense";

            const id =
              item._id ||
              item.id ||
              `${item.title || item.name || "transaction"}-${index}`;

            const amount = Number(item.amount) || 0;

            return (
              <article
                key={id}
                className="flex min-w-0 items-center gap-3 px-5 py-4 transition hover:bg-slate-50/80 sm:gap-4 sm:px-6"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isIncome
                      ? "bg-emerald-50 text-emerald-600"
                      : isExpense
                        ? "bg-rose-50 text-rose-600"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft size={21} />
                  ) : (
                    <ArrowUpRight size={21} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {item.title || item.name || "Untitled transaction"}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span className="max-w-28 truncate">
                      {item.category || "Uncategorized"}
                    </span>

                    <span aria-hidden="true">·</span>

                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={12} />
                      {formatTransactionDate(
                        item.date || item.createdAt
                      )}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      isIncome
                        ? "text-emerald-600"
                        : isExpense
                          ? "text-slate-900"
                          : "text-slate-600"
                    }`}
                  >
                    {isIncome ? "+" : isExpense ? "−" : ""}
                    {formatCurrency(Math.abs(amount))}
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-700"
                        : isExpense
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isIncome
                      ? "Income"
                      : isExpense
                        ? "Expense"
                        : item.type || "Other"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!loading && latestTransactions.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            Showing {latestTransactions.length} of {transactions.length} transactions
          </p>
        </div>
      )}
    </section>
  );
}
