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

  async function addBudget() {
    const title = prompt("Enter Budget Title");
    const limit = Number(prompt("Enter Budget Limit"));

    if (!title || !limit || limit <= 0) return;

    try {
      const budget = await createBudget({
        category: title,
        budgetlimit: limit,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });

      setBudgets((prev) => [budget, ...prev]);
    } catch (err) {
      console.error(err);
    }
  }

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

  async function handleEdit(id) {
    const budget = budgets.find((b) => b._id === id);

    if (!budget) return;

    const title = prompt(
      "Enter New Title",
      budget.category
    );

    const limit = Number(
      prompt("Enter New Limit", budget.budgetlimit)
    );

    if (!title || !limit || limit <= 0) return;

    try {
      const updated = await updateBudget(id, {
        category: title,
        budgetlimit: limit,
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
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Budgets
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your monthly budgets.
            </p>
          </div>

          <button
            onClick={addBudget}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add Budget
          </button>
        </div>

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