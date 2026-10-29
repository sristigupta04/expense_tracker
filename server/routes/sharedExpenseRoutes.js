
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  createGroup,
  getGroups,
  createSharedExpense,
  getGroupExpenses,
  getGroupBalances,
  createSettlement,
} = require("../controllers/sharedExpenseController");

router.use(authMiddleware);

router.get("/groups", getGroups);
router.post("/groups", createGroup);

router.get("/groups/:groupId/expenses", getGroupExpenses);
router.get("/groups/:groupId/balances", getGroupBalances);

router.post("/expenses", createSharedExpense);
router.post("/settlements", createSettlement);

module.exports = router;
