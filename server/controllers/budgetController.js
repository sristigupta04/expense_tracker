
const mongoose = require("mongoose");
const Budget = require("../models/Budget");

// GET /api/budget
const getBudget = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: budgets.length,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/budget/:id
const getBudgetById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

// POST /api/budget
const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || limit === undefined || limit === null) {
      return res.status(400).json({
        success: false,
        message: "Category and budget limit are required",
      });
    }

    const numericLimit = Number(limit);

    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Budget limit must be greater than zero",
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category: String(category).trim(),
      limit: numericLimit,
      month: month ?? new Date().getMonth() + 1,
      year: year ?? new Date().getFullYear(),
    });

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/budget/progress
const getBudgetProgress = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: budgets.length,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/budget/:id
const updateBudget = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    const updates = {};
    const { category, limit, month, year } = req.body;

    if (category !== undefined) {
      if (!String(category).trim()) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }
      updates.category = String(category).trim();
    }

    if (limit !== undefined) {
      const numericLimit = Number(limit);

      if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
        return res.status(400).json({
          success: false,
          message: "Budget limit must be greater than zero",
        });
      }
      updates.limit = numericLimit;
    }

    if (month !== undefined) {
      const numericMonth = Number(month);

      if (
        !Number.isInteger(numericMonth) ||
        numericMonth < 1 ||
        numericMonth > 12
      ) {
        return res.status(400).json({
          success: false,
          message: "Month must be between 1 and 12",
        });
      }
      updates.month = numericMonth;
    }

    if (year !== undefined) {
      const numericYear = Number(year);

      if (!Number.isInteger(numericYear) || numericYear < 2000) {
        return res.status(400).json({
          success: false,
          message: "Invalid budget year",
        });
      }
      updates.year = numericYear;
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/budget/:id
const deleteBudget = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudget,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
};
