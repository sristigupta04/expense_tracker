
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import formatCurrency from "../utils/formatCurrency";

export default function SummaryCard({
  income = 0,
  expense = 0,
  balance = 0,
}) {
  const cards = [
    {
      title: "Total Income",
      amount: income,
      description: "Money received",
      icon: TrendingUp,
      trendIcon: ArrowUpRight,
      color: "emerald",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      accent: "bg-emerald-500",
    },
    {
      title: "Total Expenses",
      amount: expense,
      description: "Money spent",
      icon: TrendingDown,
      trendIcon: ArrowDownRight,
      color: "rose",
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
      accent: "bg-rose-500",
    },
    {
      title: "Current Balance",
      amount: balance,
      description: "Available balance",
      icon: Wallet,
      trendIcon: ArrowUpRight,
      color: "blue",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      accent: "bg-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;

        return (
          <article
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg sm:p-6"
          >
            {/* Decorative accent */}
            <div
              className={`absolute inset-x-0 top-0 h-1 ${card.accent}`}
            />

            {/* Title and icon */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {formatCurrency(card.amount)}
                </h2>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={24} strokeWidth={2} />
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${card.iconBg} ${card.iconColor}`}
              >
                <TrendIcon size={16} />
              </span>

              <p className="text-sm text-slate-500">
                {card.description}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}