const { model } = require("mongoose");
const mongoose = require("moongoose");
const Category = require("./Category");
const Schema = mongoose.Schema;


const BudgetSchema = new Schema({
    comment:{
        type:String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
     Category:{
        type:Number,
        enum:['food','travel','shopping','rent'],
        required:true,
     },
     budgetlimit:{
          type:Number,
        required:true,
     },
     month:{
          month:Number,
        required:true,
     },
     year:{
        year:Number,
        required:true
     }
});
module.exports = mongoose.model("budget",BudgetSchema);