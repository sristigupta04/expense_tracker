const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const getUserId = (req, res) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({
      success: false,
      message: "Invalid user session. Please log in again.",
    });
    return null;
  }

  return userId;
};

const getTransactions = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const transactions = await Transaction.find({
      user: userId,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionsById = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

const addTransaction = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { title, amount, type, category, date, note } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !["income", "expense"].includes(type) ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid title, amount, type and category are required.",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid non-negative number.",
      });
    }

    const transactionDate = date ? new Date(date) : new Date();

    if (Number.isNaN(transactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction date.",
      });
    }

    const transaction = await Transaction.create({
      title: title.trim(),
      amount: numericAmount,
      type,
      category: category.trim(),
      date: transactionDate,
      note: typeof note === "string" ? note.trim() : "",
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

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

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty.",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.amount !== undefined) {
      if (updates.amount === "" || updates.amount === null) {
        return res.status(400).json({
          success: false,
          message: "Amount is required.",
        });
      }

      updates.amount = Number(updates.amount);

      if (!Number.isFinite(updates.amount) || updates.amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid non-negative number.",
        });
      }
    }

    if (
      updates.type !== undefined &&
      !["income", "expense"].includes(updates.type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type.",
      });
    }

    if (updates.category !== undefined) {
      if (
        typeof updates.category !== "string" ||
        !updates.category.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty.",
        });
      }

      updates.category = updates.category.trim();
    }

    if (updates.date !== undefined) {
      const parsedDate = new Date(updates.date);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction date.",
        });
      }

      updates.date = parsedDate;
    }

    if (updates.note !== undefined && typeof updates.note !== "string") {
      return res.status(400).json({
        success: false,
        message: "Note must be text.",
      });
    }

    if (updates.note !== undefined) {
      updates.note = updates.note.trim();
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: userId,
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransactionById = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const result = await Transaction.deleteMany({
      user: userId,
    });

    return res.status(200).json({
      success: true,
      message: "All transactions deleted successfully.",
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