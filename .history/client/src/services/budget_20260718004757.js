// services/budget.js

export function setBudget(amount) {
  localStorage.setItem("budget", JSON.stringify(amount));
}

export function getBudget() {
  return JSON.parse(localStorage.getItem("budget")) || 0;
}

export function updateBudget(amount) {
  localStorage.setItem("budget", JSON.stringify(amount));
}

export function getRemainingBudget(expense) {
  const budget = getBudget();
  return budget - expense;
}

export function isBudgetExceeded(expense) {
  const budget = getBudget();
  return expense > budget;
}