
import { useMemo, useState } from "react";
import {
  BarChart3,
  ChartPie,
  TrendingUp,
  Wallet,
} from "lucide-react";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getTransactionDate = (transaction) => {
  const value = transaction.date || transaction.createdAt;

  if (!value) return null;

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
};

const getAmount = (transaction) => {
  const amount = Number(transaction.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export default function SnapshotCharts({ transactions = [] }) {
  const [view, setView] = useState("monthly");

  const validTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const amount = Number(transaction.amount);
        const type = String(transaction.type || "").toLowerCase();

        return (
          Number.isFinite(amount) &&
          amount >= 0 &&
          ["income", "expense"].includes(type)
        );
      }),
    [transactions]
  );

  const monthlyData = useMemo(() => {
    const months = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - offset);

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        income: 0,
        expense: 0,
      });
    }

    validTransactions.forEach((transaction) => {
      const date = getTransactionDate(transaction);
      if (!date) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = months.find((item) => item.key === key);

      if (!month) return;

      const amount = getAmount(transaction);
      const type = String(transaction.type || "").toLowerCase();

      if (type === "income") month.income += amount;
      if (type === "expense") month.expense += amount;
    });

    return months;
  }, [validTransactions]);

  const categories = useMemo(() => {
    const totals = new Map();

    validTransactions.forEach((transaction) => {
      if (String(transaction.type || "").toLowerCase() !== "expense") {
        return;
      }

      const category = String(
        transaction.category || "Uncategorized"
      ).trim() || "Uncategorized";

      const amount = getAmount(transaction);

      totals.set(category, (totals.get(category) || 0) + amount);
    });

    return [...totals.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [validTransactions]);

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyData.flatMap((item) => [
      item.income,
      item.expense,
    ])
  );

  const totalCategorySpend = categories.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const barColors = [
    "bg-blue-700",
    "bg-violet-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-400",
  ];

  return (
    <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-5">
      {/* Monthly money flow */}
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-700" size={20} />
              <h3 className="text-lg font-bold text-slate-900">
                Money Flow
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Income versus expenses over six months
            </p>
          </div>

          <div className="flex w-fit rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setView("monthly")}
              aria-pressed={view === "monthly"}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                view === "monthly"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setView("net")}
              aria-pressed={view === "net"}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                view === "net"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Net flow
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
          {view === "monthly" ? (
            <>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Income
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                Expenses
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Positive net flow
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                Negative net flow
              </span>
            </>
          )}
        </div>

        {monthlyData.every(
          (month) => month.income === 0 && month.expense === 0
        ) ? (
          <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl bg-slate-50 px-4 text-center">
            <BarChart3 size={34} className="text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No monthly data available
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add income or expense transactions to see your money flow.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid min-w-0 grid-cols-6 gap-2 sm:gap-4">
            {monthlyData.map((month) => {
              const net = month.income - month.expense;

              const netHeight =
                net === 0
                  ? 0
                  : Math.max(
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
                          className={`w-3 max-w-[40%] rounded-t-md bg-emerald-500 transition-all sm:w-5 ${
                            month.income === 0 ? "opacity-20" : ""
                          }`}
                          style={{
                            height: `${
                              month.income > 0
                                ? Math.max(
                                    3,
                                    (month.income / maxMonthlyValue) * 100
                                  )
                                : 3
                            }%`,
                          }}
                        />

                        <div
                          title={`Expenses: ${currency(month.expense)}`}
                          className={`w-3 max-w-[40%] rounded-t-md bg-rose-400 transition-all sm:w-5 ${
                            month.expense === 0 ? "opacity-20" : ""
                          }`}
                          style={{
                            height: `${
                              month.expense > 0
                                ? Math.max(
                                    3,
                                    (month.expense / maxMonthlyValue) * 100
                                  )
                                : 3
                            }%`,
                          }}
                        />
                      </>
                    ) : (
                      <div
                        title={`Net flow: ${currency(net)}`}
                        className={`w-6 rounded-t-md transition-all sm:w-9 ${
                          net >= 0 ? "bg-blue-600" : "bg-rose-400"
                        }`}
                        style={{
                          height: `${netHeight || 3}%`,
                        }}
                      />
                    )}
                  </div>

                  <p className="mt-3 truncate text-center text-xs font-medium text-slate-500">
                    {month.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <TrendingUp size={15} />
          <span>Based on recorded transactions from the last six months.</span>
        </div>
      </article>

      {/* Spending categories */}
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
        <div className="flex items-center gap-2">
          <ChartPie className="text-violet-600" size={20} />

          <h3 className="text-lg font-bold text-slate-900">
            Spending Breakdown
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Expense categories across recorded transactions
        </p>

        {categories.length === 0 ? (
          <div className="mt-8 rounded-xl bg-slate-50 px-4 py-10 text-center">
            <Wallet className="mx-auto text-slate-300" size={34} />

            <p className="mt-3 font-semibold text-slate-700">
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

                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${category.name} spending`}
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
