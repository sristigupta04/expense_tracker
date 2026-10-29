
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  getDashboardReport,
  getCategoryReport,
  getMonthlyReport,
} = require("../controllers/reportController");

// All report routes require authentication
router.use(authMiddleware);

// GET /api/report
router.get("/", getDashboardReport);

// GET /api/report/category
router.get("/category", getCategoryReport);

// GET /api/report/monthly
router.get("/monthly", getMonthlyReport);

module.exports = router;
