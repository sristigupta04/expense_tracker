const { model } = require("mongoose");
const moongoose = require("moongoose");
const schema = moongoose.Schema;


const BudgetSchema = new Schema({
    comment:String,
     food:{
        type:Number,
        require:true,
     },
     travel:{
          type:Number,
        require:true,
     },
     shopping:{
          type:Number,
        require:true,
     }
});
module.exports = moongoose.model("budget","BudgetSchema");