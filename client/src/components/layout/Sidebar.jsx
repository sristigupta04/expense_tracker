
import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";

const mainLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ReceiptText },
  { label: "Budgets", path: "/budgets", icon: Wallet },
  { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
  { label: "Saving Goals", path: "/saving-goals", icon: Target },
  { label: "Recurring Expenses", path: "/recurring", icon: Repeat },
  { label: "Shared Expenses", path: "/shared-expenses", icon: Users },
];

const bankingLinks = [
  { label: "Bank Accounts", path: "/bank-accounts", icon: Landmark },
  { label: "Banking Dashboard", path: "/banking", icon: LayoutDashboard },
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
  const { label, path, icon: Icon } = item;

  return (
    <NavLink
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
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarSection({ title, items, onClose, defaultOpen = true }) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mb-3 flex w-full items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-widest text-blue-300"
      >
        {title}
        <ChevronDown
          size={15}
          className={`transition-transform ${expanded ? "" : "-rotate-90"}`}
        />
      </button>

      {expanded && (
        <nav className="space-y-1.5">
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
        {/* Logo */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 pb-5 pt-2">
          <SidebarSection
            title="Main Menu"
            items={mainLinks}
            onClose={onClose}
          />

          <SidebarSection
            title="Banking"
            items={bankingLinks}
            onClose={onClose}
          />

          <SidebarSection
            title="Account"
            items={accountLinks}
            onClose={onClose}
          />

          <div className="mt-6 border-t border-white/10 pt-4">
            <SidebarLink
              item={{
                label: "Settings",
                path: "/settings",
                icon: Settings,
              }}
              onClose={onClose}
            />
          </div>

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
