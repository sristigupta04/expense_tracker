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
    
}

module.exports.getTrendAnalysis = async( req,res)=>{
    
}
