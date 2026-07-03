const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const category = require("../models/Category");



module.exports.getDashboardStats = async( req,res)=>{
     try{
        const income = await Transaction.find({type:"income"});
        const expense = await Transaction.find({type:"expense"});
        if(!expense){
            res.status(401).json({message:"error found"});
        }
        let income= 0;
         income.forEach((transaction) => {
             income +=transaction.amount;
         });
         let expense= 0;
         expense.forEach((transaction)=>{
            income += transaction.amount;
         })
         let balance = income- expense;
         const saving = income>0?((balance/income)*100).toFixed(2):0;

         res.status(200).json(income,expense,balance,saving);
     }catch(err){
        res.json(500).json({message:err.message});
     }
}

module.exports.getMonthlyReport = async( req,res)=>{
    const month = req.params.month;
         const transaction =await Transaction.find({month});
     try{
     if(!month){
        res.status(401).json({message:err.message});
     }
     let sum =0;
     transaction.forEach((transaction)=>{
        sum += transaction.amount;
     })
     
    res.status(200).json(transaction);
     }catch(err){
        res.json(500).json({message:err.message});
     }
}

module.exports.getCategoryReport= async( req,res)=>{
    const category = req.params.category;
     const transaction =await Transaction.find({category});
     try{
     if(!category){
        res.status(401).json({message:err.message});
     }
     let sum =0;
     transaction.forEach((transaction)=>{
        sum += transaction.amount;
     })
     
    res.status(200).json(transaction);
     }catch(err){
        res.json(500).json({message:err.message});
     }

}

module.exports.getBudgetReport= async( req,res)=>{
     const budget = await Budget.find();
     const transaction = await Transaction.find();
     try{
     if(!transaction){
          res.status(401).json({message:err.message});
     }
     let budget= 0;
         budget.forEach((transaction) => {
             budget +=transaction.amount;
         });
         let transaction= 0;
         transaction.forEach((transaction)=>{
            transaction += transaction.amount;
         })
         let balance = budget- transaction;
         const saving = transaction>0?((balance/transaction)*100).toFixed(2):0;
  res.status(200).json(budget,transaction,balance,saving);
     }catch(err){
        res.json(500).json({message:err.message});
     }
}

module.exports.getTrendAnalysis = async( req,res)=>{
    
}
