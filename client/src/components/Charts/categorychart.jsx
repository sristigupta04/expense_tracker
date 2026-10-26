
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#0891B2",
  "#F97316",
  "#64748B",
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function CategoryChart({
  transactions = [],
  data,
  loading = false,
}) {
  const source = Array.isArray(data) ? data : transactions;

  const categoryMap = source.reduce((result, item) => {
    if (item.type !== "expense") return result;

    const category = item.category || "Other";
    const amount = Number(item.amount) || 0;

    result[category] = (result[category] || 0) + amount;
    return result;
  }, {});

  const chartData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Spending by Category
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Understand where your money goes
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          <PieChartIcon size={20} />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400">
            <PieChartIcon size={26} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No expense data yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add an expense to see your category breakdown.
          </p>
        </div>
      ) : (
        <>
          <div className="relative mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  cornerRadius={4}
                  stroke="none"
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => currency(Number(value))}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500">Total spent</span>
              <span className="mt-1 text-lg font-bold text-slate-900">
                {currency(total)}
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-3">
            {chartData.slice(0, 5).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="truncate text-sm text-slate-600">
                    {item.name}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    {currency(item.value)}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    {Math.round((item.value / total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
