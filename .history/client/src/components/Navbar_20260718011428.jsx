import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">
        <h1>Expense Tracker</h1>
        <p>Track your expenses</p>
      </div>

      <div className="link">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/budgets">Budgets</Link>
        <Link to="/reports">Reports</Link>
      </div>

      <div className="user">
        <span>Hello, Sristi 👋</span>
        <button>Logout</button>
      </div>
    </div>
  );
}