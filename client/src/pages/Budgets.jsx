import { useEffect, useState } from "react";
import BudgetCard from "../components/BudgetCard";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budget";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [category, setCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, []);

  async function fetchBudgets() {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Add Budget
  async function addBudget() {
    if (!category.trim() || Number(budgetLimit) <= 0) {
      alert("Please enter valid data.");
      return;
    }

    try {
      const budget = await createBudget({
        category,
        budgetlimit: Number(budgetLimit),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });

      setBudgets((prev) => [budget, ...prev]);

      setCategory("");
      setBudgetLimit("");
    } catch (err) {
      console.error(err);
    }
  }

  // Delete Budget
  async function handleDelete(id) {
    try {
      await deleteBudget(id);

      setBudgets((prev) =>
        prev.filter((budget) => budget._id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  }

  // Edit Budget
  async function handleEdit(id) {
    const budget = budgets.find((b) => b._id === id);

    if (!budget) return;

    const newCategory = window.prompt(
      "Enter New Category",
      budget.category
    );

    const newLimit = window.prompt(
      "Enter New Budget Limit",
      budget.budgetlimit
    );

    if (!newCategory || Number(newLimit) <= 0) return;

    try {
      const updated = await updateBudget(id, {
        category: newCategory,
        budgetlimit: Number(newLimit),
        month: budget.month,
        year: budget.year,
      });

      setBudgets((prev) =>
        prev.map((b) =>
          b._id === id ? updated : b
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Budgets
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your monthly budgets.
          </p>
        </div>

        {/* Add Budget Form */}

        <div className="mb-8 flex flex-wrap gap-4 rounded-xl bg-white p-6 shadow">

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border px-4 py-2"
          />

          <input
            type="number"
            placeholder="Budget Limit"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            className="rounded-lg border px-4 py-2"
          />

          <button
            onClick={addBudget}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Add Budget
          </button>

        </div>

        {/* Budget Cards */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>

      </div>
    </div>
  );
}