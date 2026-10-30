
import { useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Budgetprogress from "../Budget/Budgetprogress";
import formatCurrency from "../../utils/formatcurrency";

const getAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export default function SpendingOverview({
  transactions = [],
  budgets = [],
  loading = false,
  onViewBudgets,
}) {
  const navigate = useNavigate();

  const categorySpending = useMemo(() => {
    const totals = new Map();

    transactions.forEach((transaction) => {
      if (
        String(transaction.type || "").toLowerCase() !== "expense"
      ) {
        return;
      }

      const category =
        String(transaction.category || "Other").trim() || "Other";

      const amount = getAmount(transaction.amount);

      totals.set(category, (totals.get(category) || 0) + amount);
    });

    return [...totals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions]);

  const totalSpending = categorySpending.reduce(
    (total, item) => total + item.amount,
    0
  );

  const budgetItems = useMemo(
    () =>
      budgets.map((budget) => {
        const limit = getAmount(budget.limit ?? budget.amount);
        const spent = getAmount(
          budget.spent ?? budget.spentAmount
        );

        return {
          ...budget,
          limit,
          spent,
          remaining: Math.max(limit - spent, 0),
          overAmount: Math.max(spent - limit, 0),
          percentage:
            limit > 0 ? (spent / limit) * 100 : 0,
        };
      }),
    [budgets]
  );

  const handleViewBudgets = () => {
    if (onViewBudgets) {
      onViewBudgets();
    } else {
      navigate("/budgets");
    }
  };

  const barColors = [
    "bg-blue-700",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
  ];

  return (
    <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Spending Overview */}
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">
              Spending Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your top spending categories
            </p>
          </div>

          <div className="shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-700">
            <Wallet size={20} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="mb-2 h-3 w-1/3 rounded bg-slate-200" />
                <div className="h-2 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : categorySpending.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
              <Wallet size={23} />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              No spending yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your expense categories will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {categorySpending.map((item, index) => {
              const percentage =
                totalSpending > 0
                  ? (item.amount / totalSpending) * 100
                  : 0;

              return (
                <div key={item.category} className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-700">
                      {item.category}
                    </span>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${item.category} spending`}
                    aria-valuenow={Number(percentage.toFixed(1))}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        barColors[index % barColors.length]
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {percentage.toFixed(1)}% of shown spending
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          View Transactions
          <ArrowRight size={16} />
        </button>
      </article>

      {/* Budget Progress */}
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">
              Budget Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep your spending on track
            </p>
          </div>

          <div className="shrink-0 rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <TrendingUp size={20} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="mb-3 h-3 w-1/2 rounded bg-slate-200" />
                <div className="h-2 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : budgetItems.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
              <Wallet size={23} />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              No budgets created
            </p>

            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Set category budgets to track how much you spend.
            </p>

            <button
              type="button"
              onClick={handleViewBudgets}
              className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Create a Budget
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {budgetItems.slice(0, 4).map((budget, index) => {
              const isOverBudget = budget.overAmount > 0;

              return (
                <div
                  key={
                    budget._id ||
                    budget.id ||
                    `${budget.category || "budget"}-${index}`
                  }
                  className="min-w-0"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {budget.category || "Other"}
                      </p>

                      <p className="mt-1 text-xs">
                        {isOverBudget ? (
                          <span className="inline-flex items-center gap-1 font-medium text-rose-600">
                            <AlertCircle size={13} />
                            Over budget by{" "}
                            {formatCurrency(budget.overAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {formatCurrency(budget.remaining)} remaining
                          </span>
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(budget.spent)}
                      <span className="font-normal text-slate-400">
                        {" "}/ {formatCurrency(budget.limit)}
                      </span>
                    </p>
                  </div>

                  <Budgetprogress
                    limit={budget.limit}
                    spent={budget.spent}
                    category={budget.category}
                    showDetails={false}
                  />
                </div>
              );
            })}
          </div>
        )}

        {!loading && budgetItems.length > 0 && (
          <button
            type="button"
            onClick={handleViewBudgets}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Manage Budgets
            <ArrowRight size={16} />
          </button>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <TrendingDown size={15} className="shrink-0 text-emerald-600" />
          <span>
            Review your budgets regularly to stay on track.
          </span>
        </div>
      </article>
    </section>
  );
}
