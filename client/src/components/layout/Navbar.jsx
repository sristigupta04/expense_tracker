import { useLocation } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Expense Tracker";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Your finances, clearly organized.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <label className="hidden h-10 w-52 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 md:flex">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            type="search"
            aria-label="Search transactions"
            placeholder="Search transactions..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            onChange={(event) => {
              window.dispatchEvent(
                new CustomEvent("expense-tracker-search", {
                  detail: event.target.value,
                })
              );
            }}
          />
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
        >
          <Bell size={19} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          U
        </div>
      </div>
    </header>
  );
}