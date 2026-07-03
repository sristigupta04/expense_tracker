const express = require("express");
const router = express.router();


const {
  getDashboardStats,
  getMonthlyReport,
  getCategoryReport,
  getBudgetReport,
  getTrendAnalysis,
  
}= require("../controllers/reportController");




router.post("/dashboard",getDashboardStats);
router.post("monthly",getMonthlyReport);
router.get("/category/:category",getCategoryReport);
router.post("/budget",getBudgetReport);
router.post("/trend",getTrendAnalysis);

module.exports= router;