
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  X,
} from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Groceries",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialValues = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: today(),
  description: "",
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

export default function TransactionForm({
  open = true,
  transaction = null,
  onSubmit,
  onClose,
  loading = false,
  categories,
}) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(transaction);
  const isIncome = form.type === "income";

  const availableCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories.map((item) =>
          typeof item === "string" ? item : item.name
        ).filter(Boolean)
      : isIncome
        ? INCOME_CATEGORIES
        : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setForm({
        title: transaction.title || transaction.name || "",
        amount:
          transaction.amount != null
            ? String(transaction.amount)
            : "",
        type:
          String(transaction.type || "expense").toLowerCase() === "income"
            ? "income"
            : "expense",
        category: transaction.category || "Other",
        date: transaction.date
          ? String(transaction.date).slice(0, 10)
          : today(),
        description: transaction.description || "",
      });
    } else {
      setForm(initialValues);
    }

    setErrors({});
    setSubmitError("");
  }, [transaction, open]);

  useEffect(() => {
    if (!availableCategories.includes(form.category)) {
      setForm((current) => ({
        ...current,
        category: availableCategories[0] || "Other",
      }));
    }
  }, [form.type, form.category, availableCategories]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Please enter a transaction name.";
    } else if (form.title.trim().length > 100) {
      nextErrors.title = "Name must be 100 characters or fewer.";
    }

    const amount = Number(form.amount);

    if (form.amount.trim() === "") {
      nextErrors.amount = "Please enter an amount.";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    } else if (Math.round(amount * 100) / 100 !== amount) {
      nextErrors.amount = "Maximum two decimal places are allowed.";
    }

    if (!form.date || Number.isNaN(new Date(`${form.date}T12:00:00`).getTime())) {
      nextErrors.date = "Please select a valid date.";
    }

    if (!form.category) {
      nextErrors.category = "Please select a category.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || !validate()) return;

    if (typeof onSubmit !== "function") {
      setSubmitError("Save action is not connected yet.");
      return;
    }

    const payload = {
      ...(transaction?.id != null ? { id: transaction.id } : {}),
      title: form.title.trim(),
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      description: form.description.trim(),
    };

    try {
      setSubmitError("");
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save the transaction. Please try again."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2
              id="transaction-form-title"
              className="text-xl font-bold text-slate-900"
            >
              {isEditing ? "Edit transaction" : "Add transaction"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record your money movement accurately.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close form"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Transaction type
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  updateField("type", "expense");
                  updateField("category", EXPENSE_CATEGORIES[0]);
                }}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  !isIncome
                    ? "border-red-200 bg-red-50 text-red-700 ring-2 ring-red-100"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <ArrowDownLeft size={18} />
                Expense
              </button>

              <button
                type="button"
                onClick={() => {
                  updateField("type", "income");
                  updateField("category", INCOME_CATEGORIES[0]);
                }}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  isIncome
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <ArrowUpRight size={18} />
                Income
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="transaction-title"
              className="text-sm font-semibold text-slate-700"
            >
              Transaction name
            </label>

            <input
              id="transaction-title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. Monthly groceries"
              maxLength={100}
              className={inputClass}
            />

            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="transaction-amount"
                className="text-sm font-semibold text-slate-700"
              >
                Amount (₹)
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-[23px] -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₹
                </span>

                <input
                  id="transaction-amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    updateField("amount", event.target.value)
                  }
                  placeholder="0.00"
                  className={`${inputClass} pl-8`}
                />
              </div>

              {errors.amount && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="transaction-category"
                className="text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <select
                id="transaction-category"
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className={inputClass}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="transaction-date"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <CalendarDays size={16} className="text-slate-400" />
              Transaction date
            </label>

            <input
              id="transaction-date"
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className={inputClass}
            />

            {errors.date && (
              <p className="mt-1.5 text-xs text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="transaction-description"
              className="text-sm font-semibold text-slate-700"
            >
              Notes <span className="font-normal text-slate-400">(optional)</span>
            </label>

            <textarea
              id="transaction-description"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Add any details..."
              rows={3}
              maxLength={500}
              className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-11 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Save transaction"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
