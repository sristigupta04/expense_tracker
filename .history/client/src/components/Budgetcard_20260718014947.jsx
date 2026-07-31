import ProgressBar from "./ProgressBar";

export default function BudgetCard({ budget }) {
  const { category, limit, spent } = budget;

  const remaining = limit - spent;
  const percentage = (spent / limit) * 100;

  return (
    <div>
      <h3>{category}</h3>

      <p>Limit : ₹{limit}</p>

      <p>Spent : ₹{spent}</p>

      <p>Remaining : ₹{remaining}</p>

     <ProgressBar percentage={percentage} />
    </div>
  );
}