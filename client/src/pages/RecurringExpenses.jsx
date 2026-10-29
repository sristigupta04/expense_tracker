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

const initialForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Bills",
  frequency: "monthly",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  note: "",
};

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const dateLabel = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function RecurringExpenses() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setRecords(await getRecurringTransactions());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Recurring expenses load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeRecords = records.filter((record) => record.isActive);
  const expenses = activeRecords.filter((record) => record.type === "expense");
  const income = activeRecords.filter((record) => record.type === "income");

  const monthlyExpense = useMemo(
    () =>
      expenses.reduce((sum, record) => {
        const multiplier =
          record.frequency === "weekly"
            ? 52 / 12
            : record.frequency === "yearly"
              ? 1 / 12
              : 1;

        return sum + Number(record.amount) * multiplier;
      }, 0),
    [expenses]
  );

  const monthlyIncome = useMemo(
    () =>
      income.reduce((sum, record) => {
        const multiplier =
          record.frequency === "weekly"
            ? 52 / 12
            : record.frequency === "yearly"
              ? 1 / 12
              : 1;

        return sum + Number(record.amount) * multiplier;
      }, 0),
    [income]
  );

  const filteredRecords = records.filter((record) => {
    if (filter === "active") return record.isActive;
    if (filter === "paused") return !record.isActive;
    if (filter === "expense") return record.type === "expense";
    if (filter === "income") return record.type === "income";
    if (filter === "due") {
      const due = new Date(record.nextDueDate);
      due.setHours(0, 0, 0, 0);
      return record.isActive && due <= today;
    }
    return true;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createRecurringTransaction({
        ...form,
        amount: Number(form.amount),
        endDate: form.endDate || null,
      });

      setForm(initialForm);
      setShowForm(false);
      setSuccess("Recurring schedule successfully created.");
      await loadRecords();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Recurring schedule create nahi hua."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePaid = async (record) => {
    if (
      !window.confirm(
        `"${record.title}" ki current occurrence ko paid mark karein?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await markRecurringPaid(record._id);
      setSuccess(result.message || "Payment recorded.");
      await loadRecords();
    } catch (err) {
      setError(
        err.response?.data?.message || "Payment record nahi ho paya."
      );
    }
  };

  const handlePause = async (record) => {
    try {
      await updateRecurringTransaction(record._id, {
        isActive: !record.isActive,
      });
      await loadRecords();
    } catch (err) {
      setError(
        err.response?.data?.message || "Schedule update nahi hua."
      );
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`"${record.title}" ka recurring schedule delete karein?`)) {
      return;
    }

    try {
      await deleteRecurringTransaction(record._id);
      setSuccess("Recurring schedule deleted.");
      await loadRecords();
    } catch (err) {
      setError(
        err.response?.data?.message || "Schedule delete nahi hua."
      );
    }
  };

  const getStatus = (record) => {
    if (!record.isActive) return { text: "Paused", style: "bg-slate-100 text-slate-600" };

    const due = new Date(record.nextDueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) return { text: "Overdue", style: "bg-red-100 text-red-700" };
    if (due.getTime() === today.getTime()) {
      return { text: "Due today", style: "bg-amber-100 text-amber-700" };
    }

    return { text: "Upcoming", style: "bg-blue-100 text-blue-700" };
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              <CalendarClock size={22} />
              <span className="text-sm font-semibold">BILLS & SCHEDULES</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Recurring Expenses
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Rent, subscriptions, salary aur regular payments ek jagah manage karo.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadRecords}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium hover:bg-slate-100"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus size={17} /> Add schedule
            </button>
          </div>
        </header>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Active schedules",
              value: activeRecords.length,
              detail: "Income and expenses",
            },
            {
              label: "Estimated monthly bills",
              value: currency(monthlyExpense),
              detail: "Normalized monthly estimate",
            },
            {
              label: "Estimated monthly income",
              value: currency(monthlyIncome),
              detail: "Recurring income",
            },
            {
              label: "Due or overdue",
              value: activeRecords.filter((record) => {
                const due = new Date(record.nextDueDate);
                due.setHours(0, 0, 0, 0);
                return due <= today;
              }).length,
              detail: "Needs attention",
            },
          ].map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 break-words text-2xl font-bold">{item.value}</p>
              <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
            </article>
          ))}
        </section>

        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Create recurring schedule</h2>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium">
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. House Rent"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
                />
              </label>

              <label className="text-sm font-medium">
                Type
                <select
                  name="type"
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value;
                    setForm((prev) => ({
                      ...prev,
                      type,
                      category: type === "income" ? "Salary" : "Bills",
                    }));
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Frequency
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
                />
              </label>

              <div className="flex items-end gap-3">
                <button
                  disabled={saving}
                  type="submit"
                  className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save schedule"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

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
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
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
            <div className="p-12 text-center text-slate-500">Loading schedules...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <CircleDollarSign className="mx-auto mb-3 text-slate-300" size={40} />
              <h3 className="font-semibold">No recurring schedules found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your first recurring bill or income to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const status = getStatus(record);

                return (
                  <article
                    key={record._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`rounded-xl p-3 ${record.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                        <CalendarClock size={21} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words font-semibold">{record.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {record.category} · {record.frequency}
                        </p>
                        <p className="mt-2 text-sm">
                          Next due: <span className="font-semibold">{dateLabel(record.nextDueDate)}</span>
                        </p>
                        {record.note && (
                          <p className="mt-1 break-words text-sm text-slate-400">{record.note}</p>
                        )}
                        <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${status.style}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                      <p className={`text-lg font-bold ${record.type === "income" ? "text-emerald-700" : "text-slate-900"}`}>
                        {record.type === "income" ? "+" : "−"}{currency(record.amount)}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {record.isActive && (
                          <button
                            onClick={() => handlePaid(record)}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={15} /> Mark paid
                          </button>
                        )}

                        <button
                          onClick={() => handlePause(record)}
                          title={record.isActive ? "Pause schedule" : "Resume schedule"}
                          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"
                        >
                          {record.isActive ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
                        </button>

                        <button
                          onClick={() => handleDelete(record)}
                          title="Delete schedule"
                          className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
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