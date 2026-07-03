const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

module.exports.createBudget = async(req, res)=>{
 const category = req.body.category;
 const budgetlimit = req.body.budgetlimit;
 const month = req.body.month;
 const year = req.body.year;
try {
 if(!category|| !budgetlimit || !month || !year){
    res.status(500).json({message:" requried all the fields"});
 }
 const budget = new Budget({
    category,
    budgetlimit,
    month,
    year
 });
  await budget.save();
}catch(err){
    res.status(500).json({message:"error found"});
}
}

module.exports.getBudget = async( req,res)=>{
    
}

module.exports.getBudgetById = async( req,res)=>{
    
}
module.exports.updateBudget = async( req,res)=>{
    
}
module.exports.deleteBudget = async( req,res)=>{
    
}