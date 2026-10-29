
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

export default function SpendingOverview({
  transactions = [],
  budgets = [],
  loading = false,
  onViewBudgets,
}) {
  const navigate = useNavigate();

  const categorySpending = useMemo(() => {
    const totals = {};

    transactions
      .filter(
        (transaction) =>
          String(transaction.type).toLowerCase() === "expense"
      )
      .forEach((transaction) => {
        const category = transaction.category || "Other";
        totals[category] =
          (totals[category] || 0) + Number(transaction.amount || 0);
      });

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions]);

  const totalSpending = categorySpending.reduce(
    (total, item) => total + item.amount,
    0
  );

  const handleViewBudgets = () => {
    if (onViewBudgets) {
      onViewBudgets();
    } else {
      navigate("/budgets");
    }
  };

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Category Spending */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Spending Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your top spending categories
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
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

              const barColors = [
                "bg-blue-600",
                "bg-violet-500",
                "bg-emerald-500",
                "bg-amber-500",
              ];

              return (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-700">
                      {item.category}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColors[index]}`}
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
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          View Transactions
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Budget Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Budget Progress
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your spending on track
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
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
        ) : budgets.length === 0 ? (
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
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create a Budget
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.slice(0, 4).map((budget) => {
              const limit = Number(budget.limit ?? budget.amount ?? 0);
              const spent = Number(
                budget.spent ?? budget.spentAmount ?? 0
              );
              const remaining = Math.max(limit - spent, 0);
              const isOverBudget = spent > limit;

              return (
                <div key={budget._id || budget.id || budget.category}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {budget.category || "Other"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {isOverBudget ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <AlertCircle size={13} />
                            Over budget by {formatCurrency(spent - limit)}
                          </span>
                        ) : (
                          `${formatCurrency(remaining)} remaining`
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatCurrency(spent)}
                      <span className="font-normal text-slate-400">
                        {" "}/ {formatCurrency(limit)}
                      </span>
                    </p>
                  </div>

                  <Budgetprogress
                    limit={limit}
                    spent={spent}
                    category={budget.category}
                    showDetails={false}
                  />
                </div>
              );
            })}
          </div>
        )}

        {budgets.length > 0 && (
          <button
            type="button"
            onClick={handleViewBudgets}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Manage Budgets
            <ArrowRight size={16} />
          </button>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <TrendingDown size={15} className="shrink-0 text-emerald-600" />
          <span>Review your budgets regularly to stay on track.</span>
        </div>
      </div>
    </section>
  );
}
