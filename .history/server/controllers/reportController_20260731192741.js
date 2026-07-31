const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// Dashboard Report
module.exports.getDashboardStats = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let income = 0;
    let expense = 0;

    transactions.forEach((item) => {
      if (item.type === "income") {
        income += Number(item.amount);
      } else if (item.type === "expense") {
        expense += Number(item.amount);
      }
    });

    const balance = income - expense;

    res.status(200).json({
      income,
      expense,
      balance,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Category Report
module.exports.getCategoryReport = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const report = {};

    transactions.forEach((item) => {
      if (item.type === "expense") {
        report[item.category] =
          (report[item.category] || 0) +
          Number(item.amount);
      }
    });

    res.status(200).json(report);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Monthly Report
module.exports.getMonthlyReport = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const report = {};

    transactions.forEach((item) => {
      const month = item.date.toISOString().slice(0, 7);

      report[month] =
        (report[month] || 0) +
        Number(item.amount);
    });

    res.status(200).json(report);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Budget Report
module.exports.getBudgetReport = async (req, res) => {
  try {
    const budgets = await Budget.find();
    const transactions = await Transaction.find();

    let totalBudget = 0;
    let totalExpense = 0;

    budgets.forEach((budget) => {
      totalBudget += Number(budget.budgetlimit);
    });

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        totalExpense += Number(transaction.amount);
      }
    });

    res.status(200).json({
      totalBudget,
      totalExpense,
      remaining: totalBudget - totalExpense,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports.getTrendAnalysis = async (req, res) => {
  res.status(200).json({
    message: "Trend Analysis",
  });
};