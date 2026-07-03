const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const transactionSchema = new Schema({
    
    amount:{
        type:Number,
        required:[true, "amount to add"],
        
    },
     type:{
        type:String,
        enum:["income",'expense'],
        required:true,
     },
     category:{
         type:String,
         enum:['food','travel','shopping','rent','bills','health','entertainment'],
         required:true,
     },
     date:{
        required:true,
        type:Date,
     },
     note:{
        type:String,
        required:true,
     }
 
})


module.exports = mongose.model("transcation",transactionSchema);

