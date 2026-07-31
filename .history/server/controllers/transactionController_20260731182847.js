const Transaction = require("../models/Transaction");

// Create Transaction
module.exports.addTransaction = async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      date,
      note,
    } = req.body;

    if (
      !title ||
      !amount ||
      !type ||
      !category ||
      !date
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const transaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date,
      note,
    });

    res.status(201).json(transaction);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Transactions
module.exports.getTransactions = async (req, res) => {
  try {

    const transactions = await Transaction
      .find()
      .sort({ date: -1 });

    res.status(200).json(transactions);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get Transaction By Id
module.exports.getTransactionsById = async (req, res) => {
  try {

    const transaction =
      await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json(transaction);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Transaction
module.exports.updateTransaction = async (
  req,
  res
) => {
  try {

    const transaction =
      await Transaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json(transaction);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete One Transaction
module.exports.deleteTransactionById =
  async (req, res) => {
    try {

      const transaction =
        await Transaction.findByIdAndDelete(
          req.params.id
        );

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Transaction deleted",
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

// Delete All Transactions
module.exports.deleteTransaction = async (
  req,
  res
) => {
  try {

    await Transaction.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All transactions deleted",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};