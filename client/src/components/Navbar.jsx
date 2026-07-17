import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="logo">
        <h1>Expense Tracker</h1>
        <p>Track your expenses</p>
      </div>

      <div className="link">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/budget">Budgets</Link>
        <Link to="/reports">Reports</Link>
      </div>

      <div className="user">
        <span>Hello, {user?.name || "User"} 👋</span>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}