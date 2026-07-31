import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <Receipt size={18} />,
    },
    {
      name: "Budgets",
      path: "/budget",
      icon: <Wallet size={18} />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            Expense Tracker
          </h1>

          <p className="text-sm text-slate-500">
            Manage your finances smarter
          </p>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-4">

          <div className="hidden sm:block text-right">
            <p className="text-xs text-slate-500">
              Welcome Back
            </p>

            <p className="font-semibold text-slate-800">
              {user?.username || "User"} 👋
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>
    </header>
  );
}