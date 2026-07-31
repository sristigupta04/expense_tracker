const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  getTransactionsById,
  updateTransaction,
  deleteTransactionById,
  deleteTransaction,
} = require("../controllers/transactionController");

// Create Transaction
router.post("/", addTransaction);

// Get All Transactions
router.get("/", getTransactions);

// Get Transaction By Id
router.get("/:id", getTransactionsById);

// Update Transaction
router.put("/:id", updateTransaction);

// Delete Transaction By Id
router.delete("/:id", deleteTransactionById);

// Delete All Transactions
router.delete("/", deleteTransaction);

module.exports = router;