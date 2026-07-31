const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getCategoryReport,
  getMonthlyReport,
  getBudgetReport,
  getTrendAnalysis,
} = require("../controllers/reportController");

// Dashboard Summary
router.get("/", getDashboardStats);

// Category Report
router.get("/category", getCategoryReport);

// Monthly Report
router.get("/monthly", getMonthlyReport);

// Budget Report
router.get("/budget", getBudgetReport);

// Trend Analysis
router.get("/trend", getTrendAnalysis);

module.exports = router;