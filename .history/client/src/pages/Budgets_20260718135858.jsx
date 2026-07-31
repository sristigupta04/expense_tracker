import { useState } from "react";
import BudgetCard from "../components/BudgetCard";

export default function Budgets() {
  const [budgets, setBudgets] = useState([
    {
      id: 1,
      title: "Food",
      limit: 10000,
      spent: 4000,
    },
  ]);

  function addBudget() {
    const title = prompt("Enter Budget Title");
    const limit = Number(prompt("Enter Budget Limit"));

    if (!title || !limit || limit <= 0) return;

    setBudgets((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        limit,
        spent: 0,
      },
    ]);
  }

  function deleteBudget(id) {
    setBudgets((prev) =>
      prev.filter((budget) => budget.id !== id)
    );
  }

  function editBudget(id) {
    setBudgets((prev) =>
      prev.map((budget) => {
        if (budget.id !== id) return budget;

        const title = prompt(
          "Enter New Title",
          budget.title
        );

        const limit = Number(
          prompt("Enter New Limit", budget.limit)
        );

        if (!title || !limit || limit <= 0) {
          return budget;
        }

        return {
          ...budget,
          title,
          limit,
        };
      })
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
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Add Budget
          </button>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onDelete={deleteBudget}
              onEdit={editBudget}
            />
          ))}

        </div>

      </div>

    </div>
  );
}