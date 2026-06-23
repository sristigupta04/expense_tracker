const mongoose = require("mongoose");
const { createMemorySessionStorage } = require("react-router-dom");
const Schema = mongoose.Schema;


const transactionSchemaa = new moongose.Schema({
    amount:{
        type:Number,
        require:["true", "amount to add"],
        trim:true
    },
     type:{
        type:String,
        enum:["income",'expense'],
        require:true,
     },
     category:{
         type:String,
         enum:['food','travel'],
         require:true,
     },
     date:{
        require:true,
        type:Date,
     },
     note:{
        type:String,
        require:true,
     }
 
})


module.exports = moongose.model("transcation",transactionSchemaa);
