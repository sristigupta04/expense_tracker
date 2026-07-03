const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");



module.exports.getDashboardStats = async( req,res)=>{
     try{
        
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
