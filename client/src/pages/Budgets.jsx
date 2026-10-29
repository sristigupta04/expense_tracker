
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  Search,
  IndianRupee,
  Target,
  TrendingUp,
  X,
  AlertCircle,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import BudgetCard from "../components/Budget/BudgetCard";
import Loader from "../components/common/Loader";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budget";

const categories = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Bills",
  "Travel",
  "Investment",
  "Other",
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function normalizeBudgets(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.budgets)) return data.budgets;
  if (Array.isArray(data?.data?.budgets)) return data.data.budgets;
  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [category, setCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");

  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getBudgets();
      setBudgets(normalizeBudgets(data));
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to load budgets. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const resetForm = () => {
    setCategory("");
    setBudgetLimit("");
    setEditingId(null);
    setError("");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanCategory = category.trim();
    const limit = Number(budgetLimit);

    if (!categories.includes(cleanCategory)) {
      setError("Please select a valid budget category.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Budget limit must be greater than zero.");
      return;
    }

    const duplicateBudget = budgets.some((item) => {
      const sameId =
        String(item._id || item.id) === String(editingId);

      return (
        !sameId &&
        String(item.category || "").toLowerCase() ===
          cleanCategory.toLowerCase() &&
        Number(item.month) ===
          Number(editingId
            ? budgets.find(
                (b) => String(b._id || b.id) === String(editingId)
              )?.month ?? month
            : month) &&
        Number(item.year) === year
      );
    });

    if (duplicateBudget) {
      setError(
        "A budget for this category already exists for this month."
      );
      return;
    }

    setSaving(true);

    try {
      const existingBudget = budgets.find(
        (item) =>
          String(item._id || item.id) === String(editingId)
      );

      const payload = {
        category: cleanCategory,
        limit,
        month: existingBudget?.month ?? month,
        year: existingBudget?.year ?? year,
      };

      if (editingId) {
        const response = await updateBudget(editingId, payload);
        const updatedBudget = response?.budget ?? response?.data?.budget ?? response;

        if (
          updatedBudget &&
          typeof updatedBudget === "object" &&
          (updatedBudget._id || updatedBudget.id)
        ) {
          setBudgets((previous) =>
            previous.map((item) =>
              String(item._id || item.id) === String(editingId)
                ? { ...item, ...updatedBudget }
                : item
            )
          );
        } else {
          await fetchBudgets();
        }

        setSuccess("Budget updated successfully.");
      } else {
        const response = await createBudget(payload);
        const createdBudget = response?.budget ?? response?.data?.budget ?? response;

        if (
          createdBudget &&
          typeof createdBudget === "object" &&
          (createdBudget._id || createdBudget.id)
        ) {
          setBudgets((previous) => [
            createdBudget,
            ...previous,
          ]);
        } else {
          await fetchBudgets();
        }

        setSuccess("Budget created successfully.");
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save budget:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to save budget. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(id) {
    const budget = budgets.find(
      (item) => String(item._id || item.id) === String(id)
    );

    if (!budget) return;

    setEditingId(id);
    setCategory(budget.category || "");
    setBudgetLimit(
      String(budget.limit ?? budget.budgetlimit ?? "")
    );
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!id) {
      setError("Budget ID is missing.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this budget?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      await deleteBudget(id);

      setBudgets((previous) =>
        previous.filter(
          (item) => String(item._id || item.id) !== String(id)
        )
      );

      if (String(editingId) === String(id)) {
        resetForm();
      }

      setSuccess("Budget deleted successfully.");
    } catch (err) {
      console.error("Failed to delete budget:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to delete budget. Please try again."
        )
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredBudgets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return budgets.filter((budget) =>
      String(budget.category || budget.title || "")
        .toLowerCase()
        .includes(query)
    );
  }, [budgets, search]);

  const summary = useMemo(() => {
    return budgets.reduce(
      (result, budget) => {
        result.totalBudget +=
          Number(budget.limit ?? budget.budgetlimit) || 0;

        result.totalSpent +=
          Number(budget.spent ?? budget.spentAmount) || 0;

        return result;
      },
      { totalBudget: 0, totalSpent: 0 }
    );
  }, [budgets]);

  const totalRemaining =
    summary.totalBudget - summary.totalSpent;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Wallet size={17} />
              Personal Finance
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Budget Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Plan your spending, monitor expenses, and stay on track.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
            <Target size={18} className="text-blue-600" />
            {currentDate.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        {(error || success) && (
          <div
            role={error ? "alert" : "status"}
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            ) : (
              <Target size={19} className="mt-0.5 shrink-0" />
            )}

            <p className="flex-1">{error || success}</p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
              }}
              aria-label="Dismiss message"
              className="rounded-md p-1 hover:bg-black/5"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section
          aria-label="Budget summary"
          className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <SummaryCard
            label="Total budget"
            amount={formatCurrency(summary.totalBudget)}
            icon={Wallet}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            label="Total spent"
            amount={formatCurrency(summary.totalSpent)}
            icon={TrendingUp}
            iconStyle="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            label={totalRemaining < 0 ? "Over budget" : "Remaining"}
            amount={formatCurrency(Math.abs(totalRemaining))}
            icon={IndianRupee}
            iconStyle={
              totalRemaining < 0
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }
          />
        </section>

        <section className="mb-8 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {editingId ? <Pencil size={20} /> : <Plus size={21} />}
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  {editingId ? "Edit budget" : "Create a budget"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update your category and spending limit."
                    : "Set a monthly spending limit for a category."}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <label
                  htmlFor="budget-category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category
                </label>

                <select
                  id="budget-category"
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  className="block w-full cursor-pointer appearance-auto rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="" disabled>
                    -- Choose a category --
                  </option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="budget-limit"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Monthly budget limit (₹)
                </label>

                <input
                  id="budget-limit"
                  type="number"
                  min="1"
                  step="0.01"
                  value={budgetLimit}
                  onChange={(event) => setBudgetLimit(event.target.value)}
                  placeholder="e.g. 10000"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Plus size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add budget"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your budgets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredBudgets.length}{" "}
                {filteredBudgets.length === 1 ? "budget" : "budgets"} found
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search category..."
                aria-label="Search budgets by category"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <Loader text="Loading your budgets..." />
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Wallet size={26} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {search ? "No matching budgets" : "No budgets yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search
                  ? "Try another category name."
                  : "Create your first budget to start tracking monthly spending."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBudgets.map((budget) => {
                const id = budget._id || budget.id;

                return (
                  <div key={id || budget.category} className="relative min-w-0">
                    <BudgetCard
                      budget={{
                        ...budget,
                        title: budget.category || budget.title,
                        limit: Number(budget.limit ?? budget.budgetlimit) || 0,
                        spent: Number(budget.spent ?? budget.spentAmount) || 0,
                      }}
                      onDelete={() => handleDelete(id)}
                      onEdit={() => handleEdit(id)}
                    />

                    {deletingId === id && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                        <LoaderCircle
                          size={25}
                          className="animate-spin text-blue-600"
                        />
                        <span className="ml-2 text-sm font-medium text-slate-600">
                          Deleting...
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, amount, icon: Icon, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-900">
            {amount}
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}
