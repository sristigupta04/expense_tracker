
const express = require("express");
const router = express.Router();

const {
  createSaving,
  getSavings,
  getSavingById,
  updateSaving,
  deleteSaving,
} = require("../controllers/savingController");

const authMiddleware = require("../middleware/authMiddleware");

// All saving routes require authentication
router.use(authMiddleware);

// GET /api/saving-goals
router.get("/", getSavings);

// GET /api/saving-goals/:id
router.get("/:id", getSavingById);

// POST /api/saving-goals
router.post("/", createSaving);

// PUT /api/saving-goals/:id
router.put("/:id", updateSaving);

// DELETE /api/saving-goals/:id
router.delete("/:id", deleteSaving);

module.exports = router;
