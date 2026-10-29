
import { useMemo, useState } from "react";
import { BarChart3, ChartPie, TrendingUp } from "lucide-react";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function SnapshotCharts({ transactions = [] }) {
  const [view, setView] = useState("monthly");

  const monthlyData = useMemo(() => {
    const months = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - offset);

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-US", { month: "short" }),
        income: 0,
        expense: 0,
      });
    }

    transactions.forEach((transaction) => {
      const date = new Date(
        transaction.date || transaction.createdAt || ""
      );

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = months.find((item) => item.key === key);
      if (!month) return;

      const amount = Number(transaction.amount) || 0;
      const type = String(transaction.type || "").toLowerCase();

      if (type === "income") month.income += amount;
      if (type === "expense") month.expense += amount;
    });

    return months;
  }, [transactions]);

  const categories = useMemo(() => {
    const totals = new Map();

    transactions.forEach((transaction) => {
      if (String(transaction.type || "").toLowerCase() !== "expense") return;

      const category = transaction.category || "Uncategorized";
      const amount = Number(transaction.amount) || 0;

      totals.set(category, (totals.get(category) || 0) + amount);
    });

    return [...totals.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions]);

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyData.flatMap((item) => [item.income, item.expense])
  );

  const totalCategorySpend = categories.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-5">
      {/* Monthly chart */}
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold">Money Flow</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Income versus expenses over six months
            </p>
          </div>

          <div className="flex w-fit rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setView("monthly")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                view === "monthly"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setView("net")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                view === "net"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Net flow
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Income
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            Expenses
          </span>
        </div>

        <div className="mt-6 grid min-w-0 grid-cols-6 gap-2 sm:gap-4">
          {monthlyData.map((month) => {
            const net = month.income - month.expense;
            const netHeight = Math.max(
              4,
              (Math.abs(net) / maxMonthlyValue) * 100
            );

            return (
              <div key={month.key} className="min-w-0">
                <div className="flex h-44 items-end justify-center gap-1 border-b border-slate-100 pb-2 sm:gap-2">
                  {view === "monthly" ? (
                    <>
                      <div
                        title={`Income: ${currency(month.income)}`}
                        className="w-3 max-w-[40%] rounded-t-md bg-emerald-500 transition-all sm:w-5"
                        style={{
                          height: `${Math.max(
                            3,
                            (month.income / maxMonthlyValue) * 100
                          )}%`,
                        }}
                      />
                      <div
                        title={`Expenses: ${currency(month.expense)}`}
                        className="w-3 max-w-[40%] rounded-t-md bg-rose-400 transition-all sm:w-5"
                        style={{
                          height: `${Math.max(
                            3,
                            (month.expense / maxMonthlyValue) * 100
                          )}%`,
                        }}
                      />
                    </>
                  ) : (
                    <div
                      title={`Net flow: ${currency(net)}`}
                      className={`w-6 rounded-t-md sm:w-9 ${
                        net >= 0 ? "bg-indigo-500" : "bg-rose-400"
                      }`}
                      style={{ height: `${netHeight}%` }}
                    />
                  )}
                </div>
                <p className="mt-3 truncate text-center text-xs text-slate-500">
                  {month.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <TrendingUp size={15} />
          <span>Amounts are based on recorded transactions.</span>
        </div>
      </article>

      {/* Category chart */}
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
        <div className="flex items-center gap-2">
          <ChartPie className="text-violet-600" size={20} />
          <h3 className="text-lg font-bold">Spending Breakdown</h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Expense categories across recorded transactions
        </p>

        {categories.length === 0 ? (
          <div className="mt-8 rounded-xl bg-slate-50 px-4 py-10 text-center">
            <ChartPie className="mx-auto text-slate-300" size={34} />
            <p className="mt-3 font-medium text-slate-700">
              No expense data yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add categorized expenses to see your breakdown.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {categories.map((category, index) => {
              const percentage =
                totalCategorySpend > 0
                  ? (category.amount / totalCategorySpend) * 100
                  : 0;

              const barColors = [
                "bg-indigo-500",
                "bg-violet-500",
                "bg-sky-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-rose-400",
              ];

              return (
                <div key={category.name} className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-700">
                      {category.name}
                    </span>
                    <span className="shrink-0 text-right font-semibold text-slate-900">
                      {currency(category.amount)}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        barColors[index % barColors.length]
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}
