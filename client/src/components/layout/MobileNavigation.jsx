import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  ChartNoAxesCombined,
} from "lucide-react";

const links = [
  { label: "Home", path: "/dashboard", icon: LayoutDashboard },
  { label: "Activity", path: "/transactions", icon: ReceiptText },
  { label: "Budgets", path: "/budgets", icon: Wallet },
  { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
];

export default function MobileNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 lg:hidden">
      {links.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition ${
              isActive
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={21} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}