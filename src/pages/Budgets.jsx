import React, { useState } from "react";

const Budgets = () => {
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);

  const remaining = Number(budget) - Number(spent);

  return (
    <div>
      <h1>Budget</h1>

      <div className="cards">

        <div className="card">
          <h3>Total Budget</h3>
          <input
            type="number"
            placeholder="Enter Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <div className="card">
          <h3>Spent Amount</h3>
          <input
            type="number"
            placeholder="Enter Spent Amount"
            value={spent}
            onChange={(e) => setSpent(e.target.value)}
          />
        </div>

        <div className="card">
          <h3>Remaining Budget</h3>
          <p>₹ {remaining}</p>
        </div>

      </div>
    </div>
  );
};

export default Budgets;