import React from "react";

export default function BudgetCard({ category, budget, amount }) {
  const remaining = budget - amount;

  return (
    <div className="border rounded-lg p-4 shadow-md w-80">
      <h2 className="text-xl font-bold">{category}</h2>

      <p>Budget: ₹{budget}</p>
      <p>Spent: ₹{amount}</p>
      <p>Remaining: ₹{remaining}</p>
    </div>
  );
}