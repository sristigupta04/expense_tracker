// services/report.js

export function getTotalIncome(transactions) {
  return transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount), 0);
}

export function getTotalExpense(transactions) {
  return transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount), 0);
}

export function getBalance(transactions) {
  const income = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);

  return income - expense;
}

export function getCategoryReport(transactions) {
  const report = {};

  transactions.forEach((item) => {
    if (item.type === "expense") {
      report[item.category] =
        (report[item.category] || 0) + Number(item.amount);
    }
  });

  return report;
}

export function getMonthlyReport(transactions) {
  const report = {};

  transactions.forEach((item) => {
    const month = item.date.slice(0, 7);

    report[month] = (report[month] || 0) + Number(item.amount);
  });

  return report;
}