
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  addTransaction,
  getTransactions,
  getTransactionsById,
  updateTransaction,
  deleteTransactionById,
  deleteTransaction,
} = require("../controllers/transactionController");

// All routes require authentication
router.use(authMiddleware);

// GET /api/transactions
router.get("/", getTransactions);

// POST /api/transactions
router.post("/", addTransaction);

// DELETE /api/transactions/all
router.delete("/all", deleteTransaction);

// GET /api/transactions/:id
router.get("/:id", getTransactionsById);

// PUT /api/transactions/:id
router.put("/:id", updateTransaction);

// DELETE /api/transactions/:id
router.delete("/:id", deleteTransactionById);

module.exports = router;
