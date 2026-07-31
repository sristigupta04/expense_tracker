export default function ProgressBar({ percentage }) {
  let color = "bg-green-500";

  if (percentage >= 90) {
    color = "bg-red-500";
  } else if (percentage >= 60) {
    color = "bg-yellow-500";
  }

  return (
    <div className="mt-4">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-600">
          Progress
        </span>

        <span className="text-sm font-semibold text-slate-700">
          {percentage.toFixed(0)}%
        </span>

      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">

        <div
          className={`${color} h-full rounded-full transition-all duration-500 ease-in-out`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

    </div>
  );
}