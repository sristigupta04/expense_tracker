
const express = require("express");
const router = express.Router();

const {
  createBudget,
  getBudget,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
} = require("../controllers/budgetController");

const authMiddleware = require("../middleware/auth");
// All budget routes require login
router.use(authMiddleware);

// GET /api/budget
router.get("/", getBudget);

// GET /api/budget/progress
router.get("/progress", getBudgetProgress);

// GET /api/budget/:id
router.get("/:id", getBudgetById);

// POST /api/budget
router.post("/", createBudget);

// PUT /api/budget/:id
router.put("/:id", updateBudget);

// DELETE /api/budget/:id
router.delete("/:id", deleteBudget);

module.exports = router;
