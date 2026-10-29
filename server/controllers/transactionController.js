
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
// GET all transactions
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// GET transaction by ID
const getTransactionsById = async (req, res, next) => {
  try {

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
if (!req.user?.id || !mongoose.isValidObjectId(req.user.id)) {
  return res.status(401).json({
    success: false,
    message: "Invalid user session. Please log in again.",
  });
}
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE transaction
const addTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (
      !title ||
      amount === undefined ||
      amount === null ||
      !type ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, type and category are required",
      });
    }

    const transaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      note: note || "",
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE transaction
const updateTransaction = async (req, res, next) => {
  try {
    const allowedFields = [
      "title",
      "amount",
      "type",
      "category",
      "date",
      "note",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE one transaction
const deleteTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE all transactions for logged-in user
const deleteTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.deleteMany({
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "All transactions deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionsById,
  updateTransaction,
  deleteTransactionById,
  deleteTransaction,
};
