
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  SlidersHorizontal,
  ReceiptText,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Wallet,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";

import { useExpense } from "../context/expenseContext";
import formatCurrency from "../utils/formatCurrency";

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Salary",
  "Freelance",
  "Other",
];

const initialForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

function getAmount(transaction) {
  return Number(transaction?.amount ?? transaction?.value ?? 0) || 0;
}

function getTitle(transaction) {
  return (
    transaction?.title ||
    transaction?.description ||
    transaction?.category ||
    "Transaction"
  );
}

function getType(transaction) {
  const type = String(transaction?.type || transaction?.transactionType || "").toLowerCase();
  return type === "income" ? "income" : "expense";
}

function getDate(transaction) {
  const value = transaction?.date || transaction?.createdAt;
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function Transactions() {
  const {
    transactions = [],
    loading,
    error,
    addExpense,
    editExpense,
    removeExpense,
    fetchTransactions,
  } = useExpense();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const normalizedTransactions = useMemo(
    () =>
      (Array.isArray(transactions) ? transactions : []).map((item) => ({
        ...item,
        _id: item._id || item.id,
        _title: getTitle(item),
        _amount: getAmount(item),
        _type: getType(item),
        _category: item.category || "Other",
        _date: getDate(item),
      })),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    let result = normalizedTransactions.filter((item) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        item._title.toLowerCase().includes(query) ||
        String(item._category).toLowerCase().includes(query) ||
        String(item.description || "").toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" || item._type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" || item._category === categoryFilter;

      let matchesPeriod = true;
      if (periodFilter !== "all" && item._date) {
        const transactionDate = new Date(`${item._date}T00:00:00`);
        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (periodFilter === "month") {
          matchesPeriod =
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear();
        } else if (periodFilter === "30days") {
          const start = new Date(startOfToday);
          start.setDate(start.getDate() - 29);
          matchesPeriod =
            transactionDate >= start && transactionDate <= now;
        } else if (periodFilter === "year") {
          matchesPeriod =
            transactionDate.getFullYear() === now.getFullYear();
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesPeriod
      );
    });

    result = [...result].sort((a, b) => {
      if (sortOrder === "oldest") {
        return (a._date || "").localeCompare(b._date || "");
      }
      if (sortOrder === "highest") {
        return b._amount - a._amount;
      }
      if (sortOrder === "lowest") {
        return a._amount - b._amount;
      }
      return (b._date || "").localeCompare(a._date || "");
    });

    return result;
  }, [
    normalizedTransactions,
    search,
    typeFilter,
    categoryFilter,
    periodFilter,
    sortOrder,
  ]);

  const totals = useMemo(() => {
    const income = normalizedTransactions
      .filter((item) => item._type === "income")
      .reduce((sum, item) => sum + item._amount, 0);

    const expense = normalizedTransactions
      .filter((item) => item._type === "expense")
      .reduce((sum, item) => sum + item._amount, 0);

    return { income, expense, balance: income - expense };
  }, [normalizedTransactions]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setForm({
      title: transaction._title,
      amount: String(transaction._amount),
      type: transaction._type,
      category: transaction._category,
      date: transaction._date || initialForm.date,
      description: transaction.description || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const amount = Number(form.amount);
    if (!form.title.trim()) {
      setFormError("Please enter a transaction title.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      amount,
      type: form.type,
      category: form.category,
      date: form.date,
      description: form.description.trim(),
    };

    setSaving(true);
    try {
      if (editing) {
        await editExpense(editing._id, payload);
      } else {
        await addExpense(payload);
      }

      setShowForm(false);
      setEditing(null);
      setForm(initialForm);
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save transaction. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transaction) => {
    if (
      !window.confirm(
        `Delete "${transaction._title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await removeExpense(transaction._id);
    } catch (err) {
      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete transaction."
      );
    }
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setPeriodFilter("all");
    setSortOrder("newest");
  };

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ReceiptText size={15} />
              Money management
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Transactions
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              View, search, and manage your income and expenses in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <Plus size={18} />
            Add transaction
          </button>
        </header>

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Total income"
            amount={formatCurrency(totals.income)}
            icon={TrendingUp}
            color="emerald"
            description="All recorded income"
          />
          <SummaryCard
            title="Total expenses"
            amount={formatCurrency(totals.expense)}
            icon={TrendingDown}
            color="rose"
            description="All recorded expenses"
          />
          <SummaryCard
            title="Net balance"
            amount={formatCurrency(totals.balance)}
            icon={Wallet}
            color="blue"
            description="Income minus expenses"
          />
        </section>

        {/* Search and filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, category, or description..."
                aria-label="Search transactions"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition sm:flex-none ${
                  showFilters
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal size={17} />
                Filters
              </button>
              <button
                type="button"
                onClick={resetFilters}
                title="Reset filters"
                aria-label="Reset filters"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label="Transaction type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  ["all", "All types"],
                  ["income", "Income"],
                  ["expense", "Expense"],
                ]}
              />

              <FilterSelect
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  ["all", "All categories"],
                  ...[...new Set([
                    ...categories,
                    ...normalizedTransactions.map((item) => item._category),
                  ])].map((category) => [category, category]),
                ]}
              />

              <FilterSelect
                label="Period"
                value={periodFilter}
                onChange={setPeriodFilter}
                options={[
                  ["all", "All time"],
                  ["month", "This month"],
                  ["30days", "Last 30 days"],
                  ["year", "This year"],
                ]}
              />

              <FilterSelect
                label="Sort by"
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  ["newest", "Newest first"],
                  ["oldest", "Oldest first"],
                  ["highest", "Highest amount"],
                  ["lowest", "Lowest amount"],
                ]}
              />
            </div>
          )}
        </section>

        {/* Transaction table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">
                All transactions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredTransactions.length} transaction
                {filteredTransactions.length === 1 ? "" : "s"} found
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {String(error)}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-blue-700" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading transactions...
                </p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <ReceiptText size={27} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">
                No transactions found
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {transactions.length
                  ? "Try changing your search or filters."
                  : "Start by adding your first income or expense."}
              </p>
              <button
                type="button"
                onClick={transactions.length ? resetFilters : openCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0D21A1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#03045E]"
              >
                {transactions.length ? (
                  <>
                    <RotateCcw size={16} />
                    Reset filters
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add transaction
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredTransactions.map((transaction) => (
                  <TransactionMobileCard
                    key={transaction._id}
                    transaction={transaction}
                    onEdit={() => openEdit(transaction)}
                    onDelete={() => handleDelete(transaction)}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Transaction</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                transaction._type === "income"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {transaction._type === "income" ? (
                                <ArrowDownLeft size={19} />
                              ) : (
                                <ArrowUpRight size={19} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-56 truncate text-sm font-semibold text-slate-900">
                                {transaction._title}
                              </p>
                              {transaction.description &&
                                transaction.description !== transaction._title && (
                                  <p className="mt-1 max-w-56 truncate text-xs text-slate-400">
                                    {transaction.description}
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                            {transaction._category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {formatDate(transaction._date)}
                        </td>
                        <td className="px-6 py-4">
                          <TypeBadge type={transaction._type} />
                        </td>
                        <td
                          className={`whitespace-nowrap px-6 py-4 text-right text-sm font-bold ${
                            transaction._type === "income"
                              ? "text-emerald-700"
                              : "text-slate-900"
                          }`}
                        >
                          {transaction._type === "income" ? "+" : "−"}
                          {formatCurrency(transaction._amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              label="Edit transaction"
                              onClick={() => openEdit(transaction)}
                            >
                              <Pencil size={16} />
                            </ActionButton>
                            <ActionButton
                              label="Delete transaction"
                              danger
                              onClick={() => handleDelete(transaction)}
                            >
                              <Trash2 size={16} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Add/edit modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                setShowForm(false);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="transaction-form-title"
              className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h2
                    id="transaction-form-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    {editing ? "Edit transaction" : "Add transaction"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the details below.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close form"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="transaction-title"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Title
                  </label>
                  <input
                    id="transaction-title"
                    required
                    maxLength={100}
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                    placeholder="e.g. Grocery shopping"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="transaction-amount"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Amount (₹)
                  </label>
                  <input
                    id="transaction-amount"
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Transaction type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["expense", "income"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${
                          form.type === type
                            ? type === "income"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-rose-300 bg-rose-50 text-rose-700"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {type === "income" ? (
                          <TrendingUp size={16} className="mr-2 inline" />
                        ) : (
                          <TrendingDown size={16} className="mr-2 inline" />
                        )}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="transaction-category"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Category
                  </label>
                  <select
                    id="transaction-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="transaction-date"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Date
                  </label>
                  <input
                    id="transaction-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="transaction-description"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id="transaction-description"
                    rows={3}
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Add a note..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                  >
                    {formError}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#03045E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Plus size={17} />
                        {editing ? "Save changes" : "Add transaction"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ title, amount, icon: Icon, color, description }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-950">
            {amount}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            styles[color] || styles.blue
          }`}
        >
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TypeBadge({ type }) {
  const isIncome = type === "income";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
        isIncome
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isIncome ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {isIncome ? "Income" : "Expense"}
    </span>
  );
}

function ActionButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {children}
    </button>
  );
}

function TransactionMobileCard({ transaction, onEdit, onDelete }) {
  const isIncome = transaction._type === "income";

  return (
    <article className="p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
          }`}
        >
          {isIncome ? (
            <ArrowDownLeft size={19} />
          ) : (
            <ArrowUpRight size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-900">
                {transaction._title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {transaction._category} · {formatDate(transaction._date)}
              </p>
            </div>
            <p
              className={`shrink-0 text-sm font-bold ${
                isIncome ? "text-emerald-700" : "text-slate-900"
              }`}
            >
              {isIncome ? "+" : "−"}
              {formatCurrency(transaction._amount)}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <TypeBadge type={transaction._type} />
            <div className="flex items-center gap-1">
              <ActionButton label="Edit transaction" onClick={onEdit}>
                <Pencil size={16} />
              </ActionButton>
              <ActionButton
                label="Delete transaction"
                onClick={onDelete}
                danger
              >
                <Trash2 size={16} />
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
