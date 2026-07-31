export default function calculateBalance(transactions) {
  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      income += Number(transaction.amount);
    } else {
      expense += Number(transaction.amount);
    }
  });

  const balance = income - expense;

  return {
    income,
    expense,
    balance,
  };
}