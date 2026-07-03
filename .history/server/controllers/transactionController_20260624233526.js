const transaction = require("../models/Transaction");

module.exports.addTransaction = async(req, res)=>{
     const amount = req.body.amount;
     const type = req.body.type;
     const category = req.body.category;
     const date = req.body.Date;
     const note = req.body.note;
try{
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

     const Amount = new Transaction({
        amount,
        type,
        category,
        Date,
        note
     })
     await  Amount.save();
     res.status(200).json({message:"register successfull"});

    }catch(err){
res.status(500).json({message:err.message})
    }

}


module.exports.getTransactions = async(req,res)=>{
      const id = req.params.id;
      try{
       const amount = await Amount.find({userId}).sort({date:-1});
       res.status(200).json(amount);

      }catch(err){
        res.status(500).json({message:"error fetching"});
      }
   
}

module.exports.getTransactionsById = async(req, res)=>{
  
    
}


module.exports.updateTransaction = async(req,res)=>{
    const id = req.userId;
    try{
 const amount = await Amount.findOne({id});
     amount.updateOne({amount},{type},{category},{Date},{note});
     res.status(200).json({message:"update successfull"});
    }catch(err){
        res.status(500).json({message:"not saved the data"})
    }
}
module.exports.deleteTransaction = async(req,res)=>{
 
   try{
     await Amount.deleteMany({userId});
     res.status(200).json({message:"delete"})
   }catch(err){
    res.status(500).json({message:"error in deleting "})
   }

}
module.exports.deleteTransactionById = async(req,res)=>{
      const id = req.body.id;
    try{
       await Amount.findByIdAndDelete(id);
        res.status(200).json({message:"delete"})
   }catch(err){
    res.status(500).json({message:"error in deleting  one id val"})
   }

}