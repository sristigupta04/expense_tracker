export default function calculateBalance(transactions = []) {
  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;

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