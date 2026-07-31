import formatCurrency from "../utils/formatCurrency";

export default function SummaryCard({
  income,
  expense,
  balance,
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">

      <Card
        title="Income"
        amount={income}
        type="income"
      />

      <Card
        title="Expense"
        amount={expense}
        type="expense"
      />

      <Card
        title="Balance"
        amount={balance}
        type="balance"
      />

    </div>
  );
}

function Card({ title, amount, type }) {

  const styles = {
    income: {
      bg: "bg-green-500",
      text: "Income",
    },
    expense: {
      bg: "bg-red-500",
      text: "Expense",
    },
    balance: {
      bg: "bg-blue-600",
      text: "Balance",
    },
  };

  return (
    <div
      className={`${styles[type].bg} rounded-2xl p-6 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <h2 className="text-lg font-medium">
        {title}
      </h2>

      <p className="mt-3 text-3xl font-bold">
        {formatCurrency(amount)}
      </p>

      <p className="mt-2 text-sm opacity-90">
        {styles[type].text}
      </p>
    </div>
  );
}