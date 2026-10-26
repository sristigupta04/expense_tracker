
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
} from "lucide-react";

import BudgetCard from "../components/BudgetCard";
import Loader from "../components/Loader";
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

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load budgets. Please try again."
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

  // Add or update budget
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanCategory = category.trim();
    const limit = Number(budgetLimit);

    if (!cleanCategory) {
      setError("Please select a budget category.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Budget limit must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const existingBudget = budgets.find(
        (item) => String(item._id || item.id) === String(editingId)
      );

      const payload = {
        category: cleanCategory,
        budgetlimit: limit,
        month: existingBudget?.month ?? month,
        year: existingBudget?.year ?? year,
      };

      if (editingId) {
        const updated = await updateBudget(editingId, payload);

        setBudgets((previous) =>
          previous.map((item) =>
            String(item._id || item.id) === String(editingId)
              ? updated
              : item
          )
        );
      } else {
        const created = await createBudget(payload);
        setBudgets((previous) => [created, ...previous]);
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save budget:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save budget. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Edit budget
  function handleEdit(id) {
    const budget = budgets.find(
      (item) => String(item._id || item.id) === String(id)
    );

    if (!budget) return;

    setEditingId(id);
    setCategory(budget.category || "");
    setBudgetLimit(String(budget.budgetlimit ?? budget.limit ?? ""));
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete budget
  async function handleDelete(id) {
    if (!id) {
      setError("Budget ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    setError("");

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
    } catch (err) {
      console.error("Failed to delete budget:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete budget. Please try again."
      );
    }
  }

  // Filter budgets by category
  const filteredBudgets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return budgets.filter((budget) =>
      (budget.category || budget.title || "")
        .toLowerCase()
        .includes(query)
    );
  }, [budgets, search]);

  // Summary values
  const totalBudget = budgets.reduce(
    (total, budget) =>
      total + (Number(budget.budgetlimit ?? budget.limit) || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (total, budget) => total + (Number(budget.spent) || 0),
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded-md p-1 hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section
          aria-label="Budget summary"
          className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <SummaryCard
            label="Total budget"
            amount={currency(totalBudget)}
            icon={Wallet}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            label="Total spent"
            amount={currency(totalSpent)}
            icon={TrendingUp}
            iconStyle="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            label={totalRemaining < 0 ? "Over budget" : "Remaining"}
            amount={currency(Math.abs(totalRemaining))}
            icon={IndianRupee}
            iconStyle={
              totalRemaining < 0
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }
          />
        </section>

        {/* Add / Edit budget form */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Plus size={21} />
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
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Choose a category</option>

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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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

                  {saving ? "Saving..." : editingId ? "Save changes" : "Add budget"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* Budgets list heading and search */}
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
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
                  : "Create your first budget to start tracking your monthly spending."}
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
                const limit = Number(
                  budget.budgetlimit ?? budget.limit
                ) || 0;

                const spent = Number(budget.spent) || 0;

                return (
                  <BudgetCard
                    key={budget._id || budget.id}
                    budget={{
                      ...budget,
                      title: budget.category || budget.title,
                      limit,
                      spent,
                    }}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
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

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}
