const express = require("express");
const router = express.Router();


const {
  
  createBudget,
  getBudget,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
}= require("../controllers/budgetController");




router.post("/",createBudget);
router.get("/",getBudget);
router.get("/:id",getBudgetById);

router.put("/:id",updateBudget);
router.delete("/:id",deleteBudget);

module.exports= router;