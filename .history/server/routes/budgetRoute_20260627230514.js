const express = require("express");
const router = express.router();


const {
  
  createBudget,
  getBudget,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
}= require("../controllers/budgetController");




router.post("/",createBudget);
router.post("/",getBudget);
router.post("/",updateBudget);
router.post("/:id",deleteBudget);

module.exports= router;