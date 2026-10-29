
const Transaction = require("../models/Transaction");

// GET /api/report
const getDashboardReport = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const transactions = await Transaction.find({ user: userId }).lean();

    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);

      if (!Number.isFinite(amount)) continue;

      if (transaction.type === "income") {
        totalIncome += amount;
      } else if (transaction.type === "expense") {
        totalExpense += amount;
      }
    }

    return res.status(200).json({
      success: true,
      report: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error("Dashboard report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate dashboard report",
    });
  }
};

// GET /api/report/category
const getCategoryReport = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const transactions = await Transaction.find({
      user: userId,
      type: "expense",
    })
      .select("category amount")
      .lean();

    const categoryTotals = {};

    for (const transaction of transactions) {
      const category = transaction.category || "Other";
      const amount = Number(transaction.amount);

      if (!Number.isFinite(amount)) continue;

      categoryTotals[category] =
        (categoryTotals[category] || 0) + amount;
    }

    const categories = Object.entries(categoryTotals).map(
      ([category, total]) => ({ category, total })
    );

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Category report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate category report",
    });
  }
};

// GET /api/report/monthly
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const transactions = await Transaction.find({ user: userId })
      .select("amount type date")
      .sort({ date: 1 })
      .lean();

    const monthlyTotals = {};

    for (const transaction of transactions) {
      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) continue;

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
        };
      }

      const amount = Number(transaction.amount);

      if (!Number.isFinite(amount)) continue;

      if (transaction.type === "income") {
        monthlyTotals[monthKey].income += amount;
      } else if (transaction.type === "expense") {
        monthlyTotals[monthKey].expense += amount;
      }
    }

    return res.status(200).json({
      success: true,
      monthlyReports: Object.values(monthlyTotals),
    });
  } catch (error) {
    console.error("Monthly report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
    });
  }
};

module.exports = {
  getDashboardReport,
  getCategoryReport,
  getMonthlyReport,
};
