
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Notification = require("../models/notification");

const THRESHOLDS = [
  { percent: 75, label: "Budget warning" },
  { percent: 90, label: "Budget almost exhausted" },
  { percent: 100, label: "Budget limit reached" },
];

async function createBudgetAlerts(userId, targetMonth, targetYear) {
  const now = new Date();
  const month = targetMonth ?? now.getMonth() + 1;
  const year = targetYear ?? now.getFullYear();

  const budgets = await Budget.find({
    user: userId,
    month,
    year,
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const expenses = await Transaction.find({
    user: userId,
    type: { $regex: /^expense$/i },
    date: { $gte: startDate, $lt: endDate },
  }).select("amount category");

  for (const budget of budgets) {
    const categoryExpenses = expenses.filter(
      (transaction) =>
        String(transaction.category).trim().toLowerCase() ===
        String(budget.category).trim().toLowerCase()
    );

    const spent = categoryExpenses.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

    const limit = Number(budget.limit);
    if (!Number.isFinite(limit) || limit <= 0) continue;

    const usage = (spent / limit) * 100;

    for (const threshold of THRESHOLDS) {
      if (usage < threshold.percent) continue;

      const title = `${threshold.label}: ${budget.category}`;
      const message =
        `${budget.category} budget for ${month}/${year} is ` +
        `${usage.toFixed(0)}% used. Spent: ${spent.toFixed(2)}; ` +
        `budget: ${limit.toFixed(2)}.`;

      // Prevent repeated notifications for the same threshold,
      // category and budget month.
      const existing = await Notification.findOne({
        user: userId,
        type: "budget",
        title,
        message: {
          $regex: new RegExp(
            `^${budget.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} budget for ${month}/${year} is `
          ),
        },
      }).select("_id");

      if (existing) continue;

      await Notification.create({
        user: userId,
        title,
        message,
        type: "budget",
        isRead: false,
        link: "/budgets",
      });
    }
  }
}

module.exports = { createBudgetAlerts };
