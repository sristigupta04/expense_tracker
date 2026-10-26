
export default function calculateBalance(transactions = []) {
  let income = 0;
  let expense = 0;

  if (!Array.isArray(transactions)) {
    return { income: 0, expense: 0, balance: 0 };
  }

  transactions.forEach((transaction) => {
    if (!transaction) return;

    const amount = Number(transaction.amount);

    // Ignore invalid, infinite, or negative amounts
    if (!Number.isFinite(amount) || amount < 0) return;

    if (transaction.type === "income") {
      income += amount;
    } else if (transaction.type === "expense") {
      expense += amount;
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
  };
}
