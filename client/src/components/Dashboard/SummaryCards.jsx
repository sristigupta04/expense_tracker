
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const cards = [
  {
    key: "balance",
    title: "Total Balance",
    icon: Wallet,
    iconClass: "bg-blue-50 text-blue-600",
    accentClass: "text-blue-700",
  },
  {
    key: "income",
    title: "Total Income",
    icon: TrendingUp,
    iconClass: "bg-emerald-50 text-emerald-600",
    accentClass: "text-emerald-700",
  },
  {
    key: "expense",
    title: "Total Expenses",
    icon: TrendingDown,
    iconClass: "bg-red-50 text-red-600",
    accentClass: "text-red-700",
  },
  {
    key: "savings",
    title: "Savings Rate",
    icon: PiggyBank,
    iconClass: "bg-violet-50 text-violet-600",
    accentClass: "text-violet-700",
  },
];

export default function SummaryCards({
  transactions = [],
  balance,
  income,
  expense,
  loading = false,
}) {
  const totals = transactions.reduce(
    (result, transaction) => {
      const amount = Number(transaction.amount) || 0;
      const type = String(transaction.type || "").toLowerCase();

      if (type === "income") result.income += amount;
      if (type === "expense") result.expense += amount;

      return result;
    },
    { income: 0, expense: 0 }
  );

  const totalIncome = Number.isFinite(Number(income))
    ? Number(income)
    : totals.income;

  const totalExpense = Number.isFinite(Number(expense))
    ? Number(expense)
    : totals.expense;

  const totalBalance =
    balance !== undefined && balance !== null
      ? Number(balance) || 0
      : totalIncome - totalExpense;

  const savingsRate =
    totalIncome > 0
      ? ((totalIncome - totalExpense) / totalIncome) * 100
      : 0;

  const values = {
    balance: totalBalance,
    income: totalIncome,
    expense: totalExpense,
    savings: savingsRate,
  };

  const descriptions = {
    balance: "Income minus expenses",
    income: "Money received",
    expense: "Money spent",
    savings:
      totalIncome > 0
        ? `${savingsRate.toFixed(1)}% of income retained`
        : "Add income to calculate",
  };

  return (
    <section
      aria-label="Financial summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const value = values[card.key];

        const displayValue =
          card.key === "savings"
            ? `${value.toFixed(1)}%`
            : formatCurrency(value);

        const isNegativeSavings =
          card.key === "savings" && value < 0;

        return (
          <article
            key={card.key}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                {loading ? (
                  <div className="mt-3 h-8 w-36 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <p
                    className={`mt-3 break-words text-2xl font-bold tracking-tight sm:text-[27px] ${
                      isNegativeSavings
                        ? "text-red-600"
                        : "text-slate-900"
                    }`}
                  >
                    {displayValue}
                  </p>
                )}
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                <Icon size={22} strokeWidth={1.9} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3">
              {card.key === "income" ? (
                <ArrowUpRight size={15} className="text-emerald-600" />
              ) : card.key === "expense" ? (
                <ArrowDownRight size={15} className="text-red-500" />
              ) : null}

              <p className="text-xs leading-5 text-slate-500">
                {descriptions[card.key]}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
