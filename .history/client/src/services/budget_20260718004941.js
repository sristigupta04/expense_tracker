// services/budget.js

export function setBudget(amount) {
     if (!amount || amount <= 0) {
    throw new Error("Please enter a valid budget.");
  }
  localStorage.setItem("budget", JSON.stringify(amount));
  return amount;
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