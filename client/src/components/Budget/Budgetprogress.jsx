
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import formatCurrency from "../../utils/formatcurrency";

export default function Budgetprogress({
  limit = 0,
  spent = 0,
  category = "Budget",
  showDetails = true,
  size = "default",
}) {
  const budgetLimit = Math.max(0, Number(limit) || 0);
  const amountSpent = Math.max(0, Number(spent) || 0);

  const percentage =
    budgetLimit > 0 ? (amountSpent / budgetLimit) * 100 : 0;

  const progress = Math.min(percentage, 100);
  const remaining = budgetLimit - amountSpent;

  const isOverBudget = amountSpent > budgetLimit;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  const status = isOverBudget
    ? "Budget exceeded"
    : isNearLimit
      ? "Approaching limit"
      : "Within budget";

  const progressColor = isOverBudget
    ? "bg-red-500"
    : isNearLimit
      ? "bg-amber-500"
      : "bg-blue-600";

  const statusColor = isOverBudget
    ? "text-red-700 bg-red-50"
    : isNearLimit
      ? "text-amber-700 bg-amber-50"
      : "text-emerald-700 bg-emerald-50";

  const StatusIcon = isOverBudget
    ? AlertTriangle
    : isNearLimit
      ? TrendingUp
      : CheckCircle2;

  const barHeight = size === "compact" ? "h-2" : "h-2.5";

  return (
    <section className="w-full">
      {showDetails && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {category}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatCurrency(amountSpent)} of{" "}
              {formatCurrency(budgetLimit)} used
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}
          >
            <StatusIcon size={13} />
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        className={`w-full overflow-hidden rounded-full bg-slate-100 ${barHeight}`}
        role="progressbar"
        aria-label={`${category} budget usage`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-valuetext={`${Math.round(percentage)} percent used`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {showDetails && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500">
            {isOverBudget
              ? `${formatCurrency(Math.abs(remaining))} over limit`
              : `${formatCurrency(remaining)} remaining`}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              isOverBudget
                ? "text-red-600"
                : isNearLimit
                  ? "text-amber-600"
                  : "text-emerald-600"
            }`}
          >
            <StatusIcon size={14} />
            {status}
          </span>
        </div>
      )}
    </section>
  );
}
