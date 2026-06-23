const { model } = require("mongoose");
const mongoose = require("moongoose");
const Category = require("./Category");
const Schema = moongoose.Schema;


const BudgetSchema = new Schema({
    comment:String,
    user:{
        id:1,
        type:Number,
        required:true,
    },
     Category:{
        type:Number,
        required:true,
     },
     budgetlimit:{
          type:Number,
        required:true,
     },
     month:{
          type:Number,
        required:true,
     },
     year:{
        type:Number,
        required:true
     }
});
module.exports = moongoose.model("budget","BudgetSchema");