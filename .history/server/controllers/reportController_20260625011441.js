const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");



module.exports.getDashboardStats = async( req,res)=>{
     try{
        const income = await Transaction.find({type:"income"});
        const expense = await Budget.find({type:"expense"});
        if(!expense){
            res.status(401).json({message:"error found"});
        }
        let balance = 0;
         income.forEach((Transaction) => {
             balance +=income.amount;
         });
         res.status(200).json({message:"successful add"});
     }catch(err){
        res.json(500).json({message:err.message});
     }
}

module.exports.getMonthlyReport = async( req,res)=>{
    
}

module.exports.getCategoryReport= async( req,res)=>{
    
}

module.exports.getBudgetReport= async( req,res)=>{
    
}

module.exports.getTrendAnalysis = async( req,res)=>{
    
}
