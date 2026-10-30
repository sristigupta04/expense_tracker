
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays } from "lucide-react";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

// Date-only strings ko local timezone shift se bachata hai.
function getDateKey(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnly) {
      return value;
    }
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDay(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function DailyChart({
  transactions = [],
  data,
  loading = false,
}) {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(transactions)
      ? transactions
      : [];

  const grouped = source.reduce((result, item) => {
    const dateKey = getDateKey(
      item?.date || item?.createdAt || item?.created_at
    );

    if (!dateKey) return result;

    if (!result[dateKey]) {
      result[dateKey] = {
        date: dateKey,
        income: 0,
        expense: 0,
      };
    }

    const amount = Number(item?.amount);
    const type = String(item?.type || "").toLowerCase();

    if (!Number.isFinite(amount) || amount <= 0) return result;

    if (type === "income") {
      result[dateKey].income += amount;
    } else if (type === "expense") {
      result[dateKey].expense += amount;
    }

    return result;
  }, {});

  const chartData = Object.values(grouped)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((item) => ({
      ...item,
      day: formatDay(item.date),
    }));

  const hasData = chartData.some(
    (item) => item.income > 0 || item.expense > 0
  );

  const totalIncome = chartData.reduce(
    (sum, item) => sum + item.income,
    0
  );

  const totalExpense = chartData.reduce(
    (sum, item) => sum + item.expense,
    0
  );

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Daily Cash Flow
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Income versus expenses for your latest active days
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          <CalendarDays size={20} />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50/80 p-3">
              <p className="text-xs font-medium text-emerald-700">
                Income
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-800">
                {currency(totalIncome)}
              </p>
            </div>

            <div className="rounded-xl bg-red-50/80 p-3">
              <p className="text-xs font-medium text-red-700">
                Expenses
              </p>
              <p className="mt-1 text-lg font-bold text-red-800">
                {currency(totalExpense)}
              </p>
            </div>
          </div>

          {!hasData ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <CalendarDays size={30} className="text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No daily activity yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add income or expenses to see your cash flow.
              </p>
            </div>
          ) : (
            <div className="mt-5 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
                  barGap={5}
                >
                  <CartesianGrid
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />

                  <YAxis
                    tickFormatter={currency}
                    tick={{ fill: "#64748B", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={58}
                  />

                  <Tooltip
                    formatter={(value, name) => [
                      currency(value),
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "#F1F5F9" }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: 12,
                      paddingTop: 14,
                    }}
                  />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#16A34A"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={25}
                  />

                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#2563EB"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={25}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}
