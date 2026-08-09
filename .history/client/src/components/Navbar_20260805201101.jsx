import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}

        <div>
          <h1 className="text-2xl font-bold text-blue-600">
            Expense Tracker
          </h1>

          <p className="text-sm text-slate-500">
            Track your expenses
          </p>
        </div>

        {/* Navigation */}

        <div className="flex items-center gap-6">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`
            }
          >
            Transactions
          </NavLink>

          <NavLink
            to="/budget"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`
            }
          >
            Budgets
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `font-medium transition ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`
            }
          >
            Reports
          </NavLink>

        </div>

        {/* User */}

        <div className="flex items-center gap-4">

          <div className="text-right">

            <p className="text-sm text-slate-500">
              Welcome
            </p>

            <p className="font-semibold text-slate-800">
              {user?.username || "User"} 👋
            </p>

          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600 active:scale-95"
          >
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
}