import ProgressBar from "./BudgetProgress";
import formatCurrency from "../utils/formatCurrency";

export default function BudgetCard({
  budget,
  onDelete,
  onEdit,
}) ;
{

  const { title, limit, spent } = budget;

  const remaining = limit - spent;

  const percentage = Math.min((spent / limit) * 100, 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-xl font-bold text-slate-800">
          {title}
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            percentage >= 100
              ? "bg-red-100 text-red-600"
              : percentage >= 80
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {percentage.toFixed(0)}%
        </span>

      </div>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span className="text-slate-500">Budget</span>

          <span className="font-semibold">
            {formatCurrency(limit)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Spent</span>

          <span className="font-semibold text-red-600">
            {formatCurrency(spent)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Remaining</span>

          <span
            className={`font-semibold ${
              remaining >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        </div>

      </div>

      <div className="mt-5">
        <ProgressBar percentage={percentage} />
      </div>
<div className="mt-6 flex gap-3">

  <button
    onClick={() => onEdit(budget.id)}
    className="flex-1 rounded-lg bg-blue-500 py-2 font-medium text-white transition hover:bg-blue-600"
  >
    Edit
  </button>

  <button
    onClick={() => onDelete(budget.id)}
    className="flex-1 rounded-lg bg-red-500 py-2 font-medium text-white transition hover:bg-red-600"
  >
    Delete
  </button>

</div>
    </div>
  );
}