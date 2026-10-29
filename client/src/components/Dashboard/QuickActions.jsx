
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    id: "income",
    title: "Add Income",
    description: "Record money received",
    icon: ArrowDownLeft,
    iconClass: "bg-emerald-50 text-emerald-600",
    hoverClass: "hover:border-emerald-200 hover:bg-emerald-50/30",
  },
  {
    id: "expense",
    title: "Add Expense",
    description: "Track your spending",
    icon: ArrowUpRight,
    iconClass: "bg-blue-50 text-blue-600",
    hoverClass: "hover:border-blue-200 hover:bg-blue-50/30",
  },
  {
    id: "transactions",
    title: "All Transactions",
    description: "View your activity",
    icon: ReceiptText,
    iconClass: "bg-violet-50 text-violet-600",
    hoverClass: "hover:border-violet-200 hover:bg-violet-50/30",
  },
];

export default function QuickActions({
  onAddTransaction,
  onAddIncome,
  onAddExpense,
}) {
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (action === "income") {
      if (onAddIncome) {
        onAddIncome();
      } else if (onAddTransaction) {
        onAddTransaction({ type: "income" });
      }
      return;
    }

    if (action === "expense") {
      if (onAddExpense) {
        onAddExpense();
      } else if (onAddTransaction) {
        onAddTransaction({ type: "expense" });
      }
      return;
    }

    navigate("/transactions");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900">
          Quick Actions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your money in a few clicks
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action.id)}
              className={`group flex min-h-[76px] items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition duration-200 ${action.hoverClass}`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconClass}`}
              >
                <Icon size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {action.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {action.description}
                </p>
              </div>

              {action.id === "transactions" ? (
                <ArrowRight
                  size={17}
                  className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600"
                />
              ) : (
                <Plus
                  size={17}
                  className="shrink-0 text-slate-400 transition group-hover:text-blue-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
