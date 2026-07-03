const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Transaction = require("../models/Transaction");

module.exports.createBudget = async(req, res)=>{
 const category = req.body.category;
 const budgetlimit = req.body.budgetlimit;
 const month = req.body.month;
 const year = req.body.year;
try {
 if(!category|| !budgetlimit || !month || !year){
    res.status(400).json({message:" requried all the fields"});
 }
 const budget = new Budget({
    category,
    budgetlimit,
    month,
    year
 });
  await budget.save();
  res.status(200).json(budget);
}catch(err){
    res.status(500).json({message:"error found"});
}
}

module.exports.getBudget = async( req,res)=>{
    try{
      const budget =  await Budget.find();
        res.status(200).json(budget);
    }catch(err){
        res.status(500).json({message:"get budget erroor"});
    }
}

module.exports.getBudgetById = async( req,res)=>{
    const id = req.params.id;
    try{
     const budget =  await Budget.findById(id);
       res.status(200).json(budget);
    }catch(err){
        res.status(500).json(err.message);
    }
}
module.exports.updateBudget = async( req,res)=>{
    const id = req.params.id;
     try{
     const budget =  await Budget.findByIdAndUpdate(id,req.body,{new:true});
       res.status(200).json(budget);
    }catch(err){
        res.status(500).json(err.message);
    }
}
module.exports.deleteBudget = async( req,res)=>{
     const id = req.params.id;
     try{
     const budget =  await Budget.findByIdAndDelete(id);
       res.status(200).json({message:"succesfull delete"});
    }catch(err){
        res.status(500).json(err.message);
    }
}

module.exports.getBudgetProgress = async(req,res)=>{
   const category = req.params.category;
 
   try {
    const budget = await Budget.findOne({category});
    if(!budget){
        return res.status(404).json({message:"budget not found"});
    }
    const transaction = await Transaction.find({category,type:"expense"});
       let sum =0;
       transaction.forEach((transaction) => {
 sum += transaction.amount;
       });
          const remaining = budget.budgetlimit - sum;

  res.status(200).json({
        category,
         budget:budget.budgetlimit,
         spent,
         remaining
     
    });
}catch(err){
    res.status(500).json({message:"error found"});
}
}