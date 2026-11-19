
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  ChartNoAxesCombined,
  CreditCard,
  Settings,
  X,
  Landmark,
  ArrowLeftRight,
  FileSpreadsheet,
  Scale,
  UserRound,
  ShieldCheck,
  UserRoundX,
  Trash2,
  Target,
  Repeat,
  Users,
  ChevronDown,
  HelpCircle,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/Authcontext";

const mainLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Transactions", path: "/transactions", icon: ReceiptText },
  { label: "Budgets", path: "/budgets", icon: Wallet },
  { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
  { label: "Saving Goals", path: "/saving-goals", icon: Target },
  { label: "Recurring Expenses", path: "/recurring", icon: Repeat },
  { label: "Shared Expenses", path: "/shared-expenses", icon: Users },
];

const bankingLinks = [
  { label: "Banking Dashboard", path: "/banking", icon: LayoutDashboard, end: true },
  { label: "Bank Accounts", path: "/bank-accounts", icon: Landmark },
  { label: "Bank Transactions", path: "/bank-transactions", icon: ReceiptText },
  { label: "Credit Cards", path: "/credit-cards", icon: CreditCard },
  { label: "Bank Statements", path: "/bank-statements", icon: FileSpreadsheet },
  { label: "Money Transfers", path: "/transfers", icon: ArrowLeftRight },
  { label: "Reconciliation", path: "/reconciliation", icon: Scale },
];

const accountLinks = [
  { label: "Profile", path: "/profile", icon: UserRound },
  { label: "Account Management", path: "/settings/account", icon: Settings },
  { label: "Privacy & Security", path: "/settings/privacy", icon: ShieldCheck },
  { label: "Deactivate Account", path: "/settings/account/deactivate", icon: UserRoundX },
  { label: "Delete Account", path: "/settings/account/delete", icon: Trash2 },
];

function SidebarLink({ item, onClose }) {
  const { label, path, icon: Icon, end = false } = item;

  return (
    <NavLink
      to={path}
      end={end}
      onClick={() => onClose?.()}
      className={({ isActive }) =>
        `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={19}
            strokeWidth={isActive ? 2.4 : 1.9}
            className="shrink-0"
          />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {isActive && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarSection({ title, items, onClose, defaultOpen = true }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const location = useLocation();

  const hasActiveLink = items.some(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
  );

  useEffect(() => {
    if (hasActiveLink) setExpanded(true);
  }, [hasActiveLink]);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mb-3 flex w-full items-center justify-between rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-300 transition hover:text-white"
      >
        <span>{title}</span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${
            expanded ? "" : "-rotate-90"
          }`}
        />
      </button>

      {expanded && (
        <nav aria-label={title} className="space-y-1.5">
          {items.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              onClose={onClose}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

export default function Sidebar({ open = false, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#172554] text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/30">
              <CreditCard size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">
                ExpenseFlow
              </h2>
              <p className="text-xs text-blue-200">Personal Finance</p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 pb-5 pt-2 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
          <SidebarSection title="Main Menu" items={mainLinks} onClose={onClose} />
          <SidebarSection title="Banking" items={bankingLinks} onClose={onClose} />
          <SidebarSection title="Account" items={accountLinks} onClose={onClose} />

          {/* Additional Links */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <SidebarLink
              item={{ label: "Settings", path: "/settings", icon: Settings, end: true }}
              onClose={onClose}
            />

            <div className="mt-1.5">
              <SidebarLink
                item={{ label: "Help & Support", path: "/settings/contact", icon: HelpCircle }}
                onClose={onClose}
              />
            </div>
          </div>

          {/* Finance Tip */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200">
                <Wallet size={17} />
              </div>
              <p className="text-sm font-semibold">Stay in control</p>
            </div>

            <p className="mt-3 text-xs leading-5 text-blue-200">
              Monitor your spending, manage budgets and build better money habits.
            </p>
          </div>
        </div>

        {/* User & Logout */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-blue-300">
                {user?.email || "Personal Account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          <p className="mt-3 text-center text-[10px] font-medium tracking-wide text-blue-300">
            EXPENSEFLOW · PERSONAL FINANCE
          </p>
        </div>
      </aside>
    </>
  );
}
