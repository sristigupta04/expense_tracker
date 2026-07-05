import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Dashboard = () => {
  const [income, setincome] = useState(0);
  const [expense, setExpense] = useState(0);

  const [transaction] = useState([
    { id: 1, title: "Salary", amount: 50000 },
    { id: 2, title: "Food", amount: 500 },
    { id: 3, title: "Shopping", amount: 2000 },
  ]);

  const bal = Number(income) - Number(expense);

  return (
    <div>
      <NavLink to="/">
        <span>Welcome User</span>
      </NavLink>

      <div className="Cards">

        <div className="card">
          <p>Balance: ₹ {bal}</p>
        </div>

        <div className="budget">
          <p>Income: ₹ {income}</p>
          <input
            type="number"
            onChange={(e) => setincome(e.target.value)}
          />
        </div>

        <div className="income">
          <p>Expense: ₹ {expense}</p>
          <input
            type="number"
            onChange={(e) => setExpense(e.target.value)}
          />
        </div>

        <div className="transaction">
          <h3>Recent Transactions</h3>

          {transaction.map((item) => (
            <div key={item.id}>
              <p>{item.title}</p>
              <p>₹ {item.amount}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;