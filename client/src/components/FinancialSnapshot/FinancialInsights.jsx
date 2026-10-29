
import { useMemo } from "react";
import {
  Lightbulb,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  Target,
} from "lucide-react";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function FinancialInsights({
  income = 0,
  expense = 0,
  balance = 0,
  savingsRate = 0,
  transactions = [],
}) {
  const insights = useMemo(() => {
    const results = [];

    if (income === 0 && expense === 0) {
      return [
        {
          title: "Start with your first transaction",
          description:
            "Record your income and expenses to unlock personalized spending insights.",
          icon: Lightbulb,
          tone: "blue",
        },
      ];
    }

    if (income > 0 && expense > income) {
      results.push({
        title: "Spending is above income",
        description: `Your expenses exceed recorded income by ${currency(
          expense - income
        )} this month. Review non-essential spending first.`,
        icon: AlertTriangle,
        tone: "red",
      });
    } else if (income > 0 && savingsRate >= 20) {
      results.push({
        title: "Good savings progress",
        description: `You have ${currency(
          balance
        )} left after recorded expenses this month.`,
        icon: ShieldCheck,
        tone: "green",
      });
    } else if (income > 0 && balance > 0) {
      results.push({
        title: "Build your savings habit",
        description:
          "Your income currently exceeds expenses. Consider setting a realistic savings target.",
        icon: Target,
        tone: "blue",
      });
    } else if (income > 0 && balance <= 0) {
      results.push({
        title: "Review your monthly budget",
        description:
          "Your recorded expenses are using all of your income. Check recurring costs and flexible spending.",
        icon: TrendingDown,
        tone: "amber",
      });
    }

    const categoryTotals = new Map();

    transactions.forEach((transaction) => {
      if (String(transaction.type || "").toLowerCase() !== "expense") return;

      const category = transaction.category || "Uncategorized";
      const amount = Number(transaction.amount) || 0;

      categoryTotals.set(
        category,
        (categoryTotals.get(category) || 0) + amount
      );
    });

    const topCategory = [...categoryTotals.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topCategory && expense > 0) {
      const share = (topCategory[1] / expense) * 100;

      results.push({
        title: `${topCategory[0]} is your largest category`,
        description: `${currency(
          topCategory[1]
        )} of this month's expenses are categorized as ${topCategory[0]} (${share.toFixed(
          1
        )}% of recorded spending).`,
        icon: Lightbulb,
        tone: "violet",
      });
    }

    if (income === 0 && expense > 0) {
      results.push({
        title: "Income data is missing",
        description:
          "Expenses are recorded, but no income is recorded for this month. Your savings rate cannot be calculated reliably.",
        icon: AlertTriangle,
        tone: "amber",
      });
    }

    return results;
  }, [income, expense, balance, savingsRate, transactions]);

  const toneStyles = {
    blue: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-rose-50 text-rose-700 ring-rose-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
          <Lightbulb size={21} />
        </div>

        <div>
          <h3 className="text-lg font-bold">Your Financial Insights</h3>
          <p className="mt-1 text-sm text-slate-500">
            Observations based on your recorded transactions
          </p>
        </div>
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {insights.map((insight) => {
          const Icon = insight.icon;

          return (
            <article
              key={insight.title}
              className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 p-4"
            >
              <div
                className={`shrink-0 rounded-xl p-2 ring-1 ${
                  toneStyles[insight.tone]
                }`}
              >
                <Icon size={19} />
              </div>

              <div className="min-w-0">
                <h4 className="break-words text-sm font-semibold text-slate-800">
                  {insight.title}
                </h4>
                <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                  {insight.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
