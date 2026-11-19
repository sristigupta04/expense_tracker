
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const VALID_PERIODS = [
  "thisMonth",
  "lastMonth",
  "last3Months",
  "thisYear",
  "allTime",
];

// Convert an IST calendar date to its UTC Date equivalent.
function istDateToUTC(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day) - 330 * 60 * 1000);
}

// Get today's calendar date in India.
function getISTToday() {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  });

  return {
    year: values.year,
    month: values.month,
    day: values.day,
  };
}

// Build a date filter for the selected reporting period.
function getPeriodDateFilter(period) {
  if (!VALID_PERIODS.includes(period)) {
    return { error: true };
  }

  if (period === "allTime") {
    return { filter: null };
  }

  const { year, month } = getISTToday();

  let start;
  let end;

  switch (period) {
    case "thisMonth":
      start = istDateToUTC(year, month, 1);
      end =
        month === 12
          ? istDateToUTC(year + 1, 1, 1)
          : istDateToUTC(year, month + 1, 1);
      break;

    case "lastMonth": {
      const previousMonth = new Date(
        Date.UTC(year, month - 2, 1)
      );

      const previousYear = previousMonth.getUTCFullYear();
      const previousMonthNumber =
        previousMonth.getUTCMonth() + 1;

      start = istDateToUTC(
        previousYear,
        previousMonthNumber,
        1
      );
      end = istDateToUTC(year, month, 1);
      break;
    }

    case "last3Months": {
      const threeMonthStart = new Date(
        Date.UTC(year, month - 3, 1)
      );

      start = istDateToUTC(
        threeMonthStart.getUTCFullYear(),
        threeMonthStart.getUTCMonth() + 1,
        1
      );

      end =
        month === 12
          ? istDateToUTC(year + 1, 1, 1)
          : istDateToUTC(year, month + 1, 1);
      break;
    }

    case "thisYear":
      start = istDateToUTC(year, 1, 1);
      end = istDateToUTC(year + 1, 1, 1);
      break;

    default:
      return { error: true };
  }

  return {
    filter: {
      $gte: start,
      $lt: end,
    },
  };
}

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

function getReportFilter(req, res) {
  const period = req.query.period || "allTime";
  const result = getPeriodDateFilter(period);

  if (result.error) {
    res.status(400).json({
      success: false,
      message: "Invalid report period.",
      allowedPeriods: VALID_PERIODS,
    });

    return null;
  }

  return result.filter;
}

// GET /api/report
const getDashboardReport = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const dateFilter = getReportFilter(req, res);
    if (dateFilter === null && req.query.period &&
        req.query.period !== "allTime") return;

    const match = { user: userId };

    if (dateFilter) {
      match.date = dateFilter;
    }

    const [result] = await Transaction.aggregate([
      { $match: match },
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
      period: req.query.period || "allTime",
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

    const dateFilter = getReportFilter(req, res);
    if (dateFilter === null && req.query.period &&
        req.query.period !== "allTime") return;

    const match = {
      user: userId,
      type: "expense",
    };

    if (dateFilter) {
      match.date = dateFilter;
    }

    const categories = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $cond: [
              {
                $or: [
                  { $eq: ["$category", null] },
                  {
                    $eq: [
                      { $trim: { input: "$category" } },
                      "",
                    ],
                  },
                ],
              },
              "Other",
              { $trim: { input: "$category" } },
            ],
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
      period: req.query.period || "allTime",
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

    const dateFilter = getReportFilter(req, res);
    if (dateFilter === null && req.query.period &&
        req.query.period !== "allTime") return;

    const match = {
      user: userId,
      date: { $type: "date" },
    };

    if (dateFilter) {
      match.date = {
        ...match.date,
        ...dateFilter,
      };
    }

    const monthlyReports = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: {
              $year: {
                date: "$date",
                timezone: "Asia/Kolkata",
              },
            },
            month: {
              $month: {
                date: "$date",
                timezone: "Asia/Kolkata",
              },
            },
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
          balance: {
            $subtract: ["$income", "$expense"],
          },
          transactionCount: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      period: req.query.period || "allTime",
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
