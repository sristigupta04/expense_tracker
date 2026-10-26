
import { useEffect, useState } from "react";
import { Wallet, X } from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Food",
  "Groceries",
  "Shopping",
  "Travel",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Housing",
  "Other",
];

const initialValues = {
  category: "Food",
  limit: "",
  period: "monthly",
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

export default function BudgetForm({
  open = true,
  budget = null,
  categories = DEFAULT_CATEGORIES,
  onSubmit,
  onClose,
  loading = false,
}) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(budget);

  const categoryOptions = categories
    .map((item) => (typeof item === "string" ? item : item.name))
    .filter(Boolean);

  useEffect(() => {
    if (!open) return;

    if (budget) {
      setForm({
        category: budget.category || budget.name || "Food",
        limit:
          budget.limit != null
            ? String(budget.limit)
            : budget.amount != null
              ? String(budget.amount)
              : "",
        period: budget.period || "monthly",
      });
    } else {
      setForm(initialValues);
    }

    setErrors({});
    setSubmitError("");
  }, [budget, open]);

  useEffect(() => {
    if (
      categoryOptions.length > 0 &&
      !categoryOptions.includes(form.category)
    ) {
      setForm((current) => ({
        ...current,
        category: categoryOptions[0],
      }));
    }
  }, [form.category, categoryOptions]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const nextErrors = {};
    const limit = Number(form.limit);

    if (!form.category) {
      nextErrors.category = "Please select a category.";
    }

    if (form.limit.trim() === "") {
      nextErrors.limit = "Please enter a budget limit.";
    } else if (!Number.isFinite(limit) || limit <= 0) {
      nextErrors.limit = "Budget limit must be greater than zero.";
    } else if (Math.round(limit * 100) / 100 !== limit) {
      nextErrors.limit = "Maximum two decimal places are allowed.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (typeof onSubmit !== "function") {
      setSubmitError("Save action is not connected yet.");
      return;
    }

    const payload = {
      ...(budget?.id != null ? { id: budget.id } : {}),
      ...(budget?._id != null ? { _id: budget._id } : {}),
      category: form.category,
      limit,
      period: form.period,
    };

    try {
      setSubmitError("");
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save this budget. Please try again."
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
        aria-labelledby="budget-form-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Wallet size={22} />
            </div>

            <div>
              <h2
                id="budget-form-title"
                className="text-xl font-bold text-slate-900"
              >
                {isEditing ? "Edit budget" : "Create budget"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set a spending limit for a category.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close budget form"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label
              htmlFor="budget-category"
              className="text-sm font-semibold text-slate-700"
            >
              Category
            </label>

            <select
              id="budget-category"
              value={form.category}
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              className={inputClass}
            >
              {categoryOptions.map((category) => (
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

          <div>
            <label
              htmlFor="budget-limit"
              className="text-sm font-semibold text-slate-700"
            >
              Budget limit (₹)
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-[23px] -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>

              <input
                id="budget-limit"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={form.limit}
                onChange={(event) =>
                  updateField("limit", event.target.value)
                }
                placeholder="e.g. 5000"
                className={`${inputClass} pl-8`}
              />
            </div>

            {errors.limit && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.limit}
              </p>
            )}

            <p className="mt-1.5 text-xs text-slate-500">
              Set the maximum amount you plan to spend.
            </p>
          </div>

          <div>
            <label
              htmlFor="budget-period"
              className="text-sm font-semibold text-slate-700"
            >
              Budget period
            </label>

            <select
              id="budget-period"
              value={form.period}
              onChange={(event) =>
                updateField("period", event.target.value)
              }
              className={inputClass}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>

            <p className="mt-1.5 text-xs text-slate-500">
              Your budget period must be supported by the backend for
              calculations to reset correctly.
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Budget preview
            </p>

            <p className="mt-1 text-sm text-blue-800">
              {form.category || "Category"} ·{" "}
              {form.period.charAt(0).toUpperCase() + form.period.slice(1)}
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-900">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              }).format(Number(form.limit) || 0)}
            </p>
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
              className="min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create budget"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
