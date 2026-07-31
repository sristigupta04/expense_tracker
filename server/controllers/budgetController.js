const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// Create Budget
module.exports.createBudget = async (req, res) => {
  try {
    const { category, budgetlimit, month, year } = req.body;

    if (!category || !budgetlimit || !month || !year) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const budget = await Budget.create({
      category,
      budgetlimit,
      month,
      year,
    });

    res.status(201).json(budget);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Budgets
module.exports.getBudget = async (req, res) => {
  try {
    const budgets = await Budget.find();

    res.status(200).json(budgets);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get Budget By Id
module.exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json(budget);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Budget
module.exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json(budget);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete Budget
module.exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(
      req.params.id
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Budget Progress
module.exports.getBudgetProgress = async (req, res) => {
  try {
    const { category } = req.params;

    const budget = await Budget.findOne({ category });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const transactions = await Transaction.find({
      category,
      type: "expense",
    });

    let spent = 0;

    transactions.forEach((transaction) => {
      spent += Number(transaction.amount);
    });

    const remaining =
      Number(budget.budgetlimit) - spent;

    res.status(200).json({
      category,
      budget: budget.budgetlimit,
      spent,
      remaining,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};