
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

const actions = [
  {
    id: "income",
    title: "Add Income",
    description: "Record money received",
    icon: ArrowDownLeft,
    iconClass: "bg-emerald-50 text-emerald-600",
    hoverClass: "hover:border-emerald-200 hover:bg-emerald-50/50",
  },
  {
    id: "expense",
    title: "Add Expense",
    description: "Track your spending",
    icon: ArrowUpRight,
    iconClass: "bg-blue-50 text-blue-600",
    hoverClass: "hover:border-blue-200 hover:bg-blue-50/50",
  },
  {
    id: "transactions",
    title: "All Transactions",
    description: "View your activity",
    icon: ReceiptText,
    iconClass: "bg-violet-50 text-violet-600",
    hoverClass: "hover:border-violet-200 hover:bg-violet-50/50",
  },
];

export default function QuickActions({
  onAddTransaction,
  onAddIncome,
  onAddExpense,
  disabled = false,
}) {
  const navigate = useNavigate();
  const [activeAction, setActiveAction] = useState(null);

  const handleAction = async (action) => {
    if (disabled || activeAction) return;

    if (action === "transactions") {
      navigate("/transactions");
      return;
    }

    const callback =
      action === "income" ? onAddIncome : onAddExpense;

    const transactionType = action;

    try {
      setActiveAction(action);

      if (callback) {
        await callback();
      } else if (onAddTransaction) {
        await onAddTransaction({ type: transactionType });
      } else {
        console.warn(
          `QuickActions: No callback provided for ${transactionType}.`
        );
      }
    } catch (error) {
      console.error(`Unable to open ${transactionType} action:`, error);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Plus size={19} />
          </div>

          <h2 className="text-base font-bold text-slate-900">
            Quick Actions
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Manage your money in a few clicks
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;
          const isDisabled =
            disabled || Boolean(activeAction);

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action.id)}
              disabled={isDisabled}
              aria-label={action.title}
              aria-busy={isActive}
              className={`group flex min-h-[76px] min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${action.hoverClass}`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconClass}`}
              >
                {isActive ? (
                  <LoaderCircle size={21} className="animate-spin" />
                ) : (
                  <Icon size={21} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {action.title}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {action.description}
                </p>
              </div>

              {action.id === "transactions" ? (
                <ArrowRight
                  size={17}
                  className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600"
                />
              ) : isActive ? (
                <LoaderCircle
                  size={17}
                  className="shrink-0 animate-spin text-blue-600"
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
