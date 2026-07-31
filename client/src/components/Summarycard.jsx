import {
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

import formatCurrency from "../utils/formatCurrency";

export default function SummaryCard({
  income,
  expense,
  balance,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card
        title="Total Income"
        amount={income}
        type="income"
      />

      <Card
        title="Total Expense"
        amount={expense}
        type="expense"
      />

      <Card
        title="Current Balance"
        amount={balance}
        type="balance"
      />
    </div>
  );
}

function Card({ title, amount, type }) {
  const styles = {
    income: {
      bg: "bg-gradient-to-r from-emerald-500 to-green-600",
      icon: <TrendingUp size={34} />,
      text: "Money Received",
    },

    expense: {
      bg: "bg-gradient-to-r from-red-500 to-rose-600",
      icon: <TrendingDown size={34} />,
      text: "Money Spent",
    },

    balance: {
      bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      icon: <Wallet size={34} />,
      text: "Available Balance",
    },
  };

  return (
    <div
      className={`
        ${styles[type].bg}
        rounded-3xl
        p-7
        text-white
        shadow-xl
        hover:shadow-2xl
        hover:-translate-y-1
        transition-all
        duration-300
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {formatCurrency(amount)}
          </h2>

          <p className="mt-5 text-sm opacity-80">
            {styles[type].text}
          </p>
        </div>

        <div className="bg-white/20 rounded-full p-4">
          {styles[type].icon}
        </div>
      </div>
    </div>
  );
}