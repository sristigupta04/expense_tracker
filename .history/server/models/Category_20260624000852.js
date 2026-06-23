const { model } = require("mongoose");
const moongoose = require("moongoose");
const schema = moongoose.Schema;


const categorySchema = new Schema({
    comment:String,
     food:{
        type:Number,
        img:url(),
        require:true,
     },
     travel:{
          type:Number,
           img:url(),
        require:true,
     },
     shopping:{
          type:Number,
           img:url(),
        require:true,
     },
     Rent:{
        type:Number,
        require:true,
     },
     Bills:{
        type:Number,
        require:true,
     }
});
module.exports = moongoose.model("budget","BudgetSchema");