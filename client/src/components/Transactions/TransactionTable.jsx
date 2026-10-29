
import {
  Pencil,
  Trash2,
  CalendarDays,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";

import formatDate from "../../utils/formatDate";
import formatCurrency from "../../utils/formatcurrency";

export default function TransactionTable({
  transactions = [],
  deleteTransaction,
  editTransaction,
  onDelete,
  loading = false,
}) {
  const handleDelete = onDelete || deleteTransaction;

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-3 text-sm text-slate-500">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ReceiptText size={30} />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No transactions found
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Add an income or expense, or adjust your search and filters to see
          your transactions here.
        </p>
      </div>
    );
  }

  const renderActions = (item) => (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => editTransaction?.(item)}
        aria-label={`Edit ${item.title || "transaction"}`}
        title="Edit transaction"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
      >
        <Pencil size={17} />
      </button>

      <button
        type="button"
        onClick={() => handleDelete?.(item._id || item.id)}
        aria-label={`Delete ${item.title || "transaction"}`}
        title="Delete transaction"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );

  const renderAmount = (item) => {
    const isIncome = String(item.type).toLowerCase() === "income";

    return (
      <span
        className={`whitespace-nowrap text-sm font-bold tabular-nums ${
          isIncome ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(Number(item.amount) || 0)}
      </span>
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Mobile layout */}
      <div className="divide-y divide-slate-100 md:hidden">
        {transactions.map((item, index) => {
          const isIncome =
            String(item.type).toLowerCase() === "income";

          const id = item._id || item.id || `${item.title}-${index}`;

          return (
            <article key={id} className="p-4 transition hover:bg-slate-50/70">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft size={21} />
                    ) : (
                      <ArrowUpRight size={21} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-slate-900">
                      {item.title || item.name || "Untitled transaction"}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Tag size={13} />
                      <span className="truncate">
                        {item.category || "Uncategorized"}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={13} />
                      <span>{formatDate(item.date || item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {renderAmount(item)}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isIncome
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {isIncome ? "Income" : "Expense"}
                </span>

                {renderActions(item)}
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop layout */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {["Transaction", "Category", "Type", "Amount", "Date"].map(
                (heading) => (
                  <th
                    key={heading}
                    className={`whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                      heading === "Amount" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                )
              )}

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((item, index) => {
              const isIncome =
                String(item.type).toLowerCase() === "income";

              const id = item._id || item.id || `${item.title}-${index}`;

              return (
                <tr
                  key={id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-56 truncate text-sm font-semibold text-slate-900">
                          {item.title || item.name || "Untitled transaction"}
                        </p>

                        {item.description && (
                          <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                      <Tag size={13} />
                      {item.category || "Uncategorized"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {isIncome ? "Income" : "Expense"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    {renderAmount(item)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} />
                      {formatDate(item.date || item.createdAt)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {renderActions(item)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {transactions.length}
          </span>{" "}
          transaction{transactions.length === 1 ? "" : "s"}
        </p>
      </footer>
    </section>
  );
}
