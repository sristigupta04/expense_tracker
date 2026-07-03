const Transaction = require("../models/Transaction");

module.exports.addTransaction = async(req, res)=>{
     const amount = req.body.amount;
     const type = req.body.type;
     const category = req.body.category;
     const date = req.body.date;
     const note = req.body.note;
try{
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

     const transaction = new Transaction({
        amount,
        type,
        category,
        date,
        note
     })
     await  transaction.save();
     res.status(201).json({message:"transaction added successfully"});

    }catch(err){
res.status(500).json({message:err.message})
    }

}


module.exports.getTransactions = async(req,res)=>{
      const id = req.params.id;
      try{
       const transaction = await   Transaction.find().sort({date:-1});
       res.status(200).json(transaction);

      }catch(err){
        res.status(500).json({message:"error fetching"});
      }
   
}

module.exports.getTransactionsById = async(req, res)=>{
   const id = req.params.id;
   const transaction = await transaction.findOne(id);
   res.status(200).json(transaction);
    
}


module.exports.updateTransaction = async(req,res)=>{
    const id = req.params.id;
    try{
 const transaction = await transaction.findOne({id});
     transaction.updateOne(id, req.body,{new:true});
     res.status(200).json({message:"update successfull"});
    }catch(err){
        res.status(500).json({message:"not saved the data"})
    }
}
module.exports.deleteTransaction = async(req,res)=>{
 
   try{
     await transaction.deleteMany({});
     res.status(200).json({message:"delete"})
   }catch(err){
    res.status(500).json({message:"error in deleting "})
   }

}
module.exports.deleteTransactionById = async(req,res)=>{
      const id = req.params.id;
    try{
       await transaction.findByIdAndDelete(id);
        res.status(200).json({message:"delete"})
   }catch(err){
    res.status(500).json({message:"error in deleting  one id val"})
   }

}