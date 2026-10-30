
import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  CalendarDays,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
  Search,
  ArrowUpDown,
  X,
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
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = onDelete || deleteTransaction;

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...transactions]
      .filter((item) => {
        if (!query) return true;

        return [
          item.title,
          item.name,
          item.category,
          item.description,
          item.type,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();

        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, search, sortOrder]);

  const isIncome = (item) =>
    String(item.type || "").toLowerCase() === "income";

  const getId = (item) => item._id || item.id;

  const confirmDelete = () => {
    if (!deleteTarget || !handleDelete) return;

    handleDelete(getId(deleteTarget));
    setDeleteTarget(null);
  };

  const renderAmount = (item) => (
    <span
      className={`whitespace-nowrap text-sm font-bold tabular-nums ${
        isIncome(item) ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {isIncome(item) ? "+" : "−"}
      {formatCurrency(Number(item.amount) || 0)}
    </span>
  );

  const renderType = (item) => (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
        isIncome(item)
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {isIncome(item) ? "Income" : "Expense"}
    </span>
  );

  const renderActions = (item) => (
    <div className="flex items-center justify-end gap-1.5">
      {editTransaction && (
        <button
          type="button"
          onClick={() => editTransaction(item)}
          aria-label={`Edit ${item.title || "transaction"}`}
          title="Edit transaction"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <Pencil size={17} />
        </button>
      )}

      {handleDelete && (
        <button
          type="button"
          onClick={() => setDeleteTarget(item)}
          aria-label={`Delete ${item.title || "transaction"}`}
          title="Delete transaction"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Transaction History
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              View and manage your income and expenses.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-56"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortOrder((current) =>
                  current === "newest" ? "oldest" : "newest"
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <ArrowUpDown size={16} />
              {sortOrder === "newest" ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>

        {!filteredTransactions.length ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ReceiptText size={30} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {search ? "No matching transactions" : "No transactions found"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try another search term to find your transaction."
                : "Add an income or expense to see your transaction history here."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile layout */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredTransactions.map((item, index) => {
                const id = getId(item) || `${item.title}-${index}`;

                return (
                  <article
                    key={id}
                    className="p-4 transition hover:bg-slate-50/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isIncome(item)
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {isIncome(item) ? (
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
                            <span>
                              {formatDate(item.date || item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {renderAmount(item)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      {renderType(item)}
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
                    {[
                      "Transaction",
                      "Category",
                      "Type",
                      "Amount",
                      "Date",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                          heading === "Amount" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((item, index) => {
                    const id = getId(item) || `${item.title}-${index}`;

                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isIncome(item)
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {isIncome(item) ? (
                                <ArrowDownLeft size={20} />
                              ) : (
                                <ArrowUpRight size={20} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-56 truncate text-sm font-semibold text-slate-900">
                                {item.title ||
                                  item.name ||
                                  "Untitled transaction"}
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

                        <td className="px-5 py-4">{renderType(item)}</td>

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
          </>
        )}

        <footer className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredTransactions.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {transactions.length}
            </span>{" "}
            transactions
          </p>
        </footer>
      </section>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3
              id="delete-transaction-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Delete transaction?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">
                {deleteTarget.title ||
                  deleteTarget.name ||
                  "this transaction"}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
