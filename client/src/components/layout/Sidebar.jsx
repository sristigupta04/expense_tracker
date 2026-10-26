import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  ChartNoAxesCombined,
  CreditCard,
  Settings,
  X,
} from "lucide-react";

const links = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ReceiptText },
  { label: "Budgets", path: "/budgets", icon: Wallet },
  { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#172554] text-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <CreditCard size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight">
                ExpenseFlow
              </h2>
              <p className="text-xs text-blue-200">Personal Finance</p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-blue-300">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {links.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Settings size={19} />
            Settings
          </NavLink>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <p className="text-sm font-semibold">Stay in control</p>
            <p className="mt-1 text-xs leading-5 text-blue-200">
              Monitor your spending, manage budgets and build better money habits.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}