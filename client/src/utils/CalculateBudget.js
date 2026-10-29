
/**
 * Calculate budget usage and remaining amount.
 */

// Convert a value to a valid non-negative number.
const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

// Calculate total spent from transactions for a category.
export const calculateCategorySpending = (
  transactions = [],
  category
) => {
  if (!Array.isArray(transactions)) return 0;

  return transactions.reduce((total, transaction) => {
    if (!transaction) return total;

    const transactionCategory = String(
      transaction.category || ""
    ).toLowerCase();

    const requestedCategory = String(category || "").toLowerCase();

    const type = String(
      transaction.type || transaction.transactionType || "expense"
    ).toLowerCase();

    if (
      transactionCategory === requestedCategory &&
      type === "expense"
    ) {
      return total + toAmount(transaction.amount);
    }

    return total;
  }, 0);
};

// Calculate remaining budget amount.
export const calculateRemainingBudget = (limit, spent) => {
  return Math.max(toAmount(limit) - toAmount(spent), 0);
};

// Calculate budget usage percentage.
export const calculateBudgetPercentage = (limit, spent) => {
  const budgetLimit = toAmount(limit);

  if (budgetLimit === 0) return 0;

  return Math.min(
    (toAmount(spent) / budgetLimit) * 100,
    100
  );
};

// Return a budget status for UI indicators.
export const getBudgetStatus = (limit, spent) => {
  const budgetLimit = toAmount(limit);
  const amountSpent = toAmount(spent);

  if (budgetLimit === 0) {
    return "no-budget";
  }

  const percentage = (amountSpent / budgetLimit) * 100;

  if (percentage >= 100) return "exceeded";
  if (percentage >= 80) return "warning";

  return "safe";
};

// Return all budget calculations together.
export const calculateBudget = (limit, spent) => {
  const budgetLimit = toAmount(limit);
  const amountSpent = toAmount(spent);
  const remaining = calculateRemainingBudget(
    budgetLimit,
    amountSpent
  );
  const percentage = calculateBudgetPercentage(
    budgetLimit,
    amountSpent
  );

  return {
    limit: budgetLimit,
    spent: amountSpent,
    remaining,
    percentage,
    isExceeded: amountSpent > budgetLimit,
    status: getBudgetStatus(budgetLimit, amountSpent),
  };
};

export default calculateBudget;
