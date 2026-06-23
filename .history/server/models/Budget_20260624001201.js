const { model } = require("mongoose");
const mongoose = require("moongoose");
const Category = require("./Category");
const Schema = moongoose.Schema;


const BudgetSchema = new Schema({
    comment:String,
     Category:{
        type:Number,
        required:true,
     },
     travel:{
          type:Number,
        required:true,
     },
     shopping:{
          type:Number,
        required:true,
     }
});
module.exports = moongoose.model("budget","BudgetSchema");