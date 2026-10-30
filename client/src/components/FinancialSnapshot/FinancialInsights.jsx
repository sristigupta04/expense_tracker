
import { useMemo } from "react";
import {
  Lightbulb,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  Target,
  TrendingUp,
  Wallet,
  Sparkles,
} from "lucide-react";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const toneStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-700 ring-blue-100",
    border: "border-blue-100 hover:border-blue-200",
    label: "Insight",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    border: "border-emerald-100 hover:border-emerald-200",
    label: "Good progress",
  },
  red: {
    icon: "bg-rose-50 text-rose-700 ring-rose-100",
    border: "border-rose-100 hover:border-rose-200",
    label: "Attention",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    border: "border-amber-100 hover:border-amber-200",
    label: "Recommendation",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700 ring-violet-100",
    border: "border-violet-100 hover:border-violet-200",
    label: "Spending pattern",
  },
};

export default function FinancialInsights({
  income = 0,
  expense = 0,
  balance = 0,
  savingsRate = 0,
  transactions = [],
}) {
  const safeIncome = Math.max(0, Number(income) || 0);
  const safeExpense = Math.max(0, Number(expense) || 0);
  const safeBalance = Number(balance) || 0;
  const safeSavingsRate = Number(savingsRate) || 0;

  const insights = useMemo(() => {
    const results = [];

    if (safeIncome === 0 && safeExpense === 0) {
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

    // Overall financial health
    if (safeIncome > 0 && safeExpense > safeIncome) {
      results.push({
        title: "Spending is above income",
        description: `Your expenses exceed recorded income by ${currency(
          safeExpense - safeIncome
        )}. Review non-essential spending and recurring costs.`,
        icon: AlertTriangle,
        tone: "red",
      });
    } else if (safeIncome > 0 && safeSavingsRate >= 20) {
      results.push({
        title: "Great savings progress!",
        description: `You have saved approximately ${currency(
          safeBalance
        )} after recorded expenses. Keep maintaining this habit.`,
        icon: ShieldCheck,
        tone: "green",
      });
    } else if (safeIncome > 0 && safeBalance > 0) {
      results.push({
        title: "Build your savings habit",
        description:
          "Your income exceeds your expenses. Consider setting aside a fixed amount every month toward your savings goals.",
        icon: Target,
        tone: "blue",
      });
    } else if (safeIncome > 0 && safeBalance <= 0) {
      results.push({
        title: "Review your monthly budget",
        description:
          "Your recorded expenses are using all or more of your income. Check recurring costs and flexible spending.",
        icon: TrendingDown,
        tone: "amber",
      });
    }

    // Category analysis
    const categoryTotals = new Map();

    transactions.forEach((transaction) => {
      if (
        String(transaction.type || "").toLowerCase() !== "expense"
      ) {
        return;
      }

      const category =
        typeof transaction.category === "object"
          ? transaction.category?.name || "Uncategorized"
          : transaction.category || "Uncategorized";

      const amount = Math.max(0, Number(transaction.amount) || 0);

      if (amount <= 0) return;

      categoryTotals.set(
        category,
        (categoryTotals.get(category) || 0) + amount
      );
    });

    const topCategory = [...categoryTotals.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];

    const totalCategorizedExpense = [...categoryTotals.values()].reduce(
      (total, amount) => total + amount,
      0
    );

    if (topCategory && totalCategorizedExpense > 0) {
      const share =
        (topCategory[1] / totalCategorizedExpense) * 100;

      results.push({
        title: `${topCategory[0]} is your largest category`,
        description: `${currency(
          topCategory[1]
        )} of your recorded expenses are categorized as ${
          topCategory[0]
        }, accounting for ${share.toFixed(1)}% of categorized spending.`,
        icon: Lightbulb,
        tone: "violet",
      });
    }

    // Income missing
    if (safeIncome === 0 && safeExpense > 0) {
      results.push({
        title: "Income data is missing",
        description:
          "Expenses are recorded, but no income is recorded. Add your income to calculate your savings rate reliably.",
        icon: AlertTriangle,
        tone: "amber",
      });
    }

    // Savings opportunity
    if (safeIncome > 0 && safeSavingsRate > 0 && safeSavingsRate < 10) {
      results.push({
        title: "Improve your savings rate",
        description:
          "Your current savings rate is below 10%. Try setting a small, achievable monthly savings target.",
        icon: TrendingUp,
        tone: "amber",
      });
    }

    // No transactions
    if (results.length === 0) {
      results.push({
        title: "Keep tracking your finances",
        description:
          "Your recorded income and expenses are currently balanced. Continue tracking to identify useful spending patterns.",
        icon: Wallet,
        tone: "blue",
      });
    }

    return results;
  }, [
    safeIncome,
    safeExpense,
    safeBalance,
    safeSavingsRate,
    transactions,
  ]);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Lightbulb size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              Your Financial Insights
            </h3>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Observations based on your recorded transactions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          <Sparkles size={14} />
          Smart insights
        </div>
      </div>

      {/* Insights */}
      <div className="grid min-w-0 grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const style = toneStyles[insight.tone] || toneStyles.blue;

          return (
            <article
              key={`${insight.title}-${index}`}
              className={`flex min-w-0 items-start gap-3 rounded-xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${style.border}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${style.icon}`}
              >
                <Icon size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {style.label}
                </span>

                <h4 className="mt-1 break-words text-sm font-bold text-slate-800">
                  {insight.title}
                </h4>

                <p className="mt-1.5 break-words text-sm leading-6 text-slate-500">
                  {insight.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
        <ShieldCheck size={15} className="shrink-0 text-slate-400" />
        <p className="text-xs leading-5 text-slate-500">
          Insights are generated from your recorded financial data. They are
          suggestions, not financial advice.
        </p>
      </div>
    </section>
  );
}
