
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  UserRound,
  Settings,
  ChevronDown,
  Users,
  Wallet,
  X,
  ReceiptText,
  LayoutDashboard,
  CircleHelp,
} from "lucide-react";

const pageTitles = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your financial overview at a glance.",
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Manage your income and expenses.",
  },
  "/budgets": {
    title: "Budgets",
    subtitle: "Plan smarter and stay on budget.",
  },
  "/reports": {
    title: "Reports & Analytics",
    subtitle: "Understand your spending patterns.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage your account preferences.",
  },
  "/profile": {
    title: "My Profile",
    subtitle: "Your personal account information.",
  },
  "/saving-goals": {
    title: "Saving Goals",
    subtitle: "Make progress toward your goals.",
  },
  "/recurring": {
    title: "Recurring Expenses",
    subtitle: "Keep track of your regular payments.",
  },
  "/shared-expenses": {
    title: "Shared Expenses",
    subtitle: "Split bills and manage group balances.",
  },
  "/notifications": {
    title: "Notifications",
    subtitle: "Stay up to date with your activity.",
  },
  "/banking": {
    title: "Banking",
    subtitle: "Manage your linked bank accounts.",
  },
  "/bank-accounts": {
    title: "Bank Accounts",
    subtitle: "Manage your account details.",
  },
  "/credit-cards": {
    title: "Credit Cards",
    subtitle: "Track your credit cards and payments.",
  },
  "/money-transfers": {
    title: "Money Transfers",
    subtitle: "Manage your transfer records.",
  },
  "/bank-transactions": {
    title: "Bank Transactions",
    subtitle: "Review your imported bank activity.",
  },
  "/bank-statements": {
    title: "Bank Statements",
    subtitle: "Import and manage your statements.",
  },
  "/reconciliation": {
    title: "Reconciliation",
    subtitle: "Compare your bank and app transactions.",
  },
};

const getPageInfo = (pathname) => {
  if (pageTitles[pathname]) return pageTitles[pathname];

  const matchedRoute = Object.keys(pageTitles)
    .filter((path) => path !== "/dashboard")
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname.startsWith(`${path}/`));

  if (matchedRoute) {
    return pageTitles[matchedRoute];
  }

  return {
    title: "Expense Tracker",
    subtitle: "Your finances, clearly organized.",
  };
};

const searchEvent = (value) => {
  window.dispatchEvent(
    new CustomEvent("expense-tracker-search", {
      detail: value,
    })
  );
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const page = getPageInfo(location.pathname);

  useEffect(() => {
    setSearch("");
    searchEvent("");
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click and Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }

      if (!notificationsRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    searchEvent(value);
  };

  const clearSearch = () => {
    setSearch("");
    searchEvent("");
  };

  const navigateTo = (path) => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Menu and page heading */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {page.title}
            </h1>

            <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">
              {page.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Search, notifications and profile */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Desktop search */}
          <label className="hidden h-10 w-48 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 md:flex lg:w-64">
            <Search size={17} className="shrink-0 text-slate-400" />

            <input
              type="search"
              aria-label="Search transactions"
              placeholder="Search transactions..."
              value={search}
              onChange={handleSearch}
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </label>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setProfileOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Bell size={19} />
            </button>

            {notificationsOpen && (
              <div
                role="dialog"
                aria-label="Notifications menu"
                className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Stay updated with your activity
                    </p>
                  </div>

                  <Bell size={18} className="text-blue-700" />
                </div>

                <div className="px-4 py-5 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Bell size={22} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Check your notifications
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    View your latest alerts, reminders and account updates.
                  </p>
                </div>

                <div className="border-t border-slate-100 p-3">
                  <button
                    type="button"
                    onClick={() => navigateTo("/notifications")}
                    className="w-full rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Open notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
                <UserRound size={18} />
              </span>

              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold text-slate-800">
                  My Account
                </span>
                <span className="block text-[11px] text-slate-500">
                  Profile & settings
                </span>
              </span>

              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">
                    My Account
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Manage your personal space
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateTo("/profile")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <UserRound size={17} className="text-slate-500" />
                  My Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateTo("/settings")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings size={17} className="text-slate-500" />
                  Settings
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateTo("/shared-expenses")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Users size={17} className="text-slate-500" />
                  Shared Expenses
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateTo("/transactions")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Wallet size={17} className="text-slate-500" />
                  Transactions
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateTo("/dashboard")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <LayoutDashboard size={17} className="text-slate-500" />
                  Dashboard
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateTo("/help")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <CircleHelp size={17} className="text-slate-500" />
                  Help & Support
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="px-4 pb-3 md:hidden sm:px-6">
        <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
          <Search size={17} className="shrink-0 text-slate-400" />

          <input
            type="search"
            aria-label="Search transactions"
            placeholder="Search transactions..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          )}
        </label>
      </div>
    </header>
  );
}
