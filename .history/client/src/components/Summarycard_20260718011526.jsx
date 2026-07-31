export default function SummaryCard({
  income,
  expense,
  balance,
}) {
  return (
    <div className="summary">

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
  return (
    <div className="card">
      <h2>{title}</h2>

      <p>₹{amount}</p>

      <p>{type}</p>
    </div>
  );
}