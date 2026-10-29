const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  markRecurringPaid,
} = require("../controllers/recurringTransactionController");

router.use(authMiddleware);

router.get("/", getRecurringTransactions);
router.post("/", createRecurringTransaction);
router.patch("/:id", updateRecurringTransaction);
router.patch("/:id/paid", markRecurringPaid);
router.delete("/:id", deleteRecurringTransaction);

module.exports = router;