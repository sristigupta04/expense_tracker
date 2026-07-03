const express = require("express");
const router = express.router();


const {
  getDashboardStats,
  getMonthlyReport,
  getCategoryReport,
  getBudgetReport,
  getTrendAnalysis,
  
}= require("../controllers/reportController");




router.get("/dashboard",getDashboardStats);
router.get("monthly",getMonthlyReport);
router.get("/category/:category",getCategoryReport);
router.get("/budget",getBudgetReport);
router.get("/trend",getTrendAnalysis);

module.exports= router;