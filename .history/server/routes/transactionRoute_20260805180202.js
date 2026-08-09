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

// Add Transaction
router.post("/", addTransaction);

// Get All Transactions
router.get("/", getTransactions);

// Get Transaction By ID
router.get("/:id", getTransactionsById);

// Update Transaction
router.put("/:id", updateTransaction);

// Delete Single Transaction
router.delete("/:id", deleteTransactionById);

// Delete All Transactions (Optional)
router.delete("/", deleteTransaction);

module.exports = router;