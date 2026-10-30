const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Notification = require("../models/notification");

const THRESHOLDS = [
  { percent: 75, label: "Budget warning" },
  { percent: 90, label: "Budget almost exhausted" },
  { percent: 100, label: "Budget limit reached" },
];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function createBudgetAlerts(userId, targetMonth, targetYear) {
  if (!userId) {
    throw new Error("User ID is required to create budget alerts.");
  }

  const now = new Date();
  const month = targetMonth ?? now.getMonth() + 1;
  const year = targetYear ?? now.getFullYear();

  if (
    !Number.isInteger(Number(month)) ||
    Number(month) < 1 ||
    Number(month) > 12 ||
    !Number.isInteger(Number(year))
  ) {
    throw new Error("Invalid budget month or year.");
  }

  const budgets = await Budget.find({
    user: userId,
    month: Number(month),
    year: Number(year),
  });

  if (!budgets.length) return;

  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 1);

  const expenses = await Transaction.find({
    user: userId,
    type: { $regex: /^expense$/i },
    date: { $gte: startDate, $lt: endDate },
  }).select("amount category");

  for (const budget of budgets) {
    const category = String(budget.category || "").trim();

    if (!category) continue;

    const spent = expenses
      .filter(
        (transaction) =>
          String(transaction.category || "").trim().toLowerCase() ===
          category.toLowerCase()
      )
      .reduce(
        (total, transaction) =>
          total + Math.max(0, Number(transaction.amount) || 0),
        0
      );

    const limit = Number(budget.limit);

    if (!Number.isFinite(limit) || limit <= 0) continue;

    const usage = (spent / limit) * 100;

    for (const threshold of THRESHOLDS) {
      if (usage < threshold.percent) continue;

      const title = `${threshold.label}: ${category}`;
      const period = `${month}/${year}`;
      const message =
        `${category} budget for ${period} is ${usage.toFixed(0)}% used. ` +
        `Spent: ${spent.toFixed(2)}; budget: ${limit.toFixed(2)}.`;

      const existing = await Notification.findOne({
        user: userId,
        type: "budget",
        title,
        message: {
          $regex: `^${escapeRegex(category)} budget for ${escapeRegex(period)} is `,
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