const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const category = require("../models/Category");



module.exports.getDashboardStats = async( req,res)=>{
     try{
        const incomes = await Transaction.find({type:"income"});
        const expenses = await Transaction.find({type:"expense"});
        if(!expenses){
            res.status(401).json({message:"error found"});
        }
        let totalincome= 0;
         incomes.forEach((transaction) => {
             totalincomeincome +=transaction.amount;
         });
         let totalexpense= 0;
         expenses.forEach((transaction)=>{
            totalexpense += transaction.amount;
         })
         let balance = totalincome- totalexpense;
         const saving = totalincomeincome>0?((balance/totalincome)*100).toFixed(2):0;

         res.status(200).json(totalincome,totalexpense,balance,saving);
     }catch(err){
        res.json(500).json({message:err.message});
     }
}

module.exports.getMonthlyReport = async( req,res)=>{
         const transaction =await Transaction.find();
     try{
     if(!month){
        res.status(401).json({message:err.message});
     }
     let sum =0;
     transaction.forEach((transaction)=>{
        sum += transaction.amount;
     })
     
    res.status(200).json({total:sum});
     }catch(err){
        res.status(500).json({message:err.message});
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
     
    res.status(200).json({category,
        total: sum});
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
     let totalbudget= 0;
         budget.forEach((transaction) => {
             totalbudget +=transaction.amount;
         });
         let totaltransaction= 0;
         transaction.forEach((transaction)=>{
            totaltransaction += transaction.amount;
         })
         let balance = totalbudget- totaltransaction;
         const saving = totaltransaction>0?((balance/totaltransaction)*100).toFixed(2):0;
  res.status(200).json(totalbudget,totaltransaction,balance);
     }catch(err){
        res.json(500).json({message:err.message});
     }
}

module.exports.getTrendAnalysis = async( req,res)=>{
    
 try{

      res.status(200).json({
         message:
         "Trend Analysis"
      });

   }catch(err){

      res.status(500).json({
         message:err.message
      });

   }
}
