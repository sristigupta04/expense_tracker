
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CircleDollarSign,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  X,
  AlertCircle,
  Wallet,
  TrendingUp,
  Clock,
} from "lucide-react";

import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  markRecurringPaid,
  deleteRecurringTransaction,
} from "../services/recurringTransactionApi";

const categories = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Bills",
  "Rent",
  "Subscription",
  "Salary",
  "Investment",
  "Other",
];

const getInitialForm = () => ({
  title: "",
  amount: "",
  type: "expense",
  category: "Bills",
  frequency: "monthly",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  note: "",
});

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const dateLabel = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDateOnly = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return null;

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
};

export default function RecurringExpenses() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(getInitialForm);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  const loadRecords = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getRecurringTransactions();

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setRecords(data);
    } catch (err) {
      console.error("Error loading recurring schedules:", err);

      setError(
        err?.response?.data?.message ||
          "Recurring expenses could not be loaded. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const activeRecords = useMemo(
    () => records.filter((record) => record.isActive),
    [records]
  );

  const expenses = useMemo(
    () => activeRecords.filter((record) => record.type === "expense"),
    [activeRecords]
  );

  const income = useMemo(
    () => activeRecords.filter((record) => record.type === "income"),
    [activeRecords]
  );

  const getMonthlyAmount = (record) => {
    const amount = Number(record.amount) || 0;

    switch (record.frequency) {
      case "weekly":
        return amount * (52 / 12);
      case "yearly":
        return amount / 12;
      case "monthly":
      default:
        return amount;
    }
  };

  const monthlyExpense = useMemo(
    () =>
      expenses.reduce(
        (sum, record) => sum + getMonthlyAmount(record),
        0
      ),
    [expenses]
  );

  const monthlyIncome = useMemo(
    () =>
      income.reduce(
        (sum, record) => sum + getMonthlyAmount(record),
        0
      ),
    [income]
  );

  const dueCount = useMemo(
    () =>
      activeRecords.filter((record) => {
        const dueDate = getDateOnly(record.nextDueDate);
        return dueDate && dueDate <= today;
      }).length,
    [activeRecords, today]
  );

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        if (filter === "active") return record.isActive;
        if (filter === "paused") return !record.isActive;
        if (filter === "expense") return record.type === "expense";
        if (filter === "income") return record.type === "income";

        if (filter === "due") {
          const dueDate = getDateOnly(record.nextDueDate);
          return record.isActive && dueDate && dueDate <= today;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.nextDueDate).getTime();
        const dateB = new Date(b.nextDueDate).getTime();

        return (
          (Number.isNaN(dateA) ? Infinity : dateA) -
          (Number.isNaN(dateB) ? Infinity : dateB)
        );
      });
  }, [records, filter, today]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const amount = Number(form.amount);

    if (!form.title.trim()) {
      setError("Please enter a schedule title.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (
      form.endDate &&
      form.endDate < form.startDate
    ) {
      setError("End date cannot be before the first due date.");
      return;
    }

    try {
      setSaving(true);

      await createRecurringTransaction({
        ...form,
        title: form.title.trim(),
        amount,
        note: form.note.trim(),
        endDate: form.endDate || null,
      });

      setForm(getInitialForm());
      setShowForm(false);
      setSuccess("Recurring schedule successfully created.");

      await loadRecords();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Recurring schedule could not be created."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePaid = async (record) => {
    const confirmed = window.confirm(
      `"${record.title}" ki current occurrence ko paid mark karein?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setProcessingId(record._id);

    try {
      const result = await markRecurringPaid(record._id);

      setSuccess(result?.message || "Payment recorded successfully.");

      await loadRecords();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Payment could not be recorded."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handlePause = async (record) => {
    setError("");
    setSuccess("");
    setProcessingId(record._id);

    try {
      await updateRecurringTransaction(record._id, {
        isActive: !record.isActive,
      });

      setSuccess(
        record.isActive
          ? "Schedule paused successfully."
          : "Schedule resumed successfully."
      );

      await loadRecords();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Schedule could not be updated."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `"${record.title}" ka recurring schedule delete karein?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setProcessingId(record._id);

    try {
      await deleteRecurringTransaction(record._id);

      setSuccess("Recurring schedule deleted successfully.");

      await loadRecords();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Schedule could not be deleted."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getStatus = (record) => {
    if (!record.isActive) {
      return {
        text: "Paused",
        style: "bg-slate-100 text-slate-600",
      };
    }

    const dueDate = getDateOnly(record.nextDueDate);

    if (!dueDate) {
      return {
        text: "Date unavailable",
        style: "bg-slate-100 text-slate-600",
      };
    }

    if (dueDate < today) {
      return {
        text: "Overdue",
        style: "bg-red-100 text-red-700",
      };
    }

    if (dueDate.getTime() === today.getTime()) {
      return {
        text: "Due today",
        style: "bg-amber-100 text-amber-700",
      };
    }

    return {
      text: "Upcoming",
      style: "bg-blue-100 text-blue-700",
    };
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-800">
              <CalendarClock size={22} />
              <span className="text-sm font-semibold tracking-wide">
                BILLS & SCHEDULES
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Recurring Expenses
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Rent, subscriptions, salary aur regular payments ek jagah manage karo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadRecords(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              <Plus size={17} />
              Add schedule
            </button>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Active schedules"
            value={activeRecords.length}
            detail="Income and expenses"
            icon={CalendarClock}
            color="blue"
          />

          <SummaryCard
            label="Estimated monthly bills"
            value={currency(monthlyExpense)}
            detail="Normalized monthly estimate"
            icon={Wallet}
            color="rose"
          />

          <SummaryCard
            label="Estimated monthly income"
            value={currency(monthlyIncome)}
            detail="Recurring income"
            icon={TrendingUp}
            color="green"
          />

          <SummaryCard
            label="Due or overdue"
            value={dueCount}
            detail="Needs attention"
            icon={Clock}
            color="amber"
          />
        </section>

        {/* Create Form */}
        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  Create recurring schedule
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a regular income or expense.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <label className="text-sm font-medium">
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. House Rent"
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </label>

              <label className="text-sm font-medium">
                Amount (₹)
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </label>

              <label className="text-sm font-medium">
                Type
                <select
                  name="type"
                  value={form.type}
                  disabled={saving}
                  onChange={(event) => {
                    const type = event.target.value;

                    setForm((previous) => ({
                      ...previous,
                      type,
                      category: type === "income" ? "Salary" : "Bills",
                    }));
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <label className="text-sm font-medium">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Frequency
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>

              <label className="text-sm font-medium">
                First due date
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
                />
              </label>

              <label className="text-sm font-medium">
                End date (optional)
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={handleChange}
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
                />
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Note (optional)
                <input
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  maxLength={500}
                  placeholder="Additional details"
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
                />
              </label>

              <div className="flex items-end gap-3">
                <button
                  disabled={saving}
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save schedule
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Schedule List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Your schedules</h2>
              <p className="mt-1 text-sm text-slate-500">
                Next due date ke hisaab se sorted
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600"
            >
              <option value="all">All schedules</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="due">Due or overdue</option>
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <RefreshCw
                size={22}
                className="mx-auto mb-3 animate-spin text-blue-700"
              />
              Loading schedules...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <CircleDollarSign
                className="mx-auto mb-3 text-slate-300"
                size={40}
              />

              <h3 className="font-semibold text-slate-800">
                No recurring schedules found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first recurring bill or income to get started.
              </p>

              {filter !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const status = getStatus(record);
                const isProcessing = processingId === record._id;

                return (
                  <article
                    key={record._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`rounded-xl p-3 ${
                          record.type === "income"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <CalendarClock size={21} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-slate-900">
                          {record.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {record.category} · {record.frequency}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Next due:{" "}
                          <span className="font-semibold text-slate-800">
                            {dateLabel(record.nextDueDate)}
                          </span>
                        </p>

                        {record.note && (
                          <p className="mt-1 break-words text-sm text-slate-400">
                            {record.note}
                          </p>
                        )}

                        <span
                          className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${status.style}`}
                        >
                          {status.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                      <p
                        className={`text-lg font-bold ${
                          record.type === "income"
                            ? "text-emerald-700"
                            : "text-slate-900"
                        }`}
                      >
                        {record.type === "income" ? "+" : "−"}
                        {currency(record.amount)}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {record.isActive && (
                          <button
                            type="button"
                            onClick={() => handlePaid(record)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />
                            Mark paid
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handlePause(record)}
                          disabled={isProcessing}
                          title={
                            record.isActive
                              ? "Pause schedule"
                              : "Resume schedule"
                          }
                          aria-label={
                            record.isActive
                              ? "Pause schedule"
                              : "Resume schedule"
                          }
                          className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          {record.isActive ? (
                            <PauseCircle size={17} />
                          ) : (
                            <PlayCircle size={17} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(record)}
                          disabled={isProcessing}
                          title="Delete schedule"
                          aria-label="Delete schedule"
                          className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, detail, icon: Icon, color }) {
  const themes = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      accent: "bg-blue-700",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700",
      accent: "bg-rose-500",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      accent: "bg-amber-500",
    },
  };

  const theme = themes[color] || themes.blue;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </article>
  );
}
