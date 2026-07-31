import { useState } from "react";

import BudgetsList from "../components/BudgetsList";

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
    const newTitle = prompt("Enter Budget Title");
    const newLimit = Number(prompt("Enter Budget Limit"));

    if (!newTitle || !newLimit) return;

    setBudgets([
      ...budgets,
      {
        id: Date.now(),
        title: newTitle,
        limit: newLimit,
        spent: 0,
      },
    ]);
  }

  function deleteBudget(id) {
    setBudgets(
      budgets.filter((budget) => budget.id !== id)
    );
  }

  function editBudget(id) {
    setBudgets(
      budgets.map((budget) => {
        if (budget.id === id) {
          const newTitle = prompt(
            "Enter New Title",
            budget.title
          );

          const newLimit = Number(
            prompt(
              "Enter New Limit",
              budget.limit
            )
          );

          return {
            ...budget,
            title: newTitle,
            limit: newLimit,
          };
        }

        return budget;
      })
    );
  }

  return (
    <div>
      <h1>Budgets</h1>

      <button onClick={addBudget}>
        Add Budget
      </button>

      <BudgetsList
        budgets={budgets}
        deleteBudget={deleteBudget}
        editBudget={editBudget}
      />
    </div>
  );
}