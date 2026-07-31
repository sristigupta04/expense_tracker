const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getCategoryReport,
  getMonthlyReport,
  getBudgetReport,
  getTrendAnalysis,
} = require("../controllers/reportController");

router.get("/", getDashboardStats);

router.get("/category", getCategoryReport);

router.get("/monthly", getMonthlyReport);

router.get("/budget", getBudgetReport);

router.get("/trend", getTrendAnalysis);

module.exports = router;