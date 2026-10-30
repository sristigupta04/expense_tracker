
import { NavLink, useLocation } from "react-router-dom";
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
  const location = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {links.map(({ label, path, icon: Icon }) => {
          const isActive =
            location.pathname === path ||
            location.pathname.startsWith(`${path}/`);

          return (
            <NavLink
              key={path}
              to={path}
              aria-current={isActive ? "page" : undefined}
              className={({ isActive: active }) =>
                `group relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              {({ isActive: active }) => (
                <>
                  <span
                    className={`flex h-7 w-9 items-center justify-center rounded-lg transition-all ${
                      active ? "text-blue-700" : "text-slate-500"
                    }`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={active ? 2.5 : 1.8}
                      aria-hidden="true"
                    />
                  </span>

                  <span>{label}</span>

                  {active && (
                    <span className="absolute -top-2 h-1 w-7 rounded-full bg-blue-700" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
