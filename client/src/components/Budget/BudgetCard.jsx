
import {
  Wallet,
  Pencil,
  Trash2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import formatCurrency from "../../utils/formatcurrency";

export default function BudgetCard({
  budget,
  onEdit,
  onDelete,
  editBudget,
  deleteBudget,
}) {
  const handleEdit = onEdit || editBudget;
  const handleDelete = onDelete || deleteBudget;

  const limit = Math.max(0, Number(budget?.limit ?? budget?.amount) || 0);
  const spent = Math.max(0, Number(budget?.spent ?? budget?.spentAmount) || 0);

  const remaining = limit - spent;
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const progress = Math.min(percentage, 100);

  const isOverBudget = spent > limit;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  const status = isOverBudget
    ? "Over budget"
    : isNearLimit
      ? "Almost reached"
      : "On track";

  const progressColor = isOverBudget
    ? "bg-red-500"
    : isNearLimit
      ? "bg-amber-500"
      : "bg-blue-600";

  const statusColor = isOverBudget
    ? "bg-red-50 text-red-700"
    : isNearLimit
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  const category = budget?.category || budget?.name || "General";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Wallet size={23} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">
              {category}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Spending budget
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => handleEdit?.(budget)}
            aria-label={`Edit ${category} budget`}
            title="Edit budget"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              handleDelete?.(budget.id ?? budget._id)
            }
            aria-label={`Delete ${category} budget`}
            title="Delete budget"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Amount spent
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(spent)}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold ${statusColor}`}
        >
          {isOverBudget || isNearLimit ? (
            <AlertTriangle size={13} />
          ) : (
            <TrendingUp size={13} />
          )}

          {status}
        </span>
      </div>

      <div className="mt-5">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`${category} budget usage`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-slate-500">
            {percentage.toFixed(0)}% used
          </span>

          <span className="text-slate-500">
            Limit: {formatCurrency(limit)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">
          {remaining >= 0 ? "Remaining" : "Over limit"}
        </span>

        <span
          className={`text-sm font-bold ${
            remaining < 0 ? "text-red-600" : "text-slate-900"
          }`}
        >
          {formatCurrency(Math.abs(remaining))}
        </span>
      </div>
    </article>
  );
}
