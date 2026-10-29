const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

function getUserId(req, res) {
  const userId = req.user?.id || req.user?._id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in again.",
    });

    return null;
  }

  return new mongoose.Types.ObjectId(userId);
}

// GET /api/report
const getDashboardReport = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const [result] = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                0,
              ],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "expense"] },
                "$amount",
                0,
              ],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const totalIncome = result?.totalIncome || 0;
    const totalExpense = result?.totalExpense || 0;

    return res.status(200).json({
      success: true,
      report: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: result?.transactionCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/report/category
const getCategoryReport = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const categories = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: {
            $ifNull: ["$category", "Other"],
          },
          total: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
          transactionCount: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/report/monthly
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const monthlyReports = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $type: "date" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                0,
              ],
            },
          },
          expense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "expense"] },
                "$amount",
                0,
              ],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  {
                    $concat: [
                      "0",
                      { $toString: "$_id.month" },
                    ],
                  },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          income: 1,
          expense: 1,
          balance: { $subtract: ["$income", "$expense"] },
          transactionCount: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      monthlyReports,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardReport,
  getCategoryReport,
  getMonthlyReport,
};