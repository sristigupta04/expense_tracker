// services/budget.js

export function setBudget(amount) {
  if (!amount || amount <= 0) {
    throw new Error("Please enter a valid budget.");
  }

  localStorage.setItem("budget", JSON.stringify(amount));

  return amount;
}

export function getBudget() {
  const budget = JSON.parse(localStorage.getItem("budget"));

  return budget || 0;
}

export function updateBudget(newAmount) {
  if (!newAmount || newAmount <= 0) {
    throw new Error("Please enter a valid budget.");
  }

  localStorage.setItem("budget", JSON.stringify(newAmount));

  return newAmount;
}

export function getRemainingBudget(totalExpense) {
  const budget = getBudget();

  return budget - totalExpense;
}

export function isBudgetExceeded(totalExpense) {
  const budget = getBudget();

  return totalExpense > budget;
}

export function deleteBudget() {
  localStorage.removeItem("budget");
}