
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  X,
  ReceiptText,
  IndianRupee,
  FileText,
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

const createInitialValues = () => ({
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: today(),
  description: "",
});

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const getTransactionDate = (value) => {
  if (!value) return today();

  const dateString = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return today();
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeCategory = (category) => {
  if (typeof category === "string") return category;

  if (category && typeof category === "object") {
    return category.name || "Other";
  }

  return "Other";
};

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export default function TransactionForm({
  open = true,
  transaction = null,
  onSubmit,
  onClose,
  loading = false,
  categories,
}) {
  const [form, setForm] = useState(createInitialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(transaction);
  const isIncome = form.type === "income";
  const isBusy = loading || submitting;

  const availableCategories = useMemo(() => {
    const suppliedCategories = Array.isArray(categories)
      ? categories.map(normalizeCategory).filter(Boolean)
      : [];

    const defaults = isIncome
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

    const combined = suppliedCategories.length
      ? suppliedCategories
      : defaults;

    return [...new Set(combined)];
  }, [categories, isIncome]);

  useEffect(() => {
    if (!open) return;

    if (transaction) {
      const type =
        String(transaction.type || "expense").toLowerCase() === "income"
          ? "income"
          : "expense";

      setForm({
        title: transaction.title || transaction.name || "",
        amount:
          transaction.amount != null ? String(transaction.amount) : "",
        type,
        category: normalizeCategory(transaction.category),
        date: getTransactionDate(transaction.date || transaction.createdAt),
        description: transaction.description || "",
      });
    } else {
      setForm(createInitialValues());
    }

    setErrors({});
    setSubmitError("");
    setSubmitting(false);
  }, [transaction, open]);

  useEffect(() => {
    if (!availableCategories.length) return;

    if (!availableCategories.includes(form.category)) {
      setForm((current) => ({
        ...current,
        category: availableCategories[0],
      }));
    }
  }, [availableCategories, form.category]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isBusy) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, isBusy, onClose]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setSubmitError("");
  };

  const changeType = (type) => {
    const defaults =
      type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const suppliedCategories = Array.isArray(categories)
      ? categories.map(normalizeCategory).filter(Boolean)
      : [];

    const nextCategories = suppliedCategories.length
      ? suppliedCategories
      : defaults;

    setForm((current) => ({
      ...current,
      type,
      category: nextCategories.includes(current.category)
        ? current.category
        : defaults[0],
    }));

    setErrors((current) => ({
      ...current,
      category: "",
    }));

    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};
    const title = form.title.trim();
    const amountText = form.amount.trim();
    const amount = Number(amountText);

    if (!title) {
      nextErrors.title = "Please enter a transaction name.";
    } else if (title.length > 100) {
      nextErrors.title = "Name must be 100 characters or fewer.";
    }

    if (!amountText) {
      nextErrors.amount = "Please enter an amount.";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    } else if (!Number.isSafeInteger(Math.round(amount * 100))) {
      nextErrors.amount = "Please enter a valid amount.";
    } else if (Math.round(amount * 100) / 100 !== amount) {
      nextErrors.amount = "Maximum two decimal places are allowed.";
    }

    if (!isValidDate(form.date)) {
      nextErrors.date = "Please select a valid date.";
    }

    if (!form.category) {
      nextErrors.category = "Please select a category.";
    }

    if (form.description.trim().length > 500) {
      nextErrors.description = "Notes must be 500 characters or fewer.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isBusy || !validate()) return;

    if (typeof onSubmit !== "function") {
      setSubmitError("Save action is not connected yet.");
      return;
    }

    const transactionId = transaction?._id ?? transaction?.id;

    const payload = {
      ...(transactionId != null ? { id: transactionId } : {}),
      title: form.title.trim(),
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      description: form.description.trim(),
    };

    try {
      setSubmitting(true);
      setSubmitError("");
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save the transaction. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isBusy) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ReceiptText size={20} />
            </div>

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
            onClick={handleClose}
            disabled={isBusy}
            aria-label="Close form"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {/* Transaction type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Transaction type
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => changeType("expense")}
                disabled={isBusy}
                aria-pressed={!isIncome}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition disabled:opacity-60 ${
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
                onClick={() => changeType("income")}
                disabled={isBusy}
                aria-pressed={isIncome}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition disabled:opacity-60 ${
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

          {/* Transaction name */}
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
              required
              disabled={isBusy}
              aria-invalid={Boolean(errors.title)}
              className={`${inputClass} ${
                errors.title ? "border-red-400 focus:ring-red-50" : ""
              }`}
            />

            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Amount and category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="transaction-amount"
                className="flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                <IndianRupee size={15} />
                Amount
              </label>

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
                required
                disabled={isBusy}
                aria-invalid={Boolean(errors.amount)}
                className={`${inputClass} ${
                  errors.amount ? "border-red-400 focus:ring-red-50" : ""
                }`}
              />

              {errors.amount && (
                <p className="mt-1.5 text-xs text-red-600">{errors.amount}</p>
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
                required
                disabled={isBusy}
                aria-invalid={Boolean(errors.category)}
                className={`${inputClass} ${
                  errors.category ? "border-red-400 focus:ring-red-50" : ""
                }`}
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

          {/* Date */}
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
              required
              disabled={isBusy}
              aria-invalid={Boolean(errors.date)}
              className={`${inputClass} ${
                errors.date ? "border-red-400 focus:ring-red-50" : ""
              }`}
            />

            {errors.date && (
              <p className="mt-1.5 text-xs text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="transaction-description"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <FileText size={15} className="text-slate-400" />
              Notes
              <span className="font-normal text-slate-400">(optional)</span>
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
              disabled={isBusy}
              aria-invalid={Boolean(errors.description)}
              className={`mt-1.5 w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
                errors.description ? "border-red-400" : "border-slate-200"
              }`}
            />

            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : (
                <span className="text-xs text-slate-400">
                  Add optional transaction details.
                </span>
              )}

              <span className="text-xs text-slate-400">
                {form.description.length}/500
              </span>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="min-h-11 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isBusy}
              className={`min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {isBusy
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
