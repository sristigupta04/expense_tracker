const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// Dashboard Summary
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
    const transactions = await Transaction.find({
      type: "expense",
    });

    const report = {};

    transactions.forEach((item) => {
      if (!report[item.category]) {
        report[item.category] = 0;
      }

      report[item.category] += Number(item.amount);
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
      const month = new Date(item.date).toLocaleString(
        "default",
        {
          month: "short",
          year: "numeric",
        }
      );

      if (!report[month]) {
        report[month] = 0;
      }

      report[month] += Number(item.amount);
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
    const transactions = await Transaction.find({
      type: "expense",
    });

    let totalBudget = 0;
    let totalExpense = 0;

    budgets.forEach((budget) => {
      totalBudget += Number(budget.budgetlimit);
    });

    transactions.forEach((transaction) => {
      totalExpense += Number(transaction.amount);
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

// Trend Analysis
module.exports.getTrendAnalysis = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({
      date: 1,
    });

    res.status(200).json(transactions);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};